// Local PNG storage client. Replaces the previous remote bucket upload/download
// flow; entry objects keep the same shape ({ id, name, status, updated_by })
// so page components did not need to change how they read submissions.

const API_BASE = (process.env.REACT_APP_NOTES_API || '/api/notes').replace(/\/$/, '');

// Public URL for a stored note, the local equivalent of the old CDN URL.
export function noteUrl(name) {
  return name ? `${API_BASE}/files/${encodeURIComponent(name)}` : '';
}

async function parse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || `Request failed with status ${response.status}`);
  }
  return body.data;
}

export async function listNotes({ onlyActive = false } = {}) {
  const query = onlyActive ? '?status=active' : '';
  return parse(await fetch(`${API_BASE}${query}`));
}

export async function saveNote(blob) {
  return parse(
    await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: blob,
    })
  );
}

export async function updateNote(id, patch) {
  return parse(
    await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
  );
}
