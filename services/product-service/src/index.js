const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


let products = [
  { id: 1, name: 'Keyboard', price: 1290 },
  { id: 2, name: 'Mouse', price: 590 },
];
let seq = 3;

app.get('/products', (req, res) => res.json(products));
app.get('/products/:id', (req, res) => {
  const p = products.find(x => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'not found' });
  res.json(p);
});
app.post('/products', (req, res) => {
  const { name, price } = req.body || {};
  if (!name || price == null) return res.status(400).json({ error: 'name & price required' });
  const p = { id: seq++, name, price: Number(price) };
  products.push(p);
  res.status(201).json(p);
});
app.put('/products/:id', (req, res) => {
  const p = products.find(x => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'not found' });
  const { name, price } = req.body || {};
  if (name !== undefined) p.name = name;
  if (price !== undefined) p.price = Number(price);
  res.json(p);
});
app.delete('/products/:id', (req, res) => {
  const index = products.findIndex(x => x.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'not found' });
  const deleted = products.splice(index, 1)[0];
  res.json({ message: 'deleted', product: deleted });
});
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'product-service' }));

const PORT = process.env.PORT || 3002;
if (require.main === module) app.listen(PORT, () => console.log(`product-service on :${PORT}`));
module.exports = app;

