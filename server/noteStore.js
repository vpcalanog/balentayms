const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { NOTES_DIR, INDEX_FILE } = require('./config');

// Entries mirror the shape the app previously received from the remote
// `entries` table: { id, name, status, updated_by, created_at }.
// `name` is the PNG filename on disk, so existing consumers keep working.
// New submissions are approved (`status: true`) on arrival and appear on the
// wall straight away; admins can still hide one from /administrasyones.

let writeQueue = Promise.resolve();

async function ensureDirs() {
  await fs.mkdir(NOTES_DIR, { recursive: true });
  await fs.mkdir(path.dirname(INDEX_FILE), { recursive: true });
}

async function readIndex() {
  try {
    const raw = await fs.readFile(INDEX_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writeIndex(entries) {
  await ensureDirs();
  // Write to a temp file first so a crash mid-write cannot corrupt the index.
  const tmp = `${INDEX_FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(entries, null, 2), 'utf8');
  await fs.rename(tmp, INDEX_FILE);
}

// Serializes index mutations so concurrent submissions cannot clobber each other.
function withIndexLock(fn) {
  const next = writeQueue.then(fn, fn);
  writeQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

// Unique, filesystem-safe name: timestamp for ordering + random suffix.
function buildFileName() {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `note-${stamp}-${crypto.randomUUID()}.png`;
}

function isSafeName(name) {
  return typeof name === 'string' && /^[A-Za-z0-9._-]+\.png$/.test(name) && !name.includes('..');
}

async function listEntries({ onlyActive = false } = {}) {
  const entries = await readIndex();
  const filtered = onlyActive ? entries.filter((e) => e.status === true) : entries;
  return [...filtered].sort((a, b) => b.id - a.id);
}

async function saveNote(buffer) {
  await ensureDirs();
  const name = buildFileName();
  const target = path.join(NOTES_DIR, name);

  // 'wx' fails instead of overwriting if the name somehow already exists.
  await fs.writeFile(target, buffer, { flag: 'wx' });

  return withIndexLock(async () => {
    const entries = await readIndex();
    const entry = {
      id: entries.reduce((max, e) => Math.max(max, e.id || 0), 0) + 1,
      name,
      status: true,
      updated_by: null,
      created_at: new Date().toISOString(),
    };
    await writeIndex([...entries, entry]);
    return entry;
  });
}

async function updateEntry(id, patch) {
  return withIndexLock(async () => {
    const entries = await readIndex();
    const index = entries.findIndex((e) => e.id === Number(id));
    if (index === -1) return null;

    const updated = { ...entries[index], ...patch, id: entries[index].id, name: entries[index].name };
    entries[index] = updated;
    await writeIndex(entries);
    return updated;
  });
}

async function readNoteFile(name) {
  if (!isSafeName(name)) return null;
  try {
    return await fs.readFile(path.join(NOTES_DIR, name));
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
}

module.exports = { listEntries, saveNote, updateEntry, readNoteFile, ensureDirs };
