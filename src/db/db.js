// db.js — Simple JSON file database
// ================================================
// This module handles all reads and writes to our
// tasks.json file. In a real app, this would be
// replaced by a proper database like PostgreSQL or MongoDB.
// ================================================

const fs = require("fs");
const path = require("path");

// Resolve the absolute path to our data file
const DATA_FILE = path.join(__dirname, "tasks.json");

// -----------------------------------------------
// READ: Load all tasks from the JSON file
// -----------------------------------------------
function readTasks() {
  // Read the file contents synchronously (fine for learning; use async in production)
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  // Parse the JSON string into a JavaScript array
  return JSON.parse(data);
}

// -----------------------------------------------
// WRITE: Save the tasks array back to the JSON file
// -----------------------------------------------
function writeTasks(tasks) {
  // Stringify with 2-space indentation for readability
  const data = JSON.stringify(tasks, null, 2);
  fs.writeFileSync(DATA_FILE, data, "utf-8");
}

module.exports = { readTasks, writeTasks };
