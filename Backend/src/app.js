const express = require('express');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

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
