<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión de Garantías - Mary'sS</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="../CSS/GestionarPages.css">
</head>
<body>
    <h1 class="page-title">Gestión de Garantías</h1>

    <div class="employee-actions">
        <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" id="search-input" placeholder="Buscar Garantías...">
        </div>
        <form method="POST" action="../views/Anadir.php">
            <input type="hidden" name="IdCosa" value="GNT-000">
            <button type="submit" class="new-employee-btn">
                <i class="fas fa-plus"></i> Nueva Garantía
            </button>
        </form>
        <form method="POST" action="../views/Papelera.php">
            <input type="hidden" name="IDCosa" value="<?php echo $garantia['GarantiaID']; ?>">
            <button type="submit" class="delete-employee-btn">
                <i class="bi bi-trash-fill"></i> Papelera
            </button>
        </form>
    </div>

    <div class="card">
        <div class="employee-table">
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="empleados-list">
                    <?php include("../logic/GestionarGarantiasLogic.php");?>
                </tbody>
            </table>
            
            <div id="empty-state" class="empty-state" style="display:none;">
                <i class="fas fa-users"></i>
                <p>No hay clientes registrados</p>
                <button class="new-employee-btn" style="margin-top:15px; display:inline-flex;">
                    <i class="fas fa-plus"></i> Agregar Cliente
                </button>
            </div>
        </div>
    </div>

    <!-- <div class="pagination">
        <div class="page-item active">1</div>
        <div class="page-item">2</div>
        <div class="page-item">3</div>
        <div class="page-item"><i class="fas fa-angle-right"></i></div>
    </div> -->
</body>
</html>