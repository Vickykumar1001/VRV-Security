const mongoose = require('mongoose');

// Function to connect to the MongoDB database
// `url` is the connection string for the MongoDB instance
const connectDB = (url) => {
  return mongoose.connect(url); // Returns a promise that resolves when the connection is successful
};

module.exports = connectDB; // Export the function to be used for database connection in other files
