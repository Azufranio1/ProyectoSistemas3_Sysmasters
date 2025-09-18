<?php
include('../includes/VerifySession.php');
include('../logic/ManagerDBLogic.php');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mary'sS - Dashboard Administrativo</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="icon" type="image/png" href="../Resources/imgs/MarysSLogoIcon.png">
    <link rel="stylesheet" href="../CSS/ManagerDB.css">
</head>
<body>
    <div class="container">
        <div class="sidebar">
            <div class="sidebar-header">
                <a href="../index.php">
                    <img src="../Resources/imgs/MarysSLogoST.png" alt="Logo" class="MarysSLogo"/>
                    <h1>Mary'sS</h1>
                </a>
            </div>
            <div class="sidebar-nav">
                <div class="nav-item active" id="menu-dashboard">
                    <i class="fas fa-home"></i>
                    <span>Inicio</span>
                </div>

                <hr>

                <div class="nav-item" id="menu-rentactiva">
                    <i class="fas fa-hourglass-half"></i>
                    <span>Rentas Activas</span>
                </div>
                <div class="nav-item" id="menu-rentatrasada">
                    <i class="fas fa-clock"></i>
                    <span>Rentas Atrasadas</span>
                </div>

                <hr>

                <div class="nav-item" id="menu-renta">
                    <i class="fas fa-money-bill-wave"></i>
                    <span>Registrar Renta</span>
                </div>

                <hr>

                <div class="nav-item" id="menu-registrorentas">
                    <i class="bi bi-journal-bookmark-fill"></i>
                    <span>Historial de Rentas</span>
                </div>
            </div>
            <div class="sidebar-footer">
                <div class="nav-item" id="menu-logout">
                    <i class="fas fa-sign-out-alt"></i>
                    <span>Cerrar Sesión</span>
                </div>
            </div>
        </div>
    
        <div class="main-content">
            <div class="header">
                <div class="toggle-sidebar">
                    <i class="fas fa-bars"></i>
                </div>
                <div class="search-bar">
                </div>
                <div class="user-profile">
                    <?php include('../includes/MGREMP.php'); ?>
                </div>
            </div>
            
            <div class="dashboard">
                <div class="stats-container">
                    <div class="stat-card primary">
                        <h3>Ingresos Mensuales</h3>
                        <div class="value">Bs. <?php echo number_format($gananciasMensuales, 2) ?></div>
                    </div>
                    <div class="stat-card warning">
                        <h3>Disfraces Rentados</h3>
                        <div class="value"><?php echo number_format($prendasMensuales) ?></div>
                    </div>
                    <div class="stat-card success">
                        <h3>Rentas Activas</h3>
                        <div class="value"><?php echo $rentasActivas ?></div>
                    </div>
                    <div class="stat-card info">
                        <h3>Rentas Atrasadas</h3>
                        <div class="value"><?php echo $rentasAtrasadas ?></div>
                    </div>
                </div>
                
                <div class="charts-container">
                    <div class="chart-card">
    <h3>
        Tendencia de Alquileres
        <span>Últimos 7 meses</span>
    </h3>
    <div class="chart-content">
        <?php if(!empty($tendencias)): ?>
            <div class="bar-chart">
                <?php 
                $maxRentas = 0;
                foreach($tendencias as $mes) {
                    if($mes['TotalRentas'] > $maxRentas) $maxRentas = $mes['TotalRentas'];
                }
                if($maxRentas == 0) $maxRentas = 1; // Evitar división por cero
                
                foreach($tendencias as $mes): 
                    // Altura máxima de 160px para que quepan las etiquetas
                    $altura = max(20, ($mes['TotalRentas'] / $maxRentas) * 160);
                    // Truncar nombre del mes a 3 caracteres
                    $mesCorto = substr($mes['MesNombre'], 0, 3);
                ?>
                <div class="bar" style="height: <?php echo $altura; ?>px;" title="<?php echo $mes['MesNombre'] . ': ' . $mes['TotalRentas']; ?> rentas">
                    <div class="bar-label"><?php echo $mesCorto; ?></div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
                <div class="no-data-message">
                    <i class="fas fa-chart-bar"></i>
                    <div>No hay datos de tendencias disponibles</div>
                </div>
            <?php endif; ?>
            </div>
        </div>
                    
                    <div class="chart-card">
                        <h3>
                            Categorías Populares
                            <span>Último mes</span>
                        </h3>
                        <div class="chart-content">
                            <?php if(!empty($categoriaStats)): ?>
                                <?php
                                $totalCategorias = array_sum(array_column($categoriaStats, 'TotalRentado'));
                                $colores = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
                                $porcentajes = [];
                                $anguloAcumulado = 0;
                                
                                foreach($categoriaStats as $index => $categoria) {
                                    $porcentaje = $totalCategorias > 0 ? ($categoria['TotalRentado'] / $totalCategorias) * 100 : 0;
                                    $porcentajes[] = [
                                        'categoria' => $categoria['Categoria'],
                                        'porcentaje' => $porcentaje,
                                        'color' => $colores[$index % count($colores)]
                                    ];
                                }
                                ?>
                                <div style="display: flex; align-items: center; gap: 30px;">
                                    <div style="width: 200px; height: 200px; border-radius: 50%; background: conic-gradient(
                                        <?php 
                                        $gradientParts = [];
                                        $currentAngle = 0;
                                        foreach($porcentajes as $p) {
                                            $endAngle = $currentAngle + $p['porcentaje'];
                                            $gradientParts[] = $p['color'] . ' ' . $currentAngle . '% ' . $endAngle . '%';
                                            $currentAngle = $endAngle;
                                        }
                                        echo implode(', ', $gradientParts);
                                        ?>
                                    ); position: relative;">
                                        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80px; height: 80px; border-radius: 50%; background-color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9em;">
                                            <?php echo $totalCategorias; ?>
                                        </div>
                                    </div>
                                    <div style="flex: 1;">
                                        <?php foreach($porcentajes as $p): ?>
                                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                                            <div style="width: 16px; height: 16px; background-color: <?php echo $p['color']; ?>; border-radius: 3px; margin-right: 8px;"></div>
                                            <span style="font-size: 0.9em;"><?php echo $p['categoria']; ?>: <?php echo number_format($p['porcentaje'], 1); ?>%</span>
                                        </div>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php else: ?>
                                <div style="text-align: center; color: #666;">
                                    No hay datos de categorías disponibles
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
                
                <div class="calendar-events-container">
                    <div class="chart-card">
                        <h3>
                            Prendas Más Populares
                            <span>Últimos 2 meses</span>
                        </h3>
                        <div class="product-list scrollbar-custom">
                            <?php if(!empty($prendasPopulares)): ?>
                                <?php foreach($prendasPopulares as $index => $prenda): ?>
                                <div class="costume-card">
                                    <div class="costume-img">
                                        <i class="fas fa-tshirt"></i>
                                    </div>
                                    <div class="costume-info">
                                        <h4><?php echo htmlspecialchars($prenda['Nombre']); ?></h4>
                                        <div style="margin: 5px 0;">
                                            <span class="category-badge"><?php echo htmlspecialchars($prenda['Categoria']); ?></span>
                                        </div>
                                        <div class="color-display">
                                            <?php if(!empty($prenda['ColorPrimario'])): ?>
                                                <span class="color-badge"><?php echo htmlspecialchars($prenda['ColorPrimario']); ?></span>
                                            <?php endif; ?>
                                            <?php if(!empty($prenda['ColorSecundario'])): ?>
                                                <span class="color-badge"><?php echo htmlspecialchars($prenda['ColorSecundario']); ?></span>
                                            <?php endif; ?>
                                        </div>
                                        <span class="status popular">
                                            <?php echo $prenda['TotalRentado']; ?> veces rentado
                                        </span>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <div class="costume-card">
                                    <div class="costume-info">
                                        <h4>No hay datos disponibles</h4>
                                        <p>No se encontraron prendas rentadas este mes</p>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <div class="chart-card">
                        <h3>
                            Inventario de Productos
                            <span>Stock disponible</span>
                        </h3>
                        <div class="product-list scrollbar-custom">
                            <?php if(!empty($productosInventario)): ?>
                                <?php foreach($productosInventario as $producto): ?>
                                <div class="costume-card">
                                    <div class="costume-img" style="background-color: rgba(46, 204, 113, 0.1); color: var(--success);">
                                        <i class="fas fa-tshirt"></i>
                                    </div>
                                    <div class="costume-info">
                                        <h4><?php echo htmlspecialchars($producto['Nombre']); ?></h4>
                                        <div style="margin: 5px 0;">
                                            <span class="category-badge"><?php echo htmlspecialchars($producto['Categoria']); ?></span>
                                        </div>
                                        <div class="color-display">
                                            <?php if(!empty($producto['ColorPrimario'])): ?>
                                                <span class="color-badge"><?php echo htmlspecialchars($producto['ColorPrimario']); ?></span>
                                            <?php endif; ?>
                                            <?php if(!empty($producto['ColorSecundario'])): ?>
                                                <span class="color-badge"><?php echo htmlspecialchars($producto['ColorSecundario']); ?></span>
                                            <?php endif; ?>
                                        </div>
                                        <div class="stock-info">
                                            <span class="stock-available">
                                                <i class="fas fa-check-circle"></i> Disponible: <?php echo $producto['StockDisponible']; ?>
                                            </span>
                                            <span class="stock-rented">
                                                <i class="fas fa-clock"></i> Rentado: <?php echo $producto['CantidadRentada']; ?>
                                            </span>
                                            <span class="stock-total">
                                                <i class="fas fa-box"></i> Total: <?php echo $producto['Stock']; ?>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <div class="costume-card">
                                    <div class="costume-info">
                                        <h4>No hay productos disponibles</h4>
                                        <p>No se encontraron productos en el inventario</p>
                                    </div>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="../JS/EmployeeDB.js"></script>

</body>
</html>