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

const validateTaskPatch = (req, res, next) => {
  const { title, completed } = req.body;

  if (title === undefined && completed === undefined) {
    return res.status(400).json({
      message: 'Provide at least one field to update',
    });
  }

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        message: 'Title must be a non-empty string',
      });
    }

    req.body.title = title.trim();
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({
      message: 'Completed must be a boolean value',
    });
  }

  next();
};

module.exports = {
  validateTask,
  validateTaskPatch,
};
