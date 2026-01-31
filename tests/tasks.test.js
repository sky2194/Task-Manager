// tasks.test.js — API Tests
// ================================================
// Jest (test framework) + Node's built-in http module
// to send real HTTP requests against our Express app.
// Tests the full stack: routes → middleware → db.
// ================================================

const http = require("http");
const app  = require("../src/app");

const server = http.createServer(app);

// -----------------------------------------------
// Helper: sends an HTTP request, returns a promise
// -----------------------------------------------
function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    server.listen(0, () => {                       // port 0 = OS picks a free port
      const { port } = server.address();
      const options  = { hostname:"localhost", port, path, method, headers:{"Content-Type":"application/json"} };

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data",  chunk => data += chunk);
        res.on("end",   () => { server.close(); resolve({ statusCode: res.statusCode, body: JSON.parse(data) }); });
      });

      req.on("error", err => { server.close(); reject(err); });
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  });
}

// -----------------------------------------------
// Test Suite
// -----------------------------------------------
describe("Tasks API", () => {

  // ─── GET /tasks ───────────────────────────────
  test("GET /tasks returns all tasks", async () => {
    const { statusCode, body } = await request("GET", "/tasks");
    expect(statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.count).toBeGreaterThan(0);
  });

  test("GET /tasks?completed=true returns only completed tasks", async () => {
    const { statusCode, body } = await request("GET", "/tasks?completed=true");
    expect(statusCode).toBe(200);
    // Every task in the result must be completed
    body.data.forEach(task => expect(task.completed).toBe(true));
  });

  test("GET /tasks?completed=false returns only pending tasks", async () => {
    const { statusCode, body } = await request("GET", "/tasks?completed=false");
    expect(statusCode).toBe(200);
    body.data.forEach(task => expect(task.completed).toBe(false));
  });

  // ─── GET /tasks/:id ───────────────────────────
  test("GET /tasks/:id returns a single task", async () => {
    const { body: all }        = await request("GET", "/tasks");
    const firstId              = all.data[0].id;
    const { statusCode, body } = await request("GET", `/tasks/${firstId}`);
    expect(statusCode).toBe(200);
    expect(body.data.id).toBe(firstId);
  });

  test("GET /tasks/:id returns 404 for unknown ID", async () => {
    const { statusCode, body } = await request("GET", "/tasks/nonexistent-id");
    expect(statusCode).toBe(404);
    expect(body.success).toBe(false);
  });

  // ─── POST /tasks ──────────────────────────────
  test("POST /tasks creates a new task", async () => {
    const { statusCode, body } = await request("POST", "/tasks", {
      title: "Test Task",
      description: "Created by a test",
    });
    expect(statusCode).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.title).toBe("Test Task");
    expect(body.data.description).toBe("Created by a test");
    expect(body.data.completed).toBe(false);
    expect(body.data.id).toBeDefined();
    expect(body.data.createdAt).toBeDefined();

    // Cleanup
    await request("DELETE", `/tasks/${body.data.id}`);
  });

  test("POST /tasks trims whitespace from title and description", async () => {
    const { statusCode, body } = await request("POST", "/tasks", {
      title: "   Trimmed Title   ",
      description: "  trimmed desc  ",
    });
    expect(statusCode).toBe(201);
    expect(body.data.title).toBe("Trimmed Title");
    expect(body.data.description).toBe("trimmed desc");

    await request("DELETE", `/tasks/${body.data.id}`);
  });

  test("POST /tasks fails without a title", async () => {
    const { statusCode, body } = await request("POST", "/tasks", { description: "No title" });
    expect(statusCode).toBe(400);
    expect(body.success).toBe(false);
  });

  test("POST /tasks fails when title is only whitespace", async () => {
    const { statusCode, body } = await request("POST", "/tasks", { title: "   " });
    expect(statusCode).toBe(400);
    expect(body.success).toBe(false);
  });

  test("POST /tasks fails when title exceeds 100 characters", async () => {
    const longTitle = "a".repeat(101);
    const { statusCode, body } = await request("POST", "/tasks", { title: longTitle });
    expect(statusCode).toBe(400);
    expect(body.message).toMatch(/100 characters/);
  });

  test("POST /tasks fails when description exceeds 500 characters", async () => {
    const longDesc = "b".repeat(501);
    const { statusCode, body } = await request("POST", "/tasks", { title: "Valid", description: longDesc });
    expect(statusCode).toBe(400);
    expect(body.message).toMatch(/500 characters/);
  });

  // ─── PUT /tasks/:id ───────────────────────────
  test("PUT /tasks/:id updates a task and stamps updatedAt", async () => {
    // Create a task to update
    const { body: created } = await request("POST", "/tasks", { title: "To Update", description: "original" });
    const id = created.data.id;

    const { statusCode, body } = await request("PUT", `/tasks/${id}`, {
      title: "Updated Title",
      description: "new description",
    });
    expect(statusCode).toBe(200);
    expect(body.data.title).toBe("Updated Title");
    expect(body.data.description).toBe("new description");
    expect(body.data.updatedAt).toBeDefined(); // updatedAt should now exist

    await request("DELETE", `/tasks/${id}`);
  });

  test("PUT /tasks/:id can toggle completed without touching title", async () => {
    const { body: created } = await request("POST", "/tasks", { title: "Toggle Me" });
    const id = created.data.id;

    const { statusCode, body } = await request("PUT", `/tasks/${id}`, { completed: true });
    expect(statusCode).toBe(200);
    expect(body.data.completed).toBe(true);
    expect(body.data.title).toBe("Toggle Me"); // title unchanged

    await request("DELETE", `/tasks/${id}`);
  });

  test("PUT /tasks/:id returns 404 for unknown ID", async () => {
    const { statusCode } = await request("PUT", "/tasks/ghost-id", { title: "Ghost" });
    expect(statusCode).toBe(404);
  });

  test("PUT /tasks/:id fails when new title is empty", async () => {
    const { body: created } = await request("POST", "/tasks", { title: "Fail Update" });
    const id = created.data.id;

    const { statusCode } = await request("PUT", `/tasks/${id}`, { title: "   " });
    expect(statusCode).toBe(400);

    await request("DELETE", `/tasks/${id}`);
  });

  // ─── DELETE /tasks/:id ────────────────────────
  test("DELETE /tasks/:id removes a task", async () => {
    // Create then delete
    const { body: created } = await request("POST", "/tasks", { title: "Delete Me" });
    const id = created.data.id;

    const { statusCode, body } = await request("DELETE", `/tasks/${id}`);
    expect(statusCode).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.id).toBe(id);

    // Verify it's actually gone
    const { statusCode: check } = await request("GET", `/tasks/${id}`);
    expect(check).toBe(404);
  });

  test("DELETE /tasks/:id returns 404 for unknown ID", async () => {
    const { statusCode } = await request("DELETE", "/tasks/ghost-id");
    expect(statusCode).toBe(404);
  });

  // ─── Root endpoint ────────────────────────────
  test("GET / serves the frontend (status 200)", async () => {
    const { statusCode } = await request("GET", "/");
    expect(statusCode).toBe(200);
  });
});