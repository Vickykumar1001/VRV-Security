# **User Authentication and Management API**

## **Project Overview**

This project is a backend application built using Node.js, Express, and MongoDB to handle user authentication, role-based authorization, and user management features. It includes functionalities for user registration, login, email verification, password reset, and the ability to update user details. The application supports three roles: `admin`, `moderator`, and `user`. The functionality of this project has been tested and can be fully used via API calls made using **Postman**.

Due to time constraints, the frontend for this application has not been built. Therefore, all the interactions, including registration, login, password reset, and email verification, need to be tested using Postman by sending the relevant API requests.

## **Technologies Used**

- **Node.js**: JavaScript runtime to build the backend application.
- **Express.js**: Web framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing user data.
- **Mongoose**: MongoDB Object Data Modeling (ODM) library for schema validation and interaction with MongoDB.
- **Nodemailer**: Library for sending emails (used for account verification and password reset).
- **JWT (JSON Web Tokens)**: Used for authentication and token management.
- **Bcrypt**: Used for password hashing and comparison.

## **Setup Instructions**

To set up and run this project locally, follow the steps below:

### **1. Clone the repository:**

```bash
git clone https://github.com/Vickykumar1001/VRV-Security.git
```

### **2. Install dependencies:**

Navigate to the project directory and install the required dependencies:

```bash
cd VRV-Security
npm install
```

### **3. Set up environment variables:**

Create a `.env` file in the root directory of the project and add the following configuration (replace with your actual values):

```env
MONGO_URL = mongodb://localhost:27017/your-database
JWT_SECRET = your-jwt-secret
JWT_LIFETIME = 1d
PORT = 5000
USER = your-email@gmail.com
PASS = your-email-password 
```

### **4. Run the application:**

Start the server:

```bash
npm start
```

The server will run on `http://localhost:5000`.

### **5. API Documentation via Postman:**

To test the API, import the provided **Postman collection file** which includes all the necessary API requests for user registration, login, password reset, and email verification.

## **API Endpoints**

### **Authentication Routes**

- **POST /api/v1/auth/register**  
  Registers a new user. The first registered user becomes an admin. A verification email will be sent.

- **POST /api/v1/auth/login**  
  Logs in a user. If successful, it returns a JWT access token and a refresh token.

- **POST /api/v1/auth/verify-email**  
  Verifies the user's email address. The token for verification will be sent to the user via email.

- **POST /api/v1/auth/forgot-password**  
  Initiates a password reset process by sending an email with a reset link.

- **POST /api/v1/auth/reset-password**  
  Resets the password using the token from the email link.

- **DELETE /api/v1/auth/logout**  
  Logs the user out by invalidating the refresh token.

### **User Management Routes**

- **GET /api/v1/users**  
  Retrieves all users. Only accessible by `admin` or `moderator`.

- **GET /api/v1/users/showMe**  
  Retrieves the current user's details.

- **GET /api/v1/users/:id**  
  Retrieves a single user's details by `id`. Only accessible by `admin` or `moderator`.

- **PATCH /api/v1/users/updateUser/:id**  
  Updates user details. Only the `admin` or the user themselves can update their details. Users cannot change their roles.

- **PATCH /api/v1/users/updateUserPassword**  
  Updates the user's password. Only the user can update their own password.

### **Security and Authentication**

- **JWT Authentication**: The API uses JWT for authenticating users. The access token and refresh token are stored in **cookies** and automatically sent with each request. The cookies are signed to enhance security.
  - The **access token** is used to authenticate the user for each request.
  - The **refresh token** is used to obtain a new access token when the old one expires. 
  
- **Role-Based Access Control**: Users have roles assigned during registration. The roles are as follows:
  - **admin**: Full access to the application, including managing users.
  - **moderator**: Limited access to managing users.
  - **user**: Regular users can only manage their own data.

- **Email Verification**: A verification email is sent after registration. Users need to click the link in the email to verify their account.

- **Password Reset**: If users forget their password, they can request a password reset. An email will be sent with a reset link. The reset link contains a token which expires in 10 minutes.

## **Email Verification & Password Reset**

- When you register a user, an email will be sent to the provided address containing a verification link with a `token` query parameter.
  
- For **email verification**, you must send a POST request to `/api/v1/auth/verify-email` with the `verificationToken` and `email` (both obtained from the email).

- For **forgot password**, after the user submits their email, a reset link will be sent with a `token` query parameter. This link is valid for 10 minutes.

- To **reset the password**, you need to send a POST request to `/api/v1/auth/reset-password` with the `token`, `email`, and `new password`.

## **Postman Collection**

To help you test the API, I have attached a **Postman collection** that contains all the necessary API requests for registration, login, verification, password reset, and user management.

1. **Import the collection** into your Postman by clicking on **Import** and selecting the file.
2. Follow the instructions inside Postman to test the APIs.

### **Postman File:**

- You can download the Postman file [here](./VRV%20Security.postman_collection.json).

## **Error Handling**

The API uses custom error classes for handling various error types. Below are the common errors and their meanings:

- **BadRequestError**: The request is missing necessary fields or contains invalid data.
- **UnauthenticatedError**: The user is not authenticated (e.g., invalid or expired token).
- **UnauthorizedError**: The user does not have permission to access a resource (e.g., trying to access another user's data).
- **NotFoundError**: The requested resource (e.g., user) was not found in the database.

## **Conclusion**

This project implements a secure authentication system with role-based access control and email verification. It is intended to be tested through Postman since the frontend was not developed within the given time constraints.

If you encounter any issues or have questions, feel free to contact me.

---
