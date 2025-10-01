<?php
session_start();

if (!isset($_SESSION['temp_registration'])) {
    header("Location: ../Views/SignIn.php");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['codigo_recuperacion'])) {
        $codigo = $_POST['codigo_recuperacion'];
        
        $datos_registro = $_SESSION['temp_registration'];
        
        include('../includes/Connection.php');
        $con = connection();
        
        $nuevoId = $datos_registro['nuevoId'];
        $username = $datos_registro['username'];
        $correo = $datos_registro['correo'];
        $hashed_password = $datos_registro['hashed_password'];
        
        $stmt = $con->prepare("INSERT INTO usuario (idUser, username, correo, password, CRecuperacion) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $nuevoId, $username, $correo, $hashed_password, $codigo);

        if ($stmt->execute()) {
            unset($_SESSION['temp_registration']);
            
            $_SESSION['idUser'] = $nuevoId;
            $_SESSION['username'] = $username;
            
            $stmt->close();
            $con->close();
            
            header("Location: ../views/GeoMapa.php");
            exit();
        } else {
            $error = 'Hubo un error al registrar el usuario';
            $stmt->close();
            $con->close();
        }
    }
}
?>