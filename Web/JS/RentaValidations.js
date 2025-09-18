$(document).ready(function() {
    // 1. Hacer fecha de renta readonly
    $('#fecha_renta').attr('readonly', true);
    
    // 2. Configurar fecha de devolución (mínimo hoy, máximo 15 días)
    function configurarFechasDevolucion() {
        const hoy = new Date();
        const fechaMaxima = new Date();
        fechaMaxima.setDate(hoy.getDate() + 15);
        
        const formatoFecha = fecha => {
            const yyyy = fecha.getFullYear();
            const mm = String(fecha.getMonth() + 1).padStart(2, '0');
            const dd = String(fecha.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
        };
        
        const fechaMinima = formatoFecha(hoy);
        const fechaMax = formatoFecha(fechaMaxima);
        
        $('#fecha_devolucion').attr('min', fechaMinima);
        $('#fecha_devolucion').attr('max', fechaMax);
        
        // Si la fecha actual está fuera del rango permitido, ajustarla
        if ($('#fecha_devolucion').val() < fechaMinima) {
            $('#fecha_devolucion').val(fechaMinima);
        } else if ($('#fecha_devolucion').val() > fechaMax) {
            $('#fecha_devolucion').val(fechaMax);
        }
    }
    
    configurarFechasDevolucion();
    
    // 3. Agregar campo de descuento y modificar el cálculo del total
    function agregarCampoDescuento() {
        const totalSection = $('.total-section .row');
        
        // Crear nueva fila para el descuento antes del total
        const descuentoHTML = `
            <div class="row mb-3">
                <div class="col-md-8">
                    <h5>Descuento:</h5>
                </div>
                <div class="col-md-4 text-end">
                    <div class="input-group">
                        <span class="input-group-text">Bs</span>
                        <input type="number" class="form-control" id="descuento" name="descuento" value="0" min="0">
                    </div>
                    <div class="invalid-feedback">El descuento debe ser un número entero mayor o igual a 0.</div>
                </div>
            </div>
        `;
        
        // Insertar el descuento antes del total
        totalSection.before(descuentoHTML);
        
        // Modificar el input de total para que sea readonly
        $('#total-display').attr('readonly', true);
        
        // Crear campo de subtotal general (antes del descuento)
        const subtotalGeneralHTML = `
            <div class="row mb-3">
                <div class="col-md-8">
                    <h5>Subtotal:</h5>
                </div>
                <div class="col-md-4 text-end">
                    <div class="input-group">
                        <span class="input-group-text">Bs</span>
                        <input type="text" class="form-control" id="subtotal-general" readonly value="0.00">
                    </div>
                </div>
            </div>
        `;
        
        totalSection.before(subtotalGeneralHTML);
        
        // Evento para recalcular el total cuando cambie el descuento
        $('#descuento').on('input', function() {
            calcularTotal();
        });
    }
    
    agregarCampoDescuento();
    
    // 4. Validar cantidad máxima de productos
    function validarCantidadMaxima(productoCard) {
        const select = $(productoCard).find('.select-producto');
        const cantidadInput = $(productoCard).find('.cantidad-producto');
        
        // Usar disponible en lugar de stock como nombre del atributo de datos
        const disponibles = parseInt(select.find(':selected').data('disponible')) || 0;
        
        if (disponibles > 0) {
            cantidadInput.attr('max', disponibles);
            
            if (parseInt(cantidadInput.val()) > disponibles) {
                cantidadInput.val(disponibles);
            }
            
            // Mostrar mensaje de stock disponible
            const stockInfo = $(productoCard).find('.stock-info');
            if (stockInfo.length === 0) {
                $(productoCard).find('.producto-info .alert').append(
                    `<div class="row mt-2 stock-info">
                        <div class="col-md-12">
                            <strong>Disponibles:</strong> <span class="info-stock">${disponibles}</span>
                        </div>
                    </div>`
                );
            } else {
                stockInfo.find('.info-stock').text(disponibles).removeClass('text-danger');
            }
        } else {
            cantidadInput.attr('max', 0);
            cantidadInput.val(0);
            
            // Mostrar mensaje de error de stock
            const stockInfo = $(productoCard).find('.stock-info');
            if (stockInfo.length === 0) {
                $(productoCard).find('.producto-info .alert').append(
                    `<div class="row mt-2 stock-info">
                        <div class="col-md-12 text-danger">
                            <strong>Sin disponibilidad</strong>
                        </div>
                    </div>`
                );
            } else {
                stockInfo.find('.info-stock').text("0").addClass('text-danger');
            }
        }
    }
    
    // 5. Validación de campos de cliente
    function validarNombreApellido(input) {
        const valor = $(input).val().trim();
        const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,50}$/;
        
        if (!valor) {
            $(input).addClass('is-invalid');
            if (!$(input).next('.invalid-feedback').length) {
                $(input).after('<div class="invalid-feedback">Este campo es obligatorio.</div>');
            }
            return false;
        } else if (!regex.test(valor)) {
            $(input).addClass('is-invalid');
            if (!$(input).next('.invalid-feedback').length) {
                $(input).after('<div class="invalid-feedback">Solo se permiten letras y espacios (mínimo 2 caracteres).</div>');
            }
            return false;
        } else {
            $(input).removeClass('is-invalid').addClass('is-valid');
            return true;
        }
    }
    
    // 6. Validación de teléfono
    function validarTelefono(input) {
        const valor = $(input).val().trim();
        
        if (!valor) {
            $(input).addClass('is-invalid');
            if (!$(input).next('.invalid-feedback').length) {
                $(input).after('<div class="invalid-feedback">Este campo es obligatorio.</div>');
            }
            return false;
        } else if (parseInt(valor) < 59999999 || parseInt(valor) > 79999999) {
            $(input).addClass('is-invalid');
            if (!$(input).next('.invalid-feedback').length) {
                $(input).after('<div class="invalid-feedback">El número debe estar entre 59999999 y 79999999.</div>');
            }
            return false;
        } else {
            $(input).removeClass('is-invalid').addClass('is-valid');
            return true;
        }
    }
    
    // 7. Validación de selección de producto
    function validarSeleccionProducto(productoCard) {
        const select = $(productoCard).find('.select-producto');
        const selectedValue = select.val();
        
        if (!selectedValue) {
            select.next('.select2-container').addClass('is-invalid');
            if (!select.next('.select2-container').next('.invalid-feedback').length) {
                select.next('.select2-container').after('<div class="invalid-feedback">Debe seleccionar un producto.</div>');
            }
            return false;
        } else {
            select.next('.select2-container').removeClass('is-invalid').addClass('is-valid');
            return true;
        }
    }
    
    // 8. Validación de cantidad de producto
    function validarCantidadProducto(productoCard) {
        const cantidadInput = $(productoCard).find('.cantidad-producto');
        const cantidad = parseInt(cantidadInput.val());
        const max = parseInt(cantidadInput.attr('max')) || 0;
        
        if (isNaN(cantidad) || cantidad < 1) {
            cantidadInput.addClass('is-invalid');
            if (!cantidadInput.next('.invalid-feedback').length) {
                cantidadInput.after('<div class="invalid-feedback">La cantidad debe ser al menos 1.</div>');
            }
            return false;
        } else if (max > 0 && cantidad > max) {
            cantidadInput.addClass('is-invalid');
            if (!cantidadInput.next('.invalid-feedback').length) {
                cantidadInput.after(`<div class="invalid-feedback">La cantidad máxima disponible es ${max}.</div>`);
            }
            return false;
        } else {
            cantidadInput.removeClass('is-invalid').addClass('is-valid');
            return true;
        }
    }
    
    // 9. Validación de garantía
    function validarGarantia(garantiaCard) {
        const tipoGarantia = $(garantiaCard).find('.garantia-tipo').val().trim();
        const clienteGarantia = $(garantiaCard).find('.cliente-garantia').val();
        const tipoInput = $(garantiaCard).find('.garantia-tipo');
        const clienteSelect = $(garantiaCard).find('.cliente-garantia');
        
        if (!tipoGarantia && clienteGarantia === 'ninguno') {
            tipoInput.addClass('is-invalid');
            clienteSelect.addClass('is-invalid');
            $(garantiaCard).find('.garantia-requerida').show();
            return false;
        } else {
            tipoInput.removeClass('is-invalid');
            clienteSelect.removeClass('is-invalid');
            $(garantiaCard).find('.garantia-requerida').hide();
            return true;
        }
    }
    
    // 10. Calcular subtotal para un producto
    function calcularSubtotal(productoCard) {
        const select = $(productoCard).find('.select-producto');
        const cantidad = parseInt($(productoCard).find('.cantidad-producto').val()) || 0;
        const precioUnitario = parseFloat(select.find(':selected').data('precio')) || 0;
        
        const subtotal = precioUnitario * cantidad;
        $(productoCard).find('.subtotal-producto').val(subtotal.toFixed(2));
        
        const selectedOption = select.find(':selected');
        if (selectedOption.val()) {
            const nombre = selectedOption.data('nombre');
            const categoria = selectedOption.data('categoria');
            const color = selectedOption.data('color');
            
            $(productoCard).find('.info-nombre').text(nombre);
            $(productoCard).find('.info-categoria').text(categoria);
            $(productoCard).find('.info-color').text(color);
            $(productoCard).find('.producto-info').show();
            
            // Validar cantidad máxima
            validarCantidadMaxima(productoCard);
        } else {
            $(productoCard).find('.producto-info').hide();
        }
        
        calcularTotal();
    }
    
    // 11. Calcular el total general con descuento
    function calcularTotal() {
        let subtotal = 0;
        $('.subtotal-producto').each(function() {
            subtotal += parseFloat($(this).val()) || 0;
        });
        
        $('#subtotal-general').val(subtotal.toFixed(2));
        
        // Aplicar descuento (asegurarse que sea un número entero)
        let descuento = parseInt($('#descuento').val()) || 0;
        if (descuento < 0) {
            descuento = 0;
            $('#descuento').val(0);
        }
        
        // Asegurarse que el descuento no sea mayor que el subtotal
        if (descuento > subtotal) {
            descuento = Math.floor(subtotal);
            $('#descuento').val(descuento);
        }
        
        const total = subtotal - descuento;
        $('#total-display').val(Math.floor(total));
    }
    
    // 12. Función para configurar los eventos de los clientes
    function configurarEventosCliente(clienteCard) {
        $(clienteCard).find('.remove-cliente').click(function() {
            $(this).closest('.cliente-card').remove();
            actualizarOpcionesClientesGarantias();
            
            $('#garantias-container .garantia-card').each(function() {
                validarGarantia($(this));
            });
        });
        
        // Agregar validaciones para los campos de cliente
        $(clienteCard).find('input[name="nombre_cliente[]"]').on('input blur', function() {
            validarNombreApellido(this);
            actualizarOpcionesClientesGarantias();
        });
        
        $(clienteCard).find('input[name="apellido_cliente[]"]').on('input blur', function() {
            validarNombreApellido(this);
            actualizarOpcionesClientesGarantias();
        });
        
        $(clienteCard).find('input[name="telefono_cliente[]"]').on('input blur', function() {
            validarTelefono(this);
        });
    }
    
    // 13. Función para configurar los eventos de los productos
    function configurarEventosProducto(productoCard) {
        $(productoCard).find('.select-producto').select2({
            placeholder: "Seleccione un producto",
            allowClear: true
        });
        
        $(productoCard).find('.remove-producto').click(function() {
            $(this).closest('.producto-card').remove();
            calcularTotal();
        });
        
        // Agregar validaciones para los campos de producto
        $(productoCard).find('.select-producto').on('change', function() {
            validarSeleccionProducto(productoCard);
            calcularSubtotal(productoCard);
        });
        
        $(productoCard).find('.cantidad-producto').on('input blur', function() {
            validarCantidadProducto(productoCard);
            calcularSubtotal(productoCard);
        });
        
        // Iniciar validación y cálculo
        if ($(productoCard).find('.select-producto').val()) {
            validarSeleccionProducto(productoCard);
        }
        calcularSubtotal(productoCard);
    }
    
    // 14. Función para configurar los eventos de las garantías
    function configurarEventosGarantia(garantiaCard) {
        $(garantiaCard).find('.remove-garantia').click(function() {
            $(this).closest('.garantia-card').remove();
        });
        
        $(garantiaCard).find('.garantia-tipo').on('input blur', function() {
            validarGarantia(garantiaCard);
        });
        
        $(garantiaCard).find('.cliente-garantia').on('change', function() {
            validarGarantia(garantiaCard);
        });
    }
    
    // 15. Modificar el evento de agregar cliente
    $('#agregar-cliente').off('click').on('click', function() {
        const template = document.getElementById('template-cliente');
        const clone = document.importNode(template.content, true);
        $('#clientes-container').append(clone);
        
        const nuevaClienteCard = $('.cliente-card').last();
        configurarEventosCliente(nuevaClienteCard);
        actualizarOpcionesClientesGarantias();
    });
    
    // 16. Modificar el evento de agregar producto
    $('#agregar-producto').off('click').on('click', function() {
        const template = document.getElementById('template-producto');
        const clone = document.importNode(template.content, true);
        $('#productos-container').append(clone);
        
        const nuevoProductoCard = $('.producto-card').last();
        configurarEventosProducto(nuevoProductoCard);
    });
    
    // 17. Modificar la función de agregar garantía
    function agregarGarantia(esInicial = false) {
        const template = document.getElementById('template-garantia');
        const clone = document.importNode(template.content, true);
        $('#garantias-container').append(clone);
        
        const nuevaGarantiaCard = $('.garantia-card').last();
        configurarEventosGarantia(nuevaGarantiaCard);
        actualizarOpcionesClientesGarantias();
        
        return nuevaGarantiaCard;
    }
    
    // 18. El evento de agregar garantía
    $('#agregar-garantia').off('click').on('click', function() {
        agregarGarantia();
    });
    
    // 19. Función de actualizar opciones de clientes en garantías
    function actualizarOpcionesClientesGarantias() {
        $('#garantias-container .garantia-card').each(function() {
            const select = $(this).find('.cliente-garantia');
            const selectedValue = select.val();
    
            select.find('option:not(:first)').remove();
    
            $('#clientes-container .cliente-card').each(function(clienteIndex) {
                const nombreInput = $(this).find('input[name="nombre_cliente[]"]');
                const apellidoInput = $(this).find('input[name="apellido_cliente[]"]');
                const nombre = nombreInput.val().trim();
                const apellido = apellidoInput.val().trim();
    
                // Solo agregar si ambos campos son válidos
                if (nombre && apellido) {
                    const optionValue = 'cliente_' + clienteIndex;
                    const optionText = nombre + ' ' + apellido;
    
                    select.append(
                        $('<option></option>').attr('value', optionValue).text(optionText)
                    );
                }
            });
    
            if (select.find(`option[value="${selectedValue}"]`).length > 0) {
                select.val(selectedValue);
            } else {
                select.val('ninguno');
            }
        });
    }
    
    // 20. Validación del formulario completo
    $('#form-renta').off('submit').on('submit', function(e) {
        e.preventDefault();
        let formValido = true;
        
        // Validar que haya al menos un cliente
        if ($('#clientes-container .cliente-card').length === 0) {
            mostrarMensajeError('Debe agregar al menos un cliente.');
            formValido = false;
        } else {
            // Validar cada cliente
            $('#clientes-container .cliente-card').each(function() {
                const nombreInput = $(this).find('input[name="nombre_cliente[]"]');
                const apellidoInput = $(this).find('input[name="apellido_cliente[]"]');
                const telefonoInput = $(this).find('input[name="telefono_cliente[]"]');
                
                if (!validarNombreApellido(nombreInput) || 
                    !validarNombreApellido(apellidoInput) || 
                    !validarTelefono(telefonoInput)) {
                    formValido = false;
                }
            });
        }
        
        // Validar que haya al menos un producto
        if ($('#productos-container .producto-card').length === 0) {
            mostrarMensajeError('Debe agregar al menos un producto.');
            formValido = false;
        } else {
            // Validar cada producto
            $('#productos-container .producto-card').each(function() {
                if (!validarSeleccionProducto($(this)) || 
                    !validarCantidadProducto($(this))) {
                    formValido = false;
                }
            });
        }
        
        // Validar el total
        const total = parseFloat($('#total-display').val());
        if (isNaN(total) || total < 0) {
            mostrarMensajeError('El total debe ser un número válido mayor o igual a cero.');
            formValido = false;
        }
        
        // Validar descuento
        const descuento = parseInt($('#descuento').val());
        if (isNaN(descuento) || descuento < 0) {
            $('#descuento').addClass('is-invalid');
            formValido = false;
        }
        
        // Validar garantías
        let todasGarantiasValidas = true;
        $('#garantias-container .garantia-card').each(function() {
            if (!validarGarantia($(this))) {
                todasGarantiasValidas = false;
            }
        });
        
        if (!todasGarantiasValidas) {
            mostrarMensajeError('Debe completar correctamente la información de garantías. Cada garantía debe tener un tipo de garantía o estar asociada a un cliente.');
            formValido = false;
        }
        
        if (formValido) {
            this.submit();
        } else {
            // Desplazar a la primera validación fallida
            const primerError = $('.is-invalid:first');
            if (primerError.length) {
                $('html, body').animate({
                    scrollTop: primerError.offset().top - 100
                }, 500);
            }
        }
    });
    
    // 21. Función para mostrar mensajes de error
    function mostrarMensajeError(mensaje) {
        // Verificar si ya existe un contenedor de alertas
        if ($('#alertas-container').length === 0) {
            $('<div id="alertas-container" class="mt-3"></div>').insertBefore('#form-renta');
        }
        
        // Crear alerta
        const alertaHTML = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                ${mensaje}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        $('#alertas-container').append(alertaHTML);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(function() {
            $('#alertas-container .alert:first').alert('close');
        }, 5000);
    }
    
    // 22. Agregar estilos CSS dinámicos para las validaciones
    $('<style>')
        .prop('type', 'text/css')
        .html(`
            .select2-container--default.is-invalid .selection .select2-selection {
                border-color: #dc3545;
            }
            .select2-container--default.is-valid .selection .select2-selection {
                border-color: #198754;
            }
            .garantia-requerida {
                color: #dc3545;
                font-size: 80%;
                margin-top: 0.25rem;
            }
        `)
        .appendTo('head');
    
    // Iniciar con un cliente
    $('#agregar-cliente').click();
    
    // Configurar eventos para productos iniciales que puedan estar en el DOM
    $('.producto-card').each(function() {
        configurarEventosProducto($(this));
    });
    
    // Si no hay productos iniciales, agregar uno
    if ($('#productos-container .producto-card').length === 0) {
        $('#agregar-producto').click();
    }
    
    // Agregar garantía inicial
    if ($('#garantias-container .garantia-card').length === 0) {
        const primeraGarantia = agregarGarantia(true);
        validarGarantia(primeraGarantia);
    }
    
    // Configurar eventos para garantías iniciales que puedan estar en el DOM
    $('#garantias-container .garantia-card').each(function() {
        configurarEventosGarantia($(this));
        validarGarantia($(this));
    });
    
    // Configurar eventos para clientes iniciales que puedan estar en el DOM
    $('#clientes-container .cliente-card').each(function() {
        configurarEventosCliente($(this));
    });
    
    // Actualizar garantías con los clientes actuales
    actualizarOpcionesClientesGarantias();
    
    // Calcular total inicial
    calcularTotal();
    
    // Exponer funciones globalmente para que puedan ser usadas desde otros scripts
    window.calcularSubtotal = calcularSubtotal;
    window.calcularTotal = calcularTotal;
    window.validarGarantia = validarGarantia;
    window.actualizarOpcionesClientesGarantias = actualizarOpcionesClientesGarantias;
});