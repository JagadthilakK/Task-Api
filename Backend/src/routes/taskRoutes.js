const express = require('express');

const router = express.Router();

const tasks = [
  {
    id: 1,
    title: 'Learn Express basics',
    completed: false,
  },
];

router.get('/', (req, res) => {
  res.status(200).json(tasks);
});

router.get('/:id', (req, res) => {
  const taskId = Number(req.params.id);

  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return res.status(404).json({
      message: 'Task not found',
    });
  }

  res.status(200).json(task);
});

router.post('/', (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({
      message: 'Title is required',
    });
  }

  const newTask = {
    id: tasks.length + 1,
    title: title.trim(),
    completed: false,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

module.exports = router;
