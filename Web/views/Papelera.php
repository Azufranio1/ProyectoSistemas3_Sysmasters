<?php
include("../logic/PapeleraLogic.php");
include("../includes/VerifySession.php");

$tipoElemento = isset($_GET['tipo']) ? $_GET['tipo'] : 'productos';

$titulo = "Papelera";
$encabezados = ["ID", "Nombre", "Información", "Descripción", "Acciones"];
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Papelera - Mary'sS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../CSS/Papelera.css">
</head>
<body>
    <h1 class="page-title"><?php echo $titulo; ?></h1>

    <div class="tabs">
        <a href="?tipo=productos" class="tab-btn <?php echo $tipoElemento == 'productos' ? 'active' : ''; ?>">Productos</a>
        <a href="?tipo=proveedores" class="tab-btn <?php echo $tipoElemento == 'proveedores' ? 'active' : ''; ?>">Proveedores</a>
        <a href="?tipo=empleados" class="tab-btn <?php echo $tipoElemento == 'empleados' ? 'active' : ''; ?>">Empleados</a>
    </div>

    <div class="card">
        <div class="employee-table">
            <table> 
                <thead>
                    <tr>
                    <?php include('../utils/PapeleraSwitches2.php');?>
                    </tr>
                </thead>
                <tbody>
                    <?php include('../utils/PapeleraSwitches1.php');?>
                </tbody>
            </table>
        </div>
    </div>

    <div class="employee-actions">
        <button class="delete-employee-btn" onclick="window.location.href='../views/ManagerDB.php'">
            <i class="bi bi-box-arrow-in-left"></i> Volver
        </button>
    </div>
</body>
</html>

<script>
function confirmarRestauracion() {
    return confirm("¿Estás seguro que deseas restaurar este elemento?");
}

function confirmarEliminacion() {
    return confirm('¿Está seguro de que desea eliminar permanentemente este elemento? Esta acción no se puede deshacer.');
}
</script>
