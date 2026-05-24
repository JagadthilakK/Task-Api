# Task API (Backend)

Simple Express + MongoDB Task API with validation, centralized error handling, CORS, and Helmet.

## Tech Stack
- Node.js
- Express
- MongoDB Atlas
- Mongoose

## Project Structure
```text
src/
  app.js
  server.js
  config/db.js
  models/Task.js
  routes/taskRoutes.js
  controllers/taskController.js
  validations/taskValidation.js
  middleware/errorMiddleware.js
```

## Setup
1. Install dependencies:
```bash
npm install
```

2. Create `.env` from `.env.example`:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000
```

3. Start server:
```bash
npm start
```

Expected logs:
- `MongoDB connected`
- `Server is listening on port 5001`

## Base URL
`http://localhost:5001`

## Endpoints

### Health
- `GET /`

Response:
```json
{
  "message": "Task API is running"
}
```

### Get all tasks
- `GET /tasks`

### Get task by id
- `GET /tasks/:id`

### Create task
- `POST /tasks`

Body:
```json
{
  "title": "Learn MongoDB",
  "completed": false
}
```

Notes:
- `title` is required.
- `completed` is optional and must be boolean when provided.

### Full update task
- `PUT /tasks/:id`

Body:
```json
{
  "title": "Updated title",
  "completed": true
}
```

Notes:
- `title` is required by current validation.

### Partial update task
- `PATCH /tasks/:id`

Body examples:
```json
{
  "completed": true
}
```

```json
{
  "title": "Updated only title"
}
```

Notes:
- At least one field (`title` or `completed`) must be provided.

### Delete task
- `DELETE /tasks/:id`

## Common Status Codes
- `200` Success
- `201` Created
- `400` Bad Request (validation or invalid id format)
- `404` Not Found
- `500` Server Error

## Notes
- API responses expose `id` (not `_id`) and hide `__v`.
- Data is persisted in MongoDB (Atlas), not in-memory.
