<?php
include("../includes/VerifySession.php");
include("../includes/FechaLPBOB.php");
include("../includes/Connection.php");

// Verificar si se recibió un ID de renta por POST
$rentaID = "";
$mensajeExito = "";
$mensajeError = "";

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['procesar_devolucion'])) {
    $rentaID = $_POST['renta_id'];
    $fechaDevuelto = date("Y-m-d");
    $multaAcumulada = 0;

    try {
        $conn = connection();
        mysqli_autocommit($conn, false);

        // 1. Registrar fecha de devolución
        $stmt = mysqli_prepare($conn, "UPDATE Renta SET FechaDevuelto = ? WHERE RentaID = ?");
        mysqli_stmt_bind_param($stmt, "ss", $fechaDevuelto, $rentaID);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        // 2. Procesar productos
        if (isset($_POST['producto_id']) && is_array($_POST['producto_id'])) {
            for ($i = 0; $i < count($_POST['producto_id']); $i++) {
                $productoID = $_POST['producto_id'][$i];

                $cantidadDisponible = isset($_POST['cantidad_disponible'][$i]) ? intval($_POST['cantidad_disponible'][$i]) : 0;
                $cantidadEliminado = isset($_POST['cantidad_eliminado'][$i]) ? intval($_POST['cantidad_eliminado'][$i]) : 0;

                if ($cantidadDisponible > 0) {
                    $stmt = mysqli_prepare($conn, "UPDATE Producto SET Disponible = Disponible + ? WHERE ProductoID = ?");
                    mysqli_stmt_bind_param($stmt, "is", $cantidadDisponible, $productoID);
                    mysqli_stmt_execute($stmt);
                    mysqli_stmt_close($stmt);
                }

                if ($cantidadEliminado > 0) {
                    $stmt = mysqli_prepare($conn, "UPDATE Producto SET Stock = Stock - ? , disponible = disponible - ? WHERE ProductoID = ?");
                    mysqli_stmt_bind_param($stmt, "iis", $cantidadEliminado, $cantidadEliminado, $productoID);
                    mysqli_stmt_execute($stmt);
                    mysqli_stmt_close($stmt);
                }

                // Procesar daños
                if (isset($_POST['danos_' . $i]) && is_array($_POST['danos_' . $i])) {
                    foreach ($_POST['danos_' . $i] as $danoData) {
                        $damageID = $danoData['damage_id'];
                        $cantidadDanada = intval($danoData['cantidad']);

                        if ($cantidadDanada > 0 && $damageID > 0) {
                            $stmt = mysqli_prepare($conn, "SELECT Multa FROM Damage WHERE DamageID = ?");
                            mysqli_stmt_bind_param($stmt, "i", $damageID);
                            mysqli_stmt_execute($stmt);
                            $result = mysqli_stmt_get_result($stmt);
                            $damageInfo = mysqli_fetch_assoc($result);
                            mysqli_stmt_close($stmt);

                            if ($damageInfo) {
                                $multaUnitaria = $damageInfo['Multa'];
                                $multaTotal = $cantidadDanada * $multaUnitaria;

                                // Acumular multa total
                                $multaAcumulada += $multaTotal;

                                // Aquí podrías insertar en una tabla de detalle si quieres registrar daños individualmente
                            }
                        }
                    }
                }
            }
        }

        // 3. Actualizar multa y total en una sola sentencia
        $stmt = mysqli_prepare($conn, "UPDATE Renta SET Multa = ?, Total = Total + ? WHERE RentaID = ?");
        mysqli_stmt_bind_param($stmt, "iis", $multaAcumulada, $multaAcumulada, $rentaID);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        mysqli_commit($conn);
        mysqli_autocommit($conn, true);
        $mensajeExito = "La devolución ha sido procesada correctamente.";
    } catch (Exception $e) {
        mysqli_rollback($conn);
        mysqli_autocommit($conn, true);
        $mensajeError = "Error al procesar la devolución: " . $e->getMessage();
    }
}

elseif (isset($_POST['RentaID'])) {
    $rentaID = $_POST['RentaID'];
}

// Función para obtener datos de la renta
function obtenerDatosRenta($conn, $rentaID) {
    $sql = "SELECT r.RentaID, r.FechaRenta, r.FechaDevolucion, r.Total, 
                   c.Nombre, c.Apellido
            FROM Renta r
            JOIN Cliente c ON c.RentaID = r.RentaID
            WHERE r.RentaID = ? AND r.FechaDevuelto IS NULL";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $rentaID);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $data = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    return $data;
}

// Función para obtener productos de una renta
function obtenerProductosRenta($conn, $rentaID) {
    $sql = "SELECT dr.ProductoID, p.Nombre, dr.Cantidad, p.PrecioUnitario, 
                   dr.Subtotal, p.PrecioVenta
            FROM DetalleRenta dr
            JOIN Producto p ON p.ProductoID = dr.ProductoID
            WHERE dr.RentaID = ? AND dr.Habilitado = 1";
    
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $rentaID);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $productos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $productos[] = $row;
    }
    
    mysqli_stmt_close($stmt);
    return $productos;
}

// Función para obtener tipos de daños
function obtenerTiposDamage($conn) {
    $sql = "SELECT DamageID, Caso, Multa FROM Damage ORDER BY Multa ASC";
    $result = mysqli_query($conn, $sql);
    
    $tipos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $tipos[] = $row;
    }
    
    return $tipos;
}

// Obtener datos si hay un ID de renta válido
$rentaDatos = null;
$productos = [];
$tiposDamage = [];

if (!empty($rentaID)) {
    $conn = connection();
    $rentaDatos = obtenerDatosRenta($conn, $rentaID);
    if ($rentaDatos) {
        $productos = obtenerProductosRenta($conn, $rentaID);
    }
}

// Obtener tipos de daños
$conn = connection();
$tiposDamage = obtenerTiposDamage($conn);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Formulario de Devolución de Rentas</title>
    <link rel="stylesheet" href="../CSS/Devolucion.css">
</head>
<body>
    <?php include('../includes/HeaderFormularios.php'); ?>
    <div class="container">
        <div class="header">
            <h1>Devolución de Rentas</h1>
            <div class="date">Fecha: <span id="current-date"><?php echo date('d/m/Y'); ?></span></div>
        </div>
        
        <?php if (!empty($mensajeExito)): ?>
        <div class="mensaje exito">
            <p><?php echo $mensajeExito; ?></p>
            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
                <a href="../Views/ManagerDB.php"><button class="btn-dashboard">Volver al Dashboard</button></a>
            </div>
        </div>
        <?php endif; ?>
        
        <?php if (!empty($mensajeError)): ?>
        <div class="mensaje error">
            <p><?php echo $mensajeError; ?></p>
        </div>
        <?php endif; ?>
        
        <?php if (empty($mensajeExito)): ?>
            <?php if (empty($rentaDatos)): ?>
                <div class="form-group">
                    <p>No se ha recibido un ID de renta válido. Asegúrese de acceder a esta página desde el lugar correcto.</p>
                    <a href="../Views/ManagerDB.php"><button class="btn-dashboard">Volver al Dashboard</button></a>
                </div>
            <?php else: ?>
                <form method="POST" action="" id="form-devolucion">
                    <input type="hidden" name="renta_id" value="<?php echo htmlspecialchars($rentaDatos['RentaID']); ?>">
                    
                    <div class="form-group">
                        <h2>Información de la Renta</h2>
                        <div style="display: flex; gap: 20px;">
                            <div style="flex: 1;">
                                <label>Cliente:</label>
                                <div><?php echo htmlspecialchars($rentaDatos['Nombre'] . ' ' . $rentaDatos['Apellido']); ?></div>
                            </div>
                            <div style="flex: 1;">
                                <label>Fecha de Renta:</label>
                                <div><?php echo date('d/m/Y', strtotime($rentaDatos['FechaRenta'])); ?></div>
                            </div>
                            <div style="flex: 1;">
                                <label>Fecha de Devolución Programada:</label>
                                <div><?php echo date('d/m/Y', strtotime($rentaDatos['FechaDevolucion'])); ?></div>
                            </div>
                        </div>
                    </div>
                    
                    <h2>Productos Rentados</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Cantidad Rentada</th>
                                <th>Precio Unitario</th>
                                <th>Subtotal</th>
                                <th>Distribución de Devolución</th>
                                <th>Estado Final</th>
                            </tr>
                        </thead>
                        <tbody id="productos-body">
                            <?php foreach ($productos as $index => $producto): ?>
                            <tr data-index="<?php echo $index; ?>">
                                <td><?php echo htmlspecialchars($producto['ProductoID']); ?></td>
                                <td><?php echo htmlspecialchars($producto['Nombre']); ?></td>
                                <td class="cantidad-rentada"><?php echo $producto['Cantidad']; ?></td>
                                <td>Bs.<?php echo number_format($producto['PrecioUnitario']); ?></td>
                                <td>Bs.<?php echo number_format($producto['Subtotal']); ?></td>
                                <td>
                                    <div class="cantidad-controls">
                                        <div class="cantidad-row">
                                            <label>Disponible:</label>
                                            <input type="number" name="cantidad_disponible[]" class="cantidad-disponible" 
                                                   min="0" max="<?php echo $producto['Cantidad']; ?>" value="0" 
                                                   data-index="<?php echo $index; ?>">
                                        </div>
                                        
                                        <div class="cantidad-row">
                                            <label>Dañados:</label>
                                            <span class="total-danos">0</span>
                                        </div>
                                        
                                        <div class="danos-container" id="danos-container-<?php echo $index; ?>">
                                            <div class="dano-item">
                                                <select class="dano-select" name="danos_<?php echo $index; ?>[0][damage_id]" data-index="<?php echo $index; ?>" data-dano-index="0">
                                                    <option value="">Seleccionar daño</option>
                                                    <?php foreach ($tiposDamage as $damage): ?>
                                                    <option value="<?php echo $damage['DamageID']; ?>" data-multa="<?php echo $damage['Multa']; ?>">
                                                        <?php echo htmlspecialchars($damage['Caso']); ?> (Bs.<?php echo number_format($damage['Multa']); ?>)
                                                    </option>
                                                    <?php endforeach; ?>
                                                </select>
                                                <input type="number" class="dano-cantidad" name="danos_<?php echo $index; ?>[0][cantidad]" 
                                                       min="0" max="<?php echo $producto['Cantidad']; ?>" value="0" 
                                                       data-index="<?php echo $index; ?>" data-dano-index="0">
                                                <button type="button" class="btn-add-dano" onclick="agregarDano(<?php echo $index; ?>)">+</button>
                                            </div>
                                        </div>
                                        
                                        <div class="cantidad-row">
                                            <label>Eliminado:</label>
                                            <input type="number" name="cantidad_eliminado[]" class="cantidad-eliminado" 
                                                   min="0" max="<?php echo $producto['Cantidad']; ?>" value="0" 
                                                   data-index="<?php echo $index; ?>">
                                        </div>
                                        <div class="cantidad-row">
                                            <label>Sin cambios:</label>
                                            <span class="cantidad-sin-cambios"><?php echo $producto['Cantidad']; ?></span>
                                        </div>
                                    </div>
                                </td>
                                <td class="estado-final">
                                    <div class="estado-resumen" data-index="<?php echo $index; ?>">
                                        <div class="estado-disponible">Disponible: 0</div>
                                        <div class="estado-danos">Dañados: 0</div>
                                        <div class="estado-eliminado">Eliminado: 0</div>
                                        <div class="estado-sin-cambios">Sin cambios: <?php echo $producto['Cantidad']; ?></div>
                                    </div>
                                </td>
                                
                                <!-- Campos ocultos -->
                                <input type="hidden" name="producto_id[]" value="<?php echo htmlspecialchars($producto['ProductoID']); ?>">
                                <input type="hidden" name="precio_venta[]" value="<?php echo $producto['PrecioVenta']; ?>">
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    
                    <div class="summary">
                        <h3>Resumen de Multas</h3>
                        <div class="summary-item">
                            <span>Total Original:</span>
                            <span id="total-original">Bs.<?php echo number_format($rentaDatos['Total']); ?></span>
                        </div>
                        <div class="summary-item">
                            <span>Total Multas por Daños:</span>
                            <span id="total-multas-dano">Bs.0</span>
                        </div>
                        <div class="summary-item">
                            <span>Total Multas por Eliminación:</span>
                            <span id="total-multas-eliminacion">Bs.0</span>
                        </div>
                        <div class="summary-item">
                            <span>Total Multas:</span>
                            <span id="total-multas">Bs.0</span>
                        </div>
                        <div class="summary-item total">
                            <span>Total Final:</span>
                            <span id="total-final">Bs.<?php echo number_format($rentaDatos['Total']); ?></span>
                        </div>
                    </div>
                    
                    <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                        <a href="../Views/ManagerDB.php"><button type="button" class="btn-dashboard">Volver al Dashboard</button></a>
                        <button type="submit" name="procesar_devolucion" id="btn-procesar">Procesar Devolución</button>
                    </div>
                </form>
            <?php endif; ?>
        <?php endif; ?>
    </div>
    
    <script>
        // Datos de la renta actual
        const rentaActual = {
            total: <?php echo isset($rentaDatos) ? $rentaDatos['Total'] : 0; ?>,
            productos: <?php echo json_encode($productos); ?>
        };
        
        // Contador para nuevos daños
        let contadorDanos = {};
        
        // Configuración inicial
        document.addEventListener('DOMContentLoaded', function() {
            // Inicializar contadores de daños
            document.querySelectorAll('tr[data-index]').forEach(fila => {
                const index = parseInt(fila.dataset.index);
                contadorDanos[index] = 1;
            });
            
            // Agregar event listeners
            document.querySelectorAll('.cantidad-disponible, .cantidad-eliminado, .dano-cantidad').forEach(input => {
                input.addEventListener('input', () => {
                    const index = parseInt(input.dataset.index);
                    validarCantidades(index);
                });
            });
            
            document.querySelectorAll('.dano-select').forEach(select => {
                select.addEventListener('change', () => {
                    const index = parseInt(select.dataset.index);
                    validarCantidades(index);
                });
            });
        });
        
        function agregarDano(productoIndex) {
            const container = document.getElementById(`danos-container-${productoIndex}`);
            const danoIndex = contadorDanos[productoIndex];
            
            const nuevoDano = document.createElement('div');
            nuevoDano.className = 'dano-item';
            nuevoDano.innerHTML = `
                <select class="dano-select" name="danos_${productoIndex}[${danoIndex}][damage_id]" data-index="${productoIndex}" data-dano-index="${danoIndex}">
                    <option value="">Seleccionar daño</option>
                    <?php foreach ($tiposDamage as $damage): ?>
                    <option value="<?php echo $damage['DamageID']; ?>" data-multa="<?php echo $damage['Multa']; ?>">
                        <?php echo htmlspecialchars($damage['Caso']); ?> (Bs.<?php echo number_format($damage['Multa']); ?>)
                    </option>
                    <?php endforeach; ?>
                </select>
                <input type="number" class="dano-cantidad" name="danos_${productoIndex}[${danoIndex}][cantidad]" 
                       min="0" max="${rentaActual.productos[productoIndex].Cantidad}" value="0" 
                       data-index="${productoIndex}" data-dano-index="${danoIndex}">
                <button type="button" class="btn-remove-dano" onclick="removerDano(this, ${productoIndex})">-</button>
            `;
            
            container.appendChild(nuevoDano);
            contadorDanos[productoIndex]++;
            
            // Agregar event listeners al nuevo elemento
            const nuevoSelect = nuevoDano.querySelector('.dano-select');
            const nuevoInput = nuevoDano.querySelector('.dano-cantidad');
            
            nuevoSelect.addEventListener('change', () => validarCantidades(productoIndex));
            nuevoInput.addEventListener('input', () => validarCantidades(productoIndex));
        }
        
        function removerDano(button, productoIndex) {
            const danoItem = button.closest('.dano-item');
            const container = document.getElementById(`danos-container-${productoIndex}`);
            
            // No permitir eliminar si es el único daño
            if (container.children.length > 1) {
                danoItem.remove();
                validarCantidades(productoIndex);
            }
        }
        
        function validarCantidades(index) {
            const fila = document.querySelector(`tr[data-index="${index}"]`);
            const cantidadRentada = parseInt(fila.querySelector('.cantidad-rentada').textContent);
            
            const disponible = parseInt(fila.querySelector('.cantidad-disponible').value) || 0;
            const eliminado = parseInt(fila.querySelector('.cantidad-eliminado').value) || 0;
            
            // Calcular total de dañados
            let totalDanos = 0;
            const danosContainer = document.getElementById(`danos-container-${index}`);
            const danosInputs = danosContainer.querySelectorAll('.dano-cantidad');
            
            danosInputs.forEach(input => {
                totalDanos += parseInt(input.value) || 0;
            });
            
            const total = disponible + totalDanos + eliminado;
            const sinCambios = cantidadRentada - total;
            
            // Validar que no exceda la cantidad rentada
            if (total > cantidadRentada) {
                const ultimoModificado = document.activeElement;
                if (ultimoModificado && ultimoModificado.dataset.index == index) {
                    const exceso = total - cantidadRentada;
                    ultimoModificado.value = Math.max(0, parseInt(ultimoModificado.value) - exceso);
                }
                return validarCantidades(index); // Recursivamente validar de nuevo
            }
            
            // Actualizar displays
            fila.querySelector('.total-danos').textContent = totalDanos;
            fila.querySelector('.cantidad-sin-cambios').textContent = Math.max(0, sinCambios);
            
            // Actualizar estado final
            actualizarEstadoFinal(index, disponible, totalDanos, eliminado, sinCambios);
            
            // Actualizar totales de multas
            actualizarTotales();
        }
        
        function actualizarEstadoFinal(index, disponible, totalDanos, eliminado, sinCambios) {
            const estadoResumen = document.querySelector(`tr[data-index="${index}"] .estado-resumen`);
            estadoResumen.innerHTML = `
                <div class="estado-disponible">Disponible: ${disponible}</div>
                <div class="estado-danos">Dañados: ${totalDanos}</div>
                <div class="estado-eliminado">Eliminado: ${eliminado}</div>
                <div class="estado-sin-cambios">Sin cambios: ${Math.max(0, sinCambios)}</div>
            `;
        }
        
        function actualizarTotales() {
            let totalMultasDano = 0;
            let totalMultasEliminacion = 0;
            
            // Calcular multas por daños
            document.querySelectorAll('tr[data-index]').forEach((fila, index) => {
                // Multas por daños específicos
                const danosContainer = document.getElementById(`danos-container-${index}`);
                if (danosContainer) {
                    const danosItems = danosContainer.querySelectorAll('.dano-item');
                    danosItems.forEach(item => {
                        const select = item.querySelector('.dano-select');
                        const cantidadInput = item.querySelector('.dano-cantidad');
                        
                        if (select && cantidadInput && select.value) {
                            const cantidad = parseInt(cantidadInput.value) || 0;
                            const selectedOption = select.options[select.selectedIndex];
                            const multaUnitaria = parseInt(selectedOption.getAttribute('data-multa')) || 0;
                            totalMultasDano += cantidad * multaUnitaria;
                        }
                    });
                }
                
                // Multas por eliminación
                const cantidadEliminado = parseInt(fila.querySelector('.cantidad-eliminado').value) || 0;
                const precioVenta = parseInt(fila.querySelector('input[name="precio_venta[]"]').value) || 0;
                totalMultasEliminacion += cantidadEliminado * precioVenta;
            });
            
            const totalMultas = totalMultasDano + totalMultasEliminacion;
            const totalFinal = rentaActual.total + totalMultas;
            
            document.getElementById('total-multas-dano').textContent = 'Bs.' + totalMultasDano.toLocaleString();
            document.getElementById('total-multas-eliminacion').textContent = 'Bs.' + totalMultasEliminacion.toLocaleString();
            document.getElementById('total-multas').textContent = 'Bs.' + totalMultas.toLocaleString();
            document.getElementById('total-final').textContent = 'Bs.' + totalFinal.toLocaleString();
        }
        
        function validarFormulario(e) {
            let errores = [];
            
            // Validar que productos con daño tengan tipo de daño seleccionado y cantidad > 0
            document.querySelectorAll('tr[data-index]').forEach((fila, index) => {
                const nombreProducto = fila.cells[1].textContent;
                const danosContainer = document.getElementById(`danos-container-${index}`);
                
                if (danosContainer) {
                    const danosItems = danosContainer.querySelectorAll('.dano-item');
                    danosItems.forEach((item, danoIndex) => {
                        const select = item.querySelector('.dano-select');
                        const cantidadInput = item.querySelector('.dano-cantidad');
                        const cantidad = parseInt(cantidadInput.value) || 0;
                        
                        if (cantidad > 0 && !select.value) {
                            errores.push(`Debe seleccionar el tipo de daño para ${cantidad} unidades dañadas del producto: ${nombreProducto}`);
                        }
                        
                        if (select.value && cantidad === 0) {
                            errores.push(`Debe especificar la cantidad dañada para el tipo de daño seleccionado en el producto: ${nombreProducto}`);
                        }
                    });
                }
            });
            
            if (errores.length > 0) {
                e.preventDefault();
                alert('Errores encontrados:\n\n' + errores.join('\n'));
                return false;
            }
            
            // Confirmar procesamiento
            const confirmMessage = `¿Está seguro de procesar esta devolución?\n\nEsto actualizará permanentemente el inventario y registrará las multas correspondientes.`;
            if (!confirm(confirmMessage)) {
                e.preventDefault();
                return false;
            }
            
            return true;
        }
        
        // Event listener del formulario
        document.getElementById('form-devolucion').addEventListener('submit', validarFormulario);
    </script>
</body>
</html>