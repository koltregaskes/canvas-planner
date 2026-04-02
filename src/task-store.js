const fs = require('fs');
const path = require('path');

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_SOURCES = new Set(['notion', 'todoist', 'canvas']);
const ALLOWED_LEVELS = new Set(['project', 'task', 'subtask']);
const ALLOWED_STATUS = new Set(['todo', 'in-progress', 'done']);
const ALLOWED_PRIORITY = new Set(['low', 'medium', 'high']);

const fallbackTasks = [
  {
    id: 'seed-1',
    title: 'Welcome to Canvas Planner',
    source: 'canvas',
    level: 'project',
    status: 'in-progress',
    priority: 'high',
    dueDate: null,
    tags: ['starter'],
    parentId: null,
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
  },
];

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function readTaskArray(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.tasks)) return parsed.tasks;

  throw new Error(`Task file "${filePath}" does not contain an array`);
}

function writeTaskArray(filePath, tasks) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(tasks, null, 2));
}

function sanitizeTags(tags) {
  const seen = new Set();

  return tags
    .filter((tag) => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => {
      const normalized = tag.toLowerCase();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .slice(0, 8);
}

function normalizeTimestamp(value, fallback) {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

function normalizeTaskPayload(payload, { partial = false } = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw createHttpError(400, 'Missing body');
  }

  const normalized = {};

  if (!partial || Object.hasOwn(payload, 'title')) {
    if (typeof payload.title !== 'string' || !payload.title.trim()) {
      throw createHttpError(400, 'title is required');
    }
    normalized.title = payload.title.trim().slice(0, 160);
  }

  if (!partial || Object.hasOwn(payload, 'source')) {
    const source = payload.source || 'canvas';
    if (typeof source !== 'string' || !ALLOWED_SOURCES.has(source)) {
      throw createHttpError(400, 'source is invalid');
    }
    normalized.source = source;
  }

  if (!partial || Object.hasOwn(payload, 'level')) {
    const level = payload.level || 'task';
    if (typeof level !== 'string' || !ALLOWED_LEVELS.has(level)) {
      throw createHttpError(400, 'level is invalid');
    }
    normalized.level = level;
  }

  if (!partial || Object.hasOwn(payload, 'status')) {
    const status = payload.status || 'todo';
    if (typeof status !== 'string' || !ALLOWED_STATUS.has(status)) {
      throw createHttpError(400, 'status is invalid');
    }
    normalized.status = status;
  }

  if (!partial || Object.hasOwn(payload, 'priority')) {
    const priority = payload.priority || 'medium';
    if (typeof priority !== 'string' || !ALLOWED_PRIORITY.has(priority)) {
      throw createHttpError(400, 'priority is invalid');
    }
    normalized.priority = priority;
  }

  if (!partial || Object.hasOwn(payload, 'dueDate')) {
    if (payload.dueDate === '' || payload.dueDate === null || typeof payload.dueDate === 'undefined') {
      normalized.dueDate = null;
    } else if (typeof payload.dueDate === 'string' && DATE_ONLY_PATTERN.test(payload.dueDate)) {
      normalized.dueDate = payload.dueDate;
    } else {
      throw createHttpError(400, 'dueDate must be YYYY-MM-DD');
    }
  }

  if (!partial || Object.hasOwn(payload, 'tags')) {
    if (typeof payload.tags === 'undefined' || payload.tags === null) {
      normalized.tags = [];
    } else if (Array.isArray(payload.tags)) {
      normalized.tags = sanitizeTags(payload.tags);
    } else {
      throw createHttpError(400, 'tags must be an array');
    }
  }

  if (!partial || Object.hasOwn(payload, 'parentId')) {
    if (payload.parentId === '' || payload.parentId === null || typeof payload.parentId === 'undefined') {
      normalized.parentId = null;
    } else if (typeof payload.parentId === 'string') {
      normalized.parentId = payload.parentId.trim() || null;
    } else {
      throw createHttpError(400, 'parentId must be a string');
    }
  }

  return normalized;
}

function sanitizeExistingTasks(tasks) {
  const sanitized = [];
  const seenIds = new Set();

  tasks.forEach((task, index) => {
    try {
      const normalized = normalizeTaskPayload(task);
      const fallbackTimestamp = new Date(Date.now() + index).toISOString();
      const preferredId =
        typeof task.id === 'string' && task.id.trim()
          ? task.id.trim()
          : `task-${Date.now()}-${index + 1}`;
      const id = seenIds.has(preferredId) ? `${preferredId}-${index + 1}` : preferredId;

      seenIds.add(id);
      sanitized.push({
        id,
        ...normalized,
        createdAt: normalizeTimestamp(task.createdAt, fallbackTimestamp),
        updatedAt: normalizeTimestamp(task.updatedAt, fallbackTimestamp),
      });
    } catch (error) {
      // Skip invalid legacy tasks instead of poisoning the runtime store.
    }
  });

  const ids = new Set(sanitized.map((task) => task.id));
  return sanitized.map((task) => ({
    ...task,
    parentId: task.parentId && ids.has(task.parentId) ? task.parentId : null,
  }));
}

class TaskStore {
  constructor(config) {
    this.config = config;
    this.tasks = this.initializeTasks();
  }

  initializeTasks() {
    try {
      const runtimeTasks = sanitizeExistingTasks(readTaskArray(this.config.dataFile));
      const tasks = runtimeTasks.length ? runtimeTasks : sanitizeExistingTasks(this.loadSeedTasks());
      writeTaskArray(this.config.dataFile, tasks);
      return tasks;
    } catch (runtimeError) {
      const seedTasks = sanitizeExistingTasks(this.loadSeedTasks());
      writeTaskArray(this.config.dataFile, seedTasks);
      return seedTasks;
    }
  }

  loadSeedTasks() {
    try {
      return readTaskArray(this.config.seedDataFile);
    } catch (seedError) {
      return fallbackTasks;
    }
  }

  list() {
    return this.tasks;
  }

  getStorageSummary() {
    return {
      storageMode: this.config.storageMode,
      dataFile: this.config.dataFile,
      repoSeedFile: this.config.seedDataFile,
      usingPrivateData: path.resolve(this.config.dataFile) !== path.resolve(this.config.seedDataFile),
    };
  }

  persist() {
    writeTaskArray(this.config.dataFile, this.tasks);
  }

  create(payload) {
    const timestamp = new Date().toISOString();
    const task = {
      id: `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      ...normalizeTaskPayload(payload),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.tasks = [task, ...this.tasks];
    this.persist();
    return task;
  }

  update(id, payload) {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      throw createHttpError(404, 'Task not found');
    }

    const updates = normalizeTaskPayload(payload, { partial: true });
    if (!Object.keys(updates).length) {
      throw createHttpError(400, 'No changes provided');
    }

    const nextTask = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.tasks = [
      ...this.tasks.slice(0, taskIndex),
      nextTask,
      ...this.tasks.slice(taskIndex + 1),
    ];
    this.persist();
    return nextTask;
  }

  remove(id) {
    const taskIndex = this.tasks.findIndex((task) => task.id === id);
    if (taskIndex === -1) {
      throw createHttpError(404, 'Task not found');
    }

    const [removedTask] = this.tasks.splice(taskIndex, 1);
    this.tasks = this.tasks.map((task) =>
      task.parentId === id ? { ...task, parentId: null, updatedAt: new Date().toISOString() } : task
    );
    this.persist();
    return removedTask;
  }
}

module.exports = {
  TaskStore,
  createHttpError,
  sanitizeExistingTasks,
};
