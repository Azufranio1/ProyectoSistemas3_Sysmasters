<?php
session_start();
include 'products.php';

// Eliminar item si viene ?remove=ID
if (isset($_GET['remove'])) {
    $rem = intval($_GET['remove']);
    if (isset($_SESSION['cart'][$rem])) {
        unset($_SESSION['cart'][$rem]);
    }
    header('Location: cart.php');
    exit;
}

$cart = $_SESSION['cart'] ?? [];
$total = 0.0;
foreach ($cart as $item) {
    $subtotal = $item['price'] * $item['qty'];
    $total += $subtotal;
}
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Carrito</title>
  <link rel="stylesheet" href="estilos.css">
</head>
<body>
  <header class="header">
    <div class="container">
      <h1>Carrito</h1>
      <a class="btn small" href="index.php">Volver a productos</a>
    </div>
  </header>

  <main class="container">
    <?php if (empty($cart)): ?>
      <p>Tu carrito está vacío.</p>
    <?php else: ?>
      <table class="cart-table">
        <thead><tr><th>Producto</th><th>Precio</th><th>Cant</th><th>Subtotal</th><th></th></tr></thead>
        <tbody>
          <?php foreach ($cart as $id => $item): 
            $subtotal = $item['price'] * $item['qty'];
          ?>
            <tr>
              <td><?php echo htmlspecialchars($item['name']); ?></td>
              <td><?php echo number_format($item['price'],2); ?> Bs</td>
              <td><?php echo intval($item['qty']); ?></td>
              <td><?php echo number_format($subtotal,2); ?> Bs</td>
              <td><a class="btn small ghost" href="cart.php?remove=<?php echo $id; ?>">Eliminar</a></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align:right;"><strong>Total:</strong></td>
            <td><strong><?php echo number_format($total,2); ?> Bs</strong></td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top:1rem;">
        <a class="btn" href="confirm.php">Confirmar pedido</a>
      </div>
    <?php endif; ?>
  </main>
</body>
</html>
