const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';
// in-memory user store (demo; สลับเป็น DB จริงได้โดยไม่เปลี่ยน API)
const users = [];

function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
}

function authMiddleware(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    req.user = jwt.verify(token,  JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// POST /register { username, password }
app.post('/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username & password required' });
  if (users.find(u => u.username === username)) return res.status(409).json({ error: 'user exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = { id: users.length + 1, username, password: hash };
  users.push(user);
  // inter-service: ส่ง welcome ผ่าน noti-service แบบ fire-and-forget (ล่มก็สมัครได้)
  fetch(`${NOTIFICATION_SERVICE_URL}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: username, message: `welcome ${username}!` }),
    signal: AbortSignal.timeout(3000),
  }).catch(() => {});
  res.status(201).json({ id: user.id, username: user.username });
});

// POST /login { username, password } -> { token }
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  res.json({ token: signToken(user), username: user.username });
});

// GET /me (ต้องแนบ Bearer token) — ใช้เป็น Integration Test กับ service อื่น
app.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));

// seed demo user: admin / password123 (เผื่ออาจารย์กดเทสหน้า login)
(async () => {
  const hash = await bcrypt.hash('password123', 10);
  users.push({ id: 1, username: 'admin', password: hash });
})();

const PORT = process.env.PORT || 3001;
if (require.main === module) {
  app.listen(PORT, () => console.log(`auth-service on :${PORT}`));
}
module.exports = app;
