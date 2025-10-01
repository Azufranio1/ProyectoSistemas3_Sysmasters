<?php
include("../includes/Connection.php");
include("../includes/VerifySession.php");

$conexion = Connection();

$productos = [];
$clientes = [];

$sql_productos = "SELECT p.ProductoID, p.Nombre, p.PrecioUnitario, c.Categoria AS Categoria,
col1.Color AS Color1, col2.Color AS Color2, Stock, Disponible
FROM Producto p
JOIN Categoria c ON p.CategoriaID = c.CategoriaID
LEFT JOIN Color col1 ON p.ColorID1 = col1.ColorID
LEFT JOIN Color col2 ON p.ColorID2 = col2.ColorID
WHERE p.Habilitado = 1";
$result_productos = $conexion->query($sql_productos);

while ($row = $result_productos->fetch_assoc()) {
    $productos[] = $row;
}

$sql_clientes = "SELECT Nombre, Apellido FROM Cliente WHERE Habilitado = 1";
$result_clientes = $conexion->query($sql_clientes);

while ($row = $result_clientes->fetch_assoc()) {
    $clientes[] = $row;
}

date_default_timezone_set('America/La_Paz');
$fechaActual = date('Y-m-d');
?>