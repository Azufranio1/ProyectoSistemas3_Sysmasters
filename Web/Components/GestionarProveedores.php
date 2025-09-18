<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tabla de Proveedores - Mary'sS</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../CSS/GestionarPages.css">
</head>
<body>
    <h1 class="page-title">Gestión de Proveedores</h1>

    <div class="employee-actions">
        <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" id="search-input" placeholder="Buscar Proveedor...">
        </div>
        <form method="POST" action="../views/Anadir.php">
            <input type="hidden" name="IdCosa" value="PRV-000">
            <button type="submit" class="new-employee-btn">
                <i class="fas fa-plus"></i> Nuevo Proveedor
            </button>
        </form>
        <form method="POST" action="../views/Papelera.php">
            <input type="hidden" name="tabla" value="Proveedor">
            <button class="delete-employee-btn" id="delete-employee-btn" type="submit">
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
                        <th>Nombre Contacto</th>
                        <th>Título Contacto</th>
                        <th>Teléfono</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="empleados-list">
                    <?php include("../logic/GestionarProveedoresLogic.php");?>
                </tbody>
            </table>
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