<?php
include('../includes/Connection.php');
$con = connection();

function mostrarElementosInhabilitados($con, $tabla, $id_col, $campos, $prefijo = '') {
    $query = "SELECT * FROM $tabla WHERE Habilitado = 0";
    $resultado = $con->query($query);

    if ($resultado && $resultado->num_rows > 0) {
        while ($elemento = $resultado->fetch_assoc()) {
            echo "<tr>";
            foreach ($campos as $campo) {
                if (isset($elemento[$campo])) {
                    echo "<td>" . htmlspecialchars($elemento[$campo]) . "</td>";
                } else {
                    echo "<td>N/A</td>";
                }
            }
            
            $id_completo = '';
            if (!empty($prefijo)) {
                $id_completo = $prefijo . '-' . str_pad($elemento[$id_col], 3, '0', STR_PAD_LEFT);
            } else {
                $id_completo = $elemento[$id_col];
            }
            
            echo "<td>
                <div class='action-buttons'>
                    <form method='POST' onsubmit='return confirmarRestauracion();' style='display: inline-block;'>
                        <input type='hidden' name='tabla' value='" . htmlspecialchars($tabla) . "'>
                        <input type='hidden' name='id_col' value='" . htmlspecialchars($id_col) . "'>
                        <input type='hidden' name='id_valor' value='" . htmlspecialchars($elemento[$id_col]) . "'> 
                        <input type='hidden' name='IDCosa' value='" . htmlspecialchars($id_completo) . "'>
                        <button type='submit' name='restaurar' class='action-btn restore-btn' title='Restaurar'>
                            <i class='bi bi-arrow-clockwise'></i>
                        </button>
                    </form>
                    <form method='POST' onsubmit='return confirmarEliminacion();' style='display: inline-block;'>
                        <input type='hidden' name='tabla' value='" . htmlspecialchars($tabla) . "'>
                        <input type='hidden' name='id_col' value='" . htmlspecialchars($id_col) . "'>
                        <input type='hidden' name='id_valor' value='" . htmlspecialchars($elemento[$id_col]) . "'>
                        <button type='submit' name='eliminar' class='action-btn delete-btn' title='Eliminar permanentemente'>
                            <i class='bi bi-trash-fill'></i>
                        </button>
                    </form>
                </div>
            </td>";
            echo "</tr>";
        }
    } else {
        echo "<tr><td colspan='" . (count($campos) + 1) . "' class='text-center py-4'>No hay elementos en la papelera</td></tr>";
    }
}

function restaurarElemento($con, $tabla, $id_col, $id) {
    $query = "UPDATE $tabla SET Habilitado = 1 WHERE $id_col = ?";
    $stmt = $con->prepare($query);
    
    if ($stmt) {
        $stmt->bind_param("s", $id);
        $resultado = $stmt->execute();
        $stmt->close();
        return $resultado;
    } else {
        return false;
    }
}

function eliminarElementoPermanente($con, $tabla, $id_col, $id) {
    $query = "DELETE FROM $tabla WHERE $id_col = ?";
    $stmt = $con->prepare($query);
    
    if ($stmt) {
        $stmt->bind_param("s", $id);
        $resultado = $stmt->execute();
        $stmt->close();
        return $resultado;
    } else {
        return false;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['restaurar'], $_POST['IDCosa'])) {
    if (isset($_POST['tabla'], $_POST['id_col'], $_POST['id_valor'])) {
        $tabla = $_POST['tabla'];
        $id_col = $_POST['id_col'];
        $id_valor = $_POST['id_valor'];
        
        if (restaurarElemento($con, $tabla, $id_col, $id_valor)) {
            echo "<script>
                alert('Elemento restaurado con éxito');
                window.location.href = window.location.href;
            </script>";
        } else {
            echo "<script>
                alert('Error al restaurar el elemento: " . $con->error . "');
            </script>";
        }
    } else {
        echo "<script>
            alert('Faltan datos para la restauración');
        </script>";
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['eliminar'])) {
    if (isset($_POST['tabla'], $_POST['id_col'], $_POST['id_valor'])) {
        $tabla = $_POST['tabla'];
        $id_col = $_POST['id_col'];
        $id_valor = $_POST['id_valor'];
        
        if (eliminarElementoPermanente($con, $tabla, $id_col, $id_valor)) {
            echo "<script>
                alert('Elemento eliminado permanentemente');
                window.location.href = window.location.href;
            </script>";
        } else {
            echo "<script>
                alert('Error al eliminar el elemento: " . $con->error . "');
            </script>";
        }
    } else {
        echo "<script>
            alert('Faltan datos para la eliminación');
        </script>";
    }
}
?>