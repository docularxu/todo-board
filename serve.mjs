import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const PORT = process.env.PORT || 8900;
const DIR = new URL('.', import.meta.url).pathname;

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
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
