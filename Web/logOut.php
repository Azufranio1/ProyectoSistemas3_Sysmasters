<?php
session_start();
include('includes/Connection.php');

date_default_timezone_set('America/La_Paz');

if (isset($_SESSION['idUser']) && isset($_SESSION['username'])) {
    $con = connection();

    $fecha_hora = date('Y-m-d H:i:s');
    $accion = 0;

    // Inserción en la tabla de actividad (Incorporarlo cuando la BD esté lista)
    /*$stmt_activity = $con->prepare("INSERT INTO RegActividad (idUser, username, fecha_hora, accion) VALUES (?, ?, ?, ?)");
    $stmt_activity->bind_param("sssi", $_SESSION['idUser'], $_SESSION['username'], $fecha_hora, $accion);
    $stmt_activity->execute();
    $stmt_activity->close();*/

    session_destroy();
}


header("Location: index.php");
exit();
?>
