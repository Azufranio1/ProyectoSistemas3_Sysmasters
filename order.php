<?php
// order.php
require 'init.php';
$id = intval($_GET['id'] ?? 0);
$order = $_SESSION['orders'][$id] ?? null;
if (!$order) {
    echo "Pedido no encontrado. <a href='index.php'>Volver</a>";
    exit;
}
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Pedido #<?= htmlspecialchars($order['id']) ?></title>
  <link rel="stylesheet" href="styles.css">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body>
  <div class="container">
    <h1>Pedido #<?= htmlspecialchars($order['id']) ?> — <?= htmlspecialchars($order['customer']) ?></h1>

    <div class="row">
      <div>
        <strong>Estado actual:</strong>
        <span id="current-status" class="badge"><?= htmlspecialchars($order['current_status']) ?></span>
      </div>

      <div class="change-box">
        <label for="new-status"><strong>Cambiar estado</strong></label><br>
        <select id="new-status">
          <option value="pendiente">pendiente</option>
          <option value="en preparación">en preparación</option>
          <option value="entregado">entregado</option>
          <option value="cancelado">cancelado</option>
        </select>
        <button id="update-btn" class="btn">Cambiar</button>
      </div>
    </div>

    <h2>Historial</h2>
    <div id="history"></div>

    <p><a href="index.php">← Volver</a></p>
  </div>

<script>
const orderId = <?= $order['id'] ?>;
const STATUS_COLORS = {
  'pendiente': '#FE8CBD',
  'en preparación': '#F83788',
  'entregado': '#D7B578',
  'cancelado': '#000000'
};

function badgeElement(status){
  const color = STATUS_COLORS[status] || '#FE8CBD';
  const textColor = (status === 'cancelado') ? '#ffffff' : '#000000';
  return `<span class="badge" style="background:${color}; color:${textColor};">${status}</span>`;
}

async function loadHistory(){
  try {
    const res = await fetch(`api/get_history.php?order_id=${orderId}`);
    const json = await res.json();
    const container = document.getElementById('history');
    if (!json.success) { container.innerHTML = 'No hay historial.'; return; }
    if (json.history.length === 0) { container.innerHTML = '<em>Sin cambios aún</em>'; return; }

    let html = '<table class="history-table"><thead><tr><th>Fecha</th><th>Estado</th><th>Quién</th><th>Nota</th></tr></thead><tbody>';
    json.history.forEach(h => {
      html += `<tr>
        <td>${h.changed_at}</td>
        <td>${badgeElement(h.status)}</td>
        <td>${h.changed_by}</td>
        <td>${h.note || ''}</td>
      </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
  } catch(e) {
    console.error(e);
  }
}

async function loadCurrentStatus(){
  try {
    const res = await fetch('api/get_orders.php');
    const json = await res.json();
    const order = (json.orders || []).find(o => o.id == orderId);
    if (order) {
      const el = document.getElementById('current-status');
      el.innerText = order.current_status;
      el.style.background = STATUS_COLORS[order.current_status] || '#FE8CBD';
      el.style.color = (order.current_status === 'cancelado') ? '#ffffff' : '#000000';
      document.getElementById('new-status').value = order.current_status;
    }
  } catch(e) {
    console.error(e);
  }
}

document.getElementById('update-btn').addEventListener('click', async ()=>{
  const status = document.getElementById('new-status').value;
  try {
    const res = await fetch('api/update_status.php', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ order_id: orderId, status, changed_by: 'Empleado de sucursal', note: '' })
    });
    const json = await res.json();
    if (json.success) {
      await loadHistory();
      await loadCurrentStatus();
    } else {
      alert('Error: ' + (json.message || 'desconocido'));
    }
  } catch(e) { console.error(e); }
});


loadHistory();
loadCurrentStatus();
setInterval(()=>{ loadHistory(); loadCurrentStatus(); }, 3000);
</script>
</body>
</html>
