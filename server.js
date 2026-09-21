import express from 'express';
import Database from 'better-sqlite3';
import { createHash, randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'progress.db'));
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    key TEXT PRIMARY KEY,
    created_at INTEGER NOT NULL,
    last_seen INTEGER NOT NULL,
    progress TEXT NOT NULL DEFAULT '{}'
  );
`);

const hashCode = (code) => createHash('sha256').update('aidev:' + code.trim().toLowerCase()).digest('hex');
const normCode = (code) => String(code || '').trim();
const now = () => Date.now();

const getUser = db.prepare('SELECT * FROM users WHERE key = ?');
const insertUser = db.prepare('INSERT INTO users (key, created_at, last_seen, progress) VALUES (?, ?, ?, ?)');
const touchUser = db.prepare('UPDATE users SET last_seen = ? WHERE key = ?');
const saveProgress = db.prepare('UPDATE users SET progress = ?, last_seen = ? WHERE key = ?');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '512kb' }));

function auth(req, res, next) {
  const code = normCode(req.get('x-course-code'));
  if (code.length < 4) return res.status(401).json({ error: 'no_code' });
  const key = hashCode(code);
  const user = getUser.get(key);
  if (!user) return res.status(401).json({ error: 'unknown_code' });
  touchUser.run(now(), key);
  req.userKey = key;
  req.user = user;
  next();
}

// Create a new code (or return ok if provided code is free)
app.post('/api/session/new', (req, res) => {
  let code = normCode(req.body?.code);
  if (!code) {
    // 3 groups of 4 chars, unambiguous alphabet
    const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
    const bytes = randomBytes(12);
    code = Array.from(bytes, (b, i) => alphabet[b % alphabet.length] + ((i + 1) % 4 === 0 && i < 11 ? '-' : '')).join('');
  }
  if (code.length < 4 || code.length > 64) return res.status(400).json({ error: 'bad_code' });
  const key = hashCode(code);
  if (getUser.get(key)) return res.status(409).json({ error: 'taken' });
  insertUser.run(key, now(), now(), '{}');
  res.json({ ok: true, code });
});

// Log in with an existing code
app.post('/api/session', (req, res) => {
  const code = normCode(req.body?.code);
  if (code.length < 4) return res.status(400).json({ error: 'bad_code' });
  const user = getUser.get(hashCode(code));
  if (!user) return res.status(404).json({ error: 'unknown_code' });
  touchUser.run(now(), user.key);
  res.json({ ok: true, progress: JSON.parse(user.progress), created_at: user.created_at });
});

app.get('/api/progress', auth, (req, res) => {
  res.json({ progress: JSON.parse(req.user.progress), updated_at: req.user.last_seen });
});

// Merge partial progress: { lessons: {id: {...}}, tasks: {id: {...}}, quizzes: {id: {...}}, notes: {...} }
app.patch('/api/progress', auth, (req, res) => {
  const current = JSON.parse(req.user.progress);
  const patch = req.body?.progress || {};
  for (const section of ['lessons', 'tasks', 'quizzes', 'notes', 'meta']) {
    if (patch[section] && typeof patch[section] === 'object') {
      current[section] = { ...(current[section] || {}), ...patch[section] };
      for (const k of Object.keys(patch[section])) if (patch[section][k] === null) delete current[section][k];
    }
  }
  const json = JSON.stringify(current);
  saveProgress.run(json, now(), req.userKey);
  res.json({ ok: true, progress: current });
});

// Full replace (import)
app.put('/api/progress', auth, (req, res) => {
  const p = req.body?.progress;
  if (!p || typeof p !== 'object') return res.status(400).json({ error: 'bad_progress' });
  saveProgress.run(JSON.stringify(p), now(), req.userKey);
  res.json({ ok: true });
});

app.get('/api/health', (_req, res) => res.json({ ok: true, ts: now() }));

app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h', etag: true }));
app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, '0.0.0.0', () => console.log(`AI Dev Course listening on :${PORT}, data in ${DATA_DIR}`));
