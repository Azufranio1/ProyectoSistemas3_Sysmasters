<?php
function obtenerCategorias($conn) {
    $query = "SELECT CategoriaID, Categoria FROM Categoria ORDER BY Categoria";
    $result = $conn->query($query);
    return $result->fetch_all(MYSQLI_ASSOC);
}

// Funciones para generar reportes
function generarReporteProductos($conn, $fecha_inicio, $fecha_fin, $categoria_filtro) {
    $query = "SELECT p.ProductoID, p.Nombre, c.Categoria, 
                     CONCAT(col1.Color, COALESCE(CONCAT(' / ', col2.Color), '')) as Colores,
                     p.Stock, p.Disponible, p.PrecioVenta,
                     COALESCE(SUM(dr.Cantidad), 0) as TotalRentado
              FROM Producto p
              LEFT JOIN Categoria c ON p.CategoriaID = c.CategoriaID
              LEFT JOIN Color col1 ON p.ColorID1 = col1.ColorID
              LEFT JOIN Color col2 ON p.ColorID2 = col2.ColorID
              LEFT JOIN DetalleRenta dr ON p.ProductoID = dr.ProductoID
              LEFT JOIN Renta r ON dr.RentaID = r.RentaID
              WHERE p.Habilitado = 1";
    
    $params = [];
    $types = '';
    
    if ($fecha_inicio && $fecha_fin) {
        $query .= " AND (r.FechaRenta IS NULL OR r.FechaRenta BETWEEN ? AND ?)";
        $params[] = $fecha_inicio;
        $params[] = $fecha_fin;
        $types .= 'ss';
    }
    
    if ($categoria_filtro) {
        $query .= " AND p.CategoriaID = ?";
        $params[] = $categoria_filtro;
        $types .= 'i';
    }
    
    $query .= " GROUP BY p.ProductoID ORDER BY TotalRentado DESC";
    
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_all(MYSQLI_ASSOC);
}

function generarGraficoProductos($conn, $fecha_inicio, $fecha_fin, $categoria_filtro) {
    // Top 10 productos más rentados
    $query = "SELECT p.Nombre, COALESCE(SUM(dr.Cantidad), 0) as TotalRentado
              FROM Producto p
              LEFT JOIN DetalleRenta dr ON p.ProductoID = dr.ProductoID
              LEFT JOIN Renta r ON dr.RentaID = r.RentaID
              WHERE p.Habilitado = 1";
    
    $params = [];
    $types = '';
    
    if ($fecha_inicio && $fecha_fin) {
        $query .= " AND (r.FechaRenta IS NULL OR r.FechaRenta BETWEEN ? AND ?)";
        $params[] = $fecha_inicio;
        $params[] = $fecha_fin;
        $types .= 'ss';
    }
    
    if ($categoria_filtro) {
        $query .= " AND p.CategoriaID = ?";
        $params[] = $categoria_filtro;
        $types .= 'i';
    }
    
    $query .= " GROUP BY p.ProductoID, p.Nombre ORDER BY TotalRentado DESC LIMIT 10";
    
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_all(MYSQLI_ASSOC);
}

function generarReporteRentas($conn, $fecha_inicio, $fecha_fin) {
    $query = "SELECT r.RentaID, r.FechaRenta, r.FechaDevolucion, r.FechaDevuelto,
                     CONCAT(c.Nombre, ' ', c.Apellido) as Cliente,
                     CONCAT(e.Nombre, ' ', e.Apellido) as Empleado,
                     r.Total, r.Descuento, r.Multa,
                     GROUP_CONCAT(CONCAT(p.Nombre, ' (', dr.Cantidad, ')') SEPARATOR ', ') as Productos
              FROM Renta r
              LEFT JOIN Cliente c ON r.RentaID = c.RentaID
              LEFT JOIN Empleado e ON r.EmpleadoID = e.EmpleadoID
              LEFT JOIN DetalleRenta dr ON r.RentaID = dr.RentaID
              LEFT JOIN Producto p ON dr.ProductoID = p.ProductoID
              WHERE 1=1";
    
    $params = [];
    $types = '';
    
    if ($fecha_inicio && $fecha_fin) {
        $query .= " AND r.FechaRenta BETWEEN ? AND ?";
        $params[] = $fecha_inicio;
        $params[] = $fecha_fin;
        $types .= 'ss';
    }
    
    $query .= " GROUP BY r.RentaID ORDER BY r.FechaRenta DESC";
    
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_all(MYSQLI_ASSOC);
}

function generarGraficoRentas($conn, $fecha_inicio, $fecha_fin) {
    // Rentas por mes
    $query = "SELECT DATE_FORMAT(FechaRenta, '%Y-%m') as Mes, 
                     COUNT(*) as TotalRentas,
                     SUM(Total) as IngresoTotal
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
    
    $query .= " GROUP BY DATE_FORMAT(FechaRenta, '%Y-%m') ORDER BY Mes";
    
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_all(MYSQLI_ASSOC);
}

function generarReporteDevoluciones($conn, $fecha_inicio, $fecha_fin) {
    $query = "SELECT r.RentaID, r.FechaRenta, r.FechaDevolucion, r.FechaDevuelto,
                     CONCAT(c.Nombre, ' ', c.Apellido) as Cliente,
                     r.Total, r.Multa,
                     DATEDIFF(r.FechaDevuelto, r.FechaDevolucion) as DiasRetraso,
                     CASE 
                         WHEN r.FechaDevuelto IS NULL THEN 'Pendiente'
                         WHEN r.FechaDevuelto <= r.FechaDevolucion THEN 'A tiempo'
                         ELSE 'Tardía'
                     END as EstadoDevolucion
              FROM Renta r
              LEFT JOIN Cliente c ON r.RentaID = c.RentaID
              WHERE 1=1";
    
    $params = [];
    $types = '';
    
    if ($fecha_inicio && $fecha_fin) {
        $query .= " AND r.FechaRenta BETWEEN ? AND ?";
        $params[] = $fecha_inicio;
        $params[] = $fecha_fin;
        $types .= 'ss';
    }
    
    $query .= " AND (r.FechaDevuelto IS NOT NULL OR r.FechaDevolucion < CURDATE())
              ORDER BY r.FechaDevolucion DESC";
    
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_all(MYSQLI_ASSOC);
}

function generarGraficoDevoluciones($conn, $fecha_inicio, $fecha_fin) {
    // Estado de devoluciones
    $query = "SELECT 
                 CASE 
                     WHEN r.FechaDevuelto IS NULL THEN 'Pendiente'
                     WHEN r.FechaDevuelto <= r.FechaDevolucion THEN 'A tiempo'
                     ELSE 'Tardía'
                 END as EstadoDevolucion,
                 COUNT(*) as Cantidad
              FROM Renta r
              WHERE 1=1";
    
    $params = [];
    $types = '';
    
    if ($fecha_inicio && $fecha_fin) {
        $query .= " AND r.FechaRenta BETWEEN ? AND ?";
        $params[] = $fecha_inicio;
        $params[] = $fecha_fin;
        $types .= 'ss';
    }
    
    $query .= " AND (r.FechaDevuelto IS NOT NULL OR r.FechaDevolucion < CURDATE())
              GROUP BY EstadoDevolucion";
    
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_all(MYSQLI_ASSOC);
}

function generarReporteIngresos($conn, $fecha_inicio, $fecha_fin) {
    $query = "SELECT DATE(r.FechaRenta) as Fecha,
                     COUNT(r.RentaID) as TotalRentas,
                     SUM(r.Total) as IngresoTotal,
                     SUM(r.Descuento) as TotalDescuentos,
                     SUM(r.Multa) as TotalMultas,
                     (SUM(r.Total) + SUM(r.Multa)) as IngresoNeto
              FROM Renta r
              WHERE 1=1";
    
    $params = [];
    $types = '';
    
    if ($fecha_inicio && $fecha_fin) {
        $query .= " AND r.FechaRenta BETWEEN ? AND ?";
        $params[] = $fecha_inicio;
        $params[] = $fecha_fin;
        $types .= 'ss';
    }
    
    $query .= " GROUP BY DATE(r.FechaRenta) ORDER BY Fecha DESC";
    
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_all(MYSQLI_ASSOC);
}

function generarGraficoIngresos($conn, $fecha_inicio, $fecha_fin) {
    // Ingresos por día
    $query = "SELECT DATE(FechaRenta) as Fecha,
                     SUM(Total) as IngresoTotal,
                     SUM(Multa) as TotalMultas
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
    
    $query .= " GROUP BY DATE(FechaRenta) ORDER BY Fecha";
    
    $stmt = $conn->prepare($query);
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_all(MYSQLI_ASSOC);
}
?>