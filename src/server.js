const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_FILE = path.join(__dirname, '..', 'data', 'tasks.json');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const defaultTasks = [
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
  },
];

function loadTasks() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch (error) {
    console.warn('Using default tasks because load failed:', error.message);
  }
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultTasks, null, 2));
  return defaultTasks;
}

function persistTasks(tasks) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

let tasksState = loadTasks();

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "img-src 'self' data:",
      "connect-src 'self'",
    ].join('; ')
  );
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

function respondJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function collectJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function handleHealth(res) {
  respondJson(res, 200, { status: 'ok', timestamp: new Date().toISOString() });
}

function handleGetTasks(res) {
  respondJson(res, 200, { tasks: tasksState });
}

function generateId() {
  return `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function validateTask(payload) {
  if (!payload || typeof payload !== 'object') return { valid: false, message: 'Missing body' };
  if (!payload.title || typeof payload.title !== 'string') return { valid: false, message: 'title is required' };
  const allowedSources = ['notion', 'todoist', 'canvas'];
  const allowedLevels = ['project', 'task', 'subtask'];
  const allowedStatus = ['todo', 'in-progress', 'done'];
  if (payload.source && !allowedSources.includes(payload.source)) return { valid: false, message: 'source is invalid' };
  if (payload.level && !allowedLevels.includes(payload.level)) return { valid: false, message: 'level is invalid' };
  if (payload.status && !allowedStatus.includes(payload.status)) return { valid: false, message: 'status is invalid' };
  return { valid: true };
}

async function handleCreateTask(req, res) {
  try {
    const body = await collectJson(req);
    const check = validateTask(body);
    if (!check.valid) return respondJson(res, 400, { error: check.message });

    const newTask = {
      id: generateId(),
      title: body.title.trim(),
      source: body.source || 'canvas',
      level: body.level || 'task',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      dueDate: body.dueDate || null,
      tags: Array.isArray(body.tags) ? body.tags.slice(0, 6) : [],
      parentId: body.parentId || null,
    };

    tasksState = [newTask, ...tasksState];
    persistTasks(tasksState);
    respondJson(res, 201, { task: newTask });
  } catch (error) {
    respondJson(res, 400, { error: error.message || 'Unable to create task' });
  }
}

function serveStatic(res, urlPath) {
  const cleanPath = urlPath === '/' ? '/index.html' : urlPath;
  const requestedPath = path.normalize(path.join(PUBLIC_DIR, cleanPath));
  if (!requestedPath.startsWith(PUBLIC_DIR)) {
    respondJson(res, 403, { error: 'Forbidden' });
    return;
  }

  fs.readFile(requestedPath, (err, data) => {
    if (err) {
      fs.readFile(path.join(PUBLIC_DIR, 'index.html'), (fallbackErr, fallbackData) => {
        if (fallbackErr) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fallbackData);
      });
      return;
    }

    const ext = path.extname(requestedPath).toLowerCase();
    const mime = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
    }[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

function routeRequest(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = urlObj;

  setSecurityHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (pathname === '/api/health' && req.method === 'GET') return handleHealth(res);
  if (pathname === '/api/tasks' && req.method === 'GET') return handleGetTasks(res);
  if (pathname === '/api/tasks' && req.method === 'POST') return handleCreateTask(req, res);

  return serveStatic(res, pathname);
}

const server = http.createServer(routeRequest);

server.listen(PORT, HOST, () => {
  console.log(`Canvas Planner server ready at http://${HOST}:${PORT}`);
});
