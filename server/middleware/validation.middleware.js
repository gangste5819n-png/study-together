/**
 * Input validation middleware for Study Together REST endpoints
 * Validates request payload structure, string lengths, and types upfront
 */

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/**
 * Validate registration payload
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 60) {
    return res.status(400).json({
      success: false,
      message: 'Name is required and must be between 2 and 60 characters.',
    });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'A valid email address is required.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password is required and must be at least 6 characters long.',
    });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Validate login payload
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email is required to log in.',
    });
  }

  if (!password || typeof password !== 'string' || !password) {
    return res.status(400).json({
      success: false,
      message: 'Password is required to log in.',
    });
  }

  req.body.email = email.trim().toLowerCase();
  next();
};

/**
 * Validate task creation or updates
 */
export const validateTask = (isCreation = true) => {
  return (req, res, next) => {
    const { title, estimatedMinutes, dueDate, description } = req.body;

    if (isCreation) {
      if (!title || typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: 'Task title is required and cannot exceed 200 characters.',
        });
      }
      req.body.title = title.trim();
    } else if (title !== undefined) {
      if (typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: 'Task title cannot be empty and cannot exceed 200 characters.',
        });
      }
      req.body.title = title.trim();
    }

    if (estimatedMinutes !== undefined) {
      const mins = Number(estimatedMinutes);
      if (isNaN(mins) || mins < 0 || mins > 1440) {
        return res.status(400).json({
          success: false,
          message: 'Estimated minutes must be a positive number between 0 and 1440 (24 hours).',
        });
      }
    }

    if (description !== undefined && typeof description === 'string' && description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Task description cannot exceed 1000 characters.',
      });
    }

    if (dueDate && typeof dueDate === 'string') {
      // YYYY-MM-DD format check
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
        return res.status(400).json({
          success: false,
          message: 'Due date must be in YYYY-MM-DD format.',
        });
      }
    }

    next();
  };
};

/**
 * Validate tomorrow pact commitment
 */
export const validateCommitment = (req, res, next) => {
  const { title, estimatedMinutes } = req.body;

  if (!title || typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Commitment title is required and cannot exceed 200 characters.',
    });
  }

  if (estimatedMinutes !== undefined) {
    const mins = Number(estimatedMinutes);
    if (isNaN(mins) || mins < 0 || mins > 1440) {
      return res.status(400).json({
        success: false,
        message: 'Estimated minutes must be between 0 and 1440.',
      });
    }
  }

  req.body.title = title.trim();
  next();
};

/**
 * Validate dare creation
 */
export const validateDare = (req, res, next) => {
  const { title, instruction, categoryTag } = req.body;

  if (!title || typeof title !== 'string' || !title.trim() || title.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Dare title is required and cannot exceed 200 characters.',
    });
  }

  if (instruction && typeof instruction === 'string' && instruction.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Dare instruction cannot exceed 500 characters.',
    });
  }

  if (categoryTag && typeof categoryTag === 'string' && categoryTag.length > 50) {
    return res.status(400).json({
      success: false,
      message: 'Category tag cannot exceed 50 characters.',
    });
  }

  req.body.title = title.trim();
  next();
};
