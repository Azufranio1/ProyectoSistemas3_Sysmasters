<script>
        <?php if ($reporte_generado && count($datos_grafico) > 0): ?>
        // Generar gráfico
        const ctx = document.getElementById('reportChart').getContext('2d');
        let chartData, chartConfig;
        
        <?php if ($tipo_reporte == 'productos'): ?>
        chartData = {
            labels: <?= json_encode(array_column($datos_grafico, 'Nombre')) ?>,
            datasets: [{
                label: 'Productos Más Rentados',
                data: <?= json_encode(array_column($datos_grafico, 'TotalRentado')) ?>,
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe',
                    '#43e97b', '#fa709a', '#fee140', '#a8edea', '#d299c2'
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        };
        
        chartConfig = {
            type: 'doughnut',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        },
                        onClick: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + ' rentas';
                            }
                        }
                    }
                }
            }
        };
        
        <?php elseif ($tipo_reporte == 'rentas'): ?>
        chartData = {
            labels: <?= json_encode(array_map(function($item) {
                return date('M Y', strtotime($item['Mes'] . '-01'));
            }, $datos_grafico)) ?>,
            datasets: [{
                label: 'Número de Rentas',
                data: <?= json_encode(array_column($datos_grafico, 'TotalRentas')) ?>,
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: '#667eea',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }, {
                label: 'Ingresos (Bs.)',
                data: <?= json_encode(array_column($datos_grafico, 'IngresoTotal')) ?>,
                backgroundColor: 'rgba(118, 75, 162, 0.2)',
                borderColor: '#764ba2',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        };
        
        chartConfig = {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        onClick: false
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Número de Rentas'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Ingresos (Bs.)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        };
        
        <?php elseif ($tipo_reporte == 'devoluciones'): ?>
        chartData = {
            labels: <?= json_encode(array_column($datos_grafico, 'EstadoDevolucion')) ?>,
            datasets: [{
                label: 'Estado de Devoluciones',
                data: <?= json_encode(array_column($datos_grafico, 'Cantidad')) ?>,
                backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
                borderColor: '#fff',
                borderWidth: 2
            }]
        };
        
        chartConfig = {
            type: 'pie',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        },
                        onClick: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        };
        
        <?php elseif ($tipo_reporte == 'ingresos'): ?>
        chartData = {
            labels: <?= json_encode(array_map(function($item) {
                return date('d/m', strtotime($item['Fecha']));
            }, $datos_grafico)) ?>,
            datasets: [{
                label: 'Ingresos por Rentas (Bs.)',
                data: <?= json_encode(array_column($datos_grafico, 'IngresoTotal')) ?>,
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: '#667eea',
                borderWidth: 2
            }, {
                label: 'Multas (Bs.)',
                data: <?= json_encode(array_column($datos_grafico, 'TotalMultas')) ?>,
                backgroundColor: 'rgba(220, 53, 69, 0.6)',
                borderColor: '#dc3545',
                borderWidth: 2
            }]
        };
        
        chartConfig = {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        onClick: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Fechas'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Monto (Bs.)'
                        },
                        beginAtZero: true
                    }
                }
            }
        };

        <?php elseif ($tipo_reporte == 'prediccion_rentas' && $datos_prediccion): ?>
const historicos = <?= json_encode($datos_prediccion['datos_historicos']) ?>;
const predicciones = <?= json_encode($datos_prediccion['predicciones']) ?>;

const fechasHistoricas = historicos.map(item => item.Fecha);
const rentasHistoricas = historicos.map(item => parseInt(item.TotalRentas));
const ingresosHistoricos = historicos.map(item => parseFloat(item.IngresoTotal));

const fechasPredichas = predicciones.map(item => item.fecha);
const rentasPredichas = predicciones.map(item => item.rentas_pred);
const ingresosPredichos = predicciones.map(item => item.ingresos_pred);

chartData = {
    labels: [...fechasHistoricas, ...fechasPredichas],
    datasets: [{
        label: 'Rentas Históricas',
        data: [...rentasHistoricas, ...Array(predicciones.length).fill(null)],
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: '#667eea',
        borderWidth: 3,
        pointRadius: 4
    }, {
        label: 'Predicción Rentas',
        data: [...Array(historicos.length).fill(null), ...rentasPredichas],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: '#ff6384',
        borderWidth: 3,
        borderDash: [5, 5],
        pointRadius: 6,
        pointStyle: 'triangle'
    }]
};

chartConfig = {
    type: 'line',
    data: chartData,
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top', onClick: false },
            title: {
                display: true,
                text: 'Predicción de Rentas con Regresión Lineal'
            }
        },
        scales: {
            x: { title: { display: true, text: 'Fechas' }},
            y: { title: { display: true, text: 'Cantidad de Rentas' }, beginAtZero: true }
        }
    }
};
<?php elseif ($tipo_reporte == 'prediccion_productos' && $datos_prediccion_productos): ?>
// Tomar los primeros 10 productos para el gráfico
const topProductos = <?= json_encode(array_slice($datos_prediccion_productos, 0, 10)) ?>;

chartData = {
    labels: topProductos.map(p => p.info.Nombre),
    datasets: [{
        label: 'Demanda Semanal Predicha',
        data: topProductos.map(p => p.demanda_semanal_pred),
        backgroundColor: topProductos.map(p => {
            switch(p.nivel_riesgo) {
                case 'alto': return 'rgba(220, 53, 69, 0.6)';
                case 'medio': return 'rgba(255, 193, 7, 0.6)';
                default: return 'rgba(40, 167, 69, 0.6)';
            }
        }),
        borderColor: topProductos.map(p => {
            switch(p.nivel_riesgo) {
                case 'alto': return '#dc3545';
                case 'medio': return '#ffc107';
                default: return '#28a745';
            }
        }),
        borderWidth: 2
    }]
};

chartConfig = {
    type: 'bar',
    data: chartData,
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top', onClick: false },
            title: {
                display: true,
                text: 'Predicción de Demanda Semanal por Producto'
            },
            tooltip: {
                callbacks: {
                    afterLabel: function(context) {
                        const producto = topProductos[context.dataIndex];
                        return [
                            `Tendencia: ${producto.tendencia}`,
                            `Confianza: ${Math.round(producto.regresion.r_cuadrado * 100)}%`,
                            `Riesgo: ${producto.nivel_riesgo}`
                        ];
                    }
                }
            }
        },
        scales: {
            x: { 
                title: { display: true, text: 'Productos' },
                ticks: { maxRotation: 45 }
            },
            y: { 
                title: { display: true, text: 'Demanda Predicha (unidades)' }, 
                beginAtZero: true 
            }
        }
    }
};
        <?php endif; ?>

        
        
        new Chart(ctx, chartConfig);
        <?php endif; ?>
    </script>