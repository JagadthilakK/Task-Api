const mongoose = require('mongoose');
const Task = require('../models/Task');

const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid task id',
      });
    }

    const task = await Task.findOne({ _id: id, user: req.user.id });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, completed } = req.body;

    const newTask = await Task.create({
      title,
      completed: completed !== undefined ? completed : false,
      user: req.user.id,
    });

    res.status(201).json(newTask);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid task id',
      });
    }

    const task = await Task.findOne({ _id: id, user: req.user.id });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    task.title = title;

    if (completed !== undefined) {
      task.completed = completed;
    }

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

const patchTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid task id',
      });
    }

    const task = await Task.findOne({ _id: id, user: req.user.id });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    if (title !== undefined) {
      task.title = title;
    }

    if (completed !== undefined) {
      task.completed = completed;
    }

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: 'Invalid task id',
      });
    }

    const deletedTask = await Task.findOneAndDelete({
      _id: id,
      user: req.user.id,
    });

    if (!deletedTask) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    res.status(200).json(deletedTask);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  patchTask,
  deleteTask,
};
