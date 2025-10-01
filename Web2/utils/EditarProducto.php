8
<?php
session_start();
include('../includes/Connection.php');
$con = connection();

include('../includes/VerifySession.php');

function obtenerCategorias() {
    $con = connection();
    $query = "SELECT DISTINCT Categoria FROM Producto ORDER BY Categoria";
    $result = $con->query($query);
    
    $categorias = [];
    while ($row = $result->fetch_assoc()) {
        $categorias[] = $row['Categoria'];
    }
    
    return $categorias;
}

function obtenerColores() {
    $con = connection();
    $query = "SELECT DISTINCT Color FROM Producto ORDER BY Color";
    $result = $con->query($query);
    
    $colores = [];
    while ($row = $result->fetch_assoc()) {
        $colores[] = $row['Color'];
    }
    
    return $colores;
}

function obtenerProducto($productoID) {
    $con = connection();
    $stmt = $con->prepare("SELECT ProductoID, Categoria, Color, PrecioUnitario, Descripcion FROM Producto WHERE ProductoID = ? and habilitado = 1");
    $stmt->bind_param("s", $productoID);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return null;
    }
    
    $producto = $result->fetch_assoc();
    $stmt->close();
    return $producto;
}

function actualizarProducto($productoID, $categoria, $color, $precioUnitario, $descripcion) {
    $con = connection();
    $stmt = $con->prepare("UPDATE Producto SET Categoria = ?, Color = ?, PrecioUnitario = ?, Descripcion = ? WHERE ProductoID = ? and habilitado = 1");
    $stmt->bind_param("ssdss", $categoria, $color, $precioUnitario, $descripcion, $productoID);
    $success = $stmt->execute();
    $stmt->close();
    return $success;
}

$categorias = obtenerCategorias();
$colores = obtenerColores();
$producto = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['productoID'])) {
    $productoID = filter_input(INPUT_POST, 'productoID', FILTER_SANITIZE_STRING);
    
    if (isset($_POST['categoria'])) {
        $categoria = filter_input(INPUT_POST, 'categoria', FILTER_SANITIZE_STRING) ?? '';
        $color = filter_input(INPUT_POST, 'color', FILTER_SANITIZE_STRING) ?? '';
        $precioUnitario = filter_input(INPUT_POST, 'precioUnitario', FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION) ?? 0;
        $descripcion = filter_input(INPUT_POST, 'descripcion', FILTER_SANITIZE_STRING) ?? '';
        
        if ($categoria === 'nueva_categoria') {
            $nuevaCategoria = filter_input(INPUT_POST, 'nueva_categoria', FILTER_SANITIZE_STRING) ?? '';
            if (!empty($nuevaCategoria)) {
                $categoria = $nuevaCategoria;
            } else {
                header("Location: EditarProducto.php?error=" . urlencode('Debe ingresar el nombre de la nueva categoría'));
                exit();
            }
        }
        
        if ($color === 'nuevo_color') {
            $nuevoColor = filter_input(INPUT_POST, 'nuevo_color', FILTER_SANITIZE_STRING) ?? '';
            if (!empty($nuevoColor)) {
                $color = $nuevoColor;
            } else {
                header("Location: EditarProducto.php?error=" . urlencode('Debe ingresar el nombre del nuevo color'));
                exit();
            }
        }

        if (empty($categoria) || empty($color) || empty($precioUnitario)) {
            header("Location: EditarProducto.php?error=" . urlencode('Todos los campos marcados son obligatorios'));
            exit();
        }

        if (!preg_match('/^[0-9]+(\.[0-9]{1,2})?$/', $precioUnitario) || $precioUnitario <= 0) {
            header("Location: EditarProducto.php?error=" . urlencode('El precio debe ser un número positivo con hasta 2 decimales'));
            exit();
        }

        $actualizacionExitosa = actualizarProducto($productoID, $categoria, $color, $precioUnitario, $descripcion);
        
        if ($actualizacionExitosa) {
            header("Location: ../views/ManagerDB.php");
            exit();
        } else {
            header("Location: EditarProducto.php?error=" . urlencode('Error al actualizar el producto'));
            exit();
        }
    } else {
        $producto = obtenerProducto($productoID);
        
        if (!$producto) {
            header("Location: ListaProductos.php?error=" . urlencode('Producto no encontrado'));
            exit();
        }
    }
} else {
    header("Location: ManagerDB.php");
    exit();
}

$con->close();
?>