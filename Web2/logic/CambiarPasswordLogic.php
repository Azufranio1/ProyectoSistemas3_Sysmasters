<?php
session_start();
include("../includes/Connection.php");

if (!isset($_SESSION['temp_recovery'])) {
    //header("Location: ../views/StartSession.php");
    //exit();
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = $_POST['password'] ?? '';
    $ConPassword = $_POST['ConPassword'] ?? '';

    if (empty($password) || empty($ConPassword)) {
        $error = "Por favor, complete todos los campos.";
    } elseif ($password !== $ConPassword) {
        $error = "Las contraseñas no coinciden.";
    } elseif (strlen($password) < 8) {
        $error = "La contraseña debe tener al menos 8 caracteres.";
    } else {
        $con = connection();
        $idUser = $_SESSION['temp_recovery']['idUser'];
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        $stmt = $con->prepare("UPDATE UsuarioEmp SET Keyword = ? WHERE EmpleadoID = ?");
        $stmt->bind_param("ss", $hashed_password, $idUser);
        
        if ($stmt->execute()) {
            $stmt->close();
            $con->close();
            unset($_SESSION['temp_recovery']);
            header("Location: ../views/StartSession.php?success=1");
            exit();
        } else {
            $error = "Error al actualizar la contraseña.";
        }
        $stmt->close();
        $con->close();
    }
}
?>
