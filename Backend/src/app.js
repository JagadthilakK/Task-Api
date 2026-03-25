const express = require('express');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(express.json());

app.use('/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Task API is running',
  });
});

module.exports = app;
