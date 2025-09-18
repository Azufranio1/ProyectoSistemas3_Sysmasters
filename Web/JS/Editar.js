// EditarElementos.js

document.addEventListener('DOMContentLoaded', function() {
    // Validación del formulario antes de enviar
    const formEditar = document.getElementById('formEditar');
    
    if (formEditar) {
        formEditar.addEventListener('submit', function(event) {
            let esValido = true;
            const tipoElemento = document.querySelector('input[name="tipoElemento"]').value;
            
            // Validación para teléfono - debe ser un número de 9 dígitos
            const telefonoInput = document.getElementById('telefono');
            if (telefonoInput && !/^\d{9}$/.test(telefonoInput.value)) {
                alert('El teléfono debe contener exactamente 9 dígitos numéricos.');
                telefonoInput.focus();
                esValido = false;
            }
            
            // Validación para CI - debe ser un número de hasta 10 dígitos
            const ciInput = document.getElementById('ci');
            if (ciInput && !/^\d{1,10}$/.test(ciInput.value)) {
                alert('El CI debe contener entre 1 y 10 dígitos numéricos.');
                ciInput.focus();
                esValido = false;
            }
            
            // Validación para correo
            const correoInputs = document.querySelectorAll('input[type="email"]');
            correoInputs.forEach(function(input) {
                if (input.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
                    alert('Por favor, introduce un correo electrónico válido.');
                    input.focus();
                    esValido = false;
                }
            });
            
            // Validación para salario - debe ser un número positivo
            if (tipoElemento === 'empleados') {
                const salarioInput = document.getElementById('salario');
                if (salarioInput && (isNaN(salarioInput.value) || Number(salarioInput.value) <= 0)) {
                    alert('El salario debe ser un número positivo.');
                    salarioInput.focus();
                    esValido = false;
                }
            }
            
            // Confirmar envío
            if (esValido && !confirm('¿Estás seguro de guardar los cambios?')) {
                event.preventDefault();
                return false;
            }
            
            return esValido;
        });
    }
    
    // Mostrar/ocultar contraseña
    const keywordInput = document.getElementById('keyword');
    if (keywordInput) {
        // Creamos un botón de toggle para la contraseña
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'toggle-password';
        toggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
        toggleBtn.title = 'Mostrar/Ocultar contraseña';
        
        // Insertamos el botón después del input
        keywordInput.parentNode.insertBefore(toggleBtn, keywordInput.nextSibling);
        
        // Añadimos evento para mostrar/ocultar contraseña
        toggleBtn.addEventListener('click', function() {
            if (keywordInput.type === 'password') {
                keywordInput.type = 'text';
                toggleBtn.innerHTML = '<i class="bi bi-eye-slash"></i>';
            } else {
                keywordInput.type = 'password';
                toggleBtn.innerHTML = '<i class="bi bi-eye"></i>';
            }
        });
    }
    
    // Función para verificar si ha habido cambios en el formulario
    let formModificado = false;
    
    // Detectar cambios en inputs
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            formModificado = true;
        });
        input.addEventListener('keyup', () => {
            formModificado = true;
        });
    });
    
    // Advertir al usuario si intenta salir con cambios sin guardar
    window.addEventListener('beforeunload', function(e) {
        if (formModificado) {
            // Mensaje que se mostrará en algunos navegadores
            const mensaje = '¿Estás seguro de salir? Los cambios no guardados se perderán.';
            e.returnValue = mensaje;
            return mensaje;
        }
    });
    
    // Marcar como no modificado cuando se envía el formulario
    if (formEditar) {
        formEditar.addEventListener('submit', function() {
            formModificado = false;
        });
    }
});

// Estilos CSS adicionales para el botón de toggle de contraseña
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .toggle-password {
            background: none;
            border: none;
            cursor: pointer;
            color: var(--primary-pink);
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
        }
        
        .form-group {
            position: relative;
        }
        
        .btn-back {
            background: transparent;
            color: var(--text-color);
            border: 1px solid var(--border-color);
            padding: 14px;
            width: 100%;
            border-radius: 12px;
            font-size: 1.1rem;
            font-weight: 600;
            margin-top: 10px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-back:hover {
            background-color: #f5f5f5;
        }
        
        .success {
            color: var(--success-green);
            background-color: rgba(33, 117, 44, 0.1);
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 1rem;
            font-size: 0.9rem;
            border-left: 4px solid var(--success-green);
        }
    `;
    document.head.appendChild(style);
});