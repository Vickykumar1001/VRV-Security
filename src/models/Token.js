const mongoose = require('mongoose'); // Importing mongoose for schema and database interaction

// Defining the Token schema to store refresh tokens and related information
const TokenSchema = new mongoose.Schema(
    {
        refreshToken: {
            type: String,
            required: true // Refresh token is required
        },
        ip: {
            type: String,
            required: true // IP address of the user is required
        },
        userAgent: {
            type: String,
            required: true // User agent (browser/device) information is required
        },
        isValid: {
            type: Boolean,
            default: true // Indicates if the token is valid; default is true
        },
        user: {
            type: mongoose.Types.ObjectId, // Stores reference to a User document
            ref: 'User', // Sets up a relationship with the 'User' collection
            required: true // User reference is required
        },
    },
    { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

module.exports = mongoose.model('Token', TokenSchema); // Exporting the Token model
