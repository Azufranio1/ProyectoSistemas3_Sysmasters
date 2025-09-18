<?php
include '../includes/Connection.php';
$conn = connection();

function obtenerCategorias() {
    $conn = connection();
    $query = "SELECT DISTINCT Categoria FROM Producto ORDER BY Categoria ASC";
    $result = $conn->query($query);

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            echo '<option value="' . htmlspecialchars($row["Categoria"]) . '">' . htmlspecialchars($row["Categoria"]) . '</option>';
        }
    } else {
        echo '<option value="">No hay categorías disponibles</option>';
    }
    $conn->close();
}

function obtenerColores() {
    $conn = connection();
    $query = "SELECT DISTINCT Color FROM Producto ORDER BY Color ASC";
    $result = $conn->query($query);

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            echo '<option value="' . htmlspecialchars($row["Color"]) . '">Código ' . htmlspecialchars($row["Color"]) . '</option>';
        }
    } else {
        echo '<option value="">No hay colores disponibles</option>';
    }
    $conn->close();
}
