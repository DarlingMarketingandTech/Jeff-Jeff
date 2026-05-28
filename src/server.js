import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { validateCredentials, issueToken, parseToken } from './domains/auth.js';
import { getRoleCapabilities, hasCapability } from './domains/permissions.js';
import { createSchedule, getSchedule, patchSchedule } from './domains/schedule.js';
import { getMessages, sendMessage } from './domains/messages.js';

const port = Number(process.env.PORT ?? 3000);
const publicDirectory = path.resolve(process.cwd(), 'public');

function replyJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function replyNotFound(res) {
  replyJson(res, 404, { error: 'Not found' });
}

function getTokenFromHeaders(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice('Bearer '.length).trim();
}

function isAuthorized(req, capability) {
  const token = getTokenFromHeaders(req);
  const claims = parseToken(token);
  if (!claims) {
    return false;
  }
  return hasCapability(claims.role, capability);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large.'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON payload.'));
      }
    });
  });
}

function serveIndex(res) {
  const filePath = path.join(publicDirectory, 'index.html');
  const html = fs.readFileSync(filePath, 'utf8');
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

  try {
    if (req.method === 'GET' && url.pathname === '/') {
      serveIndex(res);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/login') {
      const body = await parseBody(req);
      if (!validateCredentials(body.username ?? '', body.password ?? '')) {
        replyJson(res, 401, { error: 'Invalid credentials' });
        return;
      }

      const role = 'internal';
      const token = issueToken(role);
      replyJson(res, 200, { token, role, capabilities: getRoleCapabilities(role) });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/schedule') {
      if (!isAuthorized(req, 'schedule:read')) {
        replyJson(res, 401, { error: 'Unauthorized' });
        return;
      }

      const schedule = getSchedule({
        from: url.searchParams.get('from') ?? undefined,
        to: url.searchParams.get('to') ?? undefined,
      });
      replyJson(res, 200, { schedule });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/schedule') {
      if (!isAuthorized(req, 'schedule:write')) {
        replyJson(res, 401, { error: 'Unauthorized' });
        return;
      }

      const body = await parseBody(req);
      const entry = createSchedule(body);
      replyJson(res, 201, { entry });
      return;
    }

    if (req.method === 'PATCH' && url.pathname.startsWith('/api/schedule/')) {
      if (!isAuthorized(req, 'schedule:write')) {
        replyJson(res, 401, { error: 'Unauthorized' });
        return;
      }

      const id = Number(url.pathname.replace('/api/schedule/', ''));
      if (!Number.isInteger(id)) {
        replyJson(res, 400, { error: 'Invalid schedule id.' });
        return;
      }

      const body = await parseBody(req);
      const entry = patchSchedule(id, body);
      if (!entry) {
        replyNotFound(res);
        return;
      }
      replyJson(res, 200, { entry });
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/messages') {
      if (!isAuthorized(req, 'message:read')) {
        replyJson(res, 401, { error: 'Unauthorized' });
        return;
      }

      replyJson(res, 200, { messages: getMessages() });
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/messages') {
      if (!isAuthorized(req, 'message:write')) {
        replyJson(res, 401, { error: 'Unauthorized' });
        return;
      }

      const body = await parseBody(req);
      const message = sendMessage(body);
      replyJson(res, 201, { message });
      return;
    }

    replyNotFound(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error.';
    replyJson(res, 400, { error: message });
  }
});

server.listen(port, () => {
  process.stdout.write(`Jeff app running on http://localhost:${port}\n`);
});
