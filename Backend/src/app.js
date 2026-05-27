const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
  })
);
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Task API is running',
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
