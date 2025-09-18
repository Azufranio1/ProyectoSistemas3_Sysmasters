<?php
include('../includes/Connection.php');
$conn = connection();

// Procesar el formulario cuando se envía
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $proveedor_id = $_POST["proveedor_id"];
    $fecha_provision = $_POST["fecha_provision"];
    $productos = $_POST["productos"]; // Array de productos

    $conn->begin_transaction();
    
    try {
        // Registrar cada producto en Provision
        foreach ($productos as $producto) {
            $producto_id = $producto["producto_id"];
            $cantidad = intval($producto["cantidad"]);
            $precio_venta = intval($producto["precio_venta"]);
            $subtotal = $cantidad * $precio_venta;

            // Verificar si ya existe una provisión para este producto y proveedor
            $check_stmt = $conn->prepare("SELECT COUNT(*) as count FROM Provision WHERE ProductoID = ? AND ProveedorID = ?");
            $check_stmt->bind_param("ss", $producto_id, $proveedor_id);
            $check_stmt->execute();
            $result = $check_stmt->get_result();
            $exists = $result->fetch_assoc()['count'] > 0;

            if ($exists) {
                // Actualizar provision existente
                $update_provision = $conn->prepare("UPDATE Provision SET FechaProvision = ?, Cantidad = Cantidad + ?, Subtotal = Subtotal + ? WHERE ProductoID = ? AND ProveedorID = ?");
                $update_provision->bind_param("siiss", $fecha_provision, $cantidad, $subtotal, $producto_id, $proveedor_id);
                $update_provision->execute();
            } else {
                // Insertar nueva provision
                $stmt = $conn->prepare("INSERT INTO Provision (ProductoID, ProveedorID, FechaProvision, Cantidad, Subtotal) VALUES (?, ?, ?, ?, ?)");
                $stmt->bind_param("sssii", $producto_id, $proveedor_id, $fecha_provision, $cantidad, $subtotal);
                $stmt->execute();
            }

            // Actualizar stock en Producto
            $update_stmt = $conn->prepare("UPDATE Producto SET Stock = Stock + ?, Disponible = Disponible + ?, PrecioVenta = ? WHERE ProductoID = ?");
            $update_stmt->bind_param("iiis", $cantidad, $cantidad, $precio_venta, $producto_id);
            $update_stmt->execute();
        }

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Lote registrado exitosamente"]);
        exit;
        
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Error al registrar el lote: " . $e->getMessage()]);
        exit;
    }
}

// Obtener lista de proveedores
$proveedores = $conn->query("SELECT ProveedorID, Nombre FROM Proveedor WHERE Habilitado = 1");

// Obtener lista de productos
$productos = $conn->query("SELECT ProductoID, Nombre, PrecioUnitario, PrecioVenta, Stock, Disponible FROM Producto WHERE Habilitado = 1");
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registrar Nuevo Lote - Mary_sS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <style>
        .header-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem 0;
            margin-bottom: 2rem;
        }
        .card {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: none;
            border-radius: 10px;
        }
        .btn-custom {
            background: linear-gradient(45deg, #667eea, #764ba2);
            border: none;
            color: white;
            padding: 0.5rem 1.5rem;
            border-radius: 25px;
            transition: all 0.3s ease;
        }
        .btn-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            color: white;
        }
        .btn-custom:disabled {
            background: #6c757d;
            transform: none;
            cursor: not-allowed;
        }
        .table-header {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .product-row {
            transition: all 0.3s ease;
        }
        .product-row:hover {
            background-color: #f8f9fa;
        }
        .total-section {
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
            border-radius: 10px;
            padding: 1rem;
            margin-top: 1rem;
        }
        .alert-custom {
            border-left: 4px solid #667eea;
            background-color: #f8f9ff;
        }
        .validation-message {
            color: #dc3545;
            font-size: 0.875em;
            margin-top: 0.25rem;
            display: none;
        }
        .btn-eliminar:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
<div class="header-section">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-md-8">
                <h1 style="display: inline-block;"><i class="fas fa-boxes me-3"></i>Registrar Nuevo Lote</h1>
                <p class="mb-0">Sistema de Gestión de Inventarios - Mary_sS</p>
            </div>
            <div class="col-md-4 text-end">
                <a href="../Views/ManagerDB.php" style="color: white; text-decoration: none; margin-right: 15px;">
                    <i class="fas fa-warehouse fa-3x opacity-50"></i> 
                </a>
            </div>
        </div>
    </div>
</div>

    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-light">
                        <h5 class="mb-0"><i class="fas fa-plus-circle me-2"></i>Información del Lote</h5>
                    </div>
                    <div class="card-body">
                        <form id="formLote">
                            <div class="row mb-4">
                                <div class="col-md-6">
                                    <label for="proveedor_id" class="form-label">
                                        <i class="fas fa-truck me-2"></i>Proveedor:
                                    </label>
                                    <select class="form-select" id="proveedor_id" name="proveedor_id" required>
                                        <option value="">Seleccionar proveedor</option>
                                        <?php while($proveedor = $proveedores->fetch_assoc()): ?>
                                            <option value="<?= $proveedor['ProveedorID'] ?>"><?= $proveedor['Nombre'] ?></option>
                                        <?php endwhile; ?>
                                    </select>
                                </div>
                                
                                <div class="col-md-6">
                                    <label for="fecha_provision" class="form-label">
                                        <i class="fas fa-calendar me-2"></i>Fecha de Provisión:
                                    </label>
                                    <input type="date" class="form-control" id="fecha_provision" name="fecha_provision" required value="<?= date('Y-m-d') ?>" readonly>
                                </div>
                            </div>
                            
                            <h5 class="mb-3"><i class="fas fa-list me-2"></i>Productos del Lote</h5>
                            <div class="table-responsive">
                                <table class="table table-striped" id="tablaProductos">
                                    <thead class="table-header">
                                        <tr>
                                            <th width="35%">Producto</th>
                                            <th width="15%">Cantidad</th>
                                            <th width="20%">Precio Venta</th>
                                            <th width="20%">Subtotal</th>
                                            <th width="10%">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Filas de productos se añadirán aquí -->
                                    </tbody>
                                    <tfoot>
                                        <tr class="table-info">
                                            <th colspan="3" class="text-end">Total General:</th>
                                            <th id="totalGeneral">0.00</th>
                                            <th></th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            <div class="validation-message" id="validationMessage">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                <span id="validationText"></span>
                            </div>
                            
                            <div class="d-flex gap-2 mt-4">
                                <button type="button" class="btn btn-custom" id="btnAgregarProducto">
                                    <i class="fas fa-plus me-2"></i>Agregar Producto
                                </button>
                                <button type="submit" class="btn btn-success">
                                    <i class="fas fa-save me-2"></i>Registrar Lote
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de Confirmación -->
    <div class="modal fade" id="modalConfirmacion" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Confirmar Registro</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>¿Está seguro de que desea registrar este lote?</p>
                    <div id="resumenLote"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-success" id="confirmarRegistro">Confirmar</button>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        $(document).ready(function() {
            // Cargar productos disponibles
            let productos = [
                <?php 
                $productos->data_seek(0); // Reset pointer
                $items = [];
                while($producto = $productos->fetch_assoc()): 
                    $items[] = "{id: '{$producto['ProductoID']}', nombre: '{$producto['Nombre']}', precioUnitario: {$producto['PrecioUnitario']}, precioVenta: {$producto['PrecioVenta']}, stock: {$producto['Stock']}}";
                endwhile;
                echo implode(',', $items);
                ?>
            ];

            // Función para validar si se puede agregar un nuevo producto
            function puedeAgregarProducto() {
                let filas = $('#tablaProductos tbody tr');
                let ultimaFila = filas.last();
                
                if (filas.length === 0) return true;
                
                let productoSeleccionado = ultimaFila.find('.producto-id').val();
                return productoSeleccionado !== '';
            }

            // Función para actualizar el estado del botón agregar
            function actualizarBotonAgregar() {
                let boton = $('#btnAgregarProducto');
                let validationDiv = $('#validationMessage');
                
                if (puedeAgregarProducto()) {
                    boton.prop('disabled', false);
                    validationDiv.hide();
                } else {
                    boton.prop('disabled', true);
                    $('#validationText').text('Debe seleccionar un producto en la fila actual antes de agregar una nueva.');
                    validationDiv.show();
                }
            }

            // Función para actualizar botones de eliminar
            function actualizarBotonesEliminar() {
                let filas = $('#tablaProductos tbody tr');
                let botones = $('.btn-eliminar');
                
                if (filas.length <= 1) {
                    botones.prop('disabled', true).attr('title', 'No se puede eliminar la última fila');
                } else {
                    botones.prop('disabled', false).attr('title', 'Eliminar');
                }
            }

            // Agregar fila de producto
            $('#btnAgregarProducto').click(function() {
                if (!puedeAgregarProducto()) {
                    return;
                }

                let select = '<select class="form-select producto-id" required><option value="">Seleccionar producto</option>';
                productos.forEach(p => {
                    select += `<option value="${p.id}" data-precio-venta="${p.precioVenta}" data-stock="${p.stock}">${p.nombre} (${p.id}) - Stock: ${p.stock}</option>`;
                });
                select += '</select>';
                
                let row = `<tr class="product-row">
                    <td>${select}</td>
                    <td><input type="number" class="form-control cantidad" min="1" value="1" max="50" required></td>
                    <td><input type="number" class="form-control precio-venta" step="1" min="30" max="1000" required></td>
                    <td class="subtotal fw-bold">0.00</td>
                    <td><button type="button" class="btn btn-danger btn-sm btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button></td>
                </tr>`;
                
                $('#tablaProductos tbody').append(row);
                
                actualizarBotonAgregar();
                actualizarBotonesEliminar();
                calcularTotal();
            });

            // Evento cuando se selecciona un producto
            $(document).on('change', '.producto-id', function() {
                let precioVenta = $(this).find('option:selected').data('precio-venta');
                if (precioVenta) {
                    $(this).closest('tr').find('.precio-venta').val(precioVenta).trigger('input');
                }
                
                // Actualizar estado del botón agregar cada vez que se selecciona un producto
                actualizarBotonAgregar();
            });

            // Calcular subtotal cuando cambian cantidad o precio
            $(document).on('input', '.cantidad, .precio-venta', function() {
                let row = $(this).closest('tr');
                let cantidad = parseInt(row.find('.cantidad').val()) || 0;
                let precio = parseInt(row.find('.precio-venta').val()) || 0;
                let subtotal = cantidad * precio;
                row.find('.subtotal').text(subtotal.toFixed(2));
                calcularTotal();
            });

            // Eliminar fila
            $(document).on('click', '.btn-eliminar', function() {
                let filas = $('#tablaProductos tbody tr');
                
                if (filas.length <= 1) {
                    alert('No se puede eliminar la última fila de producto');
                    return;
                }
                
                $(this).closest('tr').remove();
                actualizarBotonAgregar();
                actualizarBotonesEliminar();
                calcularTotal();
            });

            // Función para calcular total general
            function calcularTotal() {
                let total = 0;
                $('#tablaProductos tbody tr').each(function() {
                    let subtotal = parseFloat($(this).find('.subtotal').text()) || 0;
                    total += subtotal;
                });
                $('#totalGeneral').text(total.toFixed(2));
            }

            // Enviar formulario
            $('#formLote').submit(function(e) {
                e.preventDefault();
                
                let productos = [];
                let valid = true;
                let filasVacias = 0;
                
                $('#tablaProductos tbody tr').each(function() {
                    let productoId = $(this).find('.producto-id').val();
                    let cantidad = $(this).find('.cantidad').val();
                    let precioVenta = $(this).find('.precio-venta').val();
                    
                    if (!productoId) {
                        filasVacias++;
                    }
                    
                    if (!productoId || !cantidad || !precioVenta) {
                        valid = false;
                        return false;
                    }
                    
                    productos.push({
                        producto_id: productoId,
                        cantidad: parseInt(cantidad),
                        precio_venta: parseInt(precioVenta)
                    });
                });

                if (filasVacias > 0) {
                    alert('Hay ' + filasVacias + ' fila(s) sin producto seleccionado. Complete todos los campos o elimine las filas vacías.');
                    return;
                }

                if (!valid) {
                    alert('Por favor complete todos los campos de los productos');
                    return;
                }

                if (productos.length === 0) {
                    alert('Debe agregar al menos un producto');
                    return;
                }

                // Mostrar resumen en modal
                let resumen = '<ul>';
                productos.forEach(p => {
                    let nombre = $('.producto-id option[value="' + p.producto_id + '"]').text();
                    resumen += `<li>${nombre}: ${p.cantidad} unidades ${p.precio_venta} Bs.</li>`;
                });
                resumen += '</ul>';
                resumen += `<strong>Total: Bs${$('#totalGeneral').text()}</strong>`;
                $('#resumenLote').html(resumen);
                
                $('#modalConfirmacion').modal('show');
            });

            // Confirmar registro
            $('#confirmarRegistro').click(function() {
                let productos = [];
                $('#tablaProductos tbody tr').each(function() {
                    productos.push({
                        producto_id: $(this).find('.producto-id').val(),
                        cantidad: $(this).find('.cantidad').val(),
                        precio_venta: $(this).find('.precio-venta').val()
                    });
                });

                $.ajax({
                    url: window.location.href,
                    type: 'POST',
                    data: {
                        proveedor_id: $('#proveedor_id').val(),
                        fecha_provision: $('#fecha_provision').val(),
                        productos: productos
                    },
                    dataType: 'json',
                    success: function(response) {
                        $('#modalConfirmacion').modal('hide');
                        if (response.success) {
                            alert('✅ ' + response.message);
                            location.reload();
                        } else {
                            alert('❌ Error: ' + response.message);
                        }
                    },
                    error: function(xhr, status, error) {
                        $('#modalConfirmacion').modal('hide');
                        alert('❌ Error de conexión. Por favor intente nuevamente.');
                        console.error('Error:', error);
                    }
                });
            });

            // Agregar primera fila automáticamente
            $('#btnAgregarProducto').click();
        });
    </script>
</body>
</html>