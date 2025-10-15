<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['confirm_order'])) {
    $cart = $_SESSION['cart'] ?? [];
    if (empty($cart)) {
        $error = 'El carrito está vacío, no se puede confirmar.';
    } else {
        
        $order_id = uniqid('ORD_');
        $total = 0.0;
        foreach ($cart as $item) $total += $item['price'] * $item['qty'];


        $_SESSION['last_order'] = [
            'id' => $order_id,
            'items' => $cart,
            'total' => $total,
            'date' => date('Y-m-d H:i:s')
        ];

  
        unset($_SESSION['cart']);
        $confirmed = true;
    }
}

$last = $_SESSION['last_order'] ?? null;
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Confirmar Pedido</title>
  <link rel="stylesheet" href="estilos.css">
</head>
<body>
  <header class="header">
    <div class="container">
      <h1>Confirmar Pedido</h1>
      <a class="btn small" href="index.php">Seguir comprando</a>
    </div>
  </header>

  <main class="container">
    <?php if (!empty($error)): ?>
      <p class="error"><?php echo htmlspecialchars($error); ?></p>
    <?php endif; ?>

    <?php if (!empty($confirmed) && $last): ?>
      <h2>¡Pedido confirmado!</h2>
      <p>Tu número de pedido es <strong><?php echo htmlspecialchars($last['id']); ?></strong></p>
      <p>Fecha: <?php echo htmlspecialchars($last['date']); ?></p>
      <table class="cart-table">
        <thead><tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead>
        <tbody>
        <?php foreach ($last['items'] as $it): ?>
          <tr>
            <td><?php echo htmlspecialchars($it['name']); ?></td>
            <td><?php echo intval($it['qty']); ?></td>
            <td><?php echo number_format($it['price'],2); ?> Bs</td>
            <td><?php echo number_format($it['price'] * $it['qty'],2); ?> Bs</td>
          </tr>
        <?php endforeach; ?>
        </tbody>
        <tfoot>
          <tr><td colspan="3" style="text-align:right;"><strong>Total:</strong></td><td><strong><?php echo number_format($last['total'],2); ?> Bs</strong></td></tr>
        </tfoot>
      </table>
    <?php else: 
        // mostrar detalle 
        $cart = $_SESSION['cart'] ?? [];
        if (empty($cart)): ?>
          <p>Tu carrito está vacío. Añade productos antes de confirmar.</p>
        <?php else:
          $total = 0;
        ?>
          <h2>Revisa tu pedido</h2>
          <table class="cart-table">
            <thead><tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead>
            <tbody>
              <?php foreach ($cart as $it): 
                $subtotal = $it['price'] * $it['qty'];
                $total += $subtotal;
              ?>
                <tr>
                  <td><?php echo htmlspecialchars($it['name']); ?></td>
                  <td><?php echo intval($it['qty']); ?></td>
                  <td><?php echo number_format($it['price'],2); ?> Bs</td>
                  <td><?php echo number_format($subtotal,2); ?> Bs</td>
                </tr>
              <?php endforeach; ?>
            </tbody>
            <tfoot>
              <tr><td colspan="3" style="text-align:right;"><strong>Total:</strong></td><td><strong><?php echo number_format($total,2); ?> Bs</strong></td></tr>
            </tfoot>
          </table>

          <form method="post" style="margin-top:1rem;">
            <button class="btn" type="submit" name="confirm_order">Confirmar pedido</button>
          </form>
        <?php endif; ?>
    <?php endif; ?>
  </main>
</body>
</html>
