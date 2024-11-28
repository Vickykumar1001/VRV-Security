require('dotenv').config(); // Load environment variables from .env file
require('express-async-errors'); // Handle async errors in Express routes without try-catch

const express = require('express');
const app = express();

// Extra packages for logging, security, and request handling
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

// Database connection
const connectDB = require('./src/db/connect');

// Routers
const authRouter = require('./src/routes/authRoutes');
const userRouter = require('./src/routes/userRoutes');

// Custom middleware
const notFoundMiddleware = require('./src/middleware/not-found');
const errorHandlerMiddleware = require('./src/middleware/error-handler');

app.set('trust proxy', 1); // Trust proxy (for rate limiting to work behind a reverse proxy)

// Apply rate limiting to avoid abuse (60 requests per 15 mins per IP)
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 60, // Limit each IP to 60 requests
    })
);

// Basic security middleware
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongoSanitize());

// Body parser and cookie parser
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));

// Serve static files from the public directory
app.use(express.static('./public'));

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

// Handle 404 errors (route not found)
app.use(notFoundMiddleware);

// Centralized error handling
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

// Start the server and connect to the database
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL); // Connect to MongoDB
        app.listen(port, () => console.log(`Server is running on port ${port}...`));
    } catch (error) {
        console.log(error); // Log any errors during startup
    }
};

start(); // Kick things off
