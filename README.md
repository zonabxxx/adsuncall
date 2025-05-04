# Call Management System

A web application for managing client calls, recording call information, and tracking call history.

## Features

- User authentication and authorization
- Client database management
- Call tracking and history
- Call status updates
- User activity logging

## Setup

1. Install dependencies:
   ```
   npm run install-all
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

3. Run the application in development mode:
   ```
   npm run dev
   ```

This will start the backend server on port 5001 and the React frontend. # adsuncall
