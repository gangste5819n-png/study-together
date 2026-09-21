/**
 * Lightweight request validation middlewares
 */

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body || {};
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};
  const errors = [];

  if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    errors.push('A valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

export const validateTask = (req, res, next) => {
  const { title, estimatedMinutes, dueDate, description } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: Task title is required and cannot exceed 200 characters',
    });
  }

  if (estimatedMinutes !== undefined) {
    const mins = Number(estimatedMinutes);
    if (isNaN(mins) || mins < 0 || mins > 1440) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Estimated minutes must be a number between 0 and 1440',
      });
    }
  }

  if (description !== undefined && typeof description === 'string' && description.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: Description cannot exceed 1000 characters',
    });
  }

  if (dueDate && typeof dueDate === 'string') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Due date must be in YYYY-MM-DD format',
      });
    }
  }

  req.body.title = title.trim();
  next();
};

export const validateCommitment = (req, res, next) => {
  const { title, estimatedMinutes } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: Commitment title is required and cannot exceed 200 characters',
    });
  }

  if (estimatedMinutes !== undefined) {
    const mins = Number(estimatedMinutes);
    if (isNaN(mins) || mins < 0 || mins > 1440) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed: Estimated minutes must be between 0 and 1440',
      });
    }
  }

  req.body.title = title.trim();
  next();
};

export const validateDare = (req, res, next) => {
  const { title } = req.body || {};

  if (!title || typeof title !== 'string' || title.trim().length === 0 || title.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: Dare title is required and cannot exceed 200 characters',
    });
  }

  req.body.title = title.trim();
  next();
};

export const validateRoomCode = (req, res, next) => {
  const { roomCode } = req.body || {};
  if (!roomCode || typeof roomCode !== 'string' || roomCode.trim().length < 4) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: A valid partner room code is required',
    });
  }

  req.body.roomCode = roomCode.trim().toUpperCase();
  next();
};

