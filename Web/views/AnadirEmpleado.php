<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Agregar - Mary'sS</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../CSS/Editar.css">
    <link rel="icon" type="image/png" href="../Resources/imgs/MarysSLogoIcon.png">
</head>
<body>
    <?php include('../includes/HeaderFormularios.php'); ?>
    <div class="edit-card">
        <h2>Agregar Empleado</h2>
        <?php
            include("../utils/AnadirEmpleado.php");
        ?>
    </div>
</body>
</html>