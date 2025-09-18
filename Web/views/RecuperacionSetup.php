<?php include('../logic/RecuperacionSetupLogic.php'); ?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Recuperación</title>
    <link rel="icon" type="image/png" href="../Resources/imgs/MarysSLogoIcon.png">
    <link rel="stylesheet" href="../CSS/Formularios.css">
</head>
<body>
    <div class="users-form">
        <img src="../Resources/imgs/MarysSLogoT.png" alt="Company Logo">
        <h1>Código de Recuperación</h1>
        <div class="description">
            Por favor, ingresa un código numérico de 6 dígitos que usarás en caso de necesitar recuperar tu cuenta. 
            Asegúrate de guardarlo, ya que es el único método para identificarte. 
            En caso de <b>olvido o pérdida</b>, deberá <b>contactarse con el administrador</b>.
        </div>
        <form method="POST" action="">
            <input type="number" 
                   name="codigo_recuperacion" 
                   placeholder="Código de 6 dígitos"
                   min="100000"
                   max="999999"
                   required
                   oninput="javascript: if (this.value.length > 6) this.value = this.value.slice(0, 6)">
            <?php if (isset($error)) echo '<div class="error">' . htmlspecialchars($error) . '</div>'; ?>
            <input type="submit" value="Continuar">
        </form>
    </div>
</body>
</html>