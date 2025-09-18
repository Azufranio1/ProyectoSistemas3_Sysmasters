<?php
include("../includes/Connection.php");
include("../includes/VerifySession.php");
include("../includes/FechaLPBOB.php");

$conn = Connection();

$sql_productos = "SELECT p.ProductoID, p.Nombre, p.PrecioUnitario, p.Disponible, 
                 c.Categoria, col1.Color as Color1, col2.Color as Color2 
                 FROM Producto p 
                 INNER JOIN Categoria c ON p.CategoriaID = c.CategoriaID 
                 LEFT JOIN Color col1 ON p.ColorID1 = col1.ColorID 
                 LEFT JOIN Color col2 ON p.ColorID2 = col2.ColorID 
                 WHERE p.Habilitado = 1 AND p.Disponible > 0";
$result_productos = $conn->query($sql_productos);

$productos = [];
if ($result_productos->num_rows > 0) {
    while($row = $result_productos->fetch_assoc()) {
        $productos[] = $row;
    }
}

$fecha_actual = date('Y-m-d');
$fecha_maxima = date('Y-m-d', strtotime('+15 days'));
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulario de Renta</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <link href="../CSS/Renta.css" rel="stylesheet">
</head>
<body>
    <?php include('../includes/HeaderFormularios.php'); ?>
    <div class="renta-card">
        <h1 class="renta-title">Formulario de Renta</h1>
        
        <form id="rentaForm" method="POST" action="../utils/RentaProcess.php">
            <!-- Fechas -->
            <div class="input-group">
                <div class="form-group">
                    <label for="fecha_renta">Fecha de Renta</label>
                    <input type="date" id="fecha_renta" name="fecha_renta" class="form-control" value="<?php echo $fecha_actual; ?>" readonly>
                </div>
                <div class="form-group">
                    <label for="fecha_devolucion">Fecha de Devolución</label>
                    <input type="date" id="fecha_devolucion" name="fecha_devolucion" class="form-control" 
                           value="<?php echo $fecha_actual; ?>" 
                           min="<?php echo $fecha_actual; ?>" 
                           max="<?php echo $fecha_maxima; ?>" required>
                </div>
            </div>
            
            <!-- Clientes -->
            <h2 class="section-title">Datos del Cliente</h2>
            <div id="clientes-container">
                <div class="cliente-card" data-index="0">
                    <div class="remove-cliente" style="display: none;">&times;</div>
                    <div class="input-group">
                        <div class="form-group">
                            <label for="nombre_0">Nombre</label>
                            <input type="text" id="nombre_0" name="clientes[0][nombre]" class="form-control nombre-cliente" required minlength="3" maxlength="15">
                            <span class="check-icon">✓</span>
                            <div class="validation-error">Ingrese solo letras sin espacios ni caracteres especiales (3-15 caracteres)</div>
                        </div>
                        <div class="form-group">
                            <label for="apellido_0">Apellido</label>
                            <input type="text" id="apellido_0" name="clientes[0][apellido]" class="form-control apellido-cliente" required minlength="3" maxlength="15">
                            <span class="check-icon">✓</span>
                            <div class="validation-error">Ingrese solo letras sin espacios ni caracteres especiales (3-15 caracteres)</div>
                        </div>
                        <div class="form-group">
                            <label for="telefono_0">Teléfono</label>
                            <input type="text" id="telefono_0" min="59999999" max="79999999" name="clientes[0][telefono]" class="form-control telefono-cliente" required>
                            <span class="check-icon">✓</span>
                            <div class="validation-error">Ingrese un número de teléfono válido de 8 dígitos</div>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" id="agregar-cliente" class="btn-add">Agregar Otro Cliente</button>
            
            <!-- Productos -->
            <h2 class="section-title">Productos a Rentar</h2>
            <div id="productos-container">
    <div class="producto-card" data-index="0">
        <div class="remove-producto" style="display: none;">&times;</div>
        <div class="input-group">
            <div class="form-group">
                <label for="producto_0">Producto</label>
                <select id="producto_0" name="productos[0][producto_id]" class="form-select producto-select" required>
                    <option value="">Seleccione un producto</option>
                    <?php foreach ($productos as $producto): ?>
                        <?php 
                        $colorInfo = $producto['Color1'];
                        if (!empty($producto['Color2'])) {
                            $colorInfo .= ' con ' . $producto['Color2'];
                        }
                        ?>
                        <option value="<?php echo $producto['ProductoID']; ?>" 
                                data-nombre="<?php echo $producto['Nombre']; ?>"
                                data-categoria="<?php echo $producto['Categoria']; ?>"
                                data-color="<?php echo $colorInfo; ?>"
                                data-precio="<?php echo $producto['PrecioUnitario']; ?>"
                                data-disponible="<?php echo $producto['Disponible']; ?>">
                            <?php echo $producto['Nombre'] . ' - ' . $colorInfo . ' (Bs. ' . $producto['PrecioUnitario'] . ')'; ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="form-group">
                <label for="cantidad_0">Cantidad</label>
                <input type="number" id="cantidad_0" name="productos[0][cantidad]" class="form-control cantidad-producto" min="1" value="1" required>
            </div>
            <div class="form-group">
                <label>Subtotal</label>
                <div class="input-group">
                    <input type="text" id="subtotal_0" placeholder="Bs." name="productos[0][subtotal]" class="form-control subtotal-producto" readonly>
                </div>
            </div>
        </div>
        
        <div class="validation-error-producto" style="color: red; font-size: 0.875em; margin-top: 5px; display: none;"></div>
        <div class="producto-info" id="info_producto_0" style="display: none;">
            <p><strong>Producto:</strong> <span class="info-nombre"></span></p>
            <p><strong>Categoría:</strong> <span class="info-categoria"></span></p>
            <p><strong>Color:</strong> <span class="info-color"></span></p>
            <p><strong>Disponibilidad:</strong> <span class="info-disponible"></span> unidades</p>
        </div>
    </div>
</div>
            <button type="button" id="agregar-producto" class="btn-add">Agregar Otro Producto</button>
            
            <!-- Garantías -->
            <h2 class="section-title">Garantías</h2>
            <div id="garantias-container">
                <div class="garantia-card" data-index="0">
                    <div class="remove-garantia" style="display: none;">&times;</div>
                    <div class="input-group">
                        <div class="form-group">
                            <input type="text" id="tipo_garantia_0" name="garantias[0][tipo]" class="form-control" required minlength="5" maxlength="20">
                            <span class="check-icon">✓</span>
                            <div class="validation-error">Ingrese solo letras y espacios (3-20 caracteres)</div>
                        </div>
                        <div class="form-group">
                            <label for="cliente_garantia_0">Cliente que deja la garantía</label>
                            <select id="cliente_garantia_0" name="garantias[0][cliente_id]" class="form-select cliente-garantia-select" required disabled>
                                <option value="">Primero agregue un cliente</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            <button type="button" id="agregar-garantia" class="btn-add">Agregar Otra Garantía</button>
            
            <!-- Totales -->
            <div class="total-section">
                <div class="input-group">
                    <div class="form-group">
                        <label for="descuento">Descuento (Bs.)</label>
                        <input type="number" id="descuento" name="descuento" class="form-control" min="0" value="0">
                    </div>
                    <div class="form-group">
                        <label for="subtotal">Subtotal (Bs.)</label>
                        <input type="text" id="subtotal" name="subtotal" class="form-control" readonly>
                    </div>
                    <div class="form-group">
                        <label for="total">Total a Pagar (Bs.)</label>
                        <input type="text" id="total" name="total" class="form-control" readonly>
                    </div>
                </div>
            </div>
            
            <!-- ID oculto para el empleado -->
            <input type="hidden" name="empleado_id" value="<?php echo $_SESSION['idUser']; ?>">
            
            <!-- Botón de envío -->
            <!-- Botones -->
            <div class="buttons-container">
                <button type="submit" class="btn-submit">Registrar Renta</button>
                <a href="../Views/ManagerDB.php" class="btn-volver">Volver al Dashboard</a>
            </div>
        </form>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="../JS/Renta.js"></script>
</body>
</html>