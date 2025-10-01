<?php

require __DIR__ . '/../init.php';
header('Content-Type: application/json; charset=utf-8');

$order_id = intval($_GET['order_id'] ?? 0);
if (!$order_id || !isset($_SESSION['orders'][$order_id])) {
    echo json_encode(['success'=>false, 'message'=>'order_id inválido']);
    exit;
}

$history = $_SESSION['order_history'][$order_id] ?? [];
usort($history, function($a,$b){
    return strcmp($b['changed_at'], $a['changed_at']);
});

echo json_encode(['success'=>true, 'history'=>$history]);
