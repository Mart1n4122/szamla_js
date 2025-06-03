import express from 'express';
import cors from 'cors';
import * as db from './util/database.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/clients', (req, res) => {
  res.json(db.getAllClients());
});

app.post('/api/clients', (req, res) => {
  const { name, address, tax_number } = req.body;
  if (!name || !address || !tax_number) {
    return res.status(400).json({ error: 'Hiányzó adatok' });
  }
  const result = db.createClient(name, address, tax_number);
  res.status(201).json({ id: result.lastInsertRowid });
});

app.get('/api/invoices', (req, res) => {
  res.json(db.getAllInvoices());
});

app.post('/api/invoices', (req, res) => {
  const invoice = req.body;
  const required = ['invoice_number', 'issuer_id', 'client_id', 'issue_date', 'due_date', 'delivery_date', 'total', 'vat'];
  if (!required.every(f => invoice[f])) {
    return res.status(400).json({ error: 'Hiányzó mezők' });
  }
  const result = db.createInvoice(invoice);
  res.status(201).json({ id: result.lastInsertRowid });
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Számla API fut: http://localhost:${PORT}`));
