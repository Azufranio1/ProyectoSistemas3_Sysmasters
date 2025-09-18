<?php
switch ($tipoElemento) {
    case 'productos':
        mostrarElementosInhabilitados(
            $con,
            'Producto 
                LEFT JOIN Color AS Col1 ON Producto.ColorID1 = Col1.ColorID 
                LEFT JOIN Color AS Col2 ON Producto.ColorID2 = Col2.ColorID 
                JOIN Categoria AS Cat ON Producto.CategoriaID = Cat.CategoriaID',
            'ProductoID',
            ['Cat.Categoria AS Categoria', 'Col1.Color AS Color1', 'Col2.Color AS Color2', 'PrecioUnitario', 'Stock', 'Descripcion'],
            'PRD'
        );
        break;

    case 'proveedores':
        mostrarElementosInhabilitados($con, 'Proveedor', 'ProveedorID',
            ['Nombre', 'NombreContacto', 'ApellidoContacto', 'Telefono'], 'PRV');
        break;

    case 'empleados':
        mostrarElementosInhabilitados($con, 'Empleado', 'EmpleadoID',
            ['Nombre', 'Apellido', 'CI', 'FechaContrato', 'Salario'], 'EMP');
        break;

    case 'clientes':
        mostrarElementosInhabilitados($con, 'Cliente', 'ClienteID',
            ['Nombre', 'Apellido', 'Telefono', 'Email'], 'CLI');
        break;

    case 'garantias':
        mostrarElementosInhabilitados($con, 'Garantia', 'GarantiaID',
            ['Tipo', 'Descripcion'], 'GNT');
        break;

    default:
        echo "<tr><td colspan='5' class='subtitulo'>Productos</td></tr>";
        mostrarElementosInhabilitados(
            $con,
            'Producto 
                LEFT JOIN Color AS Col1 ON Producto.ColorID1 = Col1.ColorID 
                LEFT JOIN Color AS Col2 ON Producto.ColorID2 = Col2.ColorID 
                JOIN Categoria AS Cat ON Producto.CategoriaID = Cat.CategoriaID',
            'ProductoID',
            ['Producto.ProductoID', 'Cat.Categoria AS Categoria', 'Col1.Color AS Color1', 'Col2.Color AS Color2', 'PrecioUnitario', 'Stock'],
            'PRD'
        );

        echo "<tr><td colspan='5' class='subtitulo'>Proveedores</td></tr>";
        mostrarElementosInhabilitados($con, 'Proveedor', 'ProveedorID',
            ['ProveedorID', 'Nombre', 'NombreContacto', 'Telefono'], 'PRV');

        echo "<tr><td colspan='5' class='subtitulo'>Empleados</td></tr>";
        mostrarElementosInhabilitados($con, 'Empleado', 'EmpleadoID',
            ['EmpleadoID', 'Nombre', 'Apellido', 'CI', 'FechaContrato'], 'EMP');

        echo "<tr><td colspan='5' class='subtitulo'>Clientes</td></tr>";
        mostrarElementosInhabilitados($con, 'Cliente', 'ClienteID',
            ['ClienteID', 'Nombre', 'Apellido', 'Telefono', 'Email'], 'CLI');
        break;
}

$con->close();
?>
