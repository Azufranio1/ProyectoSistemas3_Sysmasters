<?php
switch($tipoElemento) {
    case 'productos':
        echo "<th>Categoría</th><th>Color</th><th>Precio</th><th>Stock</th><th>Descripción</th><th>Acciones</th>";
        break;
    case 'proveedores':
        echo "<th>Nombre</th><th>Contacto</th><th>Apellido Contacto</th><th>Teléfono</th><th>Acciones</th>";
        break;
    case 'empleados':
        echo "<th>Nombre</th><th>Apellido</th><th>CI</th><th>Contrato</th><th>Salario</th><th>Acciones</th>";
        break;
    default:
        echo "<th>Nombre</th><th>Descripción</th><th>Tipo</th><th>Acciones</th>";
        break;
}
?>