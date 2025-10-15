<?php
// api/update_status.php
require __DIR__ . '/../init.php';
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$order_id = intval($data['order_id'] ?? 0);
$status = trim($data['status'] ?? '');
$changed_by = trim($data['changed_by'] ?? 'Empleado');
$note = trim($data['note'] ?? '');

$allowed = ['pendiente','en preparación','entregado','cancelado'];

if (!$order_id || !isset($_SESSION['orders'][$order_id]) || !in_array($status, $allowed)) {
    http_response_code(400);
    echo json_encode(['success'=>false, 'message'=>'datos inválidos']);
    exit;
}


$_SESSION['orders'][$order_id]['current_status'] = $status;


$now = (new DateTime())->format('Y-m-d H:i:s');
if (!isset($_SESSION['order_history'][$order_id])) {
    $_SESSION['order_history'][$order_id] = [];
}
array_unshift($_SESSION['order_history'][$order_id], [
    'status'=>$status,
    'changed_by'=>$changed_by,
    'note'=>$note,
    'changed_at'=>$now
]);

echo json_encode(['success'=>true, 'message'=>'estado actualizado']);
