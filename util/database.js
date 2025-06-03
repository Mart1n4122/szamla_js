import Database from 'better-sqlite3';
const db = new Database('./data/invoices.sqlite');

db.prepare(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    tax_number TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT NOT NULL,
    issuer_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    issue_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    delivery_date TEXT NOT NULL,
    total REAL NOT NULL,
    vat REAL NOT NULL,
    FOREIGN KEY (issuer_id) REFERENCES clients(id),
    FOREIGN KEY (client_id) REFERENCES clients(id)
  )
`).run();

const clientCount = db.prepare('SELECT COUNT(*) as count FROM clients').get().count;
if (clientCount === 0) {
  const insertClient = db.prepare('INSERT INTO clients (name, address, tax_number) VALUES (?, ?, ?)');
  const c1 = insertClient.run('Kiss Péter', 'Budapest, Fő utca 1.', '12345678-1-42').lastInsertRowid;
  const c2 = insertClient.run('Nagy Anna', 'Debrecen, Piac utca 10.', '23456789-2-33').lastInsertRowid;
  const c3 = insertClient.run('Szabó Márk', 'Szeged, Tisza utca 3.', '34567890-3-21').lastInsertRowid;

  const insertInvoice = db.prepare(`
    INSERT INTO invoices (invoice_number, issuer_id, client_id, issue_date, due_date, delivery_date, total, vat)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (let i = 1; i <= 3; i++) {
    insertInvoice.run(`INV00${i}`, c1, c2, '2024-06-01', '2024-06-15', '2024-06-01', 100000 + i * 1000, 27);
    insertInvoice.run(`INV00${i + 3}`, c1, c3, '2024-06-02', '2024-06-16', '2024-06-02', 80000 + i * 1500, 27);
    insertInvoice.run(`INV00${i + 6}`, c2, c3, '2024-06-03', '2024-06-17', '2024-06-03', 60000 + i * 2000, 27);
  }
}

export const getAllClients = () => db.prepare('SELECT * FROM clients').all();
export const createClient = (name, address, tax_number) =>
  db.prepare('INSERT INTO clients (name, address, tax_number) VALUES (?, ?, ?)').run(name, address, tax_number);

export const getAllInvoices = () => db.prepare(`
  SELECT invoices.*, issuer.name AS issuer_name, client.name AS client_name
  FROM invoices
  JOIN clients AS issuer ON invoices.issuer_id = issuer.id
  JOIN clients AS client ON invoices.client_id = client.id
  ORDER BY invoices.id DESC
`).all();

export const createInvoice = (data) => db.prepare(`
  INSERT INTO invoices (invoice_number, issuer_id, client_id, issue_date, due_date, delivery_date, total, vat)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  data.invoice_number, data.issuer_id, data.client_id,
  data.issue_date, data.due_date, data.delivery_date,
  data.total, data.vat
);

export const getInvoiceById = (id) => db.prepare('SELECT * FROM invoices WHERE id = ?').get(id);

export const updateInvoice = (id, data) => db.prepare(`
  UPDATE invoices
  SET invoice_number = ?, issuer_id = ?, client_id = ?, issue_date = ?, delivery_date = ?, due_date = ?, total = ?, vat = ?
  WHERE id = ?
`).run(data.invoice_number, data.issuer_id, data.client_id, data.issue_date, data.delivery_date, data.due_date, data.total, data.vat, id);

export const updateClient = (id, data) => db.prepare(`
    UPDATE clients
    SET name = ?, address = ?, tax_number = ?
    WHERE id = ?
  `).run(data.name, data.address, data.tax_number, id);

export const deleteInvoice = (id) => db.prepare('DELETE FROM invoices WHERE id = ?').run(id);

export const deleteClient = (id) => {
  db.prepare('DELETE FROM invoices WHERE client_id = ?').run(id);
  return db.prepare('DELETE FROM clients WHERE id = ?').run(id);
};
export const getClientById = (id) => db.prepare('SELECT * FROM clients WHERE id = ?').get(id);

