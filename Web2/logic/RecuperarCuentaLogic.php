<?php
session_start();
include('../includes/Connection.php');

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo = filter_input(INPUT_POST, 'correo', FILTER_SANITIZE_EMAIL);
    $codigo = $_POST['codigo'];

    if (empty($correo) || empty($codigo)) {
        $error = "Por favor, complete todos los campos.";
    } else {
        $con = connection();
        $stmt = $con->prepare("SELECT EmpleadoID, usuario FROM UsuarioEmp WHERE correo = ? AND CodRecuperacion = ?");
        $stmt->bind_param("ss", $correo, $codigo);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            $_SESSION['temp_recovery'] = [
                'idUser' => $user['EmpleadoID'],
                'username' => $user['usuario']
            ];
            $stmt->close();
            $con->close();
            header("Location: ../views/CambiarPassword.php");
            exit();
        } else {
            $error = "El correo o código de recuperación no son válidos.";
        }
        $stmt->close();
        $con->close();
    }
}
?>