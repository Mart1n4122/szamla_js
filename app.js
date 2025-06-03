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

app.get('/api/invoices/:id', (req, res) => {
    const invoice = db.getInvoiceById(req.params.id);
    if (!invoice) return res.status(404).json({ error: 'Nem található számla' });
    res.json(invoice);
  });
  
app.put('/api/invoices/:id', (req, res) => {
    const id = req.params.id;
    const result = db.updateInvoice(id, req.body);
    if (result.changes === 0) return res.status(404).json({ error: 'Nem frissíthető' });
    res.json({ success: true });
});
app.get('/api/clients/:id', (req, res) => {
    const client = db.getClientById(req.params.id);
    if (!client) return res.status(404).json({ error: 'Nem található ügyfél' });
    res.json(client);
  });

app.put('/api/clients/:id', (req, res) => {
    const id = req.params.id;
    const { name, address, tax_number } = req.body;
    if (!name || !address || !tax_number) {
      return res.status(400).json({ error: 'Hiányzó adatok' });
    }
    const result = db.updateClient(id, { name, address, tax_number });
    if (result.changes === 0) return res.status(404).json({ error: 'Nem frissíthető' });
    res.json({ success: true });
  });
  
  app.delete('/api/clients/:id', (req, res) => {
    const result = db.deleteClient(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Nem törölhető' });
    res.status(204).send();
  });
  
app.delete('/api/invoices/:id', (req, res) => {
    const result = db.deleteInvoice(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Nem törölhető' });
    res.status(204).send();
});

const PORT = 8080;
app.listen(PORT, () => console.log(`Számla API fut: http://localhost:${PORT}`));
