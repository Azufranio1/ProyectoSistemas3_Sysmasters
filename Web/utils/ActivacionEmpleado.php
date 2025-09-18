<?php
session_start();
include('../includes/Connection.php');

if (!isset($_SESSION['idUser']) || !isset($_SESSION['username'])) {
    header('Location: ../index.php');
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['empleadoID'])) {
    $empleadoID = $_POST['empleadoID'];

    if (empty($empleadoID)) {
        echo "<script>alert('ID de empleado no válido'); window.history.back();</script>";
        exit();
    }

    try {
        $con = connection();

        $stmt = $con->prepare("SELECT Activo FROM Empleado WHERE EmpleadoID = ?");
        $stmt->bind_param("s", $empleadoID);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $row = $result->fetch_assoc();
            $estadoActual = (int)$row['Activo'];
            $nuevoEstado = $estadoActual === 1 ? 0 : 1;

            $update = $con->prepare("UPDATE Empleado SET Activo = ? WHERE EmpleadoID = ?");
            $update->bind_param("is", $nuevoEstado, $empleadoID);
            $update->execute();

            $accion = ($nuevoEstado === 1) ? 'Cuenta activada' : 'Cuenta desactivada';
            $adminID = $_SESSION['idUser'];

            /*$log = $con->prepare("INSERT INTO LogSeguridad (empleadoID, accion, fecha, adminID) VALUES (?, ?, NOW(), ?)");
            $log->bind_param("sss", $empleadoID, $accion, $adminID);
            $log->execute();*/

            echo "<script>window.location.href='../views/ManagerDB.php';</script>";

            $log->close();
            $update->close();
        } else {
            echo "<script>alert('Empleado no encontrado'); window.history.back();</script>";
        }

        $stmt->close();
        $con->close();

    } catch (Exception $e) {
        echo "<script>";
        echo "alert(" . json_encode("Error: " . $e->getMessage()) . ");";
        echo "window.history.back();";
        echo "</script>";
    }

} else {
    echo "<script>alert('Solicitud no válida'); window.history.back();</script>";
}
?>
