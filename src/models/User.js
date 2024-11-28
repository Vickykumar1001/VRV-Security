const mongoose = require('mongoose'); // For defining the schema and interacting with MongoDB
const validator = require('validator'); // For validating email format
const bcrypt = require('bcryptjs'); // For hashing passwords

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'], // Name is required with a custom error message
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: String,
        unique: true, // Ensures each email is unique
        required: [true, 'Please provide email'], // Email is required
        validate: {
            validator: validator.isEmail, // Validates email format using validator
            message: 'Please provide valid email',
        },
    },
    password: {
        type: String,
        required: [true, 'Please provide password'], // Password is required
        minlength: 6, // Minimum password length
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'moderator'], // Allowed values for role
        default: 'user', // Default role is 'user'
    },
    verificationToken: String, // Token for email verification
    isVerified: {
        type: Boolean,
        default: false, // By default, user is not verified
    },
    verified: Date, // Date when the user is verified
    passwordToken: String, // Token for resetting password
    passwordTokenExpirationDate: Date, // Expiration date for the password reset token
});

// Pre-save middleware to hash the password if it's new or modified
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return; // Skip if password is not modified
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
});

// Method to compare entered password with the stored hashed password
UserSchema.methods.comparePassword = async function (canditatePassword) {
    return bcrypt.compare(canditatePassword, this.password); // Returns true if passwords match
};

module.exports = mongoose.model('User', UserSchema); // Export the User model
