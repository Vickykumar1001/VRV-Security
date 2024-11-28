const CustomError = require('../errors');
const { isTokenValid } = require('../utils');
const Token = require('../models/Token');
const { attachCookiesToResponse } = require('../utils');

// Middleware to authenticate the user based on their access or refresh token
const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;

  try {
    // If accessToken is present and valid, no need to check the refresh token
    if (accessToken) {
      const payload = isTokenValid(accessToken);
      req.user = payload.user; // Attach user data to request object
      return next(); // Proceed to the next middleware
    }

    // If no accessToken, validate refreshToken
    const payload = isTokenValid(refreshToken);

    // Check if the refresh token is valid and associated with the user
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });

    // If no valid token found, throw an authentication error
    if (!existingToken || !existingToken?.isValid) {
      throw new CustomError.UnauthenticatedError('Authentication Invalid');
    }

    // If refresh token is valid, attach cookies to the response for future requests
    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });

    req.user = payload.user; // Attach user data to request object
    next(); // Proceed to the next middleware
  } catch (error) {
    throw new CustomError.UnauthenticatedError('Authentication Invalid');
  }
};

// Middleware to authorize the user based on roles
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (roles.includes(req.user.role)) {
      next(); // User is authorized, proceed to the next middleware
    } else {
      throw new CustomError.UnauthorizedError(
        'Unauthorized to access this route'
      );
    }
  };
};

module.exports = {
  authenticateUser,
  authorizePermissions,
};
