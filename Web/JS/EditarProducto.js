document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('productoForm');
    const categoria = document.getElementById('categoria');
    const color = document.getElementById('color');
    const precioUnitario = document.getElementById('precioUnitario');
    const precioVenta = document.getElementById('PrecioVenta');

    const requirements = {
        precioUnitario: /^[0-9]+(\.[0-9]{1,2})?$/,
        precioVenta: /^[0-9]+(\.[0-9]{1,2})?$/
    };

    function validateForm() {
        let valid = true;
        
        // Validar precios
        const isValidPrecioUnitario = requirements.precioUnitario.test(precioUnitario.value) && parseFloat(precioUnitario.value) > 0;
        document.getElementById('reqPrecioUnitario').classList.toggle('valid', isValidPrecioUnitario);
        document.getElementById('reqPrecioUnitario').classList.toggle('invalid', !isValidPrecioUnitario);
        
        const isValidPrecioVenta = requirements.precioVenta.test(precioVenta.value) && parseFloat(precioVenta.value) > 0;
        document.getElementById('reqPrecioVenta').classList.toggle('valid', isValidPrecioVenta);
        document.getElementById('reqPrecioVenta').classList.toggle('invalid', !isValidPrecioVenta);
        
        valid = valid && isValidPrecioUnitario && isValidPrecioVenta;
    
        // Validar categoría
        let isValidCategoria = false;
        if (categoria.value !== "" && categoria.value !== "nueva_categoria") {
            isValidCategoria = true;
        } else if (categoria.value === "nueva_categoria") {
            const nuevaCategoria = document.getElementById('nuevaCategoria');
            isValidCategoria = nuevaCategoria.value.trim() !== "";
        }
        document.getElementById('reqCategoria').classList.toggle('valid', isValidCategoria);
        document.getElementById('reqCategoria').classList.toggle('invalid', !isValidCategoria);
        valid = valid && isValidCategoria;
        
        // Validar color
        let isValidColor = false;
        if (color.value !== "" && color.value !== "nuevo_color") {
            isValidColor = true;
        } else if (color.value === "nuevo_color") {
            const nuevoColor = document.getElementById('nuevoColor');
            isValidColor = nuevoColor.value.trim() !== "";
        }
        document.getElementById('reqColor').classList.toggle('valid', isValidColor);
        document.getElementById('reqColor').classList.toggle('invalid', !isValidColor);
        valid = valid && isValidColor;
        
        return valid;
    }

    // Manejo de nueva categoría
    const nuevaCategoriaContainer = document.getElementById('nuevaCategoriaContainer');
    const nuevaCategoriaInput = document.getElementById('nuevaCategoria');
    
    categoria.addEventListener('change', function() {
        if (this.value === 'nueva_categoria') {
            nuevaCategoriaContainer.style.display = 'block';
            nuevaCategoriaInput.setAttribute('required', 'required');
            nuevaCategoriaInput.value = ''; // Limpiar campo al cambiar
        } else {
            nuevaCategoriaContainer.style.display = 'none';
            nuevaCategoriaInput.removeAttribute('required');
        }
        validateForm();
    });
    
    // Manejo de nuevo color
    const nuevoColorContainer = document.getElementById('nuevoColorContainer');
    const nuevoColorInput = document.getElementById('nuevoColor');
    
    color.addEventListener('change', function() {
        if (this.value === 'nuevo_color') {
            nuevoColorContainer.style.display = 'block';
            nuevoColorInput.setAttribute('required', 'required');
            nuevoColorInput.value = ''; // Limpiar campo al cambiar
        } else {
            nuevoColorContainer.style.display = 'none';
            nuevoColorInput.removeAttribute('required');
        }
        validateForm();
    });

    // Eventos de validación
    [categoria, color, precioUnitario, precioVenta].forEach(el => {
        el.addEventListener('change', validateForm);
        el.addEventListener('input', validateForm);
    });
    
    if (nuevaCategoriaInput) {
        nuevaCategoriaInput.addEventListener('input', validateForm);
    }
    
    if (nuevoColorInput) {
        nuevoColorInput.addEventListener('input', validateForm);
    }

    // Validación al enviar el formulario
    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            alert('Por favor, completa correctamente todos los campos del formulario.');
        }
    });
    
    // Ejecutar validación inicial
    validateForm();
});