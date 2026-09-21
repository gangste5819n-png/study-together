import { Task } from '../models/Task.js';
import { dbStatus } from '../config/db.js';

/**
 * Get all tasks for authenticated user
 * GET /api/tasks
 */
export const getTasks = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        message: 'Database is currently offline. Relying on local client storage.',
      });
    }

    const tasks = await Task.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 * POST /api/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({
        success: false,
        message: 'Database offline.',
      });
    }

    const {
      title,
      description,
      category,
      subject,
      priority,
      estimatedMinutes,
      dueDate,
      mandatory,
      type,
      completed,
      completedAt,
    } = req.body;

    const task = await Task.create({
      owner: req.user.userId,
      title,
      description: description || '',
      category: category || 'CDS',
      subject: subject || 'General',
      priority: priority ? priority.toLowerCase() : 'medium',
      estimatedMinutes: Number(estimatedMinutes) || 45,
      dueDate: dueDate || null,
      mandatory: Boolean(mandatory),
      type: type || 'study',
      completed: Boolean(completed),
      completedAt: completed ? (completedAt ? new Date(completedAt) : new Date()) : null,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing task
 * PATCH /api/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const task = await Task.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized to update',
      });
    }

    const updatableFields = [
      'title',
      'description',
      'category',
      'subject',
      'priority',
      'estimatedMinutes',
      'dueDate',
      'mandatory',
      'type',
      'completed',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    if (req.body.completed !== undefined) {
      task.completedAt = req.body.completed ? new Date() : null;
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task updated',
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle task completion
 * PATCH /api/tasks/:id/toggle
 */
export const toggleTask = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const task = await Task.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : null;
    await task.save();

    res.status(200).json({
      success: true,
      message: task.completed ? 'Task completed' : 'Task marked pending',
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    if (!dbStatus.connected) {
      return res.status(503).json({ success: false, message: 'Database offline.' });
    }

    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user.userId });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized to delete',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
