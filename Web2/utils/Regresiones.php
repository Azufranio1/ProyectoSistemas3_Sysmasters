<?php

function calcularRegresionPolinomica($datos_x, $datos_y, $grado = 2, $config = []) {
    $n = count($datos_x);
    if ($n < 2) return null;
    
    if ($n !== count($datos_y)) return null;
    
    // Configuración por defecto
    $config = array_merge([
        'forzar_grado' => true,           // Si es true, no limita el grado automáticamente
        'max_grado_auto' => 3,             // Máximo grado automático si forzar_grado es false
        'normalizar' => true,              // Si normalizar los datos X
        'regularizacion' => 0.01,          // Factor de regularización Ridge
        'validar_r2' => true,              // Si validar que R² sea razonable
        'limitar_extrapolacion' => true,   // Si limitar extrapolaciones extremas
        'debug' => false                   // Si mostrar información de depuración
    ], $config);
    
    // Control de grado
    if (!$config['forzar_grado']) {
        // Límites automáticos más conservadores
        $max_grado_datos = floor($n / 2) - 1; // Más conservador
        $max_grado_config = $config['max_grado_auto'];
        $max_grado = min($max_grado_datos, $max_grado_config);
        
        if ($grado > $max_grado) {
            $grado = max(1, $max_grado); // Mínimo grado 1
            if ($config['debug']) {
                echo "Grado limitado automáticamente a: $grado\n";
            }
        }
    }
    
    // Validación mínima del grado
    if ($grado < 1) $grado = 1;
    if ($grado >= $n) {
        if (!$config['forzar_grado']) {
            $grado = max(1, $n - 2);
        }
    }
    
    // Normalización opcional
    $datos_x_proc = $datos_x;
    $min_x = min($datos_x);
    $max_x = max($datos_x);
    $rango_x = $max_x - $min_x;
    
    if ($config['normalizar'] && $rango_x > 0) {
        $datos_x_proc = [];
        foreach ($datos_x as $x) {
            $datos_x_proc[] = ($x - $min_x) / $rango_x;
        }
    } elseif ($rango_x == 0) {
        // Fallback si todos los X son iguales
        return calcularRegresionLinealFallback($datos_x, $datos_y);
    }
    
    // Crear matriz de Vandermonde
    $matriz_x = [];
    for ($i = 0; $i < $n; $i++) {
        $fila = [];
        for ($j = 0; $j <= $grado; $j++) {
            $fila[] = pow($datos_x_proc[$i], $j);
        }
        $matriz_x[] = $fila;
    }
    
    // Resolver sistema de ecuaciones normales
    $xt = transponer($matriz_x);
    $xtx = multiplicarMatrices($xt, $matriz_x);
    $xty = multiplicarMatrizVector($xt, $datos_y);
    
    // Regularización opcional
    if ($config['regularizacion'] > 0) {
        for ($i = 0; $i < count($xtx); $i++) {
            $xtx[$i][$i] += $config['regularizacion'];
        }
    }
    
    $coeficientes = resolverSistemaLineal($xtx, $xty);
    
    if ($coeficientes === null) {
        if ($config['debug']) {
            echo "Fallo en resolución del sistema, usando fallback lineal\n";
        }
        return calcularRegresionLinealFallback($datos_x, $datos_y);
    }
    
    // Calcular R²
    $media_y = array_sum($datos_y) / $n;
    $ss_tot = 0;
    $ss_res = 0;
    
    for ($i = 0; $i < $n; $i++) {
        $y_pred = evaluarPolinomioConDatos($coeficientes, $datos_x[$i], $config['normalizar'], $min_x, $rango_x);
        $ss_tot += pow($datos_y[$i] - $media_y, 2);
        $ss_res += pow($datos_y[$i] - $y_pred, 2);
    }
    
    if ($ss_tot == 0) {
        $r_cuadrado = ($ss_res == 0) ? 1 : 0;
    } else {
        $r_cuadrado = 1 - ($ss_res / $ss_tot);
    }
    
    // Validación opcional de R²
    if ($config['validar_r2'] && ($r_cuadrado < -0.1 || $r_cuadrado > 1.1)) {
        if ($config['debug']) {
            echo "R² inválido ($r_cuadrado), usando fallback lineal\n";
        }
        return calcularRegresionLinealFallback($datos_x, $datos_y);
    }
    
    // Calcular pendiente equivalente (derivada en el punto medio)
    $x_medio = $config['normalizar'] ? 0.5 : ($min_x + $max_x) / 2;
    $pendiente_equiv = calcularDerivada($coeficientes, $x_medio, $config['normalizar'], $rango_x);
    
    return [
        'pendiente' => $pendiente_equiv,
        'intercepto' => $coeficientes[0],
        'r_cuadrado' => $r_cuadrado,
        'coeficientes' => $coeficientes,
        'grado' => $grado,
        'tipo' => 'polinomica',
        'normalizado' => $config['normalizar'],
        'min_x' => $min_x,
        'max_x' => $max_x,
        'rango_x' => $rango_x,
        'config' => $config
    ];
}

function evaluarPolinomioConDatos($coeficientes, $x, $normalizado = true, $min_x = 0, $rango_x = 1) {
    if ($normalizado && $rango_x > 0) {
        $x_proc = ($x - $min_x) / $rango_x;
    } else {
        $x_proc = $x;
    }
    
    $resultado = 0;
    for ($i = 0; $i < count($coeficientes); $i++) {
        $resultado += $coeficientes[$i] * pow($x_proc, $i);
    }
    return $resultado;
}

function calcularDerivada($coeficientes, $x, $normalizado = true, $rango_x = 1) {
    $derivada = 0;
    for ($i = 1; $i < count($coeficientes); $i++) {
        $derivada += $i * $coeficientes[$i] * pow($x, $i - 1);
    }
    
    // Ajustar por la normalización
    if ($normalizado && $rango_x > 0) {
        $derivada = $derivada / $rango_x;
    }
    
    return $derivada;
}

function predecirConPolinomio($regresion, $x_nuevo, $config_pred = []) {
    // Configuración de predicción
    $config_pred = array_merge([
        'limitar_extrapolacion' => true,
        'factor_extrapolacion' => 0.5,    // Qué tan lejos permitir extrapolación (como factor del rango)
        'usar_tendencia_lineal' => true,   // Si usar tendencia lineal para extrapolaciones extremas
        'limitar_valores' => false,        // Si limitar valores extremos
        'factor_limite' => 5               // Factor de límite para valores extremos
    ], $config_pred);
    
    if (!isset($regresion['coeficientes'])) {
        // Fallback a regresión lineal
        return $regresion['pendiente'] * $x_nuevo + $regresion['intercepto'];
    }
    
    // Verificar extrapolación
    $dentro_rango = ($x_nuevo >= $regresion['min_x'] && $x_nuevo <= $regresion['max_x']);
    $rango_extension = $regresion['rango_x'] * $config_pred['factor_extrapolacion'];
    $extrapolacion_moderada = ($x_nuevo >= ($regresion['min_x'] - $rango_extension) && 
                              $x_nuevo <= ($regresion['max_x'] + $rango_extension));
    
    if ($config_pred['limitar_extrapolacion'] && !$extrapolacion_moderada && $config_pred['usar_tendencia_lineal']) {
        // Usar tendencia lineal para extrapolaciones extremas
        $pendiente = $regresion['pendiente'];
        if ($x_nuevo > $regresion['max_x']) {
            $valor_borde = evaluarPolinomioConDatos($regresion['coeficientes'], $regresion['max_x'], 
                                                   $regresion['normalizado'], $regresion['min_x'], $regresion['rango_x']);
            return $valor_borde + $pendiente * ($x_nuevo - $regresion['max_x']);
        } else {
            $valor_borde = evaluarPolinomioConDatos($regresion['coeficientes'], $regresion['min_x'], 
                                                   $regresion['normalizado'], $regresion['min_x'], $regresion['rango_x']);
            return $valor_borde + $pendiente * ($x_nuevo - $regresion['min_x']);
        }
    }
    
    // Evaluación normal del polinomio
    $prediccion = evaluarPolinomioConDatos($regresion['coeficientes'], $x_nuevo, 
                                          $regresion['normalizado'], $regresion['min_x'], $regresion['rango_x']);
    
    // Limitar valores extremos opcionalmente
    if ($config_pred['limitar_valores']) {
        $valor_base = $regresion['intercepto'];
        $limite_superior = abs($valor_base) * $config_pred['factor_limite'] + abs($valor_base);
        $limite_inferior = -abs($valor_base) * $config_pred['factor_limite'];
        
        $prediccion = max($limite_inferior, min($limite_superior, $prediccion));
    }
    
    return $prediccion;
}

function generarPrediccionRentas($conn, $fecha_inicio = null, $fecha_fin = null, $grado_polinomio = 2, $config_regresion = []) {
    // Configuración de regresión personalizable
    $config_regresion = array_merge([
        'forzar_grado' => false,
        'max_grado_auto' => 5,
        'normalizar' => true,
        'regularizacion' => 0.01,
        'validar_r2' => true,
        'debug' => false
    ], $config_regresion);
    
    // Configuración de predicción
    $config_prediccion = [
        'limitar_extrapolacion' => true,
        'factor_extrapolacion' => 0.3,
        'usar_tendencia_lineal' => true,
        'limitar_valores' => true,
        'factor_limite' => 3
    ];
    
    // Consulta SQL (sin cambios)
    $query = "SELECT DATE_FORMAT(FechaRenta, '%Y-%m') AS Mes,
                     COUNT(*) AS TotalRentas,
                     SUM(Total) AS IngresoTotal
              FROM Renta 
              WHERE 1=1";

    $params = [];
    $types = '';

    if ($fecha_inicio && $fecha_fin) {
        $query .= " AND FechaRenta BETWEEN ? AND ?";
        $params[] = $fecha_inicio;
        $params[] = $fecha_fin;
        $types .= 'ss';
    }

    $query .= " GROUP BY Mes ORDER BY Mes";

    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $datos = $result->fetch_all(MYSQLI_ASSOC);

    if (count($datos) < 3) return null;

    // Preparar datos para regresión
    $datos_x = [];
    $datos_y_rentas = [];
    $datos_y_ingresos = [];
    $fechas = [];

    $mes_base = null;
    foreach ($datos as $fila) {
        $mes = $fila['Mes'];
        $fechas[] = $mes;

        $anio = intval(substr($mes, 0, 4));
        $mes_num = intval(substr($mes, 5, 2));

        if ($mes_base === null) {
            $mes_base = $anio * 12 + $mes_num;
        }

        $mes_actual = $anio * 12 + $mes_num;
        $datos_x[] = $mes_actual - $mes_base;

        $datos_y_rentas[] = (int)$fila['TotalRentas'];
        $datos_y_ingresos[] = (float)$fila['IngresoTotal'];
    }

    // Calcular regresión polinómica con configuración personalizada
    $regresion_rentas = calcularRegresionPolinomica($datos_x, $datos_y_rentas, $grado_polinomio, $config_regresion);
    $regresion_ingresos = calcularRegresionPolinomica($datos_x, $datos_y_ingresos, $grado_polinomio, $config_regresion);

    if (!$regresion_rentas || !$regresion_ingresos) {
        return null;
    }

    // Generar predicciones
    $predicciones = [];
    $ultimo_x = end($datos_x);
    $ultima_fecha = end($fechas);

    $baseDate = DateTime::createFromFormat('Y-m', $ultima_fecha);
    
    for ($i = 1; $i <= 6; $i++) {
        $x_pred = $ultimo_x + $i;
        $fecha_pred = clone $baseDate;
        $fecha_pred->modify("+$i months");
        $mes_formateado = $fecha_pred->format('Y-m');

        $rentas_pred = predecirConPolinomio($regresion_rentas, $x_pred, $config_prediccion);
        $ingresos_pred = predecirConPolinomio($regresion_ingresos, $x_pred, $config_prediccion);

        $predicciones[] = [
            'fecha' => $mes_formateado,
            'rentas_pred' => max(0, round($rentas_pred)),
            'ingresos_pred' => max(0, round($ingresos_pred, 2))
        ];
    }

    return [
        'datos_historicos' => $datos,
        'predicciones' => $predicciones,
        'regresion_rentas' => $regresion_rentas,
        'regresion_ingresos' => $regresion_ingresos,
        'config_usada' => $config_regresion,
        'info_debug' => [
            'grado_solicitado' => $grado_polinomio,
            'grado_usado' => $regresion_rentas['grado'],
            'num_datos' => count($datos_x),
            'rango_x' => max($datos_x) - min($datos_x),
            'r2_rentas' => $regresion_rentas['r_cuadrado'],
            'r2_ingresos' => $regresion_ingresos['r_cuadrado'],
            'normalizado' => $regresion_rentas['normalizado']
        ]
    ];
}

function generarPrediccionProductos($conn, $fecha_inicio, $fecha_fin, $categoria_filtro, $grado_polinomio = 2, $config_regresion = []) {
    // Configuración por defecto para productos
    $config_regresion = array_merge([
        'forzar_grado' => false,
        'max_grado_auto' => 4,
        'normalizar' => true,
        'regularizacion' => 0.005,
        'validar_r2' => true,
        'debug' => false
    ], $config_regresion);
    
    // Resto del código de la función original...
    $query = "SELECT p.ProductoID, p.Nombre, p.Stock, p.Disponible,
                     DATE(r.FechaRenta) as Fecha,
                     SUM(dr.Cantidad) as CantidadRentada
              FROM Producto p
              LEFT JOIN DetalleRenta dr ON p.ProductoID = dr.ProductoID
              LEFT JOIN Renta r ON dr.RentaID = r.RentaID
              WHERE p.Habilitado = 1 AND r.FechaRenta IS NOT NULL";
    
    $params = [];
    $types = '';
    
    if ($fecha_inicio && $fecha_fin) {
        $query .= " AND r.FechaRenta BETWEEN ? AND ?";
        $params[] = $fecha_inicio;
        $params[] = $fecha_fin;
        $types .= 'ss';
    }
    
    if ($categoria_filtro) {
        $query .= " AND p.CategoriaID = ?";
        $params[] = $categoria_filtro;
        $types .= 'i';
    }
    
    $query .= " GROUP BY p.ProductoID, DATE(r.FechaRenta)
              HAVING CantidadRentada > 0
              ORDER BY p.ProductoID, Fecha";
    
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    $datos_historicos = $result->fetch_all(MYSQLI_ASSOC);
    
    if (empty($datos_historicos)) return null;
    
    // Agrupar por producto
    $productos_data = [];
    foreach ($datos_historicos as $registro) {
        $id = $registro['ProductoID'];
        if (!isset($productos_data[$id])) {
            $productos_data[$id] = [
                'info' => [
                    'ProductoID' => $registro['ProductoID'],
                    'Nombre' => $registro['Nombre'],
                    'Stock' => $registro['Stock'],
                    'Disponible' => $registro['Disponible']
                ],
                'demanda' => []
            ];
        }
        $productos_data[$id]['demanda'][] = [
            'fecha' => $registro['Fecha'],
            'cantidad' => (int)$registro['CantidadRentada']
        ];
    }
    
    $predicciones_productos = [];
    
    foreach ($productos_data as $producto_id => $data) {
        $info = $data['info'];
        $demanda = $data['demanda'];
        
        // Necesitamos al menos 3 puntos para hacer predicción
        if (count($demanda) < 3) continue;
        
        // Preparar datos para regresión
        $datos_x = [];
        $datos_y = [];
        $fechas = [];
        
        foreach ($demanda as $i => $punto) {
            $datos_x[] = $i + 1;
            $datos_y[] = $punto['cantidad'];
            $fechas[] = $punto['fecha'];
        }
        
        $regresion = calcularRegresionPolinomica($datos_x, $datos_y, $grado_polinomio, $config_regresion);
        
        if (!$regresion) continue;
        
        // Calcular tendencia
        $tendencia = 'estable';
        if ($regresion['pendiente'] > 0.5) {
            $tendencia = 'creciente';
        } elseif ($regresion['pendiente'] < -0.5) {
            $tendencia = 'decreciente';
        }
        
        // Generar predicciones para los próximos 7 días
        $predicciones = [];
        $ultimo_dia = end($datos_x);
        $promedio_demanda = array_sum($datos_y) / count($datos_y);
        
        $config_pred = [
            'limitar_extrapolacion' => true,
            'factor_extrapolacion' => 0.2,
            'usar_tendencia_lineal' => true,
            'limitar_valores' => true,
            'factor_limite' => 2
        ];
        
        for ($i = 1; $i <= 7; $i++) {
            $x_pred = $ultimo_dia + $i;
            $fecha_pred = date('Y-m-d', strtotime(end($fechas) . " + $i days"));
            
            $demanda_pred = predecirConPolinomio($regresion, $x_pred, $config_pred);
            
            $predicciones[] = [
                'fecha' => $fecha_pred,
                'demanda_pred' => max(0, round($demanda_pred))
            ];
        }
        
        // Resto de la lógica de recomendaciones...
        $demanda_semanal_pred = array_sum(array_column($predicciones, 'demanda_pred'));
        $stock_actual = (int)$info['Stock'];
        $disponible_actual = (int)$info['Disponible'];
        
        $recomendacion_stock = '';
        $nivel_riesgo = 'bajo';
        
        if ($demanda_semanal_pred > $disponible_actual) {
            $deficit = $demanda_semanal_pred - $disponible_actual;
            $recomendacion_stock = "Aumentar stock en $deficit unidades";
            $nivel_riesgo = 'alto';
        } elseif ($demanda_semanal_pred > ($disponible_actual * 0.7)) {
            $recomendacion_stock = "Considerar aumentar stock";
            $nivel_riesgo = 'medio';
        } else {
            $recomendacion_stock = "Stock suficiente";
            $nivel_riesgo = 'bajo';
        }
        
        $predicciones_productos[] = [
            'info' => $info,
            'regresion' => $regresion,
            'tendencia' => $tendencia,
            'predicciones' => $predicciones,
            'demanda_semanal_pred' => $demanda_semanal_pred,
            'promedio_demanda' => round($promedio_demanda, 1),
            'recomendacion_stock' => $recomendacion_stock,
            'nivel_riesgo' => $nivel_riesgo,
            'datos_historicos' => $demanda,
            'config_usada' => $config_regresion
        ];
    }
    
    // Ordenar por demanda predicha (descendente)
    usort($predicciones_productos, function($a, $b) {
        return $b['demanda_semanal_pred'] <=> $a['demanda_semanal_pred'];
    });
    
    return $predicciones_productos;
}

// Funciones auxiliares (sin cambios)
function transponer($matriz) {
    $filas = count($matriz);
    $cols = count($matriz[0]);
    $resultado = [];
    
    for ($j = 0; $j < $cols; $j++) {
        $fila = [];
        for ($i = 0; $i < $filas; $i++) {
            $fila[] = $matriz[$i][$j];
        }
        $resultado[] = $fila;
    }
    
    return $resultado;
}

function multiplicarMatrices($a, $b) {
    $filas_a = count($a);
    $cols_a = count($a[0]);
    $cols_b = count($b[0]);
    $resultado = [];
    
    for ($i = 0; $i < $filas_a; $i++) {
        $fila = [];
        for ($j = 0; $j < $cols_b; $j++) {
            $suma = 0;
            for ($k = 0; $k < $cols_a; $k++) {
                $suma += $a[$i][$k] * $b[$k][$j];
            }
            $fila[] = $suma;
        }
        $resultado[] = $fila;
    }
    
    return $resultado;
}

function multiplicarMatrizVector($matriz, $vector) {
    $filas = count($matriz);
    $resultado = [];
    
    for ($i = 0; $i < $filas; $i++) {
        $suma = 0;
        for ($j = 0; $j < count($vector); $j++) {
            $suma += $matriz[$i][$j] * $vector[$j];
        }
        $resultado[] = $suma;
    }
    
    return $resultado;
}

function resolverSistemaLineal($matriz, $vector) {
    $n = count($matriz);
    
    $augmented = [];
    for ($i = 0; $i < $n; $i++) {
        $augmented[$i] = array_merge($matriz[$i], [$vector[$i]]);
    }
    
    for ($i = 0; $i < $n; $i++) {
        $max_row = $i;
        for ($k = $i + 1; $k < $n; $k++) {
            if (abs($augmented[$k][$i]) > abs($augmented[$max_row][$i])) {
                $max_row = $k;
            }
        }
        
        if ($max_row != $i) {
            $temp = $augmented[$i];
            $augmented[$i] = $augmented[$max_row];
            $augmented[$max_row] = $temp;
        }
        
        if (abs($augmented[$i][$i]) < 1e-10) {
            return null;
        }
        
        for ($k = $i + 1; $k < $n; $k++) {
            $factor = $augmented[$k][$i] / $augmented[$i][$i];
            for ($j = $i; $j <= $n; $j++) {
                $augmented[$k][$j] -= $factor * $augmented[$i][$j];
            }
        }
    }
    
    $solucion = array_fill(0, $n, 0);
    for ($i = $n - 1; $i >= 0; $i--) {
        $solucion[$i] = $augmented[$i][$n];
        for ($j = $i + 1; $j < $n; $j++) {
            $solucion[$i] -= $augmented[$i][$j] * $solucion[$j];
        }
        $solucion[$i] /= $augmented[$i][$i];
    }
    
    return $solucion;
}

function calcularRegresionLinealFallback($datos_x, $datos_y) {
    $n = count($datos_x);
    $suma_x = array_sum($datos_x);
    $suma_y = array_sum($datos_y);
    $suma_xy = 0;
    $suma_x2 = 0;
    
    for ($i = 0; $i < $n; $i++) {
        $suma_xy += $datos_x[$i] * $datos_y[$i];
        $suma_x2 += $datos_x[$i] * $datos_x[$i];
    }
    
    $denominador = ($n * $suma_x2 - $suma_x * $suma_x);
    if ($denominador == 0) {
        return [
            'pendiente' => 0,
            'intercepto' => $suma_y / $n,
            'r_cuadrado' => 0,
            'error' => 'Datos X constantes'
        ];
    }
    
    $pendiente = ($n * $suma_xy - $suma_x * $suma_y) / $denominador;
    $intercepto = ($suma_y - $pendiente * $suma_x) / $n;
    
    $media_y = $suma_y / $n;
    $ss_tot = 0;
    $ss_res = 0;
    
    for ($i = 0; $i < $n; $i++) {
        $y_pred = $pendiente * $datos_x[$i] + $intercepto;
        $ss_tot += pow($datos_y[$i] - $media_y, 2);
        $ss_res += pow($datos_y[$i] - $y_pred, 2);
    }
    
    if ($ss_tot == 0) {
        $r_cuadrado = ($ss_res == 0) ? 1 : 0;
    } else {
        $r_cuadrado = 1 - ($ss_res / $ss_tot);
    }
    
    return [
        'pendiente' => $pendiente,
        'intercepto' => $intercepto,
        'r_cuadrado' => $r_cuadrado,
        'tipo' => 'lineal'
    ];
}

?>