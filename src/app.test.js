const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { createRequestHandler } = require('./app');

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'canvas-planner-app-'));
}

test('request handler serves health info and task CRUD endpoints', async (t) => {
  const tempDir = makeTempDir();
  const publicDir = path.join(tempDir, 'public');
  const dataDir = path.join(tempDir, 'private');
  const seedDataFile = path.join(tempDir, 'seed', 'tasks.json');
  const dataFile = path.join(dataDir, 'tasks.json');

  fs.mkdirSync(publicDir, { recursive: true });
  fs.mkdirSync(path.dirname(seedDataFile), { recursive: true });
  fs.writeFileSync(path.join(publicDir, 'index.html'), '<!doctype html><title>Canvas Planner</title>');
  fs.writeFileSync(
    seedDataFile,
    JSON.stringify([
      {
        id: 'seed-project',
        title: 'Seed project',
        source: 'canvas',
        level: 'project',
        status: 'todo',
        priority: 'high',
        dueDate: null,
        tags: ['seed'],
        parentId: null,
      },
    ])
  );

  const config = {
    appName: 'Canvas Planner',
    publicDir,
    seedDataFile,
    dataFile,
    storageMode: 'test-runtime',
  };

  const server = http.createServer(createRequestHandler(config));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => server.close());

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  const health = await healthResponse.json();
  assert.equal(healthResponse.status, 200);
  assert.equal(health.status, 'ok');
  assert.equal(health.storage.storageMode, 'test-runtime');

  const invalidResponse = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: '',
      source: 'canvas',
      level: 'task',
      status: 'todo',
      priority: 'medium',
      tags: [],
    }),
  });
  const invalidPayload = await invalidResponse.json();
  assert.equal(invalidResponse.status, 400);
  assert.equal(invalidPayload.error, 'title is required');

  const createResponse = await fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Review launch copy',
      source: 'canvas',
      level: 'task',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2026-01-21',
      tags: ['copy'],
      parentId: 'seed-project',
    }),
  });
  const created = await createResponse.json();
  assert.equal(createResponse.status, 201);
  assert.equal(created.task.title, 'Review launch copy');

  const listResponse = await fetch(`${baseUrl}/api/tasks`);
  const listPayload = await listResponse.json();
  assert.equal(listResponse.status, 200);
  assert.equal(listPayload.tasks.length, 2);
});
