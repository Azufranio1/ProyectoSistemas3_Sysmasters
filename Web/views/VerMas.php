<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Detalle - Mary'sS</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../CSS/VerMas.css">
    <link rel="icon" type="image/png" href="Resources/imgs/MarysSLogoIcon.png">
</head>
<body>
    <?php include('../includes/HeaderFormularios.php'); ?>
    <div class="detalle-card">
        <?php
            include("../logic/VerMasLogic.php");
        ?>
        <div class="volver-btn">
            <button onclick="window.location.href='../views/ManagerDB.php'"><i class="bi bi-arrow-left"></i> Volver</button>
        </div>
    </div>

</body>
</html>