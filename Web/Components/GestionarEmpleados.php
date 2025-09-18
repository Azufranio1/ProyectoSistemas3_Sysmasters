<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tabla de Empleados - Mary'sS</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../CSS/GestionarPages.css">
</head>
<body>
    <h1 class="page-title">Gestión de Empleados</h1>

    <div class="employee-actions">
        <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" id="search-input" placeholder="Buscar Empleado...">
        </div>
        <form method="POST" action="../views/AnadirEmpleado.php">
            <input type="hidden" name="IdCosa" value="EMP-000">
            <button type="submit" class="new-employee-btn">
                <i class="fas fa-plus"></i> Nuevo Empleado
            </button>
        </form>
        <form method="POST" action="../views/AnadirEmpleado.php">
            <input type="hidden" name="IdCosa" value="MGR-000">
            <button type="submit" class="new-employee-btn">
                <i class="fas fa-plus"></i> Nuevo Manager
            </button>
        </form>
        <form method="POST" action="../views/Papelera.php">
            <input type="hidden" name="IDCosa" value="<?php echo $empleado['EmpleadoID']; ?>">
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
                        <th>Empleado</th>
                        <th>CI</th>
                        <th>Fecha Nacimiento</th>
                        <th>Fecha Contrato</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="empleados-list">
                    <?php include("../logic/GestionarEmpleadosLogic.php");?>
                </tbody>
            </table>
            
            <div id="empty-state" class="empty-state" style="display:none;">
                <i class="fas fa-users"></i>
                <p>No hay empleados registrados</p>
                <button class="new-employee-btn" style="margin-top:15px; display:inline-flex;">
                    <i class="fas fa-plus"></i> Agregar Empleado
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