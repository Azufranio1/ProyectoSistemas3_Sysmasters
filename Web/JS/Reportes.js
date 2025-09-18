function configurarLimitesFechas() {
    const fechaInicio = document.getElementById('fecha_inicio');
    const fechaFin = document.getElementById('fecha_fin');
    
    // Calcular las fechas límite
    const hoy = new Date();
    
    // Para fecha inicio: mínimo 6 meses atrás, máximo hace 2 semanas
    const minFechaInicio = new Date();
    minFechaInicio.setMonth(hoy.getMonth() - 6);
    
    const maxFechaInicio = new Date();
    maxFechaInicio.setDate(hoy.getDate() - 14); // 2 semanas atrás
    
    // Para fecha fin: mínimo hace 5 meses y 3 semanas, máximo hace 1 semana
    const minFechaFin = new Date();
    minFechaFin.setMonth(hoy.getMonth() - 5);
    minFechaFin.setDate(minFechaFin.getDate() - 21); // 3 semanas
    
    const maxFechaFin = new Date();
    maxFechaFin.setDate(hoy.getDate() - 7); // 1 semana atrás
    
    // Función para formatear fecha a YYYY-MM-DD
    function formatearFecha(fecha) {
        return fecha.toISOString().split('T')[0];
    }
    
    // Establecer límites para fecha inicio
    fechaInicio.min = formatearFecha(minFechaInicio);
    fechaInicio.max = formatearFecha(maxFechaInicio);
    
    // Establecer límites para fecha fin
    fechaFin.min = formatearFecha(minFechaFin);
    fechaFin.max = formatearFecha(maxFechaFin);
}

function validarFechas() {
    const fechaInicio = document.getElementById('fecha_inicio');
    const fechaFin = document.getElementById('fecha_fin');
    
    if (fechaInicio.value && fechaFin.value) {
        const inicio = new Date(fechaInicio.value);
        const fin = new Date(fechaFin.value);
        
        // Validar que fecha fin sea posterior a fecha inicio
        if (inicio >= fin) {
            alert('La fecha de fin debe ser posterior a la fecha de inicio');
            fechaFin.value = '';
            return false;
        }
        
        // Validar que la diferencia no sea mayor a 6 meses
        const diferenciaMeses = (fin.getFullYear() - inicio.getFullYear()) * 12 + 
                               (fin.getMonth() - inicio.getMonth());
        
        if (diferenciaMeses > 6) {
            alert('El rango de fechas no puede ser mayor a 6 meses');
            fechaFin.value = '';
            return false;
        }
    }
    
    return true;
}

function toggleFechaPersonalizada() {
    const rangoTiempo = document.getElementById('rango_tiempo').value;
    const fechaPersonalizada = document.getElementById('fechaPersonalizada');
    
    if (rangoTiempo === 'personalizado') {
        fechaPersonalizada.style.display = 'flex';
        document.getElementById('fecha_inicio').required = true;
        document.getElementById('fecha_fin').required = true;
        
        // Configurar límites de fechas
        configurarLimitesFechas();
    } else {
        fechaPersonalizada.style.display = 'none';
        document.getElementById('fecha_inicio').required = false;
        document.getElementById('fecha_fin').required = false;
    }
}

// Event listeners para validación en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    toggleFechaPersonalizada();
    toggleCategoriaFiltro();
    
    // Validar cuando cambie la fecha de inicio
    document.getElementById('fecha_inicio').addEventListener('change', function() {
        const fechaInicio = this.value;
        const fechaFinInput = document.getElementById('fecha_fin');
        
        if (fechaInicio) {
            // Actualizar el mínimo de fecha fin para que sea al día siguiente del inicio
            const minFechaFin = new Date(fechaInicio);
            minFechaFin.setDate(minFechaFin.getDate() + 1);
            
            // Pero respetando el límite global mínimo
            const hoy = new Date();
            const limiteMinimoGlobal = new Date();
            limiteMinimoGlobal.setMonth(hoy.getMonth() - 5);
            limiteMinimoGlobal.setDate(limiteMinimoGlobal.getDate() - 21);
            
            const fechaMinima = minFechaFin > limiteMinimoGlobal ? minFechaFin : limiteMinimoGlobal;
            fechaFinInput.min = fechaMinima.toISOString().split('T')[0];
            
            // Si la fecha fin actual es menor que el nuevo mínimo, limpiarla
            if (fechaFinInput.value && new Date(fechaFinInput.value) < fechaMinima) {
                fechaFinInput.value = '';
            }
        }
        
        validarFechas();
    });
    
    // Validar cuando cambie la fecha de fin
    document.getElementById('fecha_fin').addEventListener('change', function() {
        validarFechas();
    });
    
    // Validar antes de enviar el formulario
    document.querySelector('form').addEventListener('submit', function(e) {
        const rangoTiempo = document.getElementById('rango_tiempo').value;
        
        if (rangoTiempo === 'personalizado') {
            const fechaInicio = document.getElementById('fecha_inicio').value;
            const fechaFin = document.getElementById('fecha_fin').value;
            
            if (!fechaInicio || !fechaFin) {
                e.preventDefault();
                alert('Debe seleccionar ambas fechas para el rango personalizado');
                return false;
            }
            
            if (!validarFechas()) {
                e.preventDefault();
                return false;
            }
        }
    });
});

// Función auxiliar para mostrar mensajes de ayuda
function mostrarAyudaFechas() {
    const hoy = new Date();
    const hace6Meses = new Date();
    hace6Meses.setMonth(hoy.getMonth() - 6);
    
    const hace2Semanas = new Date();
    hace2Semanas.setDate(hoy.getDate() - 14);
    
    const hace5MesesY3Semanas = new Date();
    hace5MesesY3Semanas.setMonth(hoy.getMonth() - 5);
    hace5MesesY3Semanas.setDate(hace5MesesY3Semanas.getDate() - 21);
    
    const hace1Semana = new Date();
    hace1Semana.setDate(hoy.getDate() - 7);
    
    console.log('Límites de fechas:');
    console.log('Fecha inicio - Desde:', hace6Meses.toDateString(), 'Hasta:', hace2Semanas.toDateString());
    console.log('Fecha fin - Desde:', hace5MesesY3Semanas.toDateString(), 'Hasta:', hace1Semana.toDateString());
}
        
        function toggleCategoriaFiltro() {
            const tipoReporte = document.getElementById('tipo_reporte').value;
            const categoriaFiltro = document.getElementById('categoriaFiltro');
            
            if (tipoReporte === 'productos') {
                categoriaFiltro.style.display = 'flex';
            } else {
                categoriaFiltro.style.display = 'none';
            }
        }
        
        // Mostrar campos según selección inicial
        document.addEventListener('DOMContentLoaded', function() {
            toggleFechaPersonalizada();
            toggleCategoriaFiltro();
        });
        
        // Validar fechas
        document.getElementById('fecha_inicio').addEventListener('change', function() {
            const fechaInicio = this.value;
            const fechaFin = document.getElementById('fecha_fin');
            if (fechaInicio && fechaFin.value && fechaInicio > fechaFin.value) {
                fechaFin.value = fechaInicio;
            }
            fechaFin.min = fechaInicio;
        });