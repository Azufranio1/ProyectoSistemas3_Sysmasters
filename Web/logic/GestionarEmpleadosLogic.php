<?php
include('../includes/Connection.php');
include('../includes/VerifySession.php');

$connection = connection();

function eliminarEmpleado($empleadoID) {
    $con = connection();
    $stmt = $con->prepare("UPDATE Empleado SET Habilitado = 0 WHERE EmpleadoID = ?");
    $stmt->bind_param("s", $empleadoID);
    $stmt->execute();
    $stmt->close();
    $stmt = $con->prepare("UPDATE UsuarioEmp SET Habilitado = 0 WHERE EmpleadoID = ?");
    $stmt->bind_param("s", $empleadoID);
    $stmt->execute();
    $stmt->close();
    $con->close();

    /*if ($empleadoID == $_SESSION['idUser']) {
        session_destroy();
        header("Location: ../views/StartSession.php");
        exit;
    }*/
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST["eliminarEmpleado"])) {
        eliminarEmpleado($_POST["eliminarEmpleado"]);
        header("Location: ../views/ManagerDB.php");
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;
    $accion = $_POST['accion'] ?? '';

    if ($id && $accion === 'cambiar_estado') {
        $query = "UPDATE Empleado SET Activo = NOT Activo WHERE EmpleadoID = ?";
        $stmt = $connection->prepare($query);
        $stmt->bind_param('s', $id);
        $stmt->execute();
        $stmt->close();

        /*if ($empleadoID == $_SESSION['idUser']) {
            session_destroy();
            header("Location: ../views/StartSession.php");
            exit;
        }*/
    }
    
    if ($id && $accion === 'eliminar') {
        $query = "DELETE FROM Empleado WHERE EmpleadoID = ?";
        $stmt = $connection->prepare($query);
        $stmt->bind_param('s', $id);
        $stmt->execute();
        $stmt->close();
    }
    exit;
}

$resultado = $connection->query("SELECT * FROM Empleado where habilitado = 1");

if ($resultado && $resultado->num_rows > 0) {
    while ($empleado = $resultado->fetch_assoc()) {
        $fechaContrato = isset($empleado['FechaContrato']) ? date('d/m/Y', strtotime($empleado['FechaContrato'])) : 'N/A';
        $fechaNacimiento = isset($empleado['FechaNacimiento']) ? date('d/m/Y', strtotime($empleado['FechaNacimiento'])) : 'N/A';
        
        $estadoClass = ($empleado['Activo'] == 1) ? 'active' : 'inactive';
        $estadoTexto = ($empleado['Activo'] == 1) ? 'Activo' : 'Inactivo';
        
        $primeraLetra = strtoupper(substr($empleado['Nombre'] ?? 'U', 0, 1));
        
        echo "<tr>
            <td>
                <div class='employee-info'>
                    <div class='client-avatar'>{$primeraLetra}</div>
                    <div>
                        <div class='employee-name'>{$empleado['Nombre']} {$empleado['Apellido']}</div>
                    </div>
                </div>
            </td>
            <td>{$empleado['CI']}</td>
            <td>{$fechaNacimiento}</td>
            <td>{$fechaContrato}</td>
            <td><span class='status-badge {$estadoClass}'>{$estadoTexto}</span></td>
            <td>
                <div class='action-buttons'>
                    <form action='../views/VerMas.php' method='POST' style='display:inline;'>
                        <input type='hidden' name='IDCosa' value='{$empleado['EmpleadoID']}'>
                        <button type='submit' class='action-btn verMas-btn' title='Ver más'>
                            <i class='bi bi-plus-square'></i>
                        </button>
                    </form>
                    <form action='../views/Editar.php' method='POST' style='display:inline;'>
                        <input type='hidden' name='IdCosa' value='{$empleado['EmpleadoID']}'>
                        <button type='submit' class='action-btn edit-btn' title='Editar'>
                            <i class='bi bi-pencil-square'></i>
                        </button>
                    </form>";
                    if($empleado['EmpleadoID'] != $_SESSION['idUser']){
                    echo "<form action='../utils/ActivacionEmpleado.php' method='POST' style='display:inline;'>
                        <input type='hidden' name='empleadoID' value='" . htmlspecialchars($empleado['EmpleadoID']) . "'>
                        <button type='submit' class='action-btn toggle-btn' title='Cambiar estado'>
                            <i class='fas fa-power-off'></i>
                        </button>
                    </form>
                    <form method='POST' action='../logic/GestionarEmpleadosLogic.php'>
                        <input type='hidden' name='eliminarEmpleado' value='{$empleado['EmpleadoID']}'>
                        <button type='submit' class='action-btn delete-btn' title='Eliminar'
                            onclick=\"return confirm('¿Seguro que deseas enviar este empleado a la papelera?')\">
                            <i class='bi bi-trash-fill'></i>
                        </button>
                    </form>";
                    }
                echo "</div>
            </td>
        </tr>";
    }
} else {
    echo "<tr><td colspan='8' class='text-center py-4'>No hay empleados registrados</td></tr>";
    
    echo "<script>document.getElementById('empty-state').style.display = 'block';</script>";
}

$connection->close();
?>
