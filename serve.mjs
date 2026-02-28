import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import https from 'node:https';

const PORT = process.env.PORT || 8900;
const DIR = new URL('.', import.meta.url).pathname;

/* --- Telegram notification --- */
const TG_BOT_TOKEN = '8575995737:AAGn9zJ9SAqn7a-9PSSddwJBzKb8IZTHh44';
const TG_CHAT_ID = '-1003807343796';
const Q_NAMES = { q1: '重要紧急', q2: '重要不紧急', q3: '不重要紧急', q4: '不重要不紧急' };

function sendTelegram(text) {
  const payload = JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'HTML' });
  const req = https.request({
    hostname: 'api.telegram.org',
    path: `/bot${TG_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
  }, (res) => {
    res.resume(); // drain
    if (res.statusCode !== 200) console.error(`Telegram notify failed: ${res.statusCode}`);
  });
  req.on('error', (e) => console.error('Telegram notify error:', e.message));
  req.end(payload);
}

function notifyAction(body) {
  const { action, id, text, from, to } = body;
  let msg;
  switch (action) {
    case 'done':
      msg = `📋 看板更新：#${id}「${text}」已完成 ✅`;
      break;
    case 'restore':
      msg = `📋 看板更新：#${id}「${text}」已恢复到 ${Q_NAMES[to] || to}`;
      break;
    case 'move':
      msg = `📋 看板更新：#${id}「${text}」从 ${Q_NAMES[from] || from} 移到 ${Q_NAMES[to] || to}`;
      break;
    case 'add':
      msg = `📋 看板更新：新增 #${id}「${text}」到 ${Q_NAMES[to] || to}`;
      break;
    default:
      return;
  }
  sendTelegram(msg);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mjs':  'text/javascript; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

const server = createServer(async (req, res) => {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // POST /api/notify
  if (req.method === 'POST' && req.url.split('?')[0] === '/api/notify') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    try {
      const body = JSON.parse(Buffer.concat(chunks).toString());
      notifyAction(body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
  }

  // PUT /todo-matrix.json
  if (req.method === 'PUT' && req.url.split('?')[0] === '/todo-matrix.json') {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString();
    try {
      JSON.parse(body); // validate
    } catch {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid JSON' }));
    }
    try {
      await writeFile(join(DIR, 'todo-matrix.json'), body, 'utf-8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: e.message }));
    }
  }

  // GET - serve static files
  if (req.method === 'GET') {
    let pathname = req.url.split('?')[0];
    if (pathname === '/') pathname = '/index.html';

    // prevent directory traversal
    const filePath = join(DIR, pathname);
    if (!filePath.startsWith(DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    try {
      const data = await readFile(filePath);
      const ext = extname(filePath);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      return res.end(data);
    } catch {
      res.writeHead(404);
      return res.end('Not Found');
    }
  }

  res.writeHead(405);
  res.end('Method Not Allowed');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`TODO Board server running → http://localhost:${PORT}`);
});
