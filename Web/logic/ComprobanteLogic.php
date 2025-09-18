<?php
/**
 * ComprobanteLogic.php - Controller for rental receipt processing
 * 
 * This file handles the logic between the form processing and view display,
 * retrieving rental information either from POST data or from the database.
 */

// Include necessary files
include_once("../includes/Connection.php");
include_once("../utils/Comprobante.php");
$conexion = Connection();

$rentaID = generarIdRenta($conexion);
$detallesProductos = [];
$detallesClientes = [];
$detallesGarantias = [];
$fechaRenta = '';
$fechaDev = '';
$descuento = 0;
$total = 0;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    try {
        
        if (isset($_POST['fecha_renta']) && isset($_POST['fecha_dev']) && isset($_POST['total'])) {
            $fechaRenta = $_POST['fecha_renta'];
            $fechaDev = $_POST['fecha_dev'];
            $total = $_POST['total'];
            $descuento = $rentaData['descuento'];
            
            // Fetch related data from database
            $detallesProductos = obtenerDetallesProductos($conexion, $rentaID);
            $detallesClientes = obtenerDetallesClientes($conexion, $rentaID);
            $detallesGarantias = obtenerDetallesGarantias($conexion, $rentaID);
        } else {
            // If not all POST data is available, try to get it from the database
            $rentaData = obtenerDetallesRenta($conexion, $rentaID);
            
            if ($rentaData) {
                $fechaRenta = $rentaData['FechaRenta'];
                $fechaDev = $rentaData['FechaDevolucion'];
                $total = $rentaData['Total'];
                $descuento = $rentaData['Descuento'];
                
                $detallesProductos = obtenerDetallesProductos($conexion, $rentaID);
                $detallesClientes = obtenerDetallesClientes($conexion, $rentaID);
                $detallesGarantias = obtenerDetallesGarantias($conexion, $rentaID);
            } else {
                throw new Exception("No se encontró la renta en la base de datos");
            }
        }
    } catch (Exception $e) {
        $error = "Error al procesar la renta: " . $e->getMessage();
    } finally {
        $conexion->close();
    }
} else if (isset($_GET['id'])) {
    // Direct access to view an existing rental
    $rentaID = $_GET['id'];
    $conexion = Connection();
    
    try {
        // Get rental details
        $rentaData = obtenerDetallesRenta($conexion, $rentaID);
        
        if ($rentaData) {
            // Retrieve rental data
            $fechaRenta = $rentaData['FechaRenta'];
            $fechaDev = $rentaData['FechaDevolucion'];
            $descuento = $rentaData['Descuento'];
            $total = $rentaData['Total'];
            
            // Get related details
            $detallesProductos = obtenerDetallesProductos($conexion, $rentaID);
            $detallesClientes = obtenerDetallesClientes($conexion, $rentaID);
            $detallesGarantias = obtenerDetallesGarantias($conexion, $rentaID);
        } else {
            $error = "No se encontró la renta con ID: " . $rentaID;
        }
    } catch (Exception $e) {
        $error = "Error al recuperar datos: " . $e->getMessage();
    } finally {
        $conexion->close();
    }
} else {
    // If there's no POST data or ID in the URL, redirect to the rental form
    header("Location: ../Components/Renta.php");
    exit();
}

// Debug function - uncomment if needed for troubleshooting
/*
function debug_to_file($data) {
    $file = fopen("../debug_log.txt", "a");
    fwrite($file, date('Y-m-d H:i:s') . " - " . print_r($data, true) . "\n\n");
    fclose($file);
}
*/
?>