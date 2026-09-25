// Copies approved notes from the local notes folder into public/notes so a
// static build (REACT_APP_STATIC_NOTES=true) can render them without the
// notes server. Re-run after collecting new submissions, then commit.
const fs = require('fs');
const path = require('path');
const { NOTES_DIR, INDEX_FILE } = require('../server/config');

const OUT_DIR = path.join(__dirname, '..', 'public', 'notes');

// On Vercel (or any fresh clone) local-notes is absent, since it is gitignored.
// Keep the committed snapshot as-is instead of wiping it.
if (!fs.existsSync(INDEX_FILE)) {
  console.log(`No local notes index at ${INDEX_FILE}; keeping existing ${OUT_DIR}`);
  process.exit(0);
}

const entries = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
const approved = entries.filter(
  (entry) => entry.status === true && fs.existsSync(path.join(NOTES_DIR, entry.name))
);

fs.rmSync(OUT_DIR, { recursive: true, force: true });
fs.mkdirSync(OUT_DIR, { recursive: true });

approved.forEach((entry) => {
  fs.copyFileSync(path.join(NOTES_DIR, entry.name), path.join(OUT_DIR, entry.name));
});
fs.writeFileSync(path.join(OUT_DIR, 'entries.json'), `${JSON.stringify(approved, null, 2)}\n`);

console.log(`Exported ${approved.length} of ${entries.length} notes to ${OUT_DIR}`);
