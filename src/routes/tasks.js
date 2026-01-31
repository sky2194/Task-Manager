// tasks.js — Task Routes (CRUD)
// ================================================
// CRUD = Create, Read, Update, Delete
// These are the four basic operations of any data store.
// Each route handler is a callback: (req, res) => { ... }
// ================================================

const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { readTasks, writeTasks } = require("../db/db");

const router = express.Router();

// -----------------------------------------------
// CONSTANTS — shared validation rules
// -----------------------------------------------
const MAX_TITLE_LENGTH = 100;
const MAX_DESC_LENGTH  = 500;

// -----------------------------------------------
// HELPER — builds a 400 validation error cleanly
// -----------------------------------------------
function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err; // caller uses: throw validationError("...")
}

// -----------------------------------------------
// GET /tasks — Read ALL tasks
// -----------------------------------------------
router.get("/", (req, res) => {
  const tasks = readTasks();

  // Filter by completion status via query parameter:
  //   GET /tasks?completed=true
  //   GET /tasks?completed=false
  const { completed } = req.query;

  // BUG FIX:
  // The old version used:  task.completed === completed === "true"
  // That chained two === which compared a boolean to a string
  // and always produced the wrong result.
  // Correct approach: convert the query string to a boolean first,
  // then compare against each task.
  const filtered =
    completed !== undefined
      ? tasks.filter((task) => task.completed === (completed === "true"))
      : tasks;

  res.status(200).json({
    success: true,
    count: filtered.length,
    data: filtered,
  });
});

// -----------------------------------------------
// GET /tasks/:id — Read a SINGLE task by ID
// -----------------------------------------------
router.get("/:id", (req, res) => {
  const tasks = readTasks();
  const task  = tasks.find((t) => t.id === req.params.id);

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({ success: true, data: task });
});

// -----------------------------------------------
// POST /tasks — Create a new task
// -----------------------------------------------
router.post("/", (req, res) => {
  const { title, description } = req.body;

  // .trim() strips leading/trailing whitespace so a title
  // that is only spaces is still caught as empty.
  const cleanTitle = (title || "").trim();
  const cleanDesc  = (description || "").trim();

  if (!cleanTitle) {
    throw validationError("Title is required");
  }
  if (cleanTitle.length > MAX_TITLE_LENGTH) {
    throw validationError(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
  }
  if (cleanDesc.length > MAX_DESC_LENGTH) {
    throw validationError(`Description must be ${MAX_DESC_LENGTH} characters or less`);
  }

  const newTask = {
    id:          uuidv4(),
    title:       cleanTitle,
    description: cleanDesc,
    completed:   false,
    createdAt:   new Date().toISOString(),
  };

  const tasks = readTasks();
  tasks.push(newTask);
  writeTasks(tasks);

  res.status(201).json({ success: true, data: newTask });
});

// -----------------------------------------------
// PUT /tasks/:id — Update an existing task
// -----------------------------------------------
router.put("/:id", (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  // Validate only the fields that are actually being updated.
  // This allows partial updates (e.g. only flip "completed")
  // without requiring the full object every time.
  if (req.body.title !== undefined) {
    const cleanTitle = req.body.title.trim();
    if (!cleanTitle) {
      throw validationError("Title cannot be empty");
    }
    if (cleanTitle.length > MAX_TITLE_LENGTH) {
      throw validationError(`Title must be ${MAX_TITLE_LENGTH} characters or less`);
    }
    req.body.title = cleanTitle;
  }

  if (req.body.description !== undefined) {
    const cleanDesc = req.body.description.trim();
    if (cleanDesc.length > MAX_DESC_LENGTH) {
      throw validationError(`Description must be ${MAX_DESC_LENGTH} characters or less`);
    }
    req.body.description = cleanDesc;
  }

  // Merge existing task with incoming fields.
  // Spread copies properties; later ones overwrite earlier ones.
  // We always stamp updatedAt so the UI can show "last edited".
  const updatedTask = {
    ...tasks[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  tasks[index] = updatedTask;
  writeTasks(tasks);

  res.status(200).json({ success: true, data: updatedTask });
});

// -----------------------------------------------
// DELETE /tasks/:id — Delete a task
// -----------------------------------------------
router.delete("/:id", (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex((t) => t.id === req.params.id);

  if (index === -1) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  // splice() removes 1 element at the given index
  const deleted = tasks.splice(index, 1)[0];
  writeTasks(tasks);

  res.status(200).json({ success: true, message: "Task deleted", data: deleted });
});

module.exports = router;