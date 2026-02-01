# Node.js Task API

A simple REST API for managing tasks built with Express.js.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

npx serve

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tasks | Get all tasks |
| GET | /tasks/:id | Get single task |
| POST | /tasks | Create task |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |

## Example Request

```bash
# Create task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{ "title": "My Task", "description": "Task description" }'
```

## Project Structure

```
src/
├── app.js           # Express setup
├── server.js        # Entry point
├── db/
│   ├── db.js        # Database helper
│   └── tasks.json   # Data store
├── middleware/      # Logger & error handler
└── routes/          # API routes
```

## Tech Stack

- Express.js
- Jest (testing)
- Nodemon (development)


app3-1  | [2026-02-01T23:16:34.695Z] 200 GET / — 2ms
app1-1  | [2026-02-01T23:16:37.718Z] 200 GET / — 2ms
app2-1  | [2026-02-01T23:16:38.753Z] 200 GET / — 1ms
app3-1  | [2026-02-01T23:16:39.754Z] 200 GET / — 1ms
