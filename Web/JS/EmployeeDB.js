// Después de cargar la página, hacemos un intento agresivo de buscar y activar la búsqueda
window.addEventListener('load', function() {
    // Si estamos en la página de productos, inicializar la búsqueda
    if (window.location.href.includes('GestionarProductos') || 
        document.title.includes('Productos') || 
        document.querySelector('.main-content h1, .main-content h2')?.textContent.includes('Productos')) {
        
        console.log('Detectada página de productos al cargar. Inicializando búsqueda...');
        setTimeout(initProductSearch, 500);
    }
});

// También intentamos cada vez que hay un clic en el documento
document.addEventListener('click', function() {
    // Si estamos en la página de productos y no se ha inicializado la búsqueda
    if (!window.searchInitialized && 
        (document.querySelector('.main-content h1, .main-content h2')?.textContent.includes('Productos') || 
         document.querySelector('table') || 
         document.querySelector('input[type="search"], input[placeholder]'))) {
        
        console.log('Detectado posible contexto de productos después de clic. Intentando inicializar búsqueda...');
        setTimeout(initProductSearch, 200);
    }
});document.addEventListener('DOMContentLoaded', function() {
const toggleBtn = document.querySelector('.toggle-sidebar');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const dashboardContent = document.querySelector('.dashboard');

const originalDashboardContent = dashboardContent.innerHTML;

function loadContent(page) {
    if (page === 'dashboard') {
        dashboardContent.innerHTML = originalDashboardContent;
        // Ejecutar scripts del dashboard original si es necesario
        executeScripts(dashboardContent);
        return;
    }
    
    dashboardContent.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'components/' + page + '.php', true);
    
    xhr.onload = function() {
        if (this.status === 200) {
            dashboardContent.innerHTML = this.responseText;
            
            // Ejecutar scripts incluidos en el contenido cargado
            executeScripts(dashboardContent);
            
            // Disparar un evento para notificar que el contenido se ha cargado
            const event = new CustomEvent('contentLoaded', { detail: { page } });
            document.dispatchEvent(event);
        } else {
            dashboardContent.innerHTML = '<div class="error-message">Error al cargar el contenido</div>';
        }
    };
    
    xhr.onerror = function() {
        dashboardContent.innerHTML = '<div class="error-message">Error de conexión</div>';
    };
    
    xhr.send();
}

// Función auxiliar para ejecutar scripts dentro de un contenedor
function executeScripts(container) {
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        
        // Copiar todos los atributos del script original
        Array.from(oldScript.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copiar el contenido del script si existe
        if (oldScript.innerHTML) {
            newScript.innerHTML = oldScript.innerHTML;
        }
        
        // Intentar adjuntar el script al mismo lugar que el original
        if (oldScript.parentNode) {
            oldScript.parentNode.replaceChild(newScript, oldScript);
        } else {
            // Si por alguna razón no tiene padre, agregarlo al body
            document.body.appendChild(newScript);
        }
    });
    
    // También podemos inicializar funcionalidades específicas basadas en el contenido
    if (container.querySelector('input[type="search"], input[placeholder]')) {
        console.log('Detectado campo de búsqueda en contenido cargado');
        setTimeout(initProductSearch, 100);
    }
}

toggleBtn.addEventListener('click', function() {
    sidebar.classList.toggle('collapsed');
    if (sidebar.classList.contains('collapsed')) {
        sidebar.style.width = '0';
        mainContent.style.marginLeft = '0';
    } else {
        sidebar.style.width = window.innerWidth > 768 ? 'var(--sidebar-width)' : '70px';
        mainContent.style.marginLeft = window.innerWidth > 768 ? 'var(--sidebar-width)' : '70px';
    }
});

const navItems = document.querySelectorAll('.nav-item');
navItems.forEach(item => {
    item.addEventListener('click', function() {
        navItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

document.getElementById('menu-dashboard').addEventListener('click', function() {
    loadContent('dashboard');
});

document.getElementById('menu-rentactiva').addEventListener('click', function() {
    loadContent('../../Components/RentasActivas');
});

document.getElementById('menu-rentatrasada').addEventListener('click', function() {
    loadContent('../../Components/RentasAtrasadas');
});

document.getElementById('menu-registrorentas').addEventListener('click', function() {
    loadContent('../../Components/RegistroRentas');
});

document.getElementById('menu-renta').addEventListener('click', function() {
    window.location.href = '../Components/Renta.php'
});

document.getElementById('menu-logout').addEventListener('click', function() {
    window.location.href = '../logOut.php';
});

// Escuchar el evento contentLoaded para inicializar funcionalidades específicas
document.addEventListener('contentLoaded', function(event) {
    const page = event.detail.page;
    console.log('Contenido cargado:', page);
    
    // Inicializar funcionalidades específicas según la página cargada
    if (page === '../../Components/GestionarProductos') {
        // Dar tiempo para que el DOM se actualice completamente
        setTimeout(function() {
            initProductSearch();
        }, 200);
    }
});
});

// Función para inicializar la búsqueda de productos
function initProductSearch() {
console.log('Inicializando búsqueda de productos...', 'ManagerDB.js:149');

// Vamos a probar varios selectores para encontrar el campo de búsqueda
let searchInput = document.querySelector('input[placeholder*="chaqueta"]');

if (!searchInput) {
    searchInput = document.querySelector('.sidebar + .main-content input[type="search"]');
}

if (!searchInput) {
    searchInput = document.querySelector('.main-content input[type="text"]');
}

if (!searchInput) {
    // Este es un selector más específico basado en la imagen
    searchInput = document.querySelector('input[type="search"], input.form-control, .search-input, input[placeholder]');
}

if (searchInput) {
    console.log('Elemento de búsqueda encontrado:', searchInput);
    
    // Remover listeners previos para evitar duplicación
    searchInput.removeEventListener('input', handleSearch);
    searchInput.addEventListener('input', handleSearch);
} else {
    console.error('Campo de búsqueda no encontrado', 'ManagerDB.js:182');
    
    // Como último recurso, intentamos crear un MutationObserver para detectar cuando 
    // el campo de búsqueda se añada al DOM
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length) {
                searchInput = document.querySelector('input[type="search"], input.form-control, .search-input, input[placeholder]');
                if (searchInput) {
                    console.log('Elemento de búsqueda encontrado después de cambios en el DOM');
                    observer.disconnect();
                    searchInput.addEventListener('input', handleSearch);
                }
            }
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    // También podemos intentar nuevamente después de un tiempo
    setTimeout(function() {
        initProductSearch();
    }, 500);
}
}

function handleSearch() {
const searchTerm = this.value.toLowerCase();
console.log('Filtrando por:', searchTerm, 'GestionarProductos.js:118');

// Encuentra todas las filas de productos - ajusta el selector según tu estructura
// Seleccionamos directamente cualquier fila que tenga celdas
const productRows = document.querySelectorAll('tr');

let filasEncontradas = 0;

productRows.forEach(row => {
    // Si es la primera fila y parece un encabezado, la dejamos visible
    if (row.querySelector('th') && row.rowIndex === 0) {
        return; // Mantener visible la fila de encabezado
    }
    
    // Intenta obtener el texto del producto de diferentes maneras
    let productText = '';
    
    // Obtener texto de todas las celdas
    const allCells = row.querySelectorAll('td');
    Array.from(allCells).forEach(cell => {
        productText += ' ' + cell.textContent.toLowerCase();
    });
    
    // Si no hay celdas, obtener todo el texto de la fila
    if (!productText) {
        productText = row.textContent.toLowerCase();
    }
    
    // Si el término de búsqueda está vacío, mostrar todas las filas
    if (!searchTerm.trim()) {
        row.style.display = '';
        filasEncontradas++;
        return;
    }
    
    // Comparar si el texto del producto incluye el término de búsqueda
    if (productText.includes(searchTerm)) {
        row.style.display = '';
        filasEncontradas++;
    } else {
        row.style.display = 'none';
    }
});

console.log('Filas encontradas:', 'GestionarProductos.js:122', filasEncontradas);
}

function cargarPagina(pagina) {
fetch(pagina)
    .then(response => response.text())
    .then(html => {
        const contenedor = document.getElementById('contenido-dinamico');
        contenedor.innerHTML = html;
        
        // Ejecutar scripts del contenido cargado
        executeScripts(contenedor);
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('paginaCargada', {
            detail: { pagina }
        }));
    })
    .catch(error => console.error('Error al cargar la página:', error));
}

// Función auxiliar para ejecutar scripts (duplicada para la función cargarPagina)
function executeScripts(container) {
const scripts = container.querySelectorAll('script');
scripts.forEach(oldScript => {
    const newScript = document.createElement('script');
    
    // Copiar todos los atributos del script original
    Array.from(oldScript.attributes).forEach(attr => {
        newScript.setAttribute(attr.name, attr.value);
    });
    
    // Copiar el contenido del script si existe
    if (oldScript.innerHTML) {
        newScript.innerHTML = oldScript.innerHTML;
    }
    
    // Reemplazar el script original
    oldScript.parentNode.replaceChild(newScript, oldScript);
});
}