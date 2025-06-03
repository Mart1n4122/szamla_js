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
  const issuer = document.getElementById('issuer-id');
  const client = document.getElementById('client-id-select');
  issuer.innerHTML = '<option value="">Kiállító</option>';
  client.innerHTML = '<option value="">Vevő</option>';

  clients.forEach(c => {
    const opt1 = new Option(`${c.name} (${c.tax_number})`, c.id);
    const opt2 = new Option(`${c.name} (${c.tax_number})`, c.id);
    issuer.appendChild(opt1);
    client.appendChild(opt2);
  });
}

function renderClients(clients) {
  const container = document.getElementById('client-list');
  container.innerHTML = '';
  clients.forEach(c => {
    const div = document.createElement('div');
    div.className = 'invoice-item';
    div.innerHTML = `
      <strong>${c.name}</strong><br>
      Cím: ${c.address}<br>
      Adószám: ${c.tax_number}
      <div class="invoice-actions">
        <button class="icon-btn edit-btn" onclick="editClient(${c.id})" title="Szerkesztés">✏️</button>
        <button class="icon-btn delete-btn" onclick="deleteClient(${c.id})" title="Törlés">🗑️</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function renderInvoices(invoices) {
  const container = document.getElementById('invoice-list');
  container.innerHTML = '';
  invoices.forEach(inv => {
    const div = document.createElement('div');
    div.className = 'invoice-item';
    div.innerHTML = `
      <strong>${inv.invoice_number}</strong><br>
      ${inv.issuer_name} ➜ ${inv.client_name}<br>
      Kelte: ${inv.issue_date}, Határidő: ${inv.due_date}, Összeg: ${inv.total} Ft (${inv.vat}% ÁFA)
      <div class="invoice-actions">
        <button class="icon-btn edit-btn" onclick="editInvoice(${inv.id})" title="Szerkesztés">✏️</button>
        <button class="icon-btn delete-btn" onclick="deleteInvoice(${inv.id})" title="Törlés">🗑️</button>
      </div>
    `;
    container.appendChild(div);
  });
}

document.getElementById('client-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('client-id').value;
  const data = {
    name: document.getElementById('client-name').value,
    address: document.getElementById('client-address').value,
    tax_number: document.getElementById('client-tax').value,
  };

  const res = await fetch(id ? `${API}/api/clients/${id}` : `${API}/api/clients`, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    e.target.reset();
    document.getElementById('client-id').value = '';
    loadData();
  }
});

document.getElementById('invoice-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = document.getElementById('invoice-id').value;
  const invoice = {
    invoice_number: document.getElementById('invoice-number').value,
    issuer_id: parseInt(document.getElementById('issuer-id').value),
    client_id: parseInt(document.getElementById('client-id-select').value),
    issue_date: document.getElementById('issue-date').value,
    delivery_date: document.getElementById('delivery-date').value,
    due_date: document.getElementById('due-date').value,
    total: parseFloat(document.getElementById('total').value),
    vat: parseFloat(document.getElementById('vat').value)
  };

  const res = await fetch(id ? `${API}/api/invoices/${id}` : `${API}/api/invoices`, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invoice)
  });

  if (res.ok) {
    e.target.reset();
    document.getElementById('invoice-id').value = '';
    loadData();
  }
});

async function deleteClient(id) {
  if (confirm('Biztosan törlöd az ügyfelet?')) {
    await fetch(`${API}/api/clients/${id}`, { method: 'DELETE' });
    loadData();
  }
}

async function deleteInvoice(id) {
  if (confirm('Biztosan törlöd a számlát?')) {
    await fetch(`${API}/api/invoices/${id}`, { method: 'DELETE' });
    loadData();
  }
}

async function editClient(id) {
    try {
      const res = await fetch(`${API}/api/clients/${id}`);
      if (!res.ok) {
        alert('Nem található ügyfél!');
        return;
      }
  
      const client = await res.json();
  
      document.getElementById('client-id').value = client.id;
      document.getElementById('client-name').value = client.name;
      document.getElementById('client-address').value = client.address;
      document.getElementById('client-tax').value = client.tax_number;
  
      document.getElementById('client-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Hiba történt az ügyfél szerkesztésekor:', error);
      alert('Hiba történt az ügyfél szerkesztésekor.');
    }
  }
  
  document.getElementById('client-form').addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('client-id').value;
    const data = {
      name: document.getElementById('client-name').value,
      address: document.getElementById('client-address').value,
      tax_number: document.getElementById('client-tax').value,
    };
  
    const res = await fetch(id ? `${API}/api/clients/${id}` : `${API}/api/clients`, {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  
    if (res.ok) {
      e.target.reset();
      document.getElementById('client-id').value = '';
      loadData();
    } else {
      const error = await res.json();
      alert(error.error || 'Hiba történt az ügyfél mentésekor.');
    }
  });

  async function editInvoice(id) {
    try {
      const res = await fetch(`${API}/api/invoices/${id}`);
      if (!res.ok) {
        alert('Nem található számla!');
        return;
      }
  
      const inv = await res.json();
      document.getElementById('invoice-id').value = inv.id;
      document.getElementById('invoice-number').value = inv.invoice_number;
      document.getElementById('issuer-id').value = inv.issuer_id;
      document.getElementById('client-id-select').value = inv.client_id;
      document.getElementById('issue-date').value = inv.issue_date;
      document.getElementById('delivery-date').value = inv.delivery_date;
      document.getElementById('due-date').value = inv.due_date;
      document.getElementById('total').value = inv.total;
      document.getElementById('vat').value = inv.vat;

      document.getElementById('invoice-form').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Hiba történt a számla szerkesztésekor:', error);
      alert('Hiba történt a számla szerkesztésekor.');
    }
  }

async function loadData() {
  const clients = await fetchClients();
  renderClients(clients);
  populateClientSelects(clients);

  const invoices = await fetchInvoices();
  renderInvoices(invoices);
}

loadData();
