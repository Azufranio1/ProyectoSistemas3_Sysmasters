<?php
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["IDCosa"])) {
    include("../includes/Connection.php");
    include("../includes/VerifySession.php");
    $con = connection();

    $id = $_POST["IDCosa"];
    $prefix = strtoupper(substr($id, 0, 3));

    $tablasConfiguradas = [
        'PRD' => [
            'from' => 'Producto 
                     LEFT JOIN Color AS Col1 ON Producto.ColorID1 = Col1.ColorID 
                     LEFT JOIN Color AS Col2 ON Producto.ColorID2 = Col2.ColorID 
                     JOIN Categoria AS Cat ON Producto.CategoriaID = Cat.CategoriaID',
            'select' => 'Cat.Categoria AS Categoria, Col1.Color AS Color1, Col2.Color AS Color2, 
                         Producto.PrecioUnitario, Producto.PrecioVenta, Producto.Stock',
            'id_col' => 'ProductoID',
            'campos' => [
                'Categoria' => 'Categoría',
                'Color1' => 'Color Principal',
                'Color2' => 'Color Secundario',
                'PrecioUnitario' => 'Precio Unitario',
                'PrecioVenta' => 'Precio Venta',
                'Stock' => 'Stock'
            ]
        ],
        'EMP' => [
            'from' => 'Empleado JOIN UsuarioEmp ON Empleado.EmpleadoID = UsuarioEmp.EmpleadoID',
            'select' => 'CI, Nombre, Apellido, FechaContrato, FechaNacimiento, Usuario, Correo, Activo',
            'id_col' => 'Empleado.EmpleadoID',
        ],
        'MGR' => [
            'from' => 'Empleado JOIN UsuarioEmp ON Empleado.EmpleadoID = UsuarioEmp.EmpleadoID',
            'select' => '*',
            'id_col' => 'Empleado.EmpleadoID',
        ],
        'CTM' => [
            'from' => 'Cliente',
            'select' => '*',
            'id_col' => 'ClienteID',
        ],
        'PRV' => [
            'from' => 'Proveedor',
            'select' => '*',
            'id_col' => 'ProveedorID',
        ],
        'GNT' => [
            'from' => 'Garantia',
            'select' => '*',
            'id_col' => 'GarantiaID',
        ],
    ];

    if (array_key_exists($prefix, $tablasConfiguradas)) {
        $config = $tablasConfiguradas[$prefix];
        $from = $config['from'];
        $select = $config['select'];
        $id_col = $config['id_col'];

        $stmt = $con->prepare("SELECT $select FROM $from WHERE $id_col = ?");
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();

        if ($resultado->num_rows > 0) {
            $datos = $resultado->fetch_assoc();

            $titulo = match ($prefix) {
                'PRD' => 'Producto',
                'PRV' => 'Proveedor',
                'CTM' => 'Cliente',
                'GNT' => 'Garantía',
                default => 'Empleado'
            };
            echo "<h2>Detalles de $titulo</h2><ul>";

            if ($prefix === 'PRD') {
                $categoria = $datos['Categoria'];
                $color1 = $datos['Color1'];
                $color2 = $datos['Color2'];
                $precioUnitario = $datos['PrecioUnitario'];
                $precioVenta = $datos['PrecioVenta'];
                $stock = $datos['Stock'];

                if ($color1 && $color2 && $color1 !== $color2) {
                    $colores = "$color1 con $color2";
                } elseif ($color1 || $color2) {
                    $colores = $color1 ?: $color2;
                } else {
                    $colores = "-";
                }

                 echo "<li><strong>Categoría:</strong> $categoria</li>";
                echo "<li><strong>Color(es):</strong> " . ($colores ?: "-") . "</li>";
                echo "<li><strong>Precio Unitario:</strong> $precioUnitario</li>";
                echo "<li><strong>Precio Venta:</strong> $precioVenta</li>";
                echo "<li><strong>Stock:</strong> $stock</li>";
                       } else {
                foreach ($datos as $campo => $valor) {
                    if (($prefix === 'EMP' || $prefix === 'MGR') && $campo === 'Activo') {
                        $valor = ($valor == 1) ? 'Activo' : 'Inactivo';
                    }
                    echo "<li><strong>$campo:</strong> " . htmlspecialchars($valor) . "</li>";
                }
            }

            echo "</ul>";
        } else {
            echo "<p style='color: red; text-align: center;'>Registro no encontrado.</p>";
        }

        $stmt->close();
        $con->close();
    } else {
        echo "<p style='color: red; text-align: center;'>Prefijo de ID no reconocido.</p>";
    }
} else {
    echo "<p style='color: red; text-align: center;'>Acceso no válido.</p>";
}
?>
