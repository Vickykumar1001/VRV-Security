const express = require('express');
const router = express.Router();

// Middleware for protecting routes
const { authenticateUser } = require('../middleware/authentication');

// Auth controllers handling user registration, login, etc.
const {
  register,       // Handles user registration
  login,          // Handles user login
  logout,         // Logs the user out
  verifyEmail,    // Verifies the user's email
  forgotPassword, // Initiates password reset process
  resetPassword,  // Resets the user's password
} = require('../controllers/authController');

// Public routes (no authentication required)
router.post('/register', register);         // Register a new user
router.post('/login', login);               // Log in an existing user
router.post('/verify-email', verifyEmail);  // Verify user's email after registration
router.post('/forgot-password', forgotPassword); // Send a password reset link
router.post('/reset-password', resetPassword);   // Reset password with token

// Protected route (requires user to be authenticated)
router.delete('/logout', authenticateUser, logout); // Log out the authenticated user

module.exports = router; // Export the router to be used in the app
