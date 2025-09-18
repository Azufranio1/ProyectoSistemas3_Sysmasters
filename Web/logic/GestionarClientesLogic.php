<?php
include('../includes/Connection.php');

$connection = connection();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;
    $accion = $_POST['accion'] ?? '';

    if ($id && $accion === 'cambiar_estado') {
        $query = "UPDATE Cliente SET Habilitado = NOT Habilitado WHERE ClienteID = ?";
        $stmt = $connection->prepare($query);
        $stmt->bind_param('s', $id);  
        $stmt->execute();
        $stmt->close();
    }
}

$resultado = $connection->query("SELECT * FROM Cliente WHERE Habilitado = 1");

if ($resultado && $resultado->num_rows > 0) {
    while ($cliente = $resultado->fetch_assoc()) {
        
        $primeraLetra = strtoupper(substr($cliente['Nombre'] ?? 'U', 0, 1));
        
        echo "<tr>
            <td>
                <div class='client-info'>
                    <div class='client-avatar'>{$primeraLetra}</div>
                    <div>
                        <div class='client-name'>{$cliente['Nombre']} {$cliente['Apellido']}</div>
                    </div>
                </div>
            </td>
            <td>{$cliente['CI']}</td>
            <td>{$cliente['Telefono']}</td>
            <td>{$cliente['Correo']}</td>
            <td>{$cliente['CantTransacciones']}</td>
            <td>{$cliente['CantDevolucionesLate']}</td>
            <td>
                <div class='action-buttons'>
                    <form action='../views/Editar.php' method='POST' style='display:inline;'>
                        <input type='hidden' name='IdCosa' value='{$cliente['ClienteID']}'>
                        <button type='submit' class='action-btn edit-btn' title='Editar'>
                            <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-pencil-square\" viewBox=\"0 0 16 16\">
                                <path d=\"M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z\"/>
                                <path fill-rule=\"evenodd\" d=\"M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z\"/>
                            </svg>
                        </button>
                    </form>
                    <button class='action-btn delete-btn' title='Eliminar' onclick='eliminarCliente({$cliente['ClienteID']})'>
                        <i class='fas fa-trash'></i>
                    </button>
                </div>
            </td>
        </tr>";
    }
} else {
    echo "<tr><td colspan='8' class='text-center py-4'>No hay clientes registrados</td></tr>";
    
    echo "<script>document.getElementById('empty-state').style.display = 'block';</script>";
}

$connection->close();
?>
