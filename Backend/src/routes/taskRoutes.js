const express = require('express');
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  patchTask,
  deleteTask,
} = require('../controllers/taskController');
const { validateTask, validateTaskPatch } = require('../validations/taskValidation');

const router = express.Router();

router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.post('/', validateTask, createTask);
router.put('/:id', validateTask, updateTask);
router.patch('/:id', validateTaskPatch, patchTask);
router.delete('/:id', deleteTask);

module.exports = router;
