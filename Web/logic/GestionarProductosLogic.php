<?php
include('../includes/Connection.php');

$connection = connection();

function eliminarProducto($productoID) {
    $con = connection();
    $stmt = $con->prepare("UPDATE Producto SET Habilitado = 0 WHERE ProductoID = ?");
    $stmt->bind_param("s", $productoID);
    $stmt->execute();
    $stmt->close();
    $con->close();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST["eliminarProducto"])) {
        eliminarProducto($_POST["eliminarProducto"]);
        header("Location: ../views/ManagerDB.php");
        exit;
    }
}

$resultado = $connection->query("
    SELECT p.Nombre, p.ProductoID, c.Categoria, p.Disponible,
       col1.Color AS Color1, col2.Color AS Color2,
       p.PrecioUnitario, p.PrecioVenta, p.Stock,
       IFNULL(dr.conteo, 0) AS VecesRentado
FROM Producto p
JOIN Categoria c ON p.CategoriaID = c.CategoriaID
LEFT JOIN Color col1 ON p.ColorID1 = col1.ColorID
LEFT JOIN Color col2 ON p.ColorID2 = col2.ColorID
LEFT JOIN (
    SELECT ProductoID, COUNT(*) AS conteo
    FROM DetalleRenta
    WHERE Habilitado = 1
    GROUP BY ProductoID
) dr ON p.ProductoID = dr.ProductoID
WHERE p.Habilitado = 1
");

if ($resultado && $resultado->num_rows > 0) {
    while ($producto = $resultado->fetch_assoc()) {
        $colores = '-';
        if (!empty($producto['Color1']) && !empty($producto['Color2'])) {
            $colores = "{$producto['Color1']} / {$producto['Color2']}";
        } elseif (!empty($producto['Color1'])) {
            $colores = $producto['Color1'];
        } elseif (!empty($producto['Color2'])) {
            $colores = $producto['Color2'];
        }

        echo "<tr>
            <td>{$producto['Nombre']}</td>
            <td>{$producto['Categoria']}</td>
            <td>{$colores}</td>
            <td>{$producto['PrecioUnitario']}</td>
            <td>{$producto['PrecioVenta']}</td>
            <td>{$producto['Stock']}</td>
            <td>{$producto['Disponible']}</td>
            <td>
            <div class='action-buttons'>
            
            <form action='../views/VerMas.php' method='POST' style='display:inline;'>
            <input type='hidden' name='IDCosa' value='{$producto['ProductoID']}'>
                        <button type='submit' class='action-btn verMas-btn' title='Ver más'>
                            <i class='bi bi-plus-square'></i>
                        </button>
                    </form>

                    <form action='../views/Editar.php' method='POST' style='display:inline;'>
                        <input type='hidden' name='IdCosa' value='{$producto['ProductoID']}'>
                        <button type='submit' class='action-btn edit-btn' title='Editar'>
                            <i class='bi bi-pencil-square'></i>
                        </button>
                    </form>";
                    if($producto['VecesRentado'] == 0){
                        echo "<form method='POST' action='../logic/GestionarProductosLogic.php'>
                        <input type='hidden' name='eliminarProducto' value='{$producto['ProductoID']}'>
                        <button type='submit' class='action-btn delete-btn' title='Eliminar'
                            onclick=\"return confirm('¿Seguro que deseas enviar este producto a la papelera?')\">
                            <i class='bi bi-trash-fill'></i>
                        </button>
                    </form>";
                    }
                    echo
                    

                "</div>
            </td>
        </tr>";
    }
} else {
    echo "<tr><td colspan='5' class='text-center py-4'>No hay productos registrados</td></tr>";
}

$connection->close();
?>
