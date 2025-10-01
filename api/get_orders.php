<?php
// api/get_orders.php
require __DIR__ . '/../init.php';
header('Content-Type: application/json; charset=utf-8');

$orders = array_values($_SESSION['orders']); 
echo json_encode(['success'=>true, 'orders'=>$orders]);
