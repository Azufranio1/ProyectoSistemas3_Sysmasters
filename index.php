<?php
session_start();
include 'products.php';
$cart_count = 0;
if (!empty($_SESSION['cart'])) {
    foreach ($_SESSION['cart'] as $it) $cart_count += $it['qty'];
}
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Tienda - Productos</title>
  <link rel="stylesheet" href="estilos.css">
</head>
<body>
  <header class="header">
    <div class="container">
      <h1>Mi Tienda</h1>
      <nav>
        <a class="btn small" href="cart.php">Carrito (<?php echo $cart_count; ?>)</a>
      </nav>
    </div>
  </header>

  <main class="container">
    <h2>Productos</h2>
    <div class="products-grid">
      <?php foreach ($products as $id => $p): ?>
        <div class="product-card">
          <h3><?php echo htmlspecialchars($p['name']); ?></h3>
          <p class="desc"><?php echo htmlspecialchars($p['desc']); ?></p>
          <p class="price"><?php echo number_format($p['price'], 2); ?> Bs</p>

          <form method="post" action="add_to_cart.php" class="inline-form">
            <input type="hidden" name="product_id" value="<?php echo $id; ?>">
            <label>
              Cant:
              <input type="number" name="quantity" value="1" min="1" class="qty-input">
            </label>
            <button class="btn" type="submit">Agregar</button>
          </form>
        </div>
      <?php endforeach; ?>
    </div>
  </main>
</body>
</html>
