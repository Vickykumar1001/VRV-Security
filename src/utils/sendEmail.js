const nodemailer = require('nodemailer'); // Import the nodemailer library
const nodemailerConfig = require('./nodemailerConfig'); // Import the SMTP configuration

// Function to send an email using nodemailer
const sendEmail = async ({ to, subject, html }) => {
  // Create a test account (useful for testing, but not recommended in production)
  let testAccount = await nodemailer.createTestAccount();

  // Create a transporter using the SMTP configuration
  const transporter = nodemailer.createTransport(nodemailerConfig);

  // Send the email
  return transporter.sendMail({
    from: '"vicky kumar" <test.1001.email.1001@gmail.com>', // Sender's email address
    to, // Recipient email address
    subject, // Email subject
    html, // HTML content for the email
  });
};

module.exports = sendEmail; // Export the sendEmail function to be used in other parts of the application
