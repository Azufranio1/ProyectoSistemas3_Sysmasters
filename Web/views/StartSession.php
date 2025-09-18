<?php include('../logic/StartSessionLogic.php'); ?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Iniciar Sesión - Mary's Tienda de Disfraces</title>
    <link rel="icon" type="image/png" href="../Resources/imgs/MarysSLogoIcon.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../CSS/Formularios.css">
</head>
<body>
    <div class="users-form">
        <img src="../Resources/imgs/MarysSLogoT.png" alt="Mary's Tienda de Disfraces">
        <h1>Iniciar Sesión</h1>
        
        <form action="" method="POST">
            <div class="mb-3">
                <input type="text" class="form-control" name="username" placeholder="Nombre de usuario o correo" required>
            </div>
            
            <div class="mb-3">
                <input type="password" class="form-control" name="password" placeholder="Contraseña" required>
            </div>
            
            <?php if (!empty($error)): ?>
                <div class="error"><?php echo htmlspecialchars($error); ?></div>
            <?php endif; ?>
            
            <div class="remember-me">
                <input type="checkbox" name="remember_me" id="remember_me">
                <label for="remember_me">Mantener sesión iniciada</label>
            </div>
            
            <button type="submit" class="btn-login">Ingresar</button>
            
            <a href="RecuperarCuenta.php" class="forgot-password">¿Olvidaste tu contraseña?</a>
        </form>
    </div>
    

</body>
</html>