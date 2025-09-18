<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tabla de Productos - Mary'sS</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../CSS/GestionarPages.css">
</head>
<body>
    <h1 class="page-title">Gestión de Productos</h1>

    <div class="employee-actions">
        <div class="search-bar">
            <i class="fas fa-search"></i>
            <input type="text" id="search-input" placeholder="Buscar Producto...">
        </div>
        <form method="POST" action="../views/Anadir.php">
            <input type="hidden" name="IdCosa" value="PRD-000">
            <button type="submit" class="new-employee-btn">
                <i class="fas fa-plus"></i> Nuevo Producto
            </button>
        </form>
        <form method="POST" action="../views/Papelera.php">
            <input type="hidden" name="IDCosa" value="<?php echo $producto['ProductoID']; ?>">
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
                        <th>Producto</th>
                        <th>Categoria</th>
                        <th>Color</th>
                        <th>Precio unit.</th>
                        <th>Precio venta</th>
                        <th>Stock</th>
                        <th>Disponible</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="empleados-list">
                    <?php include("../logic/GestionarProductosLogic.php");?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>