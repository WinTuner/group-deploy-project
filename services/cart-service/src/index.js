const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let items = [];
let seq = 1;

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

app.get('/cart', (req, res) => {
  const { userId } = req.query;
  res.json(userId ? items.filter(i => String(i.userId) === String(userId)) : items);
});
app.post('/cart', async (req, res) => {
  const { userId, productId, qty } = req.body || {};
  if (userId == null || !productId || qty == null) return res.status(400).json({ error: 'userId, productId & qty required' });
  if (Number(qty) <= 0 || Number(qty) > 99) return res.status(400).json({ error: 'qty must be 1..99' });
  // inter-service: ของต้องมีจริงใน product-service (fail-open ตอนล่ม)
  try {
    const r = await fetch(`${PRODUCT_SERVICE_URL}/products/${Number(productId)}`, { signal: AbortSignal.timeout(3000) });
    if (r.status === 404) return res.status(400).json({ error: 'product not found' });
  } catch { /* product-service ล่ม -> รับของเข้าตะกร้าต่อ */ }
  const item = { id: seq++, userId, productId: Number(productId), qty: Number(qty), addedAt: new Date().toISOString() };
  items.push(item);
  res.status(201).json(item);
});
app.put('/cart/:id', (req, res) => {
  const item = items.find(x => x.id === Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'not found' });
  const { qty } = req.body || {};
  if (qty == null || Number(qty) <= 0 || Number(qty) > 99) return res.status(400).json({ error: 'qty must be 1..99' });
  item.qty = Number(qty);
  res.json(item);
});
app.delete('/cart/:id', (req, res) => {
  const i = items.findIndex(x => x.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'not found' });
  items.splice(i, 1);
  res.status(204).end();
});
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'cart-service' }));

const PORT = process.env.PORT || 3005;
if (require.main === module) app.listen(PORT, () => console.log(`cart-service on :${PORT}`));
module.exports = app;
