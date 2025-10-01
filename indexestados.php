<?php
// index.php
require 'init.php';
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Pedidos - Sucursal (estático)</title>
  <link rel="stylesheet" href="styles.css">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body>
  <div class="container">
    <h1>Pedidos - Sucursal</h1>
    <table class="orders-table">
      <thead>
        <tr><th>ID</th><th>Cliente</th><th>Estado</th><th>Acciones</th></tr>
      </thead>
      <tbody id="orders"></tbody>
    </table>
  </div>

<script>
const STATUS_COLORS = {
  'pendiente': '#FE8CBD',
  'en preparación': '#F83788',
  'entregado': '#D7B578',
  'cancelado': '#000000'
};

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

function badgeHtml(status){
  const color = STATUS_COLORS[status] || '#FE8CBD';
  const textColor = (status === 'cancelado') ? '#ffffff' : '#000000';
  return `<span class="badge" style="background:${color}; color:${textColor};">${escapeHtml(status)}</span>`;
}

async function fetchOrders(){
  try {
    const res = await fetch('api/get_orders.php');
    const json = await res.json();
    const tbody = document.getElementById('orders');
    tbody.innerHTML = '';
    (json.orders || []).forEach(o=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${o.id}</td>
        <td>${escapeHtml(o.customer)}</td>
        <td>${badgeHtml(o.current_status)}</td>
        <td><a class="btn" href="order.php?id=${o.id}">Ver</a></td>`;
      tbody.appendChild(tr);
    });
  } catch(e){
    console.error('Error fetching orders', e);
  }
}

fetchOrders();
setInterval(fetchOrders, 3000);
</script>
</body>
</html>
