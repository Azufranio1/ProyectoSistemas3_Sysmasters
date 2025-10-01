<?php include('../logic/RecuperarCuentaLogic.php'); ?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Cuenta - Mary's Tienda de Disfraces</title>
    <link rel="icon" type="image/png" href="../Resources/imgs/SugarDonutsLogo.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../CSS/Formularios.css">
</head>
<body>
    <div class="users-form">
        <img src="../Resources/imgs/SugarDonutsTD.png" alt="Company Logo">
        <h1>Recuperar Cuenta</h1>
        
        <div class="description">
            Ingresa tu correo electrónico y el código de recuperación de 6 dígitos con el que se registró.
        </div>
        
        <form action="" method="POST">
            <div class="mb-3">
                <input type="email"
                       class="form-control"
                       name="correo"
                       placeholder="Correo electrónico"
                       required>
            </div>
            
            <div class="mb-3 code-input">
                <input type="number"
                       class="form-control"
                       name="codigo"
                       placeholder="Código de recuperación"
                       min="100000"
                       max="999999"
                       required
                       oninput="javascript: if (this.value.length > 6) this.value = this.value.slice(0, 6)">
            </div>
            
            <?php
            if (!empty($error)) {
                echo '<div class="error">' . htmlspecialchars($error) . '</div>';
            }
            ?>
            
            <button type="submit" class="btn-login">Continuar</button>
            
            <a href="StartSession.php" class="forgot-password">Volver a inicio de sesión</a>
        </form>
    </div>
    

</body>
</html>