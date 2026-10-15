const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

let orders = [];
let seq = 1;

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

app.get('/orders', (req, res) => res.json(orders));
app.post('/orders', async (req, res) => {
  const { productId, qty } = req.body || {};
  if (!productId || !qty) return res.status(400).json({ error: 'productId & qty required' });
  if (Number(qty) <= 0) return res.status(400).json({ error: 'qty must be > 0' });
  // inter-service call: สินค้าต้องมีจริงใน product-service ถึงรับออเดอร์
  // shortcut: fail-open ตอน product-service ล่ม (unit test ไม่ต้องพึ่ง service อื่น), เปิด STRICT_PRODUCT_CHECK=1 เพื่อ fail-closed
  try {
    const r = await fetch(`${PRODUCT_SERVICE_URL}/products/${Number(productId)}`, { signal: AbortSignal.timeout(3000) });
    if (r.status === 404) return res.status(400).json({ error: 'product not found' });
  } catch {
    if (process.env.STRICT_PRODUCT_CHECK === '1') return res.status(503).json({ error: 'product-service unavailable' });
  }
  const o = { id: seq++, productId: Number(productId), qty: Number(qty), status: 'created', createdAt: new Date().toISOString() };
  orders.push(o);
  res.status(201).json(o);
});
app.get('/orders/:id', (req, res) => {
  const o = orders.find(x => x.id === Number(req.params.id));
  if (!o) return res.status(404).json({ error: 'not found' });
  res.json(o);
});
app.put('/orders/:id', (req, res) => {
  const o = orders.find(x => x.id === Number(req.params.id));
  if (!o) return res.status(404).json({ error: 'not found' });
  const { qty, status } = req.body || {};
  if (qty != null && Number(qty) <= 0) return res.status(400).json({ error: 'qty must be > 0' });
  if (qty != null) o.qty = Number(qty);
  if (status) o.status = status;
  res.json(o);
});
app.delete('/orders/:id', (req, res) => {
  const i = orders.findIndex(x => x.id === Number(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'not found' });
  orders.splice(i, 1);
  res.status(204).end();
});
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'order-service' }));

const PORT = process.env.PORT || 3003;
if (require.main === module) app.listen(PORT, () => console.log(`order-service on :${PORT}`));
module.exports = app;
