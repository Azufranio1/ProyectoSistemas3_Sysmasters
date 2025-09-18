document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('productoForm');
    const categoria = document.getElementById('categoria');
    const color = document.getElementById('color');
    const precioUnitario = document.getElementById('precioUnitario');
    const stock = document.getElementById('stock');

    const requirements = {
        precioUnitario: /^[0-9]+(\.[0-9]{1,2})?$/,
        stock: /^[0-9]{1,5}$/
    };

    function validateForm() {
        let valid = true;
        
        const isValidPrecio = requirements.precioUnitario.test(precioUnitario.value);
        document.getElementById('reqPrecio').classList.toggle('valid', isValidPrecio);
        document.getElementById('reqPrecio').classList.toggle('invalid', !isValidPrecio);
        valid = valid && isValidPrecio;
        
        const isValidStock = requirements.stock.test(stock.value);
        document.getElementById('reqStock').classList.toggle('valid', isValidStock);
        document.getElementById('reqStock').classList.toggle('invalid', !isValidStock);
        valid = valid && isValidStock;
        
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

    const nuevaCategoriaContainer = document.getElementById('nuevaCategoriaContainer');
    const nuevaCategoria = document.getElementById('nuevaCategoria');
    
    categoria.addEventListener('change', function() {
        if (this.value === 'nueva_categoria') {
            nuevaCategoriaContainer.style.display = 'block';
            nuevaCategoria.setAttribute('required', 'required');
        } else {
            nuevaCategoriaContainer.style.display = 'none';
            nuevaCategoria.removeAttribute('required');
        }
        validateForm();
    });
    
    // Manejo de nuevo color
    const nuevoColorContainer = document.getElementById('nuevoColorContainer');
    const nuevoColor = document.getElementById('nuevoColor');
    
    color.addEventListener('change', function() {
        if (this.value === 'nuevo_color') {
            nuevoColorContainer.style.display = 'block';
            nuevoColor.setAttribute('required', 'required');
        } else {
            nuevoColorContainer.style.display = 'none';
            nuevoColor.removeAttribute('required');
        }
        validateForm();
    });

    categoria.addEventListener('change', validateForm);
    color.addEventListener('change', validateForm);
    precioUnitario.addEventListener('input', validateForm);
    stock.addEventListener('input', validateForm);
    
    if (nuevaCategoria) {
        nuevaCategoria.addEventListener('input', validateForm);
    }
    
    if (nuevoColor) {
        nuevoColor.addEventListener('input', validateForm);
    }

    form.addEventListener('submit', function(e) {
        if (!validateForm()) {
            e.preventDefault();
            alert('Por favor, completa correctamente todos los campos del formulario.');
        }
    });
});