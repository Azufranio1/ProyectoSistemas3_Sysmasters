$(document).ready(function() {
    // Variables para controlar índices
    let clienteIndex = 0;
    let productoIndex = 0;
    let garantiaIndex = 0;
    
    // Inicializar Select2
    $('.producto-select').select2();
    $('.cliente-garantia-select').select2();
    
    // Función para validar nombres y apellidos
    function validarNombreApellido(input) {
        const valor = input.val().trim();
        const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/; // Solo letras, sin espacios ni caracteres especiales
        const esValido = regex.test(valor) && valor.length >= 3 && valor.length <= 15;
        
        if (esValido) {
            input.removeClass('is-invalid');
            input.parent().find('.check-icon').css('display', 'block');
            input.parent().find('.validation-error').css('display', 'none');
            return true;
        } else {
            input.addClass('is-invalid');
            input.parent().find('.check-icon').css('display', 'none');
            input.parent().find('.validation-error').css('display', 'block');
            return false;
        }
    }
    
    // Función para validar garantías - CORREGIDA
    function validarGarantia(input) {
    const valor = input.val().trim();
    
    // Regex que acepta: letras (con acentos), números, espacios, punto, coma, punto y coma, paréntesis
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,;()]+$/;
    
    // Validaciones
    const tieneCaracteresValidos = regex.test(valor);
    const tieneLongitudValida = valor.length >= 3 && valor.length <= 20;
    const noEstaVacio = valor.length > 0;
    
    const esValido = tieneCaracteresValidos && tieneLongitudValida && noEstaVacio;
    
    if (esValido) {
        input.removeClass('is-invalid');
        input.parent().find('.check-icon').css('display', 'block');
        input.parent().find('.validation-error').css('display', 'none');
        return true;
    } else {
        input.addClass('is-invalid');
        input.parent().find('.check-icon').css('display', 'none');
        input.parent().find('.validation-error').css('display', 'block');
        return false;
    }
}


    function validarProducto(productoCard) {
    const productoSelect = productoCard.find('.producto-select');
    const cantidadInput = productoCard.find('.cantidad-producto');
    
    const productoSeleccionado = productoSelect.val();
    const cantidadValue = cantidadInput.val();
    const cantidadNum = parseInt(cantidadValue);
    
    const productoValido = productoSeleccionado !== '' && productoSeleccionado !== null;
    const cantidadValida = cantidadValue !== '' && !isNaN(cantidadNum) && cantidadNum > 0;
    
    const esValido = productoValido && cantidadValida;
    
    const errorContainer = productoCard.find('.validation-error-producto');
    
    if (esValido) {
        productoCard.removeClass('producto-invalid');
        errorContainer.hide();
        return true;
    } else {
        productoCard.addClass('producto-invalid');
        
        let mensaje = 'Complete los datos: ';
        let errores = [];
        
        if (!productoValido) errores.push('seleccione un producto');
        if (!cantidadValida) errores.push('ingrese cantidad válida');
        
        mensaje += errores.join(', ');
        errorContainer.text(mensaje).show();
        return false;
    }
}
    
    function validarGarantiaCompleta(garantiaCard) {
    const tipoInput = garantiaCard.find('.tipo-garantia-input');
    const clienteSelect = garantiaCard.find('.cliente-garantia-select');
    
    const tipoValido = validarGarantia(tipoInput);
    const clienteValido = clienteSelect.val() !== '';
    
    const esValido = tipoValido && clienteValido;
    
    const errorContainer = garantiaCard.find('.validation-error-garantia');
    
    if (esValido) {
        garantiaCard.removeClass('garantia-invalid');
        errorContainer.hide();
        return true;
    } else {
        garantiaCard.addClass('garantia-invalid');
        
        let mensaje = 'Complete los datos: ';
        let errores = [];
        
        if (!tipoValido) errores.push('tipo de garantía válido');
        if (!clienteValido) errores.push('seleccione un cliente');
        
        mensaje += errores.join(', ');
        errorContainer.text(mensaje).show();
        return false;
    }
}

    // Función para validar teléfono
    function validarTelefono(input) {
        const valor = input.val().trim();
        const regex = /^[5-7][0-9]{7}$/; // Primer dígito 5, 6 o 7, seguido de 7 dígitos más
        const esValido = regex.test(valor);
        
        if (esValido) {
            input.removeClass('is-invalid');
            input.parent().find('.check-icon').css('display', 'block');
            input.parent().find('.validation-error').css('display', 'none');
            return true;
        } else {
            input.addClass('is-invalid');
            input.parent().find('.check-icon').css('display', 'none');
            input.parent().find('.validation-error').css('display', 'block');
            return false;
        }
    }
    
    // Función para filtrar caracteres no permitidos en nombres y apellidos
    function filtrarCaracteresNombreApellido(input) {
        let valor = input.val();
        // Remover caracteres que no sean letras (incluyendo acentos y ñ)
        valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
        input.val(valor);
    }
    
    // Función para filtrar caracteres no permitidos en garantías
    function filtrarCaracteresGarantia(input) {
        let valor = input.val();
        // Permitir letras (con acentos), números, espacios, punto, coma, punto y coma, paréntesis
        valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,;()]/g, '');
        input.val(valor);
    }
    
    // Función para filtrar solo números en teléfono
    function filtrarNumeros(input) {
        let valor = input.val();
        valor = valor.replace(/[^0-9]/g, '');
        input.val(valor);
    }
    
    // Validación en tiempo real para nombre - MEJORADA
    $(document).on('input', '.nombre-cliente', function() {
        filtrarCaracteresNombreApellido($(this));
        validarNombreApellido($(this));
        actualizarSelectClientesGarantia();
    });
    
    // Aplicar trim al perder el foco en nombre - CORREGIDO
    $(document).on('blur', '.nombre-cliente', function() {
        const valorTrimmed = $(this).val().trim();
        $(this).val(valorTrimmed);
        validarNombreApellido($(this));
        actualizarSelectClientesGarantia();
    });
    
    // Validación en tiempo real para apellido - MEJORADA
    $(document).on('input', '.apellido-cliente', function() {
        filtrarCaracteresNombreApellido($(this));
        validarNombreApellido($(this));
        actualizarSelectClientesGarantia();
    });
    
    // Aplicar trim al perder el foco en apellido - CORREGIDO
    $(document).on('blur', '.apellido-cliente', function() {
        const valorTrimmed = $(this).val().trim();
        $(this).val(valorTrimmed);
        validarNombreApellido($(this));
        actualizarSelectClientesGarantia();
    });
    
    // Validación en tiempo real para teléfono - MEJORADA
    $(document).on('input', '.telefono-cliente', function() {
        filtrarNumeros($(this));
        validarTelefono($(this));
        actualizarSelectClientesGarantia();
    });
    
    // Aplicar trim al perder el foco en teléfono - CORREGIDO
    $(document).on('blur', '.telefono-cliente', function() {
        const valorTrimmed = $(this).val().trim();
        $(this).val(valorTrimmed);
        validarTelefono($(this));
        actualizarSelectClientesGarantia();
    });
    
    // Validación en tiempo real para garantías - CORREGIDA Y MEJORADA
    $(document).on('input', 'input[name^="garantias"][name$="[tipo]"], .tipo-garantia-input', function() {
        console.log('Filtrando garantía:', $(this).val()); // Debug
        filtrarCaracteresGarantia($(this));
        validarGarantia($(this));
    });
    
    // Aplicar trim al perder el foco en garantías - CORREGIDO
    $(document).on('blur', 'input[name^="garantias"][name$="[tipo]"], .tipo-garantia-input', function() {
        console.log('Blur garantía:', $(this).val()); // Debug
        const valorTrimmed = $(this).val().trim();
        $(this).val(valorTrimmed);
        validarGarantia($(this));
    });

    $(document).on('change', '.producto-select, .cantidad-producto', function() {
        const productoCard = $(this).closest('.producto-card');
        validarProducto(productoCard);
    });

    $(document).on('input', '.cantidad-producto', function() {
        const productoCard = $(this).closest('.producto-card');
        validarProducto(productoCard);
    });

    $(document).on('input blur', '.tipo-garantia-input', function() {
        const garantiaCard = $(this).closest('.garantia-card');
        setTimeout(() => validarGarantiaCompleta(garantiaCard), 100);
    });

    $(document).on('change', '.cliente-garantia-select', function() {
        const garantiaCard = $(this).closest('.garantia-card');
        validarGarantiaCompleta(garantiaCard);
    });
    
    // Actualizar información del producto y calcular subtotal
    $(document).on('change', '.producto-select', function() {
    console.log('Producto select changed'); // Debug
    const productoCard = $(this).closest('.producto-card');
    setTimeout(() => {
        validarProducto(productoCard);
    }, 100);
});

$(document).on('input change', '.cantidad-producto', function() {
    console.log('Cantidad changed'); // Debug
    const productoCard = $(this).closest('.producto-card');
    setTimeout(() => {
        validarProducto(productoCard);
    }, 100);
});

$(document).on('change', '.producto-select', function() {
    $(this).removeClass('is-invalid');
    const productoCard = $(this).closest('.producto-card');
    productoCard.find('.validation-error-producto').hide();
    
    // Actualizar información del producto
    const selected = $(this).find('option:selected');
    const index = productoCard.data('index');
    
    if (selected.val()) {
        const info = {
            nombre: selected.data('nombre'),
            categoria: selected.data('categoria'),
            color: selected.data('color'),
            disponible: selected.data('disponible'),
            precio: selected.data('precio')
        };
        
        // Mostrar información del producto
        const infoDiv = productoCard.find('.producto-info');
        infoDiv.find('.info-nombre').text(info.nombre);
        infoDiv.find('.info-categoria').text(info.categoria);
        infoDiv.find('.info-color').text(info.color);
        infoDiv.find('.info-disponible').text(info.disponible);
        infoDiv.show();
        
        // Actualizar límite de cantidad
        const cantidadInput = productoCard.find('.cantidad-producto');
        cantidadInput.attr('max', info.disponible);
        
        // Calcular subtotal si hay cantidad
        const cantidad = parseInt(cantidadInput.val()) || 1;
        if (cantidad > info.disponible) {
            cantidadInput.val(info.disponible);
        }
        
        const subtotal = (parseInt(cantidadInput.val()) || 1) * info.precio;
        productoCard.find('.subtotal-producto').val(subtotal);
        
        calcularTotales();
    } else {
        // Ocultar información y limpiar subtotal
        productoCard.find('.producto-info').hide();
        productoCard.find('.subtotal-producto').val('');
        calcularTotales();
    }
});

// Limpiar estilos de error cuando se cambia la cantidad
$(document).on('input change', '.cantidad-producto', function() {
    const valor = parseInt($(this).val());
    if (valor > 0) {
        $(this).removeClass('is-invalid');
    }
    
    const productoCard = $(this).closest('.producto-card');
    productoCard.find('.validation-error-producto').hide();
});

// Validación en tiempo real más estricta
$(document).on('blur', '.producto-select', function() {
    if (!$(this).val()) {
        $(this).addClass('is-invalid');
    }
});

$(document).on('blur', '.cantidad-producto', function() {
    const valor = parseInt($(this).val());
    if (!valor || valor <= 0) {
        $(this).addClass('is-invalid');
    }
});
    
    // Actualizar subtotal cuando cambia la cantidad
    $(document).on('input', '.cantidad-producto', function() {
        const productoCard = $(this).closest('.producto-card');
        const index = productoCard.data('index');
        const productoSelect = productoCard.find('.producto-select');
        const selected = productoSelect.find('option:selected');
        
        if (selected.val()) {
            const precio = selected.data('precio');
            const disponible = selected.data('disponible');
            
            // Asegurar que la cantidad no exceda el disponible
            let cantidad = parseInt($(this).val()) || 0;
            if (cantidad > disponible) {
                cantidad = disponible;
                $(this).val(disponible);
            }
            
            // Calcular subtotal
            const subtotal = cantidad * precio;
            $(`#subtotal_${index}`).val(subtotal);
            
            // Actualizar totales
            calcularTotales();
        }
    });
    
    // Calcular totales generales
    function calcularTotales() {
        let subtotalGeneral = 0;
        
        $('.subtotal-producto').each(function() {
            const valor = parseInt($(this).val()) || 0;
            subtotalGeneral += valor;
        });
        
        $('#subtotal').val(subtotalGeneral);
        
        const descuento = parseInt($('#descuento').val()) || 0;
        const totalGeneral = subtotalGeneral - descuento;
        
        $('#total').val(totalGeneral);
    }
    
    // Agregar cliente - VALIDACIÓN MEJORADA
    $('#agregar-cliente').click(function() {
        // Verificar si el último cliente tiene datos válidos
        const ultimoCliente = $('.cliente-card').last();
        if (ultimoCliente.length > 0) {
            const nombreInput = ultimoCliente.find('.nombre-cliente');
            const apellidoInput = ultimoCliente.find('.apellido-cliente');
            const telefonoInput = ultimoCliente.find('.telefono-cliente');
            
            // Aplicar trim antes de validar
            nombreInput.val(nombreInput.val().trim());
            apellidoInput.val(apellidoInput.val().trim());
            telefonoInput.val(telefonoInput.val().trim());
            
            const nombreValido = validarNombreApellido(nombreInput);
            const apellidoValido = validarNombreApellido(apellidoInput);
            const telefonoValido = validarTelefono(telefonoInput);
            
            if (!nombreValido || !apellidoValido || !telefonoValido) {
                alert('Por favor, complete correctamente los datos del cliente actual antes de agregar otro.');
                return;
            }
            
            // Mostrar botón de eliminar en el cliente anterior
            ultimoCliente.find('.remove-cliente').show();
        }
        
        // Incrementar índice
        clienteIndex++;
        
        // Crear nuevo cliente
        const nuevoCliente = `
            <div class="cliente-card" data-index="${clienteIndex}">
                <div class="remove-cliente">&times;</div>
                <div class="input-group">
                    <div class="form-group">
                        <label for="nombre_${clienteIndex}">Nombre</label>
                        <input type="text" id="nombre_${clienteIndex}" name="clientes[${clienteIndex}][nombre]" class="form-control nombre-cliente" required maxlength="15">
                        <span class="check-icon">✓</span>
                        <div class="validation-error">Ingrese solo letras (3-15 caracteres)</div>
                    </div>
                    <div class="form-group">
                        <label for="apellido_${clienteIndex}">Apellido</label>
                        <input type="text" id="apellido_${clienteIndex}" name="clientes[${clienteIndex}][apellido]" class="form-control apellido-cliente" required maxlength="15">
                        <span class="check-icon">✓</span>
                        <div class="validation-error">Ingrese solo letras (3-15 caracteres)</div>
                    </div>
                    <div class="form-group">
                        <label for="telefono_${clienteIndex}">Teléfono</label>
                        <input type="text" min="59999999" max="79999999" id="telefono_${clienteIndex}" name="clientes[${clienteIndex}][telefono]" class="form-control telefono-cliente" required maxlength="8">
                        <span class="check-icon">✓</span>
                        <div class="validation-error">Ingrese un número de teléfono boliviano válido de 8 dígitos</div>
                    </div>
                </div>
            </div>
        `;
        
        $('#clientes-container').append(nuevoCliente);
    });
    
    // Agregar producto - VALIDACIÓN CORREGIDA
$('#agregar-producto').click(function() {
    console.log('Botón agregar producto clickeado');
    
    // Verificar si hay productos existentes
    const productosExistentes = $('.producto-card');
    
    if (productosExistentes.length > 0) {
        // Obtener el último producto
        const ultimoProducto = productosExistentes.last();
        const productoSelect = ultimoProducto.find('.producto-select');
        const cantidadInput = ultimoProducto.find('.cantidad-producto');
        
        console.log('Validando último producto...');
        console.log('Producto seleccionado:', productoSelect.val());
        console.log('Cantidad:', cantidadInput.val());
        
        // Validación más estricta
        const tieneProductoSeleccionado = productoSelect.val() !== null && productoSelect.val() !== '' && productoSelect.val() !== undefined;
        const cantidadValue = cantidadInput.val();
        const tieneCantidadValida = cantidadValue !== '' && cantidadValue !== null && !isNaN(cantidadValue) && parseInt(cantidadValue) > 0;
        
        if (!tieneProductoSeleccionado || !tieneCantidadValida) {
            console.log('Validación falló');
            let mensaje = 'Complete el producto actual:\n';
            let errores = [];
            
            if (!tieneProductoSeleccionado) errores.push('• Seleccione un producto');
            if (!tieneCantidadValida) errores.push('• Ingrese una cantidad válida mayor a 0');
            
            mensaje += errores.join('\n');
            alert(mensaje);
            
            // Marcar visualmente el error
            if (!tieneProductoSeleccionado) {
                productoSelect.addClass('is-invalid');
            }
            if (!tieneCantidadValida) {
                cantidadInput.addClass('is-invalid');
            }
            
            return false;
        }
        
        // Si llegamos aquí, el producto está válido
        ultimoProducto.find('.remove-producto').show();
        console.log('Producto anterior validado correctamente');
    }
    
    // Incrementar índice
    productoIndex++;
    console.log('Creando producto con índice:', productoIndex);
    
    // Obtener todas las opciones de productos del primer select
    let opcionesProductos = '';
    const primerSelect = $('.producto-select').first();
    
    if (primerSelect.length > 0) {
        primerSelect.find('option').each(function() {
            let option = $(this);
            opcionesProductos += `<option value="${option.val()}" 
                                    data-nombre="${option.data('nombre') || ''}"
                                    data-categoria="${option.data('categoria') || ''}"
                                    data-color="${option.data('color') || ''}"
                                    data-precio="${option.data('precio') || ''}"
                                    data-disponible="${option.data('disponible') || ''}">
                                    ${option.text()}
                                  </option>`;
        });
    }
    
    // Crear nuevo producto
    const nuevoProducto = `
        <div class="producto-card" data-index="${productoIndex}">
            <div class="remove-producto" style="display: none;">&times;</div>
            <div class="input-group">
                <div class="form-group">
                    <label for="producto_${productoIndex}">Producto</label>
                    <select id="producto_${productoIndex}" name="productos[${productoIndex}][producto_id]" class="form-select producto-select" required>
                        ${opcionesProductos}
                    </select>
                </div>
                <div class="form-group">
                    <label for="cantidad_${productoIndex}">Cantidad</label>
                    <input type="number" id="cantidad_${productoIndex}" name="productos[${productoIndex}][cantidad]" class="form-control cantidad-producto" min="1" value="1" required>
                </div>
                <div class="form-group">
                    <label>Subtotal</label>
                    <div class="input-group">
                        <span style="padding: 14px 5px 0 0;">Bs.</span>
                        <input type="text" id="subtotal_${productoIndex}" name="productos[${productoIndex}][subtotal]" class="form-control subtotal-producto" readonly>
                    </div>
                </div>
            </div>
            <div class="validation-error-producto" style="color: red; font-size: 0.875em; margin-top: 5px; display: none;"></div>
            <div class="producto-info" id="info_producto_${productoIndex}" style="display: none;">
                <p><strong>Producto:</strong> <span class="info-nombre"></span></p>
                <p><strong>Categoría:</strong> <span class="info-categoria"></span></p>
                <p><strong>Color:</strong> <span class="info-color"></span></p>
                <p><strong>Disponibilidad:</strong> <span class="info-disponible"></span> unidades</p>
            </div>
        </div>
    `;
    
    $('#productos-container').append(nuevoProducto);
    
    // Inicializar Select2 para el nuevo producto
    $(`#producto_${productoIndex}`).select2();
    
    console.log('Producto agregado exitosamente con índice:', productoIndex);
});
    
    // Agregar garantía - VALIDACIÓN MEJORADA
    $('#agregar-garantia').click(function() {
        // Verificar si hay clientes registrados
        if ($('.cliente-card').length === 0) {
            alert('Debe agregar al menos un cliente antes de agregar una garantía.');
            return;
        }
        
        // Verificar si la última garantía tiene datos válidos (si existe alguna)
        const ultimaGarantia = $('.garantia-card').last();
        if (ultimaGarantia.length > 0) {
            const tipoInput = ultimaGarantia.find('input[name^="garantias"][name$="[tipo]"], .tipo-garantia-input');
            const clienteSelect = ultimaGarantia.find('select[name^="garantias"][name$="[cliente_id]"]');
            
            // Aplicar trim antes de validar
            tipoInput.val(tipoInput.val().trim());
            
            const tipoValido = validarGarantia(tipoInput);
            const clienteValido = clienteSelect.val() !== '';
            
            if (!tipoValido || !clienteValido) {
                alert('Por favor, complete correctamente los datos de la garantía actual antes de agregar otra.');
                return;
            }
            
            // Mostrar botón de eliminar en la garantía anterior
            ultimaGarantia.find('.remove-garantia').show();
        }
        
        // Incrementar índice
        garantiaIndex++;
        
        // Crear nueva garantía
        const nuevaGarantia = `
            <div class="garantia-card" data-index="${garantiaIndex}">
                <div class="remove-garantia">&times;</div>
                <div class="input-group">
                    <div class="form-group">
                        <label for="tipo_garantia_${garantiaIndex}">Tipo de Garantía</label>
                        <input type="text" id="tipo_garantia_${garantiaIndex}" name="garantias[${garantiaIndex}][tipo]" class="form-control tipo-garantia-input" required maxlength="20">
                        <span class="check-icon">✓</span>
                        <div class="validation-error">Ingrese solo letras y espacios (3-20 caracteres)</div>
                    </div>
                    <div class="form-group">
                        <label for="cliente_garantia_${garantiaIndex}">Cliente que deja la garantía</label>
                        <select id="cliente_garantia_${garantiaIndex}" name="garantias[${garantiaIndex}][cliente_id]" class="form-select cliente-garantia-select" required>
                            <option value="">Seleccione un cliente</option>
                        </select>
                    </div>
                </div>
                <div class="validation-error-garantia" style="color: red; font-size: 0.875em; margin-top: 5px; display: none;"></div>
            </div>
        `;
        
        $('#garantias-container').append(nuevaGarantia);
        $(`#cliente_garantia_${garantiaIndex}`).select2();
        
        // Actualizar opciones de clientes en el selector de garantías
        actualizarSelectClientesGarantia();
    });
    
    // Eliminar cliente
    $(document).on('click', '.remove-cliente', function() {
        $(this).closest('.cliente-card').remove();
        
        // Si solo queda un cliente, ocultar su botón de eliminar
        if ($('.cliente-card').length === 1) {
            $('.cliente-card').find('.remove-cliente').hide();
        }
        
        // Actualizar índices de los clientes restantes
        $('.cliente-card').each(function(i) {
            const nuevoIndice = i;
            $(this).attr('data-index', nuevoIndice);
            $(this).find('.nombre-cliente').attr('id', `nombre_${nuevoIndice}`).attr('name', `clientes[${nuevoIndice}][nombre]`);
            $(this).find('.apellido-cliente').attr('id', `apellido_${nuevoIndice}`).attr('name', `clientes[${nuevoIndice}][apellido]`);
            $(this).find('.telefono-cliente').attr('id', `telefono_${nuevoIndice}`).attr('name', `clientes[${nuevoIndice}][telefono]`);
        });
        
        // Actualizar dropdown de clientes para garantías
        actualizarSelectClientesGarantia();
    });
    
    // Eliminar producto
    $(document).on('click', '.remove-producto', function() {
        $(this).closest('.producto-card').remove();
        
        // Si solo queda un producto, ocultar su botón de eliminar
        if ($('.producto-card').length === 1) {
            $('.producto-card').find('.remove-producto').hide();
        }
        
        // Actualizar índices de los productos restantes
        $('.producto-card').each(function(i) {
            const nuevoIndice = i;
            $(this).attr('data-index', nuevoIndice);
            $(this).find('.producto-select').attr('id', `producto_${nuevoIndice}`).attr('name', `productos[${nuevoIndice}][producto_id]`);
            $(this).find('.cantidad-producto').attr('id', `cantidad_${nuevoIndice}`).attr('name', `productos[${nuevoIndice}][cantidad]`);
            $(this).find('.subtotal-producto').attr('id', `subtotal_${nuevoIndice}`).attr('name', `productos[${nuevoIndice}][subtotal]`);
            $(this).find('.producto-info').attr('id', `info_producto_${nuevoIndice}`);
        });
        
        // Recalcular totales
        calcularTotales();
    });
    
    // Eliminar garantía
    $(document).on('click', '.remove-garantia', function() {
        $(this).closest('.garantia-card').remove();
        
        // Si solo queda una garantía, ocultar su botón de eliminar
        if ($('.garantia-card').length === 1) {
            $('.garantia-card').find('.remove-garantia').hide();
        }
        
        // Actualizar índices de las garantías restantes
        $('.garantia-card').each(function(i) {
            const nuevoIndice = i;
            $(this).attr('data-index', nuevoIndice);
            $(this).find('input[name^="garantias"]').attr('id', `tipo_garantia_${nuevoIndice}`).attr('name', `garantias[${nuevoIndice}][tipo]`);
            $(this).find('select[name^="garantias"]').attr('id', `cliente_garantia_${nuevoIndice}`).attr('name', `garantias[${nuevoIndice}][cliente_id]`);
        });
    });
    
    // Actualizar el select de clientes para garantías - MEJORADO
    function actualizarSelectClientesGarantia() {
        let clientesValidos = [];
        
        // Recorrer todos los clientes con datos válidos
        $('.cliente-card').each(function() {
            const index = $(this).data('index');
            const nombreInput = $(this).find('.nombre-cliente');
            const apellidoInput = $(this).find('.apellido-cliente');
            const telefonoInput = $(this).find('.telefono-cliente');
            
            // Aplicar trim antes de validar
            const nombreTrimmed = nombreInput.val().trim();
            const apellidoTrimmed = apellidoInput.val().trim();
            const telefonoTrimmed = telefonoInput.val().trim();
            
            // Actualizar valores con trim
            nombreInput.val(nombreTrimmed);
            apellidoInput.val(apellidoTrimmed);
            telefonoInput.val(telefonoTrimmed);
            
            const nombreValido = validarNombreApellido(nombreInput);
            const apellidoValido = validarNombreApellido(apellidoInput);
            const telefonoValido = validarTelefono(telefonoInput);
            
            if (nombreValido && apellidoValido && telefonoValido) {
                clientesValidos.push({
                    index: index,
                    nombre: nombreTrimmed,
                    apellido: apellidoTrimmed,
                    texto: `${nombreTrimmed} ${apellidoTrimmed}`
                });
            }
        });
        
        // Actualizar los selectores de clientes en garantías
        $('.cliente-garantia-select').each(function() {
            const selectedValue = $(this).val();
            
            // Limpiar opciones actuales
            $(this).empty();
            
            // Agregar opción por defecto
            $(this).append('<option value="">Seleccione un cliente</option>');
            
            // Si no hay clientes válidos, deshabilitar el selector
            if (clientesValidos.length === 0) {
                $(this).append('<option value="">Primero agregue un cliente</option>');
                $(this).prop('disabled', true);
            } else {
                // Agregar los clientes válidos
                clientesValidos.forEach(function(cliente) {
                    $(this).append(`<option value="${cliente.index}">${cliente.texto}</option>`);
                }.bind(this));
                
                // Habilitar el selector
                $(this).prop('disabled', false);
            }
            
            // Restaurar valor seleccionado si existe
            if (selectedValue && $(this).find(`option[value="${selectedValue}"]`).length > 0) {
                $(this).val(selectedValue);
            }
            
            // Actualizar Select2
            $(this).trigger('change');
        });
    }
    
    // Actualizar totales cuando cambia el descuento
    $('#descuento').on('input', function() {
        calcularTotales();
    });
    
    // Validación final del formulario antes de enviar - MEJORADA
    $('#rentaForm').on('submit', function(e) {
        // Verificar que haya al menos un cliente
        if ($('.cliente-card').length === 0) {
            e.preventDefault();
            alert('Debe agregar al menos un cliente.');
            return false;
        }
        
        // Verificar que todos los clientes tengan datos válidos
        let clientesValidos = true;
        $('.cliente-card').each(function() {
            const nombreInput = $(this).find('.nombre-cliente');
            const apellidoInput = $(this).find('.apellido-cliente');
            const telefonoInput = $(this).find('.telefono-cliente');
            
            // Aplicar trim antes de validar
            nombreInput.val(nombreInput.val().trim());
            apellidoInput.val(apellidoInput.val().trim());
            telefonoInput.val(telefonoInput.val().trim());
            
            const nombreValido = validarNombreApellido(nombreInput);
            const apellidoValido = validarNombreApellido(apellidoInput);
            const telefonoValido = validarTelefono(telefonoInput);
            
            if (!nombreValido || !apellidoValido || !telefonoValido) {
                clientesValidos = false;
            }
        });
        
        if (!clientesValidos) {
            e.preventDefault();
            alert('Por favor, corrija los datos de los clientes.');
            return false;
        }
        
        // Verificar que haya al menos un producto
        if ($('.producto-card').length === 0) {
            e.preventDefault();
            alert('Debe agregar al menos un producto.');
            return false;
        }
        
        // Verificar que todos los productos tengan datos válidos
        let productosValidos = true;
        $('.producto-card').each(function() {
            const productoSelect = $(this).find('.producto-select');
            const cantidadInput = $(this).find('.cantidad-producto');
            
            if (!productoSelect.val() || cantidadInput.val() <= 0) {
                productosValidos = false;
            }
        });
        
        if (!productosValidos) {
            e.preventDefault();
            alert('Por favor, corrija los datos de los productos.');
            return false;
        }
        
        // Verificar que todas las garantías tengan datos válidos si existen
        if ($('.garantia-card').length > 0) {
            let garantiasValidas = true;
            $('.garantia-card').each(function() {
                const tipoInput = $(this).find('input[name^="garantias"][name$="[tipo]"], .tipo-garantia-input');
                const clienteSelect = $(this).find('select[name^="garantias"][name$="[cliente_id]"]');
                
                // Aplicar trim antes de validar
                tipoInput.val(tipoInput.val().trim());
                
                const tipoValido = validarGarantia(tipoInput);
                const clienteValido = clienteSelect.val() !== '';
                
                if (!tipoValido || !clienteValido) {
                    garantiasValidas = false;
                }
            });
            
            if (!garantiasValidas) {
                e.preventDefault();
                alert('Por favor, corrija los datos de las garantías.');
                return false;
            }
        }
        
        // Verificar que el total sea mayor que cero
        const total = parseInt($('#total').val()) || 0;
        if (total <= 0) {
            e.preventDefault();
            alert('El total a pagar debe ser mayor que cero.');
            return false;
        }
        
        // Formulario válido
        return true;
    });
    
    // Inicializar subtotales y totales al cargar
    calcularTotales();
    
    // Inicializar validación de cliente inicial
    actualizarSelectClientesGarantia();
});