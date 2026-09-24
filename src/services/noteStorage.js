// Local PNG storage client. Replaces the previous remote bucket upload/download
// flow; entry objects keep the same shape ({ id, name, status, updated_by })
// so page components did not need to change how they read submissions.
//
// With REACT_APP_STATIC_NOTES=true (set in .env.production) the client reads a
// snapshot exported into public/notes by `npm run export-notes`, so the wall
// can be hosted statically (e.g. Vercel) without the notes server.

const STATIC_NOTES = process.env.REACT_APP_STATIC_NOTES === 'true';
const STATIC_BASE = `${process.env.PUBLIC_URL || ''}/notes`;
const API_BASE = (process.env.REACT_APP_NOTES_API || '/api/notes').replace(/\/$/, '');

// Public URL for a stored note, the local equivalent of the old CDN URL.
export function noteUrl(name) {
  if (!name) return '';
  const base = STATIC_NOTES ? STATIC_BASE : `${API_BASE}/files`;
  return `${base}/${encodeURIComponent(name)}`;
}

async function parse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return body.data;
}

function readOnly() {
  throw new Error('Notes are read-only in static mode.');
}

export async function listNotes({ onlyActive = false } = {}) {
  if (STATIC_NOTES) {
    const response = await fetch(`${STATIC_BASE}/entries.json`, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const entries = await response.json();
    return (onlyActive ? entries.filter((entry) => entry.status) : entries)
      .slice()
      .sort((a, b) => b.id - a.id);
  }

  const query = onlyActive ? '?status=active' : '';
  return parse(await fetch(`${API_BASE}${query}`));
}

export async function saveNote(blob) {
  if (STATIC_NOTES) readOnly();
  return parse(
    await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: blob,
    })
  );
}

export async function updateNote(id, patch) {
  if (STATIC_NOTES) readOnly();
  return parse(
    await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  );
}
