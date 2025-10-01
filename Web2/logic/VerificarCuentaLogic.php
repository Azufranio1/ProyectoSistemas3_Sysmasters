<?php
include("../includes/Connection.php");

define('Firma', "Mary'sS_2025");

function verificarToken($tokenRecibido, $claveSecreta, $duracionMin = 1440) {
    $partes = explode('_', $tokenRecibido);
    if (count($partes) !== 3) {
        return ['valido' => false, 'mensaje' => "❌ Token malformado. El token no tiene la estructura correcta."];
    }

    list($idCodificado, $timestamp, $firmaCodificada) = $partes;

    if (!is_numeric($timestamp)) {
        return ['valido' => false, 'mensaje' => "❌ Timestamp inválido."];
    }

    $tiempoTranscurrido = time() - intval($timestamp);
    if ($tiempoTranscurrido > ($duracionMin * 60)) {
        return ['valido' => false, 'mensaje' => "⏰ Token expirado. El token ha sido generado hace más de $duracionMin minutos."];
    }

    $firmaCalculada = hash_hmac('sha256', $idCodificado . "_" . $timestamp, $claveSecreta);
    $firmaCalculadaBase64 = base64_encode($firmaCalculada);

    if (!hash_equals($firmaCalculadaBase64, $firmaCodificada)) {
        return ['valido' => false, 'mensaje' => "⚠️ Token inválido o manipulado. La firma no coincide."];
    }

    $idDecodificado = base64_decode($idCodificado);
    if (!$idDecodificado) {
        return ['valido' => false, 'mensaje' => "❌ No se pudo decodificar el ID del token. El ID está mal codificado."];
    }

    return [
        'valido' => true, 
        'mensaje' => "✅ Token válido.", 
        'idEmpleado' => $idDecodificado
    ];
}

$verificacion = null;
$idEmpleado = null;
$error = null;
$success = null;

if (isset($_GET['token'])) {
    $token = $_GET['token'];
    $verificacion = verificarToken($token, Firma);
    if ($verificacion['valido']) {
        $idEmpleado = $verificacion['idEmpleado'];
    }
}

if (isset($_POST['action']) && $_POST['action'] == 'update_password') {
    $idEmpleado = $_POST['idEmpleado'];
    $password = $_POST['password'];
    $confirmPassword = $_POST['confirmPassword'];
    $codigoRecuperacion = $_POST['codigoRecuperacion'];
    
    if ($password !== $confirmPassword) {
        $error = "Las contraseñas no coinciden.";
    }
    elseif (strlen($password) < 8 || 
            !preg_match('/[A-Z]/', $password) || 
            !preg_match('/[a-z]/', $password) || 
            !preg_match('/[0-9]/', $password) || 
            !preg_match('/[!@#$%^&*]/', $password)) {
        $error = "La contraseña no cumple con los requisitos de seguridad.";
    }
    elseif (!preg_match('/^\d{6}$/', $codigoRecuperacion)) {
        $error = "El código de recuperación debe ser un número de 6 dígitos.";
    }
    else {
        $conexion = Connection();
        
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        $stmt = $conexion->prepare("UPDATE UsuarioEmp SET Keyword = ?, CodRecuperacion = ? WHERE EmpleadoID = ?");
        $stmt->bind_param("sss", $passwordHash, $codigoRecuperacion, $idEmpleado);
        
        if ($stmt->execute()) {
            $success = "¡Contraseña y código de recuperación actualizados correctamente!";
        } else {
            $error = "Error al actualizar: " . $conexion->error;
        }
        
        $stmt->close();
        $conexion->close();
    }
}
?>