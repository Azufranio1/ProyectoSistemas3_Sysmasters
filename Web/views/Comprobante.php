<?php
include("../logic/ComprobanteLogic.php");
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Comprobante de Renta - Mary'sS</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="../CSS/Comprobante.css" rel="stylesheet">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <?php if ($error === null): ?>
        <div class="container">
            <div class="factura-card">
                <div class="factura-header d-flex justify-content-between align-items-center">
                    <div>
                        <h2 class="factura-title">Mary'sS</h2>
                    </div>
                    <div class="text-end">
                        <span class="success-icon">✅</span>
                        <h3>Comprobante de Renta</h3>
                    </div>
                </div>
                
                <div class="fecha-info row">
                    <div class="col-md-4">
                        <strong>Fecha de Renta:</strong> <?php echo formatearFecha($fechaRenta); ?> 
                    </div>
                    <div class="col-md-4">
                        <strong>Fecha de Devolución:</strong> <?php echo formatearFecha($fechaDev); ?>
                    </div>
                    <div class="col-md-4 text-md-end">
                        <strong>Días:</strong> <?php echo calcularDiasRenta($fechaRenta, $fechaDev); ?>
                    </div>
                </div>
                
                <h4 class="factura-subtitle">Datos del Cliente</h4>
                <div class="cliente-container">
                    <?php foreach ($detallesClientes as $index => $cliente): ?>
                        <div class="cliente-item mb-2 <?php echo $cliente['Garantia'] ? 'con-garantia' : ''; ?>">
                            <div class="d-flex justify-content-between">
                                <div>
                                    <strong><?php echo $cliente['Nombre'] . ' ' . $cliente['Apellido']; ?></strong>
                                    <span class="ms-3">Tel: <?php echo $cliente['Telefono']; ?></span>
                                </div>
                                <?php if ($cliente['Garantia']): ?>
                                    <span class="badge bg-warning text-dark">Con garantía</span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <?php if ($index < count($detallesClientes) - 1): ?>
                            <hr class="cliente-divisor">
                        <?php endif; ?>
                    <?php endforeach; ?>
                </div>
                
                <h4 class="factura-subtitle mt-4">Detalle de Productos</h4>
                <div class="table-responsive">
                    <table class="table tabla-productos">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Categoría</th>
                                <th>Color</th>
                                <th class="text-end">Precio</th>
                                <th class="text-center">Cantidad</th>
                                <th class="text-end">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($detallesProductos as $producto): ?>
                                <tr>
                                    <td><?php echo $producto['Nombre']; ?></td>
                                    <td><?php echo $producto['Categoria']; ?></td>
                                    <td><?php echo $producto['Color']; ?></td>
                                    <td class="text-end">Bs <?php echo number_format($producto['PrecioUnitario'], 2); ?></td>
                                    <td class="text-center"><?php echo $producto['Cantidad']; ?></td>
                                    <td class="text-end">Bs <?php echo number_format($producto['Subtotal'], 2); ?></td>
                                </tr>
                            <?php endforeach; ?>
                            <tr class="total-row">
                                <td colspan="5" class="text-end">Descuento:</td>
                                <td class="text-end">Bs <?php echo number_format($descuento, 2); ?></td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="5" class="text-end"><strong>TOTAL:</strong></td>
                                <td class="text-end"><strong>Bs <?php echo number_format($total, 2); ?></strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <h4 class="factura-subtitle mt-4">Garantías Dejadas</h4>
                <?php if(count($detallesGarantias) > 0): ?>
                    <div class="table-responsive">
                        <table class="table tabla-garantias">
                            <thead>
                                <tr>
                                    <th>Tipo de Garantía</th>
                                    <th>Cliente</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($detallesGarantias as $garantia): ?>
                                    <tr>
                                        <td><?php echo $garantia['Tipo']; ?></td>
                                        <td><?php echo $garantia['NombreCliente']; ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php else: ?>
                    <div class="alert alert-info">No se registraron garantías para esta renta.</div>
                <?php endif; ?>
                
                <div class="mt-4 text-center no-print">
                    <button onclick="window.print();" class="btn btn-outline-dark me-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-printer" viewBox="0 0 16 16">
                          <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                          <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2H5zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4V3zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2H5zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1z"/>
                        </svg>
                        Imprimir Comprobante
                    </button>
                    <a href="../Components/Renta.php" class="btn btn-custom">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus-circle" viewBox="0 0 16 16">
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                          <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                        </svg>
                        Registrar otra renta
                    </a>
                    <a href="../Views/ManagerDB.php" class="btn btn-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house" viewBox="0 0 16 16">
                          <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5ZM13 7.207V13.5a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5V7.207l5-5 5 5Z"/>
                        </svg>
                        Volver al inicio
                    </a>
                </div>
                
                <div class="footer-print">
                    <p>Gracias por confiar en Mary'sS. Los productos deben ser devueltos en la fecha acordada.</p>
                    <p class="small text-muted">© <?php echo date('Y'); ?> Mary'sS - Todos los derechos reservados</p>
                </div>
            </div>
        </div>
    <?php else: ?>
        <div class="container">
            <div class="error-card">
                <div class="error-icon">❌</div>
                <h2 class="error-title">Error al Procesar la Renta</h2>
                
                <div class="error-message">
                    <?php echo $error; ?>
                </div>
                
                <div class="mt-4 text-center">
                    <a href="../Components/Renta.php" class="btn btn-custom">Intentar de nuevo</a>
                    <a href="../Views/ManagerDB.php" class="btn btn-secondary">Volver al inicio</a>
                </div>
            </div>
        </div>
    <?php endif; ?>
</body>
</html>