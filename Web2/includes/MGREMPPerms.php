<?php
$idUser = $_SESSION['idUser'] ?? '';

$prefix = substr($idUser, 0, 3); // Extrae los primeros 3 caracteres


if($prefix == 'EMP'){
    header('Location: ../Views/EmployeeDB.php');
}
?>