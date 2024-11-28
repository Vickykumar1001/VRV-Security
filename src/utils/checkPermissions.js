const CustomError = require('../errors');

// Function to check if the requestor has permission to access a specific resource
const checkPermissions = (requestUser, resourceUserId) => {
  // Admin users are always authorized to access any resource
  if (requestUser.role === 'admin') return;

  // The user can access their own resource (i.e., update their own profile)
  if (requestUser.userId === resourceUserId.toString()) return;

  // If neither of the above conditions are met, throw an unauthorized error
  throw new CustomError.UnauthorizedError(
    'Not authorized to access this route'
  );
};

module.exports = checkPermissions;
