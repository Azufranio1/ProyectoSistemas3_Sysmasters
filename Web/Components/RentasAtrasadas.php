<?php
include("../includes/FechaLPBOB.php");
include("../includes/Connection.php");

$conexion = Connection();
$hoy = date('Y-m-d');

// Consulta para obtener rentas atrasadas sin un JOIN a Cliente para evitar filas repetidas
$sql = "SELECT r.RentaID, r.FechaRenta, r.FechaDevolucion, r.Total, r.Descuento
        FROM Renta r
        WHERE r.FechaDevolucion < ?
          AND EXISTS (
              SELECT 1 FROM Cliente c WHERE c.RentaID = r.RentaID
          )
          AND r.FechaDevuelto is null
        ORDER BY r.FechaDevolucion ASC";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $hoy);
$stmt->execute();
$resultado = $stmt->get_result();

$rentas = [];

while ($row = $resultado->fetch_assoc()) {
    $rentaID = $row['RentaID'];

    // Calcular días de retraso
    $fechaDevolucion = new DateTime($row['FechaDevolucion']);
    $fechaHoy = new DateTime($hoy);
    $diasAtraso = $fechaDevolucion->diff($fechaHoy)->days;
    $row['DiasAtraso'] = $diasAtraso;

    // Obtener productos de la renta
    $sql_detalle = "SELECT p.Nombre AS Producto, cat.Categoria AS Categoria, 
                           col1.Color AS Color1, col2.Color AS Color2, 
                           p.PrecioUnitario, dr.Cantidad, dr.Subtotal
                    FROM DetalleRenta dr
                    JOIN Producto p ON dr.ProductoID = p.ProductoID
                    JOIN Categoria cat ON p.CategoriaID = cat.CategoriaID
                    LEFT JOIN Color col1 ON p.ColorID1 = col1.ColorID
                    LEFT JOIN Color col2 ON p.ColorID2 = col2.ColorID
                    WHERE dr.RentaID = ?";

    $stmt_detalle = $conexion->prepare($sql_detalle);
    $stmt_detalle->bind_param("s", $rentaID);
    $stmt_detalle->execute();
    $productos = $stmt_detalle->get_result()->fetch_all(MYSQLI_ASSOC);
    $row['Productos'] = $productos;
    
    // Calcular total sin descuento (suma de subtotales)
    $totalSinDescuento = 0;
    foreach ($productos as $p) {
        $totalSinDescuento += $p['Subtotal'];
    }
    $row['TotalSinDescuento'] = $totalSinDescuento;
    
    // Si no hay descuento en la base de datos, lo calculamos
    if (!isset($row['Descuento']) || $row['Descuento'] === null) {
        $row['Descuento'] = $totalSinDescuento - $row['Total'];
    }

    // Obtener clientes asociados a la renta
    $sql_clientes = "SELECT Nombre, Apellido, Telefono FROM Cliente WHERE RentaID = ?";
    $stmt_clientes = $conexion->prepare($sql_clientes);
    $stmt_clientes->bind_param("s", $rentaID);
    $stmt_clientes->execute();
    $clientes = $stmt_clientes->get_result()->fetch_all(MYSQLI_ASSOC);
    
    $row['Clientes'] = $clientes;
    
    // Para la visualización principal: mostrar solo el primero o cantidad
    if (count($clientes) > 1) {
        $row['ClientesPrincipal'] = $clientes[0]['Nombre'] . ' ' . $clientes[0]['Apellido'] . ' y ' . (count($clientes) - 1) . ' más';
        $row['TelefonoPrincipal'] = $clientes[0]['Telefono'] . ' y ' . (count($clientes) - 1) . ' más';
    } else if (count($clientes) == 1) {
        $row['ClientesPrincipal'] = $clientes[0]['Nombre'] . ' ' . $clientes[0]['Apellido'];
        $row['TelefonoPrincipal'] = $clientes[0]['Telefono'];
    } else {
        $row['ClientesPrincipal'] = 'Sin cliente';
        $row['TelefonoPrincipal'] = 'N/A';
    }

    // Obtener garantías con clientes asociados a la renta
    $sql_garantias = "SELECT g.Tipo, c.Nombre, c.Apellido
                      FROM Garantia g
                      JOIN Cliente c ON g.ClienteID = c.ClienteID
                      WHERE g.RentaID = ?";
    $stmt_garantia = $conexion->prepare($sql_garantias);
    $stmt_garantia->bind_param("s", $rentaID);
    $stmt_garantia->execute();
    $garantias = $stmt_garantia->get_result()->fetch_all(MYSQLI_ASSOC);

    $row['Garantias'] = $garantias;

    $rentas[] = $row;

    // Cerrar los prepared statements internos
    $stmt_detalle->close();
    $stmt_clientes->close();
    $stmt_garantia->close();
}

$stmt->close();
$conexion->close();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Rentas Atrasadas</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            background-color: #FFF3E0;
            font-family: 'Montserrat', sans-serif;
            justify-content: center;
        }
        .factura-card {
            background-color: #fff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin: 0 auto;
        }
        .factura-header {
            border-bottom: 2px solid #f05555;
            padding-bottom: 20px;
            margin-bottom: 20px;
        }
        .factura-title {
            color: #f05555;
            font-weight: 700;
            font-size: 1.8rem;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            text-align: left;
        }
        .tabla-productos th {
            background-color: #f05555;
            color: white;
        }
        .detalle-productos {
            display: none;
            background-color: #f9f9f9;
        }
        .toggle-btn {
            cursor: pointer;
            color: #f05555;
            font-weight: bold;
        }
        .atraso {
            color: #d32f2f;
            font-weight: bold;
            font-size: 0.9rem;
        }
        #filtroBusqueda {
            width: 100%;
            padding: 10px;
            margin-bottom: 25px;
            font-size: 1rem;
            border-radius: 6px;
            border: 1px solid #ccc;
        }
        .resumen-total {
            margin-top: 15px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
        }
        .total-final {
            font-weight: bold;
            color: #d32f2f;
        }
        .info-adicional {
            margin-top: 20px;
            padding: 15px;
            background-color: #f1f8e9;
            border-radius: 8px;
            border-left: 4px solid #8bc34a;
        }
        .info-adicional h4 {
            margin-top: 0;
            color: #558b2f;
        }
        .info-adicional ul {
            padding-left: 20px;
        }
        .info-adicional li {
            margin-bottom: 5px;
        }
        .clientes-lista {
            margin-top: 15px;
            padding: 10px;
            background-color: #e3f2fd;
            border-radius: 8px;
            border-left: 4px solid #2196f3;
        }
        .clientes-lista h4 {
            margin-top: 0;
            color: #1565c0;
        }
        .devolucion-btn {
            background-color: #f05555;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 15px;
            transition: background-color 0.3s;
        }
        .devolucion-btn:hover {
            background-color: #d32f2f;
        }
        .acciones {
            text-align: right;
            margin-top: 15px;
        }
    </style>
    <script>
        function filtrarRentas() {
        const filtro = document.getElementById('filtroBusqueda').value.toLowerCase();
        const tabla = document.querySelector('.tabla-productos tbody');
        const filas = tabla.getElementsByTagName('tr');

        for (let i = 0; i < filas.length; i++) {
            // Omitimos las filas de detalle (productos), solo filtramos filas principales (las pares)
            if (filas[i].classList.contains('detalle-productos')) {
                continue;
            }

            let textoFila = filas[i].textContent.toLowerCase();

            if (textoFila.indexOf(filtro) > -1) {
                filas[i].style.display = '';
                // Mostrar también la fila de detalle correspondiente
                const rentaID = filas[i].querySelector('.toggle-btn').getAttribute('onclick').match(/'(.+)'/)[1];
                const detalleFila = document.getElementById('detalle-' + rentaID);
                if (detalleFila) detalleFila.style.display = detalleFila.style.display; // dejar igual
            } else {
                filas[i].style.display = 'none';
                // Ocultar la fila de detalle correspondiente
                const rentaID = filas[i].querySelector('.toggle-btn').getAttribute('onclick').match(/'(.+)'/)[1];
                const detalleFila = document.getElementById('detalle-' + rentaID);
                if (detalleFila) detalleFila.style.display = 'none';
            }
        }
    }

        function toggleDetalle(id) {
            var fila = document.getElementById('detalle-' + id);
            fila.style.display = fila.style.display === 'table-row' ? 'none' : 'table-row';
        }
    </script>
</head>
<body>
<div class="container">
    <div class="factura-card">
        <div class="factura-header">
            <h2 class="factura-title">Rentas Atrasadas</h2>
        </div>

        <input type="text" id="filtroBusqueda" placeholder="Buscar por cliente, teléfono, fechas, total..." onkeyup="filtrarRentas()">
        <?php if (!empty($rentas)): ?>
            <table class="tabla-productos">
                <thead>
                    <tr>
                        <th></th>
                        <th>Cliente(s)</th>
                        <th>Teléfono(s)</th>
                        <th>Fecha Renta</th>
                        <th>Fecha Devolución</th>
                        <th>Total (Bs)</th>
                        <th>Atraso</th>
                    </tr>
                </thead>
                <tbody>
                <?php foreach ($rentas as $r): ?>
                    <tr>
                        <td class="toggle-btn" onclick="toggleDetalle('<?= $r['RentaID'] ?>')">&#9660;</td>
                        <td><?= htmlspecialchars($r['ClientesPrincipal']) ?></td>
                        <td><?= htmlspecialchars($r['TelefonoPrincipal']) ?></td>
                        <td><?= $r['FechaRenta'] ?></td>
                        <td><?= $r['FechaDevolucion'] ?></td>
                        <td><?= number_format($r['Total'], 2) ?></td>
                        <td class="atraso">Renta atrasada por <?= $r['DiasAtraso'] ?> día(s)</td>
                    </tr>
                    <tr id="detalle-<?= $r['RentaID'] ?>" class="detalle-productos">
                        <td colspan="7">
                            <?php if (count($r['Clientes']) > 1): ?>
                                <div class="clientes-lista">
                                    <h4>Lista completa de clientes:</h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Cliente</th>
                                                <th>Teléfono</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <?php foreach ($r['Clientes'] as $c): ?>
                                                <tr>
                                                    <td><?= htmlspecialchars($c['Nombre'] . ' ' . $c['Apellido']) ?></td>
                                                    <td><?= htmlspecialchars($c['Telefono']) ?></td>
                                                </tr>
                                            <?php endforeach; ?>
                                        </tbody>
                                    </table>
                                </div>
                            <?php endif; ?>
                            
                            <strong>Productos:</strong>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Categoría</th>
                                        <th>Color 1</th>
                                        <th>Color 2</th>
                                        <th>Precio Unitario</th>
                                        <th>Cantidad</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach ($r['Productos'] as $p): ?>
                                        <tr>
                                            <td><?= htmlspecialchars($p['Producto']) ?></td>
                                            <td><?= htmlspecialchars($p['Categoria']) ?></td>
                                            <td><?= htmlspecialchars($p['Color1']) ?></td>
                                            <td><?= htmlspecialchars($p['Color2']) ?></td>
                                            <td><?= number_format($p['PrecioUnitario'], 2) ?></td>
                                            <td><?= $p['Cantidad'] ?></td>
                                            <td><?= number_format($p['Subtotal'], 2) ?></td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td><b>Subtotal:</b></td>
                                        <td><?= number_format($r['TotalSinDescuento'], 2) ?> Bs</td>
                                        <td></td>
                                        <td><b>Descuento:</b></td>
                                        <td><?= number_format($r['Descuento'], 2) ?> Bs</td>
                                        <td class="total-final"><strong>Total con Descuento:</strong></td>
                                        <td class="total-final"><strong><?= number_format($r['Total'], 2) ?> Bs</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                            
                            <?php if (!empty($r['Garantias'])): ?>
                                <div class="info-adicional">
                                    <h4>Garantías:</h4>
                                    <ul>
                                        <?php foreach ($r['Garantias'] as $g): ?>
                                            <li>
                                                <?= htmlspecialchars($g['Tipo']) ?> - Cliente: <?= htmlspecialchars($g['Nombre'] . ' ' . $g['Apellido']) ?>
                                            </li>
                                        <?php endforeach; ?>
                                    </ul>
                                </div>
                            <?php else: ?>
                                <div class="info-adicional">
                                    <p><em>Sin garantías registradas.</em></p>
                                </div>
                            <?php endif; ?>
                            
                            <div class="acciones">
                                <form action="Devolucion.php" method="post">
                                    <input type="hidden" name="RentaID" value="<?= $r['RentaID'] ?>">
                                    <button type="submit" class="devolucion-btn">Registrar Devolución</button>
                                </form>
                            </div>
                        </td>
                    </tr>
                <?php endforeach; ?>
                </tbody>
            </table>
        <?php else: ?>
            <div class="text-muted">No hay rentas atrasadas por el momento.</div>
        <?php endif; ?>
    </div>
</div>
</body>
</html>