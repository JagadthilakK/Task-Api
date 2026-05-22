const tasks = [
  {
    id: 1,
    title: 'Learn Express basics',
    completed: false,
  },
];

const getNextTaskId = () => {
  if (tasks.length === 0) {
    return 1;
  }

  const maxId = Math.max(...tasks.map((task) => task.id));
  return maxId + 1;
};

const getAllTasks = (req, res) => {
  res.status(200).json(tasks);
};

const getTaskById = (req, res) => {
  const taskId = Number(req.params.id);

  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return res.status(404).json({
      message: 'Task not found',
    });
  }

  res.status(200).json(task);
};

const createTask = (req, res) => {
  const { title } = req.body;

  const newTask = {
    id: getNextTaskId(),
    title,
    completed: false,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
};

const updateTask = (req, res) => {
  const taskId = Number(req.params.id);
  const { title, completed } = req.body;

  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return res.status(404).json({
      message: 'Task not found',
    });
  }

  task.title = title;
  task.completed = completed;

  res.status(200).json(task);
};

const deleteTask = (req, res) => {
  const taskId = Number(req.params.id);

  const taskIndex = tasks.findIndex((item) => item.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      message: 'Task not found',
    });
  }

  const deletedTask = tasks.splice(taskIndex, 1);

  res.status(200).json(deletedTask[0]);
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
