<?php

include('../includes/Connection.php');
// Fecha actual y un mes atrás
$conn = Connection();
$hoy = date('Y-m-d');
$mesAtras = date('Y-m-d', strtotime('-2 month'));

// 1. Ganancias mensuales (sumar Total donde FechaDevuelto no es null y FechaRenta entre hace un mes y hoy)
$sqlGanancias = "SELECT SUM(Total) AS gananciasMensuales 
                 FROM Renta 
                 WHERE FechaDevuelto IS NOT NULL 
                   AND FechaRenta BETWEEN ? AND ?";
$stmt = $conn->prepare($sqlGanancias);
$stmt->bind_param("ss", $mesAtras, $hoy);
$stmt->execute();
$result = $stmt->get_result();
$gananciasMensuales = $result->fetch_assoc()['gananciasMensuales'] ?? 0;

// 2. Prendas rentadas este mes (sumar Cantidad de DetalleRenta donde Renta.FechaRenta entre hace un mes y hoy)
$sqlPrendas = "SELECT SUM(DR.Cantidad) AS prendasMensuales
               FROM DetalleRenta DR
               JOIN Renta R ON DR.RentaID = R.RentaID
               WHERE R.FechaRenta BETWEEN ? AND ?";
$stmt = $conn->prepare($sqlPrendas);
$stmt->bind_param("ss", $mesAtras, $hoy);
$stmt->execute();
$result = $stmt->get_result();
$prendasMensuales = $result->fetch_assoc()['prendasMensuales'] ?? 0;

// 3. Rentas activas aún vigentes (FechaDevuelto es null y FechaDevolucion > hoy)
$sqlActivas = "SELECT COUNT(rentaid) AS rentasActivas
        FROM Renta r
        WHERE r.FechaDevolucion >= ?
        AND EXISTS (
            SELECT 1 FROM Cliente c WHERE c.RentaID = r.RentaID
        )
        AND r.FechaDevuelto is null
        ORDER BY r.FechaDevolucion ASC";
$stmt = $conn->prepare($sqlActivas);
$stmt->bind_param("s", $hoy);
$stmt->execute();
$result = $stmt->get_result();
$rentasActivas = $result->fetch_assoc()['rentasActivas'] ?? 0;

// 4. Rentas atrasadas (FechaDevuelto es null y FechaDevolucion < hoy)
$sqlAtrasadas = "SELECT COUNT(*) AS rentasAtrasadas
                 FROM Renta
                 WHERE FechaDevuelto IS NULL AND FechaDevolucion < ?";
$stmt = $conn->prepare($sqlAtrasadas);
$stmt->bind_param("s", $hoy);
$stmt->execute();
$result = $stmt->get_result();
$rentasAtrasadas = $result->fetch_assoc()['rentasAtrasadas'] ?? 0;

// 5. Prendas más rentadas (TOP 5 productos con mayor demanda)
$sqlPrendasPopulares = "SELECT 
                            P.Nombre,
                            C1.Color as ColorPrimario,
                            C2.Color as ColorSecundario,
                            Cat.Categoria,
                            SUM(DR.Cantidad) as TotalRentado,
                            COUNT(DR.RentaID) as VecesRentado
                        FROM DetalleRenta DR
                        JOIN Producto P ON DR.ProductoID = P.ProductoID
                        JOIN Categoria Cat ON P.CategoriaID = Cat.CategoriaID
                        LEFT JOIN Color C1 ON P.ColorID1 = C1.ColorID
                        LEFT JOIN Color C2 ON P.ColorID2 = C2.ColorID
                        JOIN Renta R ON DR.RentaID = R.RentaID
                        WHERE R.FechaRenta BETWEEN ? AND ?
                          AND DR.Habilitado = 1
                          AND P.Habilitado = 1
                        GROUP BY P.ProductoID, P.Nombre, C1.Color, C2.Color, Cat.Categoria
                        ORDER BY TotalRentado DESC, VecesRentado DESC
                        LIMIT 5";
$stmt = $conn->prepare($sqlPrendasPopulares);
$stmt->bind_param("ss", $mesAtras, $hoy);
$stmt->execute();
$result = $stmt->get_result();
$prendasPopulares = [];
while ($row = $result->fetch_assoc()) {
    $prendasPopulares[] = $row;
}

// 6. Lista de todos los productos con stock y disponibilidad
$sqlProductos = "SELECT 
                    P.ProductoID,
                    P.Nombre,
                    C1.Color as ColorPrimario,
                    C2.Color as ColorSecundario,
                    Cat.Categoria,
                    P.Stock,
                    P.Disponible,
                    P.PrecioUnitario,
                    COALESCE(
                        (SELECT SUM(DR.Cantidad) 
                         FROM DetalleRenta DR 
                         JOIN Renta R ON DR.RentaID = R.RentaID 
                         WHERE DR.ProductoID = P.ProductoID 
                         AND R.FechaDevuelto IS NULL
                         AND DR.Habilitado = 1), 0
                    ) as CantidadRentada,
                    (P.Stock - COALESCE(
                        (SELECT SUM(DR.Cantidad) 
                         FROM DetalleRenta DR 
                         JOIN Renta R ON DR.RentaID = R.RentaID 
                         WHERE DR.ProductoID = P.ProductoID 
                         AND R.FechaDevuelto IS NULL
                         AND DR.Habilitado = 1), 0
                    )) as StockDisponible
                 FROM Producto P
                 JOIN Categoria Cat ON P.CategoriaID = Cat.CategoriaID
                 LEFT JOIN Color C1 ON P.ColorID1 = C1.ColorID
                 LEFT JOIN Color C2 ON P.ColorID2 = C2.ColorID
                 WHERE P.Habilitado = 1
                 ORDER BY P.Nombre ASC, C1.Color ASC";
$result = $conn->query($sqlProductos);
$productosInventario = [];
while ($row = $result->fetch_assoc()) {
    $productosInventario[] = $row;
}

// 7. Datos para el gráfico de tendencias (últimos 6 meses)
$sqlTendencias = "SELECT 
                    DATE_FORMAT(R.FechaRenta, '%Y-%m') as Mes,
                    DATE_FORMAT(R.FechaRenta, '%b') as MesNombre,
                    COUNT(DISTINCT R.RentaID) as TotalRentas,
                    SUM(DR.Cantidad) as TotalPrendas,
                    SUM(R.Total) as TotalIngresos
                  FROM Renta R
                  JOIN DetalleRenta DR ON R.RentaID = DR.RentaID
                  WHERE R.FechaRenta >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
                    AND DR.Habilitado = 1
                  GROUP BY DATE_FORMAT(R.FechaRenta, '%Y-%m')
                  ORDER BY Mes ASC";
$result = $conn->query($sqlTendencias);
$tendencias = [];
while ($row = $result->fetch_assoc()) {
    $tendencias[] = $row;
}

// 8. Estadísticas por categoría (para el gráfico circular)
$sqlCategorias = "SELECT 
                    Cat.Categoria,
                    SUM(DR.Cantidad) as TotalRentado,
                    COUNT(DISTINCT DR.RentaID) as TotalRentas
                  FROM DetalleRenta DR
                  JOIN Producto P ON DR.ProductoID = P.ProductoID
                  JOIN Categoria Cat ON P.CategoriaID = Cat.CategoriaID
                  JOIN Renta R ON DR.RentaID = R.RentaID
                  WHERE R.FechaRenta BETWEEN ? AND ?
                    AND DR.Habilitado = 1
                    AND P.Habilitado = 1
                  GROUP BY Cat.CategoriaID, Cat.Categoria
                  ORDER BY TotalRentado DESC";
$stmt = $conn->prepare($sqlCategorias);
$stmt->bind_param("ss", $mesAtras, $hoy);
$stmt->execute();
$result = $stmt->get_result();
$categoriaStats = [];
while ($row = $result->fetch_assoc()) {
    $categoriaStats[] = $row;
}

// Las variables que puedes usar en el dashboard:
/// $gananciasMensuales
/// $prendasMensuales
/// $rentasActivas
/// $rentasAtrasadas
/// $prendasPopulares (array de las 5 prendas más rentadas)
/// $productosInventario (array de todos los productos con stock)
/// $tendencias (array para el gráfico de tendencias)
/// $categoriaStats (array para estadísticas por categoría)

// Cerrar conexión
$conn->close();
?>