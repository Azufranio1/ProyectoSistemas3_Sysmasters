// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de búsqueda cargado correctamente');

    // Obtener referencia al campo de búsqueda
    const searchInput = document.getElementById('search-input');
    
    // Verificar si encontramos el elemento
    if (!searchInput) {
        console.error('No se encontró el elemento search-input');
        return;
    }
    
    console.log('Elemento de búsqueda encontrado, añadiendo event listener');
    
    // Agregar evento de entrada para filtrar la tabla cada vez que se escriba
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        filterTable(searchTerm);
    });
    
    /**
     * Filtra la tabla de productos según el término de búsqueda
     * @param {string} searchTerm - Término de búsqueda ingresado por el usuario
     */
    function filterTable(searchTerm) {
        console.log('Filtrando por:', searchTerm);
        
        // Obtener todas las filas de la tabla de productos
        const rows = document.querySelectorAll('#empleados-list tr');
        console.log('Filas encontradas:', rows.length);
        
        // Iterar sobre cada fila para mostrar u ocultar según coincidencia
        rows.forEach(row => {
            // Solo procesamos si tiene celdas (para evitar filas de "No hay productos")
            if (row.cells.length > 1) {
                const nombre = row.cells[0].textContent.toLowerCase();
                const categoria = row.cells[1].textContent.toLowerCase();
                const color = row.cells[2].textContent.toLowerCase();
                
                // Buscar coincidencia en nombre, categoría o color
                if (nombre.includes(searchTerm) || 
                    categoria.includes(searchTerm) || 
                    color.includes(searchTerm)) {
                    row.style.display = ''; // Mostrar fila
                } else {
                    row.style.display = 'none'; // Ocultar fila
                }
            } else {
                // Si no hay productos o es una fila de mensaje, mantenerla visible
                const mensajeNoProductos = row.textContent.includes('No hay productos');
                row.style.display = searchTerm === '' || mensajeNoProductos ? '' : 'none';
            }
        });
        
        // Mostrar mensaje cuando no hay resultados
        showNoResultsMessage(rows);
    }
    
    /**
     * Muestra un mensaje cuando no hay resultados que coincidan con la búsqueda
     * @param {NodeList} rows - Lista de filas de la tabla
     */
    function showNoResultsMessage(rows) {
        // Verificar si hay alguna fila visible
        let visibleRowCount = 0;
        rows.forEach(row => {
            if (row.style.display !== 'none') {
                visibleRowCount++;
            }
        });
        
        // Si no hay filas visibles y la tabla no tiene ya un mensaje de "no hay resultados"
        const tbody = document.getElementById('empleados-list');
        const noResultsRow = document.getElementById('no-results-row');
        
        if (visibleRowCount === 0) {
            // Si no existe ya una fila de "no hay resultados", créala
            if (!noResultsRow) {
                const newRow = document.createElement('tr');
                newRow.id = 'no-results-row';
                newRow.innerHTML = `<td colspan="6" class="text-center py-4">No se encontraron productos que coincidan con la búsqueda</td>`;
                tbody.appendChild(newRow);
            } else {
                noResultsRow.style.display = ''; // Mostrar el mensaje existente
            }
        } else if (noResultsRow) {
            // Si hay resultados y existe la fila de "no hay resultados", ocultarla
            noResultsRow.style.display = 'none';
        }
    }
});// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de búsqueda cargado correctamente');

    // Obtener referencia al campo de búsqueda
    const searchInput = document.getElementById('search-input');
    
    // Verificar si encontramos el elemento
    if (!searchInput) {
        console.error('No se encontró el elemento search-input');
        return;
    }
    
    console.log('Elemento de búsqueda encontrado, añadiendo event listener');
    
    // Agregar evento de entrada para filtrar la tabla cada vez que se escriba
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        filterTable(searchTerm);
    });
    
    /**
     * Filtra la tabla de productos según el término de búsqueda
     * @param {string} searchTerm - Término de búsqueda ingresado por el usuario
     */
    function filterTable(searchTerm) {
        console.log('Filtrando por:', searchTerm);
        
        // Obtener todas las filas de la tabla de productos
        const rows = document.querySelectorAll('#empleados-list tr');
        console.log('Filas encontradas:', rows.length);
        
        // Iterar sobre cada fila para mostrar u ocultar según coincidencia
        rows.forEach(row => {
            // Solo procesamos si tiene celdas (para evitar filas de "No hay productos")
            if (row.cells.length > 1) {
                const nombre = row.cells[0].textContent.toLowerCase();
                const categoria = row.cells[1].textContent.toLowerCase();
                const color = row.cells[2].textContent.toLowerCase();
                
                // Buscar coincidencia en nombre, categoría o color
                if (nombre.includes(searchTerm) || 
                    categoria.includes(searchTerm) || 
                    color.includes(searchTerm)) {
                    row.style.display = ''; // Mostrar fila
                } else {
                    row.style.display = 'none'; // Ocultar fila
                }
            } else {
                // Si no hay productos o es una fila de mensaje, mantenerla visible
                const mensajeNoProductos = row.textContent.includes('No hay productos');
                row.style.display = searchTerm === '' || mensajeNoProductos ? '' : 'none';
            }
        });
        
        // Mostrar mensaje cuando no hay resultados
        showNoResultsMessage(rows);
    }
    
    /**
     * Muestra un mensaje cuando no hay resultados que coincidan con la búsqueda
     * @param {NodeList} rows - Lista de filas de la tabla
     */
    function showNoResultsMessage(rows) {
        // Verificar si hay alguna fila visible
        let visibleRowCount = 0;
        rows.forEach(row => {
            if (row.style.display !== 'none') {
                visibleRowCount++;
            }
        });
        
        // Si no hay filas visibles y la tabla no tiene ya un mensaje de "no hay resultados"
        const tbody = document.getElementById('empleados-list');
        const noResultsRow = document.getElementById('no-results-row');
        
        if (visibleRowCount === 0) {
            // Si no existe ya una fila de "no hay resultados", créala
            if (!noResultsRow) {
                const newRow = document.createElement('tr');
                newRow.id = 'no-results-row';
                newRow.innerHTML = `<td colspan="6" class="text-center py-4">No se encontraron productos que coincidan con la búsqueda</td>`;
                tbody.appendChild(newRow);
            } else {
                noResultsRow.style.display = ''; // Mostrar el mensaje existente
            }
        } else if (noResultsRow) {
            // Si hay resultados y existe la fila de "no hay resultados", ocultarla
            noResultsRow.style.display = 'none';
        }
    }
});