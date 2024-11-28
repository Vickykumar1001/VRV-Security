const express = require('express');
const router = express.Router();

// Middleware for authentication and role-based authorization
const {
  authenticateUser,               // Verifies if the user is authenticated
  authorizePermissions,           // Checks if the user has specific roles (e.g., admin, moderator)
} = require('../middleware/authentication');

// User controllers handling various user-related operations
const {
  getAllUsers,                    // Fetch all users (admin/moderator only)
  getSingleUser,                  // Fetch a specific user by ID (admin/moderator only)
  showCurrentUser,                // Display the currently logged-in user's details
  updateUser,                     // Update user details (admin or the user themselves)
  updateUserPassword,             // Update the user's password (only by the user themselves)
} = require('../controllers/userController');

// Route to get all users (restricted to admin and moderator roles)
router
  .route('/')
  .get(authenticateUser, authorizePermissions('admin', 'moderator'), getAllUsers);

// Route for the currently logged-in user to see their own details
router.route('/showMe').get(authenticateUser, showCurrentUser);

// Route to update a user's details
// Can be updated by the admin or the user themselves, but users cannot update their role
router.route('/updateUser/:id').patch(authenticateUser, updateUser);

// Route to update the user's password
// Only the authenticated user can update their own password
router.route('/updateUserPassword').patch(authenticateUser, updateUserPassword);

// Route to get a single user's details by ID
// Restricted to admin and moderator roles
router
  .route('/:id')
  .get(authenticateUser, authorizePermissions('admin', 'moderator'), getSingleUser);

module.exports = router; // Export the router to be used in the main application
