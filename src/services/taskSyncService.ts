/**
 * Task Synchronization and Migration Service
 * Connects frontend state with the MongoDB backend while preserving
 * full offline functionality and localStorage persistence.
 */

import { apiClient, isClientAuthenticated, type BackendTask } from './apiClient';
import type { Task, Priority } from '../types';

/**
 * Maps a BackendTask from MongoDB to the frontend Task interface
 */
export const mapBackendTaskToFrontend = (bTask: BackendTask): Task => {
  return {
    id: bTask._id,
    title: bTask.title,
    description: bTask.description,
    subject: bTask.subject || 'General',
    category: (bTask.category as any) || 'CDS',
    type: (bTask.type as any) || 'study',
    priority: (bTask.priority.charAt(0).toUpperCase() + bTask.priority.slice(1)) as Priority,
    estimatedMinutes: Number(bTask.estimatedMinutes) || 45,
    completed: Boolean(bTask.completed),
    mandatory: Boolean(bTask.mandatory),
    owner: 'me',
    assignedTo: 'me',
    dueDate: bTask.dueDate || new Date().toISOString().split('T')[0],
    createdAt: bTask.createdAt || new Date().toISOString(),
    completedAt: bTask.completedAt
      ? new Date(bTask.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : undefined,
  };
};

/**
 * Maps a frontend Task to the backend creation payload
 */
export const mapFrontendTaskToBackend = (task: Task) => {
  return {
    title: task.title,
    description: task.description || '',
    category: task.category,
    subject: task.subject,
    priority: task.priority.toLowerCase(),
    estimatedMinutes: task.estimatedMinutes,
    dueDate: task.dueDate || null,
    mandatory: task.mandatory,
    type: task.type,
  };
};

/**
 * Hybrid sync: Fetch remote tasks if authenticated and merge with local tasks
 */
export const fetchAndMergeRemoteTasks = async (localTasks: Task[]): Promise<Task[]> => {
  if (!isClientAuthenticated()) {
    return localTasks;
  }

  try {
    const res = await apiClient.tasks.getAll();
    if (res.success && res.data?.tasks) {
      const remoteTasks = res.data.tasks.map(mapBackendTaskToFrontend);

      if (remoteTasks.length === 0 && localTasks.length > 0) {
        // Initial migration: seed local tasks into MongoDB for new accounts
        for (const localTask of localTasks.slice(0, 10)) {
          if (localTask.owner === 'me') {
            await apiClient.tasks.create(mapFrontendTaskToBackend(localTask));
          }
        }
        const refreshed = await apiClient.tasks.getAll();
        if (refreshed.success && refreshed.data?.tasks) {
          return refreshed.data.tasks.map(mapBackendTaskToFrontend);
        }
      }

      // Return remote tasks for 'me' plus preserve any 'partner' mock tasks for dual display
      const partnerTasks = localTasks.filter((t) => t.owner === 'partner');
      return [...remoteTasks, ...partnerTasks];
    }
  } catch (err) {
    console.warn('[TaskSyncService] Could not sync with backend. Using local storage.', err);
  }

  return localTasks;
};

/**
 * Asynchronously syncs a newly created task to MongoDB
 */
export const syncTaskCreate = async (task: Task): Promise<string | null> => {
  if (!isClientAuthenticated()) return null;

  try {
    const res = await apiClient.tasks.create(mapFrontendTaskToBackend(task));
    if (res.success && res.data?.task?._id) {
      return res.data.task._id;
    }
  } catch (err) {
    console.warn('[TaskSyncService] Failed to persist task creation to backend:', err);
  }
  return null;
};

/**
 * Asynchronously syncs task completion toggle to MongoDB
 */
export const syncTaskToggle = async (taskId: string): Promise<void> => {
  if (!isClientAuthenticated()) return;

  try {
    // Only MongoDB ObjectIDs can be updated via the backend API
    if (/^[0-9a-fA-F]{24}$/.test(taskId)) {
      await apiClient.tasks.toggle(taskId);
    }
  } catch (err) {
    console.warn('[TaskSyncService] Failed to sync task toggle to backend:', err);
  }
};

/**
 * Asynchronously syncs task update to MongoDB
 */
export const syncTaskUpdate = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  if (!isClientAuthenticated()) return;

  try {
    if (/^[0-9a-fA-F]{24}$/.test(taskId)) {
      const payload: any = {};
      if (updates.title) payload.title = updates.title;
      if (updates.category) payload.category = updates.category;
      if (updates.subject) payload.subject = updates.subject;
      if (updates.priority) payload.priority = updates.priority.toLowerCase();
      if (updates.estimatedMinutes) payload.estimatedMinutes = updates.estimatedMinutes;
      if (updates.completed !== undefined) payload.completed = updates.completed;

      await apiClient.tasks.update(taskId, payload);
    }
  } catch (err) {
    console.warn('[TaskSyncService] Failed to sync task update to backend:', err);
  }
};

/**
 * Asynchronously syncs task deletion to MongoDB
 */
export const syncTaskDelete = async (taskId: string): Promise<void> => {
  if (!isClientAuthenticated()) return;

  try {
    if (/^[0-9a-fA-F]{24}$/.test(taskId)) {
      await apiClient.tasks.delete(taskId);
    }
  } catch (err) {
    console.warn('[TaskSyncService] Failed to sync task deletion to backend:', err);
  }
};
