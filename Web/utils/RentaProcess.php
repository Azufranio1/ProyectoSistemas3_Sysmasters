<?php
include("../includes/VerifySession.php");
include("../includes/Connection.php");

// Función para generar ID de renta (no estaba definida en tu código)
function generarIdRenta($conexion) {
    $sql = "SELECT MAX(SUBSTRING(RentaID, 5)) as ultimo_numero FROM Renta WHERE RentaID LIKE 'RNT-%'";
    $result = $conexion->query($sql);
    $row = $result->fetch_assoc();
    
    $ultimo_numero = (int)$row['ultimo_numero'];
    $nuevo_numero = $ultimo_numero + 1;
    
    return 'RNT-' . str_pad($nuevo_numero, 3, '0', STR_PAD_LEFT);
}

// Función para generar ID de cliente (no estaba definida en tu código)
function generarIdCliente($conexion) {
    // Obtener la fecha actual en formato YYMMDD
    $fechaPrefijo = date('ymd');
    
    // Consultar el último ID con el prefijo de fecha actual
    $sql = "SELECT MAX(ClienteID) as ultimo FROM Cliente WHERE ClienteID LIKE ?";
    $stmt = $conexion->prepare($sql);
    $patron = 'C' . $fechaPrefijo . '%';
    $stmt->bind_param("s", $patron);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    // Si no hay clientes hoy, iniciar con 001
    if ($row['ultimo'] === null) {
        return 'C' . $fechaPrefijo . '001';
    }
    
    // Extraer el número secuencial y aumentarlo en 1
    $ultimoNumero = intval(substr($row['ultimo'], -3));
    $nuevoNumero = $ultimoNumero + 1;
    
    // Formatear con ceros a la izquierda
    return 'C' . $fechaPrefijo . str_pad($nuevoNumero, 3, '0', STR_PAD_LEFT);
}

$conexion = Connection();

$detallesProductos = [];
$detallesClientes = [];
$detallesGarantias = [];
$fechaRenta = '';
$fechaDev = '';
$total = 0;
$subtotal = 0;
$descuento = 0;
$error = null;
$rentaID = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $conexion->begin_transaction();
    
    try {
        // Obtener datos del formulario según estructura del formulario original
        $fechaRenta = $_POST['fecha_renta'];
        $fechaDev = $_POST['fecha_devolucion'];
        $total = $_POST['total'];
        $subtotal = $_POST['subtotal'];
        $descuento = $_POST['descuento'];
        $empleadoID = $_POST['empleado_id'];
        
        // Generar ID de renta
        $rentaID = generarIdRenta($conexion);

        // Insertar la renta principal
        $sqlRenta = "INSERT INTO Renta (RentaID, EmpleadoID, FechaRenta, FechaDevolucion, Descuento, Total) VALUES (?, ?, ?, ?, ?, ?)";
        $stmtRenta = $conexion->prepare($sqlRenta);
        $stmtRenta->bind_param("ssssid", $rentaID, $empleadoID, $fechaRenta, $fechaDev, $descuento, $total);
        
        if ($stmtRenta->execute()) {
            // Procesar clientes
            if (isset($_POST['clientes']) && is_array($_POST['clientes'])) {
                $stmtCliente = $conexion->prepare("INSERT INTO Cliente (ClienteID, RentaID, Nombre, Apellido, Telefono, Garantia) VALUES (?, ?, ?, ?, ?, ?)");
                
                foreach ($_POST['clientes'] as $index => $clienteData) {
                    $nombre = $clienteData['nombre'];
                    $apellido = $clienteData['apellido'];
                    $telefono = $clienteData['telefono'];
                    $conGarantia = 0; // Por defecto sin garantía, se actualizará después
                    
                    $clienteID = generarIdCliente($conexion);
                    
                    $detallesClientes[$index] = [
                        'ClienteID' => $clienteID,
                        'Nombre' => $nombre,
                        'Apellido' => $apellido,
                        'Telefono' => $telefono,
                        'Garantia' => $conGarantia
                    ];
                
                    $stmtCliente->bind_param("sssssi", $clienteID, $rentaID, trim($nombre), trim($apellido), $telefono, $conGarantia);
                    $stmtCliente->execute();
                }
            } else {
                throw new Exception("No se recibieron datos de clientes");
            }
            
            // Procesar productos
            if (isset($_POST['productos']) && is_array($_POST['productos'])) {
                $stmtDetalle = $conexion->prepare("INSERT INTO DetalleRenta (RentaID, ProductoID, Cantidad, Subtotal) VALUES (?, ?, ?, ?)");
                $stmtPrecio = $conexion->prepare("SELECT p.ProductoID, p.Nombre, p.PrecioUnitario, p.Disponible,
                                               c.Categoria AS Categoria, 
                                               col1.Color AS ColorPrincipal, 
                                               col2.Color AS ColorSecundario 
                                               FROM Producto p 
                                               JOIN Categoria c ON p.CategoriaID = c.CategoriaID 
                                               LEFT JOIN Color col1 ON p.ColorID1 = col1.ColorID 
                                               LEFT JOIN Color col2 ON p.ColorID2 = col2.ColorID 
                                               WHERE p.ProductoID = ?");
                $stmtUpdateInventario = $conexion->prepare("UPDATE Producto SET Disponible = Disponible - ? WHERE ProductoID = ?");
                
                foreach ($_POST['productos'] as $productoData) {
                    $productoID = $productoData['producto_id'];
                    $cantidad = $productoData['cantidad'];
                    $subtotalProducto = $productoData['subtotal'];
                    
                    // Obtener detalles del producto y verificar disponibilidad
                    $stmtPrecio->bind_param("s", $productoID);
                    $stmtPrecio->execute();
                    $resultPrecio = $stmtPrecio->get_result();
                    
                    if ($rowPrecio = $resultPrecio->fetch_assoc()) {
                        $precioUnitario = $rowPrecio['PrecioUnitario'];
                        $disponibleActual = $rowPrecio['Disponible'];
                        
                        // Verificar que hay suficiente stock disponible
                        if ($disponibleActual < $cantidad) {
                            throw new Exception("Stock insuficiente para el producto " . $rowPrecio['Nombre'] . ". Disponible: " . $disponibleActual . ", Solicitado: " . $cantidad);
                        }
                        
                        $colorDisplay = $rowPrecio['ColorPrincipal'];
                        if (!empty($rowPrecio['ColorSecundario'])) {
                            $colorDisplay .= ' con ' . $rowPrecio['ColorSecundario'];
                        }
                        
                        $detallesProductos[] = [
                            'ProductoID' => $rowPrecio['ProductoID'],
                            'Nombre' => $rowPrecio['Nombre'],
                            'Color' => $colorDisplay,
                            'Categoria' => $rowPrecio['Categoria'],
                            'PrecioUnitario' => $precioUnitario,
                            'Cantidad' => $cantidad,
                            'Subtotal' => $subtotalProducto
                        ];
                        
                        // Insertar detalle de renta
                        $stmtDetalle->bind_param("ssid", $rentaID, $productoID, $cantidad, $subtotalProducto);
                        $stmtDetalle->execute();
                        
                        // Actualizar inventario - reducir la cantidad disponible
                        $stmtUpdateInventario->bind_param("is", $cantidad, $productoID);
                        if (!$stmtUpdateInventario->execute()) {
                            throw new Exception("Error al actualizar el inventario del producto: " . $productoID);
                        }
                        
                    } else {
                        throw new Exception("Producto no encontrado: " . $productoID);
                    }
                }
            } else {
                throw new Exception("No se recibieron datos de productos");
            }
            
            // Procesar garantías
            if (isset($_POST['garantias']) && is_array($_POST['garantias'])) {
                $stmtInsertGarantia = $conexion->prepare("INSERT INTO Garantia (RentaID, Tipo, ClienteID) VALUES (?, ?, ?)");
                $stmtUpdateCliente = $conexion->prepare("UPDATE Cliente SET Garantia = 1 WHERE ClienteID = ?");
                
                foreach ($_POST['garantias'] as $garantiaData) {
                    $tipoGarantia = trim($garantiaData['tipo']);
                    $clienteIndex = $garantiaData['cliente_id']; // Índice del cliente que deja la garantía
                    
                    if (isset($detallesClientes[$clienteIndex])) {
                        $clienteID = $detallesClientes[$clienteIndex]['ClienteID'];
                        $nombreCliente = $detallesClientes[$clienteIndex]['Nombre'] . ' ' . $detallesClientes[$clienteIndex]['Apellido'];
                        
                        $detallesGarantias[] = [
                            'Tipo' => $tipoGarantia,
                            'ClienteID' => $clienteID,
                            'NombreCliente' => $nombreCliente
                        ];
                        
                        // Insertar garantía
                        $stmtInsertGarantia->bind_param("sss", $rentaID, $tipoGarantia, $clienteID);
                        $stmtInsertGarantia->execute();
                        
                        // Actualizar cliente con garantía
                        $stmtUpdateCliente->bind_param("s", $clienteID);
                        $stmtUpdateCliente->execute();
                        
                        // Actualizar en el array local
                        $detallesClientes[$clienteIndex]['Garantia'] = 1;
                    } else {
                        throw new Exception("Cliente no encontrado para la garantía");
                    }
                }
            }
            
            $conexion->commit();
            
            // Crear datos para el comprobante
            $_SESSION['comprobante_datos'] = [
                'rentaID' => $rentaID,
                'fechaRenta' => $fechaRenta,
                'fechaDevolucion' => $fechaDev,
                'subtotal' => $subtotal,
                'descuento' => $descuento,
                'total' => $total,
                'clientes' => $detallesClientes,
                'productos' => $detallesProductos,
                'garantias' => $detallesGarantias
            ];
            
            // Redirigir al comprobante
            header("Location: ../views/Comprobante.php?id=" . $rentaID);
            exit();
            
        } else {
            throw new Exception("Error al registrar la renta: " . $stmtRenta->error);
        }
    } catch (Exception $e) {
        $conexion->rollback();
        $error = $e->getMessage();
    } finally {
        // Cerrar todas las declaraciones preparadas
        if (isset($stmtRenta)) $stmtRenta->close();
        if (isset($stmtDetalle)) $stmtDetalle->close();
        if (isset($stmtPrecio)) $stmtPrecio->close();
        if (isset($stmtCliente)) $stmtCliente->close();
        if (isset($stmtInsertGarantia)) $stmtInsertGarantia->close();
        if (isset($stmtUpdateCliente)) $stmtUpdateCliente->close();
        if (isset($stmtUpdateInventario)) $stmtUpdateInventario->close();
    }
} else {
    header("Location: ../Components/Renta.php");
    exit();
}

$conexion->close();

// Si hay error, mostrar página de error o redirigir
if ($error) {
    $_SESSION['error_renta'] = $error;
    header("Location: ../Components/Renta.php?error=1");
    exit();
}
?>