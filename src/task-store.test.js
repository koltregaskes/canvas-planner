const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { TaskStore, sanitizeExistingTasks } = require('./task-store');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'canvas-planner-store-'));
}

test('sanitizeExistingTasks drops invalid records and repairs parent links', () => {
  const tasks = sanitizeExistingTasks([
    {
      id: 'valid-project',
      title: 'Launch prep',
      source: 'canvas',
      level: 'project',
      status: 'todo',
      priority: 'high',
      dueDate: null,
      tags: ['launch', 'launch'],
      parentId: null,
      createdAt: '2026-01-02T10:00:00.000Z',
      updatedAt: '2026-01-02T10:00:00.000Z',
    },
    {
      id: 'child-task',
      title: 'Ship docs',
      source: 'canvas',
      level: 'task',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2026-01-12',
      tags: ['docs'],
      parentId: 'valid-project',
    },
    {
      id: 'broken',
      title: '',
      source: 'canvas',
      level: 'task',
      status: 'todo',
      priority: 'medium',
      dueDate: null,
      tags: [],
      parentId: null,
    },
    {
      id: 'orphan-task',
      title: 'Orphan',
      source: 'notion',
      level: 'task',
      status: 'done',
      priority: 'low',
      dueDate: null,
      tags: [],
      parentId: 'missing-parent',
    },
  ]);

  assert.equal(tasks.length, 3);
  assert.equal(tasks.find((task) => task.id === 'broken'), undefined);
  assert.deepEqual(tasks.find((task) => task.id === 'valid-project').tags, ['launch']);
  assert.equal(tasks.find((task) => task.id === 'orphan-task').parentId, null);
});

test('TaskStore seeds runtime storage, validates updates, and detaches child tasks on delete', () => {
  const tempDir = makeTempDir();
  const dataFile = path.join(tempDir, 'private', 'tasks.json');
  const seedDataFile = path.join(tempDir, 'seed', 'tasks.json');

  fs.mkdirSync(path.dirname(seedDataFile), { recursive: true });
  fs.writeFileSync(
    seedDataFile,
    JSON.stringify([
      {
        id: 'project-1',
        title: 'Seed project',
        source: 'canvas',
        level: 'project',
        status: 'todo',
        priority: 'high',
        dueDate: null,
        tags: ['seed'],
        parentId: null,
      },
      {
        id: 'invalid-seed',
        title: '',
        source: 'canvas',
        level: 'task',
        status: 'todo',
        priority: 'medium',
        dueDate: null,
        tags: [],
        parentId: null,
      },
    ])
  );

  const store = new TaskStore({
    dataFile,
    seedDataFile,
    storageMode: 'test',
  });

  assert.equal(store.list().length, 1);
  assert.equal(fs.existsSync(dataFile), true);

  const childTask = store.create({
    title: 'Child task',
    source: 'canvas',
    level: 'task',
    status: 'todo',
    priority: 'medium',
    dueDate: '2026-01-15',
    tags: ['child'],
    parentId: 'project-1',
  });

  const updated = store.update(childTask.id, {
    status: 'done',
    tags: ['child', 'verified'],
  });

  assert.equal(updated.status, 'done');
  assert.deepEqual(updated.tags, ['child', 'verified']);

  store.remove('project-1');
  const detachedChild = store.list().find((task) => task.id === childTask.id);
  assert.equal(detachedChild.parentId, null);
});
