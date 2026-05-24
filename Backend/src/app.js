const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
  })
);
app.use(express.json());

app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Task API is running',
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
