<?php foreach ($productos as $producto): ?>
<?php 
    $colorDisplay = $producto['Color1'];
    if (!empty($producto['Color2'])) {
        $colorDisplay .= ' con ' . $producto['Color2'];
    }
    
    $precioBs = $producto['PrecioUnitario'];
?>
<option value="<?php echo $producto['ProductoID']; ?>" 
        data-precio="<?php echo $precioBs; ?>"
        data-nombre="<?php echo $producto['Nombre']; ?>"
        data-categoria="<?php echo $producto['Categoria']; ?>"
        data-color="<?php echo $colorDisplay; ?>">
    <?php echo $producto['Nombre'] . ' - ' . $colorDisplay . ' (Bs ' . number_format($precioBs, 2) . ')'; ?>
</option>
<?php endforeach; ?>