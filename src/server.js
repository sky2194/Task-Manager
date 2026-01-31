// server.js — Entry Point
// ================================================
// This file starts the HTTP server. We keep it
// separate from app.js so that tests can import
// the app without starting a server.
// ================================================

const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 ${process.env.APP_NAME} is running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV}`);
});
