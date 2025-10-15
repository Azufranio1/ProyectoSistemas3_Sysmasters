<?php
session_start();
include 'products.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php');
    exit;
}

$id = intval($_POST['product_id'] ?? 0);
$qty = max(1, intval($_POST['quantity'] ?? 1));

if (!isset($products[$id])) {
    // producto inválido -> volver
    header('Location: index.php');
    exit;
}

// inicializar carrito si hace falta
if (!isset($_SESSION['cart'])) $_SESSION['cart'] = [];

// si ya existe el producto, sumamos cantidad
if (isset($_SESSION['cart'][$id])) {
    $_SESSION['cart'][$id]['qty'] += $qty;
} else {
    $_SESSION['cart'][$id] = [
        'name' => $products[$id]['name'],
        'price' => $products[$id]['price'],
        'qty' => $qty
    ];
}

// redirigir al carrito para ver el resultado
header('Location: cart.php');
exit;
