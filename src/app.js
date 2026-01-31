// app.js — Express Application Setup
// ================================================
// This is the heart of our application. It creates
// the Express app, registers middleware, and mounts routes.
// ================================================

// express-async-errors patches Express so that if an async
// route handler throws an error, it is automatically forwarded
// to our error handler. Without this, unhandled promise rejections
// in async routes would crash the server silently.
require("express-async-errors");

const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const tasksRouter = require("./routes/tasks");

// Load environment variables from .env file into process.env
dotenv.config();

// -----------------------------------------------
// 1. Create the Express app
// -----------------------------------------------
const app = express();

// -----------------------------------------------
// 2. Built-in Middleware
// -----------------------------------------------
// express.json() parses incoming request bodies with JSON payloads.
// Without this, req.body would be undefined.
app.use(express.json());

// -----------------------------------------------
// 3. Custom Middleware
// -----------------------------------------------
// Our logger runs on EVERY request before it hits a route.
app.use(logger);

// -----------------------------------------------
// 4. Static Files & Routes
// -----------------------------------------------
// Serve everything inside src/public/ as static files.
// express.static() makes files available at the root URL.
//   e.g., src/public/index.html is served at GET /
app.use(express.static(path.join(__dirname, "public")));

// Mount the tasks router at /tasks.
// All routes defined inside tasksRouter are now prefixed with /tasks.
//   e.g., router.get("/") → GET /tasks
//         router.get("/:id") → GET /tasks/:id
app.use("/tasks", tasksRouter);

// -----------------------------------------------
// 5. 404 Handler (catches any unmatched routes)
// -----------------------------------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// -----------------------------------------------
// 6. Global Error Handler (MUST be last)
// -----------------------------------------------
// Express identifies this as an error handler because
// it has exactly 4 parameters: (err, req, res, next).
app.use(errorHandler);

// -----------------------------------------------
// 7. Export the app
// -----------------------------------------------
// We export the app so it can be imported in server.js
// AND in our test files.
module.exports = app;