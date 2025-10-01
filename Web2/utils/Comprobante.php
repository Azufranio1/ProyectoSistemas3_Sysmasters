<?php
/**
 * Comprobante.php - Utility functions for rental receipts
 * 
 * This file contains utility functions for generating and formatting
 * rental receipt information.
 */

/**
 * Genera un ID único para una nueva renta
 * 
 * @param mysqli $conexion Conexión a la base de datos
 * @return string ID de renta generado
 */

function obtenerIdRenta($conexion) {
    $sql = "SELECT idRenta FROM Renta ORDER BY idRenta DESC LIMIT 1";
    $resultado = mysqli_query($conexion, $sql);

    if ($resultado && mysqli_num_rows($resultado) > 0) {
        $fila = mysqli_fetch_assoc($resultado);
        return $fila['idRenta'];
    }
}

function generarIdRenta($conexion) {
    // Formato: R-YYYYMMDD-XXXX (donde XXXX es un número secuencial)
    $fecha = date('Ymd');
    $prefijo = "R-" . $fecha . "-";
    
    // Buscar el último ID con este prefijo
    $sql = "SELECT RentaID FROM Renta WHERE RentaID LIKE ? ORDER BY RentaID DESC LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $busqueda = $prefijo . "%";
    $stmt->bind_param("s", $busqueda);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $ultimoID = $row['RentaID'];
        $partes = explode("-", $ultimoID);
        $numero = intval($partes[2]) + 1;
    } else {
        $numero = 1;
    }
    
    // Formatear el número con ceros a la izquierda
    $numeroFormateado = str_pad($numero, 4, "0", STR_PAD_LEFT);
    return $prefijo . $numeroFormateado;
}

/**
 * Genera un ID único para un nuevo cliente
 * 
 * @param mysqli $conexion Conexión a la base de datos
 * @return string ID de cliente generado
 */
function generarIdCliente($conexion) {
    // Formato: C-YYMMDD-XXXX
    $fecha = date('ymd');
    $prefijo = "C-" . $fecha . "-";
    
    // Buscar el último ID con este prefijo
    $sql = "SELECT ClienteID FROM Cliente WHERE ClienteID LIKE ? ORDER BY ClienteID DESC LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $busqueda = $prefijo . "%";
    $stmt->bind_param("s", $busqueda);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $ultimoID = $row['ClienteID'];
        $partes = explode("-", $ultimoID);
        $numero = intval($partes[2]) + 1;
    } else {
        $numero = 1;
    }
    
    // Formatear el número con ceros a la izquierda
    $numeroFormateado = str_pad($numero, 4, "0", STR_PAD_LEFT);
    return $prefijo . $numeroFormateado;
}

/**
 * Calcula el número de días entre dos fechas
 * 
 * @param string $fechaInicio Fecha de inicio (YYYY-MM-DD)
 * @param string $fechaFin Fecha de fin (YYYY-MM-DD)
 * @return int Número de días entre las fechas
 */
function calcularDiasRenta($fechaInicio, $fechaFin) {
    $inicio = new DateTime($fechaInicio);
    $fin = new DateTime($fechaFin);
    $intervalo = $inicio->diff($fin);
    return $intervalo->days;
}

/**
 * Formatea una fecha para mostrar en el comprobante
 * 
 * @param string $fecha Fecha en formato YYYY-MM-DD
 * @return string Fecha formateada (DD/MM/YYYY)
 */
function formatearFecha($fecha) {
    return date('d/m/Y', strtotime($fecha));
}

/**
 * Obtiene los detalles completos de una renta existente
 * 
 * @param mysqli $conexion Conexión a la base de datos
 * @param string $rentaID ID de la renta a buscar
 * @return array|null Datos de la renta o null si no existe
 */
function obtenerDetallesRenta($conexion, $rentaID) {
    $stmt = $conexion->prepare("SELECT RentaID, EmpleadoID, FechaRenta, FechaDevolucion, Descuento, Total FROM Renta WHERE RentaID = ?");
    $stmt->bind_param("s", $rentaID);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        return $result->fetch_assoc();
    }
    
    return null;
}

/**
 * Obtiene los productos incluidos en una renta
 * 
 * @param mysqli $conexion Conexión a la base de datos
 * @param string $rentaID ID de la renta
 * @return array Lista de productos con sus detalles
 */
function obtenerDetallesProductos($conexion, $rentaID) {
    $productos = [];
    
    $sql = "SELECT dr.ProductoID, dr.Cantidad, dr.Subtotal, 
            p.Nombre, p.PrecioUnitario, 
            c.Categoria, 
            col1.Color AS ColorPrincipal, 
            col2.Color AS ColorSecundario 
            FROM DetalleRenta dr 
            JOIN Producto p ON dr.ProductoID = p.ProductoID 
            JOIN Categoria c ON p.CategoriaID = c.CategoriaID 
            LEFT JOIN Color col1 ON p.ColorID1 = col1.ColorID 
            LEFT JOIN Color col2 ON p.ColorID2 = col2.ColorID 
            WHERE dr.RentaID = ?";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $rentaID);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $colorDisplay = $row['ColorPrincipal'];
        if (!empty($row['ColorSecundario'])) {
            $colorDisplay .= ' con ' . $row['ColorSecundario'];
        }
        
        $productos[] = [
            'ProductoID' => $row['ProductoID'],
            'Nombre' => $row['Nombre'],
            'Color' => $colorDisplay,
            'Categoria' => $row['Categoria'],
            'PrecioUnitario' => $row['PrecioUnitario'],
            'Cantidad' => $row['Cantidad'],
            'Subtotal' => $row['Subtotal']
        ];
    }
    
    return $productos;
}

/**
 * Obtiene los clientes asociados a una renta
 * 
 * @param mysqli $conexion Conexión a la base de datos
 * @param string $rentaID ID de la renta
 * @return array Lista de clientes con sus detalles
 */
function obtenerDetallesClientes($conexion, $rentaID) {
    $clientes = [];
    
    $sql = "SELECT ClienteID, Nombre, Apellido, Telefono, Garantia FROM Cliente WHERE RentaID = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $rentaID);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $clientes[] = [
            'ClienteID' => $row['ClienteID'],
            'Nombre' => $row['Nombre'],
            'Apellido' => $row['Apellido'],
            'Telefono' => $row['Telefono'],
            'Garantia' => $row['Garantia']
        ];
    }
    
    return $clientes;
}

/**
 * Obtiene las garantías asociadas a una renta
 * 
 * @param mysqli $conexion Conexión a la base de datos
 * @param string $rentaID ID de la renta
 * @return array Lista de garantías con sus detalles
 */
function obtenerDetallesGarantias($conexion, $rentaID) {
    $garantias = [];
    
    $sql = "SELECT g.Tipo, g.ClienteID, c.Nombre, c.Apellido 
            FROM Garantia g 
            JOIN Cliente c ON g.ClienteID = c.ClienteID 
            WHERE g.RentaID = ?";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $rentaID);
    $stmt->execute();
    $result = $stmt->get_result();
    
    while ($row = $result->fetch_assoc()) {
        $garantias[] = [
            'Tipo' => $row['Tipo'],
            'ClienteID' => $row['ClienteID'],
            'NombreCliente' => $row['Nombre'] . ' ' . $row['Apellido']
        ];
    }
    
    return $garantias;
}
?>