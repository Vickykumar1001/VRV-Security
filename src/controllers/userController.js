const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  createTokenUser,       // Utility to create a token user object
  attachCookiesToResponse, // Utility to attach cookies for authentication
  checkPermissions,        // Utility to check if the user has permission to access the resource
} = require('../utils');

// Get all users, excluding the password field
const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.status(StatusCodes.OK).json({ users });
};

// Get a single user by ID, excluding the password field
const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');

  // If the user does not exist, throw a 404 error
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }

  // Check if the logged-in user has permission to access the requested user's data
  checkPermissions(req.user, user._id);

  res.status(StatusCodes.OK).json({ user });
};

// Get the current logged-in user (from the token)
const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

// Update user information (name and role, if admin)
const updateUser = async (req, res) => {
  const { name, role } = req.body;

  // Validate that the name field is provided
  if (!name) {
    throw new CustomError.BadRequestError('Please provide all values');
  }

  // Find the user by ID
  const user = await User.findOne({ _id: req.params.id });

  // Check if the logged-in user has permission to update this user
  checkPermissions(req.user, user._id);

  // Update the user details
  user.name = name;

  // If the user is an admin, allow them to update the role as well
  if (req.user.role === 'admin') {
    user.role = role;
  }

  // Save the updated user to the database
  await user.save();

  // Create a token for the updated user and attach it to the response
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });

  // Respond with the updated user information
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

// Update the password for the logged-in user
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  // Validate that both old and new password values are provided
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');
  }

  // Find the user by their ID
  const user = await User.findOne({ _id: req.user.userId });

  // Verify that the provided old password is correct
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }

  // Update the password with the new one
  user.password = newPassword;

  // Save the updated user object with the new password
  await user.save();

  // Respond with a success message
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};

