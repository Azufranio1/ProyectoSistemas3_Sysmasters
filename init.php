<?php
// init.php


session_start();
date_default_timezone_set('America/La_Paz');

if (!isset($_SESSION['orders'])) {
    $_SESSION['orders'] = [
        1 => ['id'=>1, 'customer'=>'Cliente A', 'current_status'=>'pendiente', 'created_at'=>'2025-09-30 10:00:00'],
        2 => ['id'=>2, 'customer'=>'Cliente B', 'current_status'=>'en preparación', 'created_at'=>'2025-09-30 10:05:00'],
        3 => ['id'=>3, 'customer'=>'Cliente C', 'current_status'=>'entregado', 'created_at'=>'2025-09-29 16:20:00'],
    ];
}


if (!isset($_SESSION['order_history'])) {
    $_SESSION['order_history'] = [
        1 => [
            ['status'=>'pendiente','changed_by'=>'system','note'=>'creado','changed_at'=>'2025-09-30 10:00:00'],
        ],
        2 => [
            ['status'=>'en preparación','changed_by'=>'system','note'=>'creado','changed_at'=>'2025-09-30 10:05:00'],
        ],
        3 => [
            ['status'=>'entregado','changed_by'=>'system','note'=>'creado','changed_at'=>'2025-09-29 16:20:00'],
        ],
    ];
}
