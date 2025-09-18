<?php

//use Dba\Connection;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../libs/PHPMailer-master/src/PHPMailer.php';
require '../libs/PHPMailer-master/src/SMTP.php';
require '../libs/PHPMailer-master/src/Exception.php';

include("../includes/Connection.php");

define('CLAVE_SECRETA', "Mary'sS_2025");

$dominiosPermitidos = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'est.univalle.edu'];

$con = Connection();

$mensaje = '';
$tipoMensaje = '';
$mostrarFormulario = true;
$reintento = false;
$correoEmpleado = '';
$idEmpleado = '';

// Función para obtener correos ya registrados
function obtenerCorreosRegistrados($con) {
    $stmt = $con->prepare("SELECT correo FROM UsuarioEmp WHERE correo IS NOT NULL AND correo != ''");
    $stmt->execute();
    $result = $stmt->get_result();
    $correos = [];
    while ($row = $result->fetch_assoc()) {
        $correos[] = strtolower(trim($row['correo']));
    }
    $stmt->close();
    return $correos;
}

// Función para verificar si un empleado ya tiene correo asignado
function empleadoTieneCorreo($con, $idEmpleado) {
    $stmt = $con->prepare("SELECT correo FROM UsuarioEmp WHERE EmpleadoID = ? AND correo IS NOT NULL AND correo != ''");
    $stmt->bind_param("s", $idEmpleado);
    $stmt->execute();
    $result = $stmt->get_result();
    $hasEmail = $result->num_rows > 0;
    $correoActual = '';
    if ($hasEmail) {
        $row = $result->fetch_assoc();
        $correoActual = $row['correo'];
    }
    $stmt->close();
    return ['tiene_correo' => $hasEmail, 'correo' => $correoActual];
}

// Función para enviar correo
function enviarCorreoActivacion($correoEmpleado, $idEmpleado) {
    $timestamp = time();
    $idCodificado = base64_encode($idEmpleado);
    $firma = hash_hmac('sha256', $idCodificado . "_" . $timestamp, CLAVE_SECRETA);
    $firmaCodificada = base64_encode($firma);
    $token = $idCodificado . "_" . $timestamp . "_" . $firmaCodificada;
    
    $url = "https://azusprojects.ratio-software-bo.tech/Azufranio/Mary%27sS%20System%20v3.7/RepoProyectoSistemas2-AlquilerVestuarioMary-sS/Web/views/VerificarCuenta.php?token=" . urlencode($token);
    
    $mail = new PHPMailer(true);
    
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'marysscompany@gmail.com';
        $mail->Password   = 'borb mznd wmru hgpu';
        $mail->SMTPSecure = 'tls';
        $mail->Port       = 587;
        
        $mail->setFrom('marysscompany@gmail.com', 'Mary\'sS');
        $mail->addAddress($correoEmpleado);
        
        $mail->isHTML(true);
        $mail->Subject = 'Activación de cuenta de empleado';
        $mail->Body = "
            <h2>Bienvenido a Mary'sS</h2>
            <p>Has sido registrado en nuestro sistema. Para establecer tu contraseña y tu código de recuperación, haz clic en el siguiente botón:</p>
            <p><a href='$url' style='padding:10px 20px; background-color:#FF3DA1; color:white; text-decoration:none; border-radius:12px; font-weight:600;'>Configurar mi contraseña y código</a></p>
            <p>O puedes copiar y pegar el siguiente enlace en tu navegador:<br><a href='$url'>$url</a></p>
            <p>Este enlace expirará en 24 horas por motivos de seguridad.</p>
            <hr>
            <small>Este es un correo automático, por favor no responda a este mensaje.</small>
        ";
        
        $mail->send();
        return ['success' => true, 'message' => ''];
    } catch (Exception $e) {
        return ['success' => false, 'message' => $mail->ErrorInfo];
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['id'])) {
        $mensaje = "Error: No se recibió el ID del empleado.";
        $tipoMensaje = "danger";
    } else {
        $idEmpleado = $_POST['id'];
        
        // Verificar si es un reenvío
        if (isset($_POST['reenviar'])) {
            $infoCorreo = empleadoTieneCorreo($con, $idEmpleado);
            if ($infoCorreo['tiene_correo']) {
                $correoEmpleado = $infoCorreo['correo'];
                $resultadoEnvio = enviarCorreoActivacion($correoEmpleado, $idEmpleado);
                
                if ($resultadoEnvio['success']) {
                    $mensaje = "¡Correo reenviado exitosamente a $correoEmpleado!";
                    $tipoMensaje = "success";
                    $mostrarFormulario = false;
                } else {
                    $mensaje = "Error al reenviar el correo: " . $resultadoEnvio['message'];
                    $tipoMensaje = "danger";
                    $reintento = true;
                    $correoEmpleado = $infoCorreo['correo'];
                }
            } else {
                $mensaje = "Error: El empleado no tiene un correo asignado para reenviar.";
                $tipoMensaje = "danger";
            }
        } else if (isset($_POST['correo'])) {
            $correoEmpleado = trim($_POST['correo']);
            
            // Validaciones del correo
            if (!filter_var($correoEmpleado, FILTER_VALIDATE_EMAIL)) {
                $mensaje = "Correo inválido. Por favor, ingrese un correo electrónico válido.";
                $tipoMensaje = "danger";
            } else {
                $dominio = explode('@', $correoEmpleado)[1];
                if (!in_array($dominio, $dominiosPermitidos)) {
                    $mensaje = "Dominio no permitido. Use uno de los siguientes: " . implode(', ', $dominiosPermitidos);
                    $tipoMensaje = "danger";
                } else {
                    // Verificar si el correo ya está registrado
                    $correosRegistrados = obtenerCorreosRegistrados($con);
                    $correoLower = strtolower(trim($correoEmpleado));
                    
                    if (in_array($correoLower, $correosRegistrados)) {
                        $mensaje = "El correo '$correoEmpleado' ya está registrado en el sistema. Por favor, use otro correo.";
                        $tipoMensaje = "danger";
                    } else {
                        // Actualizar el correo en la base de datos
                        $stmt = $con->prepare("UPDATE UsuarioEmp SET correo = ? WHERE EmpleadoID = ?");
                        $stmt->bind_param("ss", $correoEmpleado, $idEmpleado);
                        if (!$stmt->execute()) {
                            $mensaje = "Error al actualizar el correo: " . $stmt->error;
                            $tipoMensaje = "danger";
                        } else {
                            $stmt->close();
                            
                            // Enviar correo de activación
                            $resultadoEnvio = enviarCorreoActivacion($correoEmpleado, $idEmpleado);
                            
                            if ($resultadoEnvio['success']) {
                                $mensaje = "¡Correo enviado exitosamente a $correoEmpleado!";
                                $tipoMensaje = "success";
                                $mostrarFormulario = false;
                            } else {
                                $mensaje = "Error al enviar el correo: " . $resultadoEnvio['message'];
                                $tipoMensaje = "danger";
                                $reintento = true;
                            }
                        }
                    }
                }
            }
        }
    }
}

// Verificar si el empleado ya tiene correo para mostrar opción de reenvío
$infoCorreoEmpleado = null;
if (!empty($idEmpleado)) {
    $infoCorreoEmpleado = empleadoTieneCorreo($con, $idEmpleado);
}

if (isset($con)) {
    $con->close();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mary'sS - Activación de Cuenta</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

    <link rel="stylesheet" href="../CSS/CorreoEmpleado.css">
</head>
<body>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="users-form">
                    <div class="logo-container">
                    <img src="../Resources/imgs/MarysSLogoT.png" alt="Mary's Tienda de Disfraces">
                    </div>
                    
                    <h4 class="mb-4 text-center">Activación de Cuenta de Empleado</h4>
                    
                    <?php if (!empty($mensaje)): ?>
                        <div class="alert alert-<?php echo $tipoMensaje; ?> alert-dismissible fade show fadeIn" role="alert">
                            <?php echo $mensaje; ?>
                            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                        </div>
                    <?php endif; ?>
                    
                    <?php if ($mostrarFormulario): ?>
                        <?php if ($infoCorreoEmpleado && $infoCorreoEmpleado['tiene_correo']): ?>
                            <div class="alert alert-info mb-4">
                                <i class="bi bi-info-circle"></i>
                                <strong>Correo ya asignado:</strong> <?php echo htmlspecialchars($infoCorreoEmpleado['correo']); ?>
                                <br><small>Puede reenviar el correo de activación o asignar uno nuevo.</small>
                            </div>
                            
                            <div class="row mb-3">
                                <div class="col-6">
                                    <form method="POST">
                                        <input type="hidden" name="id" value="<?php echo htmlspecialchars($idEmpleado); ?>">
                                        <button type="submit" name="reenviar" class="btn btn-outline-primary w-100">
                                            <i class="bi bi-arrow-repeat"></i> Reenviar Correo
                                        </button>
                                    </form>
                                </div>
                                <div class="col-6">
                                    <button type="button" class="btn btn-outline-secondary w-100" onclick="toggleNuevoCorreo()">
                                        <i class="bi bi-pencil"></i> Cambiar Correo
                                    </button>
                                </div>
                            </div>
                            
                            <div id="nuevoCorreoForm" style="display: none;">
                                <hr>
                                <h6>Asignar Nuevo Correo</h6>
                        <?php endif; ?>
                        
                        <form method="POST" class="needs-validation" novalidate>
                            <input type="hidden" name="id" value="<?php echo isset($idEmpleado) ? htmlspecialchars($idEmpleado) : ''; ?>">
                            
                            <div class="mb-4">
                                <label for="correo" class="form-label">Correo Electrónico del Empleado *</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-envelope"></i></span>
                                    <input type="email" class="form-control" id="correo" name="correo" 
                                           value="<?php echo htmlspecialchars($correoEmpleado); ?>" 
                                           placeholder="ejemplo@dominio.com" required>
                                </div>
                                <div class="form-text mt-2">
                                    <strong>Dominios permitidos:</strong> <?php echo implode(', ', $dominiosPermitidos); ?>
                                </div>
                            </div>
                            
                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-primary">
                                    <i class="bi bi-send"></i> Enviar Correo de Activación
                                </button>
                            </div>
                        </form>
                        
                        <?php if ($infoCorreoEmpleado && $infoCorreoEmpleado['tiene_correo']): ?>
                            </div>
                        <?php endif; ?>
                        
                    <?php elseif ($reintento): ?>
                        <div class="alert alert-warning mb-4">
                            <i class="bi bi-exclamation-triangle"></i>
                            <strong>Error en el envío.</strong> ¿Desea intentar nuevamente?
                        </div>
                        <form method="POST" class="fadeIn">
                            <input type="hidden" name="id" value="<?php echo htmlspecialchars($idEmpleado); ?>">
                            <input type="hidden" name="correo" value="<?php echo htmlspecialchars($correoEmpleado); ?>">
                            <div class="d-grid gap-2 mb-3">
                                <button type="submit" class="btn btn-retry">
                                    <i class="bi bi-arrow-clockwise"></i> Reintentar Envío
                                </button>
                            </div>
                        </form>
                        <div class="text-center">
                            <button type="button" class="btn btn-outline-secondary" onclick="location.reload()">
                                <i class="bi bi-pencil"></i> Cambiar Correo
                            </button>
                        </div>
                    <?php else: ?>
                        <div class="text-center my-4 fadeIn">
                            <i class="bi bi-check-circle-fill success-icon" style="font-size: 3rem; color: #28a745;"></i>
                            <h5 class="mt-3 mb-2">¡Correo Enviado Exitosamente!</h5>
                            <p>Se ha enviado un correo con las instrucciones para activar la cuenta a:</p>
                            <p><strong><?php echo htmlspecialchars($correoEmpleado); ?></strong></p>
                            <div class="mt-4">
                                <a href="../views/ManagerDB.php" class="btn btn-primary me-2">
                                    <i class="bi bi-house"></i> Volver al Inicio
                                </a>
                                <button type="button" class="btn btn-outline-primary" onclick="reenviarCorreo()">
                                    <i class="bi bi-arrow-repeat"></i> Reenviar Correo
                                </button>
                            </div>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
    // Validación de formularios Bootstrap
    (function () {
        'use strict'
        var forms = document.querySelectorAll('.needs-validation')
        Array.prototype.slice.call(forms).forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }
                form.classList.add('was-validated')
            }, false)
        })
    })()
    
    // Función para reenviar correo sin redirección
    function reenviarCorreo() {
        const idEmpleado = '<?php echo htmlspecialchars($idEmpleado); ?>';
        
        // Crear formulario temporal para reenvío
        const form = document.createElement('form');
        form.method = 'POST';
        form.style.display = 'none';
        
        const inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.name = 'id';
        inputId.value = idEmpleado;
        
        const inputReenviar = document.createElement('input');
        inputReenviar.type = 'hidden';
        inputReenviar.name = 'reenviar';
        inputReenviar.value = '1';
        
        form.appendChild(inputId);
        form.appendChild(inputReenviar);
        document.body.appendChild(form);
        
        // Mostrar loading en el botón
        const btn = event.target;
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="bi bi-arrow-repeat"></i> Reenviando...';
        
        // Enviar formulario
        form.submit();
    }
    
    // Función para mostrar/ocultar formulario de nuevo correo
    function toggleNuevoCorreo() {
        const form = document.getElementById('nuevoCorreoForm');
        const isVisible = form.style.display !== 'none';
        form.style.display = isVisible ? 'none' : 'block';
        
        const button = event.target.closest('button');
        const icon = button.querySelector('i');
        const text = button.childNodes[button.childNodes.length - 1];
        
        if (isVisible) {
            icon.className = 'bi bi-pencil';
            text.textContent = ' Cambiar Correo';
        } else {
            icon.className = 'bi bi-x-circle';
            text.textContent = ' Cancelar';
        }
    }
    
    // Validación en tiempo real del correo
    document.addEventListener('DOMContentLoaded', function() {
        const correoInput = document.getElementById('correo');
        if (correoInput) {
            correoInput.addEventListener('blur', function() {
                validateEmail(this);
            });
            
            correoInput.addEventListener('input', function() {
                clearValidationMessage(this);
            });
        }
    });
    
    function validateEmail(input) {
        const value = input.value.trim();
        const dominiosPermitidos = <?php echo json_encode($dominiosPermitidos); ?>;
        
        clearValidationMessage(input);
        
        if (!value) {
            showValidationMessage(input, 'El correo es obligatorio', 'error');
            return false;
        }
        
        if (!isValidEmail(value)) {
            showValidationMessage(input, 'Formato de correo inválido', 'error');
            return false;
        }
        
        const dominio = value.split('@')[1];
        if (!dominiosPermitidos.includes(dominio)) {
            showValidationMessage(input, 'Dominio no permitido. Use: ' + dominiosPermitidos.join(', '), 'error');
            return false;
        }
        
        showValidationMessage(input, 'Correo válido', 'success');
        return true;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showValidationMessage(input, message, type) {
        const container = input.closest('.mb-4') || input.parentNode;
        const messageDiv = document.createElement('div');
        messageDiv.className = `validation-message ${type}`;
        messageDiv.innerHTML = `<small style="color: ${type === 'error' ? '#dc3545' : '#28a745'}">${message}</small>`;
        container.appendChild(messageDiv);
        
        input.classList.remove('is-valid', 'is-invalid');
        input.classList.add(type === 'error' ? 'is-invalid' : 'is-valid');
    }
    
    function clearValidationMessage(input) {
        const container = input.closest('.mb-4') || input.parentNode;
        const existingMessage = container.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        input.classList.remove('is-valid', 'is-invalid');
    }
    </script>
</body>
</html>