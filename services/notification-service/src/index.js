const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let notifications = [];
let seq = 1;

app.get('/notifications', (req, res) => res.json(notifications));
app.post('/notifications', (req, res) => {
  const { to, message } = req.body || {};
  if (!to || !message) return res.status(400).json({ error: 'to & message required' });
  const n = { id: seq++, to, message, sentAt: new Date().toISOString() };
  notifications.push(n);
  res.status(201).json(n);
});
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'notification-service' }));

const PORT = process.env.PORT || 3004;
if (require.main === module) app.listen(PORT, () => console.log(`notification-service on :${PORT}`));
module.exports = app;
