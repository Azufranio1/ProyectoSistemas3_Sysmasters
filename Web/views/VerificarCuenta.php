<?php include("../logic/VerificarCuentaLogic.php");?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">

    <link rel="stylesheet" href="../CSS/VerificarCuenta.css">

    <title>Configuración de Cuenta - Mary'sS</title>
</head>
<body>
    <div class="container">
        <h1>Configuración de Cuenta - Mary'sS</h1>
        
        <?php if (isset($error)): ?>
            <div class="message error">
                <?php echo $error; ?>
            </div>
        <?php endif; ?>
        
        <?php if (isset($success)): ?>
            <div class="message success">
                <?php echo $success; ?>
                <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
            </div>
            
            <div class="btn-wrapper">
            <a href="../views/StartSession.php" class="btn btn-primary">Volver al Inicio</a>
            </div>
        <?php elseif ($verificacion !== null): ?>
            <?php if ($verificacion['valido']): ?>
                <div class="message success">
                    <?php echo $verificacion['mensaje']; ?> Por favor, establece tu contraseña y código de recuperación.
                </div>
                
                <form id="passwordChangeForm" method="POST">
                    <input type="hidden" name="action" value="update_password">
                    <input type="hidden" name="idEmpleado" value="<?php echo htmlspecialchars($idEmpleado); ?>">
                    
                    <label for="password">Nueva contraseña:</label>
                    <input type="password" id="password" name="password" required>
                    
                    <label for="confirmPassword">Confirmar contraseña:</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required>
                    
                    <div class="requirements">
                        <h3>Requisitos de contraseña:</h3>
                        <div class="requirement-item" id="length">Al menos 8 caracteres</div>
                        <div class="requirement-item" id="uppercase">Al menos una letra mayúscula</div>
                        <div class="requirement-item" id="lowercase">Al menos una letra minúscula</div>
                        <div class="requirement-item" id="number">Al menos un número</div>
                        <div class="requirement-item" id="special">Al menos un carácter especial (!@#$%^&*)</div>
                        <div class="requirement-item" id="match">Las contraseñas coinciden</div>
                    </div>
                    
                    <label for="codigoRecuperacion">Código de recuperación (6 dígitos):</label>
                    <input type="text" id="codigoRecuperacion" name="codigoRecuperacion" pattern="\d{6}" 
                           title="Ingresa un código de 6 dígitos" maxlength="6" required>
                    
                    <button type="submit">Guardar configuración</button>
                </form>
                
                <script>
                    const form = document.getElementById('passwordChangeForm');
                    const password = document.getElementById('password');
                    const confirmPassword = document.getElementById('confirmPassword');
                    const codigoRecuperacion = document.getElementById('codigoRecuperacion');
                    
                    const requirements = {
                        length: /.{8,}/,
                        uppercase: /[A-Z]/,
                        lowercase: /[a-z]/,
                        number: /[0-9]/,
                        special: /[!@#$%^&*]/
                    };

                    function validatePassword() {
                        const pwd = password.value;
                        let valid = true;

                        for (const [requirement, regex] of Object.entries(requirements)) {
                            const isValid = regex.test(pwd);
                            const element = document.getElementById(requirement);
                            element.classList.toggle('valid', isValid);
                            element.classList.toggle('invalid', !isValid);
                            valid = valid && isValid;
                        }

                        const passwordsMatch = password.value === confirmPassword.value;
                        const matchElement = document.getElementById('match');
                        matchElement.classList.toggle('valid', passwordsMatch);
                        matchElement.classList.toggle('invalid', !passwordsMatch);
                        valid = valid && passwordsMatch;

                        return valid;
                    }

                    codigoRecuperacion.addEventListener('input', function() {
                        this.value = this.value.replace(/[^0-9]/g, '');
                    });

                    password.addEventListener('input', validatePassword);
                    confirmPassword.addEventListener('input', validatePassword);

                    form.addEventListener('submit', function(e) {
                        if (!validatePassword()) {
                            e.preventDefault();
                            alert('Por favor, asegúrate de cumplir todos los requisitos de la contraseña.');
                        }
                        
                        if (!/^\d{6}$/.test(codigoRecuperacion.value)) {
                            e.preventDefault();
                            alert('El código de recuperación debe ser un número de 6 dígitos.');
                        }
                    });
                </script>
            <?php else: ?>
                <div class="message error">
                    <?php echo $verificacion['mensaje']; ?>
                </div>
                <p>Por favor, solicita un nuevo enlace de activación.</p>
            <?php endif; ?>
        <?php else: ?>
            <div class="message error">
                ❌ Token no recibido.
            </div>
            <p>Es necesario un token válido para configurar tu cuenta.</p>
        <?php endif; ?>
    </div>
</body>
</html>