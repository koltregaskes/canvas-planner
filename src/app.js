const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const { createConfig } = require('./config');
const { TaskStore } = require('./task-store');

function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "font-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
}

function respondJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function respondText(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(body);
}

function collectJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        const error = new Error('Payload too large');
        error.status = 413;
        reject(error);
        req.destroy();
      }
    });

    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        error.status = 400;
        error.message = 'Invalid JSON';
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

function mimeTypeFor(filePath) {
  return {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
  }[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

function sendFile(res, filePath) {
  const data = fs.readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': mimeTypeFor(filePath) });
  res.end(data);
}

function isHtmlNavigation(req, pathname) {
  const accept = req.headers.accept || '';
  return req.method === 'GET' && !path.extname(pathname) && accept.includes('text/html');
}

function createRequestHandler(config = createConfig(), store = new TaskStore(config)) {
  const publicDir = path.resolve(config.publicDir);
  const indexPath = path.join(publicDir, 'index.html');

  return async function routeRequest(req, res) {
    const host = req.headers.host || '127.0.0.1';
    const urlObj = new URL(req.url, `http://${host}`);
    const pathname = urlObj.pathname;

    setSecurityHeaders(res);

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    try {
      if (pathname === '/api/health' && req.method === 'GET') {
        return respondJson(res, 200, {
          status: 'ok',
          timestamp: new Date().toISOString(),
          storage: store.getStorageSummary(),
        });
      }

      if (pathname === '/api/config' && req.method === 'GET') {
        return respondJson(res, 200, {
          appName: config.appName,
          storage: store.getStorageSummary(),
          features: {
            liveEditing: true,
            browserDrafts: true,
            staticPreview: true,
          },
        });
      }

      if (pathname === '/api/tasks' && req.method === 'GET') {
        return respondJson(res, 200, { tasks: store.list() });
      }

      if (pathname === '/api/tasks' && req.method === 'POST') {
        const body = await collectJson(req);
        const task = store.create(body);
        return respondJson(res, 201, { task });
      }

      const taskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/);
      if (taskMatch) {
        const taskId = decodeURIComponent(taskMatch[1]);

        if (req.method === 'PUT' || req.method === 'PATCH') {
          const body = await collectJson(req);
          const task = store.update(taskId, body);
          return respondJson(res, 200, { task });
        }

        if (req.method === 'DELETE') {
          const task = store.remove(taskId);
          return respondJson(res, 200, { task });
        }
      }

      const decodedPath = decodeURIComponent(pathname);
      const requestedPath = path.resolve(publicDir, `.${decodedPath === '/' ? '/index.html' : decodedPath}`);

      if (!requestedPath.startsWith(publicDir)) {
        return respondJson(res, 403, { error: 'Forbidden' });
      }

      if (fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
        return sendFile(res, requestedPath);
      }

      if (isHtmlNavigation(req, pathname)) {
        return sendFile(res, indexPath);
      }

      return respondText(res, 404, 'Not found');
    } catch (error) {
      const status = error.status || 500;
      const message = error.message || 'Internal server error';
      return respondJson(res, status, { error: message });
    }
  };
}

function createServer(config = createConfig()) {
  const store = new TaskStore(config);
  const handler = createRequestHandler(config, store);
  const server = http.createServer(handler);
  return { server, store, config };
}

module.exports = {
  createRequestHandler,
  createServer,
};
