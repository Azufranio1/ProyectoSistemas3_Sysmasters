<?php include("../logic/CambiarPasswordLogic.php"); ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cambiar Contraseña - Mary's Tienda de Disfraces</title>
    <link rel="icon" type="image/png" href="../Resources/imgs/MarysSLogoIcon.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../CSS/Formularios.css">
    
</head>
<body>
    <div class="users-form">
        <img src="../Resources/imgs/MarysSLogoT.png" alt="Mary's Tienda de Disfraces">
        <h1>Nueva Contraseña</h1>
        
        <div class="description">
            Crea una contraseña segura que cumpla con todos los requisitos.
        </div>
        
        <form action="" method="POST" id="passwordChangeForm">
            <div class="mb-3">
                <input type="password" class="form-control" name="password" id="password" placeholder="Nueva contraseña" required>
            </div>
            
            <div class="password-requirements">
                <div class="requirement" id="length">Mínimo 8 caracteres</div>
                <div class="requirement" id="uppercase">Al menos una mayúscula</div>
                <div class="requirement" id="lowercase">Al menos una minúscula</div>
                <div class="requirement" id="number">Al menos un número</div>
                <div class="requirement" id="special">Al menos un carácter especial (!@#$%^&*)</div>
                <div class="requirement" id="match">Las contraseñas coinciden</div>
            </div>
            
            <div class="mb-3">
                <input type="password" class="form-control" name="ConPassword" id="confirmPassword" placeholder="Confirmar contraseña" required>
            </div>
            
            <?php
            if (!empty($error)) {
                echo '<div class="error">' . htmlspecialchars($error) . '</div>';
            }
            ?>
            
            <button type="submit" class="btn-login">Cambiar Contraseña</button>
            
            <a href="StartSession.php" class="forgot-password">Volver a inicio de sesión</a>
        </form>
    </div>

    <script src="../JS/CambiarPassword.js"></script>
</body>
</html>