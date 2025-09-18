<?php
include('../includes/Connection.php');

$connection = connection();

function eliminarProveedor($proveedorID) {
    $con = connection();
    $stmt = $con->prepare("UPDATE Proveedor SET Habilitado = 0 WHERE ProveedorID = ?");
    $stmt->bind_param("s", $proveedorID);
    $stmt->execute();
    $stmt->close();
    $con->close();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST["eliminarProveedor"])) {
        eliminarProveedor($_POST["eliminarProveedor"]);
        header("Location: ../views/ManagerDB.php");
        exit;
    }
}

$resultado = $connection->query("SELECT * FROM Proveedor where habilitado = 1");

if ($resultado && $resultado->num_rows > 0) {
    while ($producto = $resultado->fetch_assoc()) {

        echo "<tr>
            <td>{$producto['Nombre']}</td>
            <td>" . $producto['NombreContacto'] . " " . $producto['ApellidoContacto'] . "</td>
            <td>{$producto['TituloContacto']}</td>
            <td>{$producto['Telefono']}</td>
            <td>
                <div class='action-buttons'>
                    <form action='../views/VerMas.php' method='POST' style='display:inline;'>
                        <input type='hidden' name='IDCosa' value='{$producto['ProveedorID']}'>
                        <button type='submit' class='action-btn verMas-btn' title='Ver más'>
                            <i class='bi bi-plus-square'></i>
                        </button>
                    </form>
                    <form method='POST' action='../views/Editar.php' style='display:inline;'>
                        <input type='hidden' name='tipo' value='proveedores'>
                        <input type='hidden' name='IdCosa' value='" . $producto['ProveedorID'] . "'>
                        <button type='submit' class='action-btn edit-btn' title='Editar'>
                            <i class='bi bi-pencil'></i>
                        </button>
                    </form>
                    <form method='POST' action='../logic/GestionarProveedoresLogic.php'>
                        <input type='hidden' name='eliminarProveedor' value='{$producto['ProveedorID']}'>
                        <button type='submit' class='action-btn delete-btn' title='Eliminar'
                            onclick=\"return confirm('¿Seguro que deseas enviar este producto a la papelera?')\">
                            <i class='bi bi-trash-fill'></i>
                        </button>
                    </form>
                </div>
            </td>
        </tr>";
    }
} else {
    echo "<tr><td colspan='8' class='text-center py-4'>No hay proveedores registrados</td></tr>";
    
    echo "<script>document.getElementById('empty-state').style.display = 'block';</script>";
}

$connection->close();
?>
