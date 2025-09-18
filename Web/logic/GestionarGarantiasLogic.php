<?php
include('../includes/Connection.php');

$connection = connection();

function eliminarGarantia($garantiaID) {
    $con = connection();
    $stmt = $con->prepare("UPDATE Garantia SET Habilitado = 0 WHERE GarantiaID = ?");
    $stmt->bind_param("s", $garantiaID);
    $stmt->execute();
    $stmt->close();
    $con->close();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST["eliminarGarantia"])) {
        eliminarGarantia($_POST["eliminarGarantia"]);
        header("Location: ../views/ManagerDB.php");
        exit;
    }
}

$resultado = $connection->query("SELECT * FROM Garantia WHERE Habilitado = 1");

if ($resultado && $resultado->num_rows > 0) {
    while ($garantia = $resultado->fetch_assoc()) {
        echo "<tr>
            <td>{$garantia['Tipo']}</td>
            <td>{$garantia['Descripcion']}</td>
            <td>
                <div class='action-buttons'>

                    <form action='../views/VerMas.php' method='POST' style='display:inline;'>
                        <input type='hidden' name='IDCosa' value='{$garantia['GarantiaID']}'>
                        <button type='submit' class='action-btn verMas-btn' title='Ver más'>
                            <i class='bi bi-plus-square'></i>
                        </button>
                    </form>

                    <form action='../views/Editar.php' method='POST' style='display:inline;'>
                        <input type='hidden' name='IdCosa' value='{$garantia['GarantiaID']}'>
                        <button type='submit' class='action-btn edit-btn' title='Editar'>
                            <i class='bi bi-pencil-square'></i>
                        </button>
                    </form>

                    <form method='POST' action='../logic/GestionarGarantiasLogic.php'>
                        <input type='hidden' name='eliminarGarantia' value='{$garantia['GarantiaID']}'>
                        <button type='submit' class='action-btn delete-btn' title='Eliminar'
                            onclick=\"return confirm('¿Seguro que deseas enviar esta Garantía a la papelera?')\">
                            <i class='bi bi-trash-fill'></i>
                        </button>
                    </form>

                </div>
            </td>
        </tr>";
    }
} else {
    echo "<tr><td colspan='5' class='text-center py-4'>No hay Garantías Registradas</td></tr>";
}

$connection->close();
?>
