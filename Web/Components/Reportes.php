<?php
include('../includes/Connection.php');
include('../includes/FechaLPBOB.php');
include('../includes/HeaderFormularios.php');
include('../utils/Reportes.php');
include('../utils/Regresiones.php');
$conn = connection();

// Procesar formulario si se envió
$reporte_generado = false;
$datos_reporte = [];
$datos_grafico = [];
$titulo_reporte = '';
$tipo_reporte = '';
$fecha_inicio = '';
$fecha_fin = '';
$categoria_filtro = '';

if ($_POST) {
    $tipo_reporte = $_POST['tipo_reporte'];
    $rango_tiempo = $_POST['rango_tiempo'] ?? 'todos';
    $categoria_filtro = $_POST['categoria_filtro'] ?? '';
    
    // Calcular fechas según el rango seleccionado
    $hoy = date('Y-m-d');
    
    if ($rango_tiempo == 'personalizado') {
        $fecha_inicio = $_POST['fecha_inicio'];
        $fecha_fin = $_POST['fecha_fin'];
    } elseif ($rango_tiempo != 'todos') {
        $fecha_fin = $hoy;
        switch ($rango_tiempo) {
            case 'semana':
                $fecha_inicio = date('Y-m-d', strtotime('-7 days'));
                break;
            case 'mes':
                $fecha_inicio = date('Y-m-d', strtotime('-1 month'));
                break;
            case '2meses':
                $fecha_inicio = date('Y-m-d', strtotime('-2 months'));
                break;
            case '3meses':
                $fecha_inicio = date('Y-m-d', strtotime('-3 months'));
                break;
            case '6meses':
                $fecha_inicio = date('Y-m-d', strtotime('-6 months'));
                break;
            case 'año':
                $fecha_inicio = date('Y-m-d', strtotime('-1 year'));
                break;
        }
    }
    
    // Generar reporte según el tipo
    switch ($tipo_reporte) {
        case 'productos':
            $datos_reporte = generarReporteProductos($conn, $fecha_inicio, $fecha_fin, $categoria_filtro);
            $datos_grafico = generarGraficoProductos($conn, $fecha_inicio, $fecha_fin, $categoria_filtro);
            $titulo_reporte = 'Reporte de Productos';
            break;
        case 'rentas':
            $datos_reporte = generarReporteRentas($conn, $fecha_inicio, $fecha_fin);
            $datos_grafico = generarGraficoRentas($conn, $fecha_inicio, $fecha_fin);
            $titulo_reporte = 'Reporte de Rentas';
            break;
        case 'devoluciones':
            $datos_reporte = generarReporteDevoluciones($conn, $fecha_inicio, $fecha_fin);
            $datos_grafico = generarGraficoDevoluciones($conn, $fecha_inicio, $fecha_fin);
            $titulo_reporte = 'Reporte de Devoluciones';
            break;
        case 'ingresos':
            $datos_reporte = generarReporteIngresos($conn, $fecha_inicio, $fecha_fin);
            $datos_grafico = generarGraficoIngresos($conn, $fecha_inicio, $fecha_fin);
            $titulo_reporte = 'Reporte de Ingresos';
            break;
        case 'prediccion_rentas':
            $datos_prediccion = generarPrediccionRentas($conn, $fecha_inicio, $fecha_fin, 6); // grado 2
            $titulo_reporte = 'Predicción de Rentas (Regresión Polinómica)';
            break;
        case 'prediccion_productos':
            $datos_prediccion_productos = generarPrediccionProductos($conn, $fecha_inicio, $fecha_fin, $categoria, 6);
            $titulo_reporte = 'Predicción de Demanda de Productos';
            break;
    }
    
    $reporte_generado = true;
}


$categorias = obtenerCategorias($conn);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reportes - Mary'sS</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
    <link rel="stylesheet" href="../CSS/Reporte.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <p style="color:white">-</p>
            <h1>📊 Reportes</h1>
            <p>Analice sus datos con gráficos y reportes detallados</p>
        </div>
        
        <div class="form-container">
            <form method="POST">
                <div class="form-row">
                    <div class="form-group">
                        <label for="tipo_reporte">Tipo de Reporte:</label>
                        <select id="tipo_reporte" name="tipo_reporte" required onchange="toggleCategoriaFiltro()">
                            <option value="">Seleccione un tipo...</option>
                            <option value="productos" <?= isset($_POST['tipo_reporte']) && $_POST['tipo_reporte'] == 'productos' ? 'selected' : '' ?>>📦 Productos</option>
                            <option value="rentas" <?= isset($_POST['tipo_reporte']) && $_POST['tipo_reporte'] == 'rentas' ? 'selected' : '' ?>>🏪 Rentas</option>
                            <option value="devoluciones" <?= isset($_POST['tipo_reporte']) && $_POST['tipo_reporte'] == 'devoluciones' ? 'selected' : '' ?>>↩️ Devoluciones</option>
                            <option value="ingresos" <?= isset($_POST['tipo_reporte']) && $_POST['tipo_reporte'] == 'ingresos' ? 'selected' : '' ?>>💰 Ingresos</option>
                            <option value="prediccion_rentas" <?= isset($_POST['tipo_reporte']) && $_POST['tipo_reporte'] == 'prediccion_rentas' ? 'selected' : '' ?>>🔮 Predicción de Rentas</option>
                            <option value="prediccion_productos" <?= isset($_POST['tipo_reporte']) && $_POST['tipo_reporte'] == 'prediccion_productos' ? 'selected' : '' ?>>📈 Predicción de Productos</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="rango_tiempo">Rango de Tiempo:</label>
                        <select id="rango_tiempo" name="rango_tiempo" onchange="toggleFechaPersonalizada()">
                            <option value="todos" <?= isset($_POST['rango_tiempo']) && $_POST['rango_tiempo'] == 'todos' ? 'selected' : '' ?>>📅 Todos los datos</option>
                            <option value="semana" <?= isset($_POST['rango_tiempo']) && $_POST['rango_tiempo'] == 'semana' ? 'selected' : '' ?>>📅 Última semana</option>
                            <option value="mes" <?= isset($_POST['rango_tiempo']) && $_POST['rango_tiempo'] == 'mes' ? 'selected' : '' ?>>📅 Último mes</option>
                            <option value="2meses" <?= isset($_POST['rango_tiempo']) && $_POST['rango_tiempo'] == '2meses' ? 'selected' : '' ?>>📅 Últimos 2 meses</option>
                            <option value="3meses" <?= isset($_POST['rango_tiempo']) && $_POST['rango_tiempo'] == '3meses' ? 'selected' : '' ?>>📅 Últimos 3 meses</option>
                            <option value="6meses" <?= isset($_POST['rango_tiempo']) && $_POST['rango_tiempo'] == '6meses' ? 'selected' : '' ?>>📅 Últimos 6 meses</option>
                            <option value="año" <?= isset($_POST['rango_tiempo']) && $_POST['rango_tiempo'] == 'año' ? 'selected' : '' ?>>📅 Último año</option>
                            <option value="personalizado" <?= isset($_POST['rango_tiempo']) && $_POST['rango_tiempo'] == 'personalizado' ? 'selected' : '' ?>>🗓️ Personalizado</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row categoria-filtro" id="categoriaFiltro">
                    
                </div>
                
                <div class="form-row fecha-personalizada" id="fechaPersonalizada">
                    <div class="form-group">
                        <label for="fecha_inicio">Fecha Inicio:</label>
                        <input type="date" id="fecha_inicio" name="fecha_inicio" 
                            value="<?= isset($_POST['fecha_inicio']) ? $_POST['fecha_inicio'] : '' ?>">
                        <small class="help-text">Rango permitido: desde hace 6 meses hasta hace 2 semanas</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="fecha_fin">Fecha Fin:</label>
                        <input type="date" id="fecha_fin" name="fecha_fin" 
                            value="<?= isset($_POST['fecha_fin']) ? $_POST['fecha_fin'] : '' ?>">
                        <small class="help-text">Rango permitido: desde hace 5 meses y 3 semanas hasta hace 1 semana</small>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <button type="submit">🚀 Generar Reporte</button>
                    </div>
                </div>
            </form>
        </div>
        
        <?php if ($reporte_generado): ?>
        <div class="report-container">
            <div class="report-header">
                <h2><?= $titulo_reporte ?></h2>
                <p>Reporte generado el <?= date('d/m/Y H:i:s') ?></p>
            </div>
            
            <div class="report-info">
                <div><strong>📊 Tipo:</strong> <?= $titulo_reporte ?></div>
                <div><strong>📅 Período:</strong> 
                    <?= ($fecha_inicio && $fecha_fin) ? date('d/m/Y', strtotime($fecha_inicio)) . ' - ' . date('d/m/Y', strtotime($fecha_fin)) : 'Todos los datos' ?>
                </div>
                <div><strong>📈 Registros:</strong> <?= count($datos_reporte) ?></div>
                <?php if ($categoria_filtro): ?>
                    <div><strong>🏷️ Categoría:</strong> 
                        <?php 
                        $cat_nombre = array_filter($categorias, function($c) use ($categoria_filtro) {
                            return $c['CategoriaID'] == $categoria_filtro;
                        });
                        echo !empty($cat_nombre) ? htmlspecialchars(reset($cat_nombre)['Categoria']) : 'Todas';
                        ?>
                    </div>
                <?php endif; ?>
            </div>
            
            <?php if (count($datos_grafico) > 0): ?>
            <div class="chart-container">
                <div class="chart-title">📊 Análisis Gráfico</div>
                <canvas id="reportChart"></canvas>
            </div>
            <?php endif; ?>
            
            <?php if (count($datos_reporte) > 0): ?>
                
                <?php if ($tipo_reporte == 'ingresos'): ?>
                <div class="stats-grid">
                    <?php 
                    $totalRentas = array_sum(array_column($datos_reporte, 'TotalRentas'));
                    $totalIngresos = array_sum(array_column($datos_reporte, 'IngresoTotal'));
                    $totalDescuentos = array_sum(array_column($datos_reporte, 'TotalDescuentos'));
                    $totalMultas = array_sum(array_column($datos_reporte, 'TotalMultas'));
                    $totalNeto = array_sum(array_column($datos_reporte, 'IngresoNeto'));
                    ?>
                    <div class="stat-card">
                        <div class="stat-value"><?= $totalRentas ?></div>
                        <div class="stat-label">Total Rentas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">Bs. <?= number_format($totalIngresos) ?></div>
                        <div class="stat-label">Ingresos Totales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">Bs. <?= number_format($totalMultas) ?></div>
                        <div class="stat-label">Total Multas</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">Bs. <?= number_format($totalNeto) ?></div>
                        <div class="stat-label">Ingreso Neto</div>
                    </div>
                </div>
                <?php endif; ?>
                
                <?php if ($tipo_reporte == 'productos'): ?>
                <table>
                    <thead>
                        <tr>
                            <th>🆔 ID</th>
                            <th>📦 Producto</th>
                            <th>🏷️ Categoría</th>
                            <th>🎨 Colores</th>
                            <th>📊 Stock</th>
                            <th>✅ Disponible</th>
                            <th>💰 Precio</th>
                            <th>📈 Rentado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($datos_reporte as $producto): ?>
                        <tr>
                            <td><?= htmlspecialchars($producto['ProductoID']) ?></td>
                            <td><?= htmlspecialchars($producto['Nombre']) ?></td>
                            <td><?= htmlspecialchars($producto['Categoria']) ?></td>
                            <td><?= htmlspecialchars($producto['Colores']) ?></td>
                            <td><?= $producto['Stock'] ?></td>
                            <td><?= $producto['Disponible'] ?></td>
                            <td>Bs. <?= number_format($producto['PrecioVenta']) ?></td>
                            <td><strong><?= $producto['TotalRentado'] ?></strong></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                
                <?php elseif ($tipo_reporte == 'rentas'): ?>
                <table>
                    <thead>
                        <tr>
                            <th>🆔 ID</th>
                            <th>📅 Fecha</th>
                            <th>👤 Cliente</th>
                            <th>👨‍💼 Empleado</th>
                            <th>💰 Total</th>
                            <th>🎁 Descuento</th>
                            <th>⚖️ Multa</th>
                            <th>📦 Productos</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($datos_reporte as $renta): ?>
                        <tr>
                            <td><?= htmlspecialchars($renta['RentaID']) ?></td>
                            <td><?= date('d/m/Y', strtotime($renta['FechaRenta'])) ?></td>
                            <td><?= htmlspecialchars($renta['Cliente']) ?></td>
                            <td><?= htmlspecialchars($renta['Empleado']) ?></td>
                            <td>Bs. <?= number_format($renta['Total']) ?></td>
                            <td>Bs. <?= number_format($renta['Descuento']) ?></td>
                            <td>Bs. <?= number_format($renta['Multa'] ?? 0) ?></td>
                            <td><?= htmlspecialchars($renta['Productos']) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                
                <?php elseif ($tipo_reporte == 'devoluciones'): ?>
                <table>
                    <thead>
                        <tr>
                            <th>🆔 ID</th>
                            <th>👤 Cliente</th>
                            <th>📅 F. Renta</th>
                            <th>⏰ F. Esperada</th>
                            <th>✅ F. Devuelto</th>
                            <th>📊 Estado</th>
                            <th>⏱️ Días Retraso</th>
                            <th>⚖️ Multa</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($datos_reporte as $devolucion): ?>
                        <tr>
                            <td><?= htmlspecialchars($devolucion['RentaID']) ?></td>
                            <td><?= htmlspecialchars($devolucion['Cliente']) ?></td>
                            <td><?= date('d/m/Y', strtotime($devolucion['FechaRenta'])) ?></td>
                            <td><?= date('d/m/Y', strtotime($devolucion['FechaDevolucion'])) ?></td>
                            <td><?= $devolucion['FechaDevuelto'] ? date('d/m/Y', strtotime($devolucion['FechaDevuelto'])) : '⏳ Pendiente' ?></td>
                            <td>
                                <?php 
                                $estado = $devolucion['EstadoDevolucion'];
                                $emoji = $estado == 'A tiempo' ? '✅' : ($estado == 'Tardía' ? '❌' : '⏳');
                                echo $emoji . ' ' . htmlspecialchars($estado);
                                ?>
                            </td>
                            <td><?= $devolucion['DiasRetraso'] > 0 ? $devolucion['DiasRetraso'] : '-' ?></td>
                            <td>Bs. <?= number_format($devolucion['Multa'] ?? 0) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                
                <?php elseif ($tipo_reporte == 'ingresos'): ?>
                <table>
                    <thead>
                        <tr>
                            <th>📅 Fecha</th>
                            <th>📊 Rentas</th>
                            <th>💰 Ingreso Rentas</th>
                            <th>🎁 Descuentos</th>
                            <th>⚖️ Multas</th>
                            <th>💎 Ingreso Neto</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($datos_reporte as $ingreso): ?>
                        <tr>
                            <td><?= date('d/m/Y', strtotime($ingreso['Fecha'])) ?></td>
                            <td><?= $ingreso['TotalRentas'] ?></td>
                            <td>Bs. <?= number_format($ingreso['IngresoTotal']) ?></td>
                            <td>Bs. <?= number_format($ingreso['TotalDescuentos']) ?></td>
                            <td>Bs. <?= number_format($ingreso['TotalMultas']) ?></td>
                            <td><strong>Bs. <?= number_format($ingreso['IngresoNeto']) ?></strong></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                <?php endif; ?>
                <?php elseif ($tipo_reporte == 'prediccion_rentas' && $datos_prediccion): ?>
    <div class="prediction-stats">
        <div class="stat-card">
            <div class="stat-value"><?= round($datos_prediccion['regresion_rentas']['r_cuadrado'] * 100, 1) ?>%</div>
            <div class="stat-label">Confianza Rentas</div>
        </div>
        <div class="stat-card">
            <div class="stat-value"><?= round($datos_prediccion['regresion_ingresos']['r_cuadrado'] * 100, 1) ?>%</div>
            <div class="stat-label">Confianza Ingresos</div>
        </div>
    </div>
    
    <h3>🔮 Predicciones para los próximos 6 meses</h3>
    <table>
        <thead>
            <tr>
                <th>📅 Fecha</th>
                <th>🏪 Rentas Predichas</th>
                <th>💰 Ingresos Predichos</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($datos_prediccion['predicciones'] as $pred): ?>
            <tr>
                <td><?= date('m/Y', strtotime($pred['fecha'])) ?></td>
                <td><strong><?= $pred['rentas_pred'] ?></strong></td>
                <td><strong>Bs. <?= number_format($pred['ingresos_pred']) ?></strong></td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
    <?php elseif ($tipo_reporte == 'prediccion_productos' && $datos_prediccion_productos): ?>
<div class="prediction-stats">
    <div class="stat-card">
        <div class="stat-value"><?= count($datos_prediccion_productos) ?></div>
        <div class="stat-label">Productos Analizados</div>
    </div>
    <div class="stat-card">
        <div class="stat-value"><?= count(array_filter($datos_prediccion_productos, function($p) { return $p['nivel_riesgo'] == 'alto'; })) ?></div>
        <div class="stat-label">Riesgo Alto</div>
    </div>
    <div class="stat-card">
        <div class="stat-value"><?= count(array_filter($datos_prediccion_productos, function($p) { return $p['tendencia'] == 'creciente'; })) ?></div>
        <div class="stat-label">Tendencia Creciente</div>
    </div>
    <div class="stat-card">
        <div class="stat-value"><?= round(array_sum(array_column($datos_prediccion_productos, 'demanda_semanal_pred'))) ?></div>
        <div class="stat-label">Demanda Total Semanal</div>
    </div>
</div>

<h3>📈 Predicciones de Demanda por Producto</h3>
<table>
    <thead>
        <tr>
            <th>🆔 ID</th>
            <th>📦 Producto</th>
            <th>📊 Stock Actual</th>
            <th>✅ Disponible</th>
            <th>📈 Tendencia</th>
            <th>🔮 Demanda Semanal</th>
            <th>📊 Confianza</th>
            <th>⚠️ Riesgo</th>
            <th>💡 Recomendación</th>
        </tr>
    </thead>
    <tbody>
        <?php foreach ($datos_prediccion_productos as $pred): ?>
        <tr>
            <td><?= htmlspecialchars($pred['info']['ProductoID']) ?></td>
            <td><?= htmlspecialchars($pred['info']['Nombre']) ?></td>
            <td><?= $pred['info']['Stock'] ?></td>
            <td><?= $pred['info']['Disponible'] ?></td>
            <td>
                <?php 
                $tendencia_emoji = $pred['tendencia'] == 'creciente' ? '📈' : 
                                 ($pred['tendencia'] == 'decreciente' ? '📉' : '➡️');
                echo $tendencia_emoji . ' ' . ucfirst($pred['tendencia']);
                ?>
            </td>
            <td><strong><?= $pred['demanda_semanal_pred'] ?></strong></td>
            <td><?= round($pred['regresion']['r_cuadrado'] * 100, 1) ?>%</td>
            <td>
                <?php 
                $riesgo_color = $pred['nivel_riesgo'] == 'alto' ? '🔴' : 
                              ($pred['nivel_riesgo'] == 'medio' ? '🟡' : '🟢');
                echo $riesgo_color . ' ' . ucfirst($pred['nivel_riesgo']);
                ?>
            </td>
            <td><?= htmlspecialchars($pred['recomendacion_stock']) ?></td>
        </tr>
        <?php endforeach; ?>
    </tbody>
</table>

<h3>📊 Detalles de Predicción por Producto</h3>
<?php foreach (array_slice($datos_prediccion_productos, 0, 5) as $pred): ?>
<div class="prediction-detail" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
    <h4>📦 <?= htmlspecialchars($pred['info']['Nombre']) ?></h4>
    <p><strong>Promedio histórico:</strong> <?= $pred['promedio_demanda'] ?> unidades/día</p>
    <p><strong>Predicciones para los próximos 7 días:</strong></p>
    <table style="width: 100%; border-collapse: collapse;">
        <thead>
            <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">📅 Fecha</th>
                <th style="border: 1px solid #ddd; padding: 8px;">🔮 Demanda Predicha</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($pred['predicciones'] as $p): ?>
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><?= date('d/m/Y', strtotime($p['fecha'])) ?></td>
                <td style="border: 1px solid #ddd; padding: 8px;"><?= $p['demanda_pred'] ?> unidades</td>
            </tr>
            <?php endforeach; ?>
        </tbody>
    </table>
</div>
<?php endforeach; ?>
            <?php else: ?>
                <div class="no-data">
                    🔍 No se encontraron datos para los criterios seleccionados.
                    <br>Intente ajustar los filtros o el rango de fechas.
                </div>
            <?php endif; ?>
        </div>

        
        <?php endif; ?>
    </div>


    <script src="../JS/Reportes.js"></script>
    <?php
        include('../logic/ReportesJsLogic.php');
    ?>
</body>
</html>