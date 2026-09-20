const http = require('http');
const { PORT, NOTES_DIR, MAX_UPLOAD_BYTES } = require('./config');
const store = require('./noteStore');

function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_UPLOAD_BYTES) {
        reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const { pathname } = url;

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // GET /api/notes?status=active  -> entry list
  if (req.method === 'GET' && pathname === '/api/notes') {
    const onlyActive = url.searchParams.get('status') === 'active';
    const entries = await store.listEntries({ onlyActive });
    sendJson(res, 200, { data: entries });
    return;
  }

  // GET /api/notes/files/:name -> the PNG itself
  if (req.method === 'GET' && pathname.startsWith('/api/notes/files/')) {
    const name = decodeURIComponent(pathname.slice('/api/notes/files/'.length));
    const file = await store.readNoteFile(name);
    if (!file) {
      sendJson(res, 404, { error: 'Note not found' });
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': file.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    });
    res.end(file);
    return;
  }

  // POST /api/notes -> raw image/png body, saved as a uniquely named file
  if (req.method === 'POST' && pathname === '/api/notes') {
    const body = await readBody(req);
    if (body.length === 0 || !body.subarray(0, 8).equals(PNG_MAGIC)) {
      sendJson(res, 400, { error: 'Expected a PNG image body' });
      return;
    }
    const entry = await store.saveNote(body);
    sendJson(res, 201, { data: entry });
    return;
  }

  // PATCH /api/notes/:id -> moderation updates (status, updated_by)
  if (req.method === 'PATCH' && /^\/api\/notes\/\d+$/.test(pathname)) {
    const id = Number(pathname.split('/').pop());
    const raw = await readBody(req);
    let patch;
    try {
      patch = JSON.parse(raw.toString('utf8') || '{}');
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return;
    }

    const allowed = {};
    if (typeof patch.status === 'boolean') allowed.status = patch.status;
    if (typeof patch.updated_by === 'string' || patch.updated_by === null) {
      allowed.updated_by = patch.updated_by;
    }

    const updated = await store.updateEntry(id, allowed);
    if (!updated) {
      sendJson(res, 404, { error: 'Note not found' });
      return;
    }
    sendJson(res, 200, { data: updated });
    return;
  }

  sendJson(res, 404, { error: 'Not found' });
}

const server = http.createServer((req, res) => {
  handler(req, res).catch((err) => {
    const status = err.statusCode || 500;
    if (status >= 500) console.error('Notes server error:', err);
    if (!res.headersSent) sendJson(res, status, { error: err.message || 'Server error' });
  });
});

store.ensureDirs().then(() => {
  server.listen(PORT, () => {
    console.log(`Notes server listening on http://localhost:${PORT}`);
    console.log(`Storing PNG submissions in ${NOTES_DIR}`);
  });
});

module.exports = server;
