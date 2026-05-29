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
JWT_SECRET=change_this_to_a_long_random_secret
```

3. Start server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
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

## Auth Endpoints

### Register
- `POST /auth/register`

Body:
```json
{
  "name": "User A",
  "email": "usera@test.com",
  "password": "password123"
}
```

### Login
- `POST /auth/login`

Body:
```json
{
  "email": "usera@test.com",
  "password": "password123"
}
```

Response includes:
- `token` (JWT)
- `user` details

### Logout
- `POST /auth/logout`
- Header required: `Authorization: Bearer <token>`

### Forgot Password (development mode)
- `POST /auth/forgot-password`

Body:
```json
{
  "email": "usera@test.com"
}
```

Response returns `resetToken` for testing in Postman.

### Reset Password
- `POST /auth/reset-password/:token`

Body:
```json
{
  "password": "newpassword123"
}
```

Notes:
- Reset token expires in 15 minutes.
- Reset invalidates old tokens; user must login again.

## Protected Task Routes
- `/tasks` routes require JWT token.
- Send header:
```text
Authorization: Bearer <token>
```

## Multi-Login Session Behavior
- Logging in again issues a new token and invalidates older tokens.
- Logout invalidates current token.
- This is handled with `tokenVersion` checks.

## Common Status Codes
- `200` Success
- `201` Created
- `400` Bad Request (validation or invalid id format)
- `404` Not Found
- `500` Server Error

## Notes
- API responses expose `id` (not `_id`) and hide `__v`.
- Data is persisted in MongoDB (Atlas), not in-memory.
- Tasks are user-scoped; each user sees only their own tasks.
- When using free ngrok for backend and Vercel for frontend, ngrok URL changes after restart.
- If ngrok URL changes, update `VITE_API_BASE_URL` in Vercel and redeploy frontend.
