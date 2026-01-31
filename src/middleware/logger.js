// logger.js — Request Logger Middleware
// ================================================
// Middleware is a function that sits between the
// incoming request and the final route handler.
//
// This logger does two things:
//   1. Records the start time BEFORE the route runs.
//   2. Hooks into the response's "finish" event, which
//      fires AFTER the response has been sent — so we
//      can measure how long the route actually took.
// ================================================

function logger(req, res, next) {
  const startTime = Date.now();

  // res.on("finish", ...) fires automatically once Express
  // has finished sending the response. At that point we know
  // the status code and can calculate duration.
  res.on("finish", () => {
    const duration  = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    const status    = res.statusCode;

    // Color-code the status for the terminal:
    //   2xx → green   ✓
    //   4xx → yellow  ⚠
    //   5xx → red     ✕
    const color =
      status >= 500 ? "\x1b[31m" :
      status >= 400 ? "\x1b[33m" :
                      "\x1b[32m";
    const reset = "\x1b[0m";

    console.log(`[${timestamp}] ${color}${status}${reset} ${req.method} ${req.url} — ${duration}ms`);
  });

  // Call next() to continue down the middleware chain.
  next();
}

module.exports = logger;