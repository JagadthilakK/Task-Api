const validateTask = (req, res, next) => {
  const { title, completed } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({
      message: 'Title is required',
    });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({
      message: 'Completed must be a boolean value',
    });
  }

  req.body.title = title.trim();
  next();
};

module.exports = {
  validateTask,
};
