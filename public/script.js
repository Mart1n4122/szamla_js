const API = 'http://localhost:8080';

async function fetchClients() {
  const res = await fetch(`${API}/api/clients`);
  return await res.json();
}

async function fetchInvoices() {
  const res = await fetch(`${API}/api/invoices`);
  return await res.json();
}

function populateClientSelects(clients) {
  const issuerSelect = document.getElementById('issuer-id');
  const clientSelect = document.getElementById('client-id');
  issuerSelect.innerHTML = '<option value="">Válassz kiállítót</option>';
  clientSelect.innerHTML = '<option value="">Válassz vevőt</option>';

  clients.forEach(c => {
    const option1 = new Option(`${c.name} (${c.tax_number})`, c.id);
    const option2 = new Option(`${c.name} (${c.tax_number})`, c.id);
    issuerSelect.appendChild(option1);
    clientSelect.appendChild(option2);
  });
}

function renderInvoices(invoices) {
  const container = document.getElementById('invoice-list');
  container.innerHTML = '';

  invoices.forEach(inv => {
    const card = document.createElement('div');
    card.className = 'invoice-card';
    card.innerHTML = `
      <strong>Számla: ${inv.invoice_number}</strong><br>
      Kiállító: ${inv.issuer_name}<br>
      Vevő: ${inv.client_name}<br>
      Kelte: ${inv.issue_date} | Teljesítés: ${inv.delivery_date} | Határidő: ${inv.due_date}<br>
      Végösszeg: <strong>${inv.total} Ft</strong> | ÁFA: ${inv.vat}%
    `;
    container.appendChild(card);
  });
}

document.getElementById('client-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('client-name').value;
  const address = document.getElementById('client-address').value;
  const tax_number = document.getElementById('client-tax').value;

  const res = await fetch(`${API}/api/clients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, address, tax_number })
  });

  if (res.ok) {
    e.target.reset();
    alert('Ügyfél mentve!');
    loadData();
  } else {
    alert('Hiba az ügyfél mentése közben.');
  }
});

document.getElementById('invoice-form').addEventListener('submit', async e => {
  e.preventDefault();
  const invoice = {
    invoice_number: document.getElementById('invoice-number').value,
    issuer_id: parseInt(document.getElementById('issuer-id').value),
    client_id: parseInt(document.getElementById('client-id').value),
    issue_date: document.getElementById('issue-date').value,
    delivery_date: document.getElementById('delivery-date').value,
    due_date: document.getElementById('due-date').value,
    total: parseFloat(document.getElementById('total').value),
    vat: parseFloat(document.getElementById('vat').value),
  };

  const res = await fetch(`${API}/api/invoices`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice)
  });

  if (res.ok) {
    e.target.reset();
    alert('Számla elmentve!');
    loadData();
  } else {
    alert('Hiba a számla mentésekor.');
  }
});

async function loadData() {
  const clients = await fetchClients();
  populateClientSelects(clients);

  const invoices = await fetchInvoices();
  renderInvoices(invoices);
}

loadData();
