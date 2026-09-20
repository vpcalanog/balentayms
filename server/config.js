const path = require('path');

// Local storage location is configurable via environment variables so the
// notes folder can live outside the repo in other deployments.
const NOTES_DIR = path.resolve(
  process.env.NOTES_DIR || path.join(__dirname, '..', 'local-notes')
);

const INDEX_FILE = path.resolve(
  process.env.NOTES_INDEX_FILE || path.join(NOTES_DIR, 'entries.json')
);

const PORT = Number(process.env.NOTES_PORT || 4000);

// Max accepted PNG payload (bytes). Canvas exports are ~1-2MB at multiplier 2.
const MAX_UPLOAD_BYTES = Number(process.env.NOTES_MAX_UPLOAD_BYTES || 10 * 1024 * 1024);

module.exports = { NOTES_DIR, INDEX_FILE, PORT, MAX_UPLOAD_BYTES };
