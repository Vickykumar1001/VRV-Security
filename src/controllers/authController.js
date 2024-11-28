const User = require("../models/User");
const Token = require("../models/Token");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const {
  attachCookiesToResponse,       // Utility to attach cookies to the response
  createTokenUser,               // Utility to create a token user object
  sendVerificationEmail,         // Utility to send email for verification
  sendResetPasswordEmail,        // Utility to send email for password reset
  createHash,                    // Utility to create a hash of a token
} = require("../utils");
const crypto = require("crypto");

// Register a new user
const register = async (req, res) => {
  const { email, name, password } = req.body;

  // Check if the email is already taken
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError("Email already exists");
  }

  // First registered user gets the 'admin' role
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";

  // Generate a verification token for email verification
  const verificationToken = crypto.randomBytes(40).toString("hex");

  // Create the user
  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  // Origin for the email verification link
  const origin = "http://localhost:3000";

  // Send verification email
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });

  // Respond with a success message
  res.status(StatusCodes.CREATED).json({
    msg: "Success! Please check your email to verify account",
  });
};

// Verify the user's email using the token sent to them
const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;
  const user = await User.findOne({ email });

  // Check if the user exists and if the verification token matches
  if (!user) {
    throw new CustomError.UnauthenticatedError("Verification Failed");
  }

  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError("Verification Failed");
  }

  // Mark user as verified
  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";

  // Save the user after verification
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Email Verified" });
};

// Login a user
const login = async (req, res) => {
  const { email, password } = req.body;

  // Ensure both email and password are provided
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email });

  // Check if user exists and validate password
  if (!user) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);

  // Check if password matches
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError("Invalid Credentials");
  }

  // Ensure the user has verified their email
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError("Please verify your email");
  }

  // Create token for the user
  const tokenUser = createTokenUser(user);

  // Handle refresh token logic
  let refreshToken = "";
  const existingToken = await Token.findOne({ user: user._id });

  // Check for existing valid refresh token
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  // Generate new refresh token if none exists
  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  // Attach cookies and send response
  attachCookiesToResponse({ res, user: tokenUser, refreshToken });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// Logout a user and clear their tokens
const logout = async (req, res) => {
  // Delete the refresh token from the database
  await Token.findOneAndDelete({ user: req.user.userId });

  // Clear the cookies in the response
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "user logged out!" });
};

// Handle forgot password request
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Ensure email is provided
  if (!email) {
    throw new CustomError.BadRequestError("Please provide valid email");
  }

  const user = await User.findOne({ email });

  // If user exists, send reset password email
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");
    const origin = "http://localhost:3000";
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    await user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: "Please check your email for reset password link" });
};

// Reset the user's password using a valid token
const resetPassword = async (req, res) => {
  const { token, email, password } = req.body;

  // Ensure all fields are provided
  if (!token || !email || !password) {
    throw new CustomError.BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ email });

  // If user exists and token is valid, reset the password
  if (user) {
    const currentDate = new Date();

    if (
      user.passwordToken === createHash(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    } else {
      throw new CustomError.UnauthenticatedError("Token expired or invalid");
    }
  }

  res.status(StatusCodes.OK).json({ msg: "Password Reset" });
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
