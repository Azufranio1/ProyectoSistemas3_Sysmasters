<?php
// Verificar que la sesión esté iniciada
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Obtener datos de la sesión
$username = isset($_SESSION['username']) ? $_SESSION['username'] : 'Usuario';
$companyName = 'Mary\'sS'; // Esto también podría venir de la sesión o base de datos
$companyLogo = '../Resources/imgs/MarysSLogoST.png'; // Ruta a tu logo
?>

<style>
/* Reset y variables CSS */
:root {
    --primary-color: #6366f1;
    --primary-hover: #4f46e5;
    --primary-light: #e0e7ff;
    --primary-lighter: #f0f4ff;
    --secondary-color: #10b981;
    --secondary-hover: #059669;
    --secondary-light: #d1fae5;
    --danger-color: #ef4444;
    --danger-hover: #dc2626;
    --danger-light: #fee2e2;
    --gray-50: #f9fafb;
    --gray-100: #f3f4f6;
    --gray-200: #e5e7eb;
    --gray-300: #d1d5db;
    --gray-400: #9ca3af;
    --gray-500: #6b7280;
    --gray-600: #4b5563;
    --gray-700: #374151;
    --gray-800: #1f2937;
    --gray-900: #111827;
    --white: #ffffff;
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --header-height: 70px;
}

* {
    box-sizing: border-box;
}

/* Estilos del header */
.header-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: var(--header-height);
    /*color*/
    background: linear-gradient(135deg, #334155 0%, #8b5cf6 100%);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--gray-200);
    box-shadow: var(--shadow-md);
    z-index: 1000;
    padding: 0 1rem;
}

/* Ajuste para el contenido principal */
.container {
    margin-top: calc(var(--header-height) + 1rem);
}

.header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 1200px;
    margin: 0 auto;
    height: 100%;
    gap: 1rem;
}

/* Logo y empresa */
.logo-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
    flex-shrink: 0;
}

.logo-img {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    object-fit: cover;
    border: 2px solid var(--gray-200);
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
}

.logo-img:hover {
    transform: scale(1.05);
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
}

.logo-fallback {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: var(--white);
    border-radius: 12px;
    display: none;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 16px;
    box-shadow: var(--shadow-sm);
}

.company-name {
    color: white;
    background: linear-gradient(135deg, #ffffff, #f1f5f9);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}


/* Botones de navegación */
.nav-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
}

.nav-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    white-space: nowrap;
    min-width: 44px;
    justify-content: center;
}

.nav-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    transition: left 0.5s;
}

.nav-btn:hover::before {
    left: 100%;
}

.nav-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.nav-btn:active {
    transform: translateY(0);
}

.btn-back {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-back:hover {
    background: rgba(255, 255, 255, 0.3);
}

.btn-home {
    background: linear-gradient(135deg, var(--secondary-color), var(--primary-hover));
    color: var(--white);
    box-shadow: var(--shadow-sm);
}

.btn-home:hover {
    background: linear-gradient(135deg, var(--primary-hover), var(--primary-color));
    color: var(--white);
}

/* Usuario y menú */
.user-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-shrink: 0;
}

.user-menu {
    position: relative;
}

.user-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: linear-gradient(135deg, var(--gray-50), var(--gray-100));
    border: 1px solid var(--gray-200);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: var(--shadow-sm);
    min-width: 44px;
}

.user-btn:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.user-avatar {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, var(--secondary-color), var(--secondary-hover));
    color: var(--white);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    box-shadow: var(--shadow-sm);
    flex-shrink: 0;
}

.user-name {
    color: var(--gray-700);
    font-weight: 600;
    font-size: 0.875rem;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;
}

.chevron-icon {
    font-size: 12px;
    color: var(--gray-400);
    transition: transform 0.3s ease;
    flex-shrink: 0;
}

.user-btn.active .chevron-icon {
    transform: rotate(180deg);
}

.dropdown {
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);
    width: 220px;
    background: var(--white);
    border-radius: 12px;
    box-shadow: var(--shadow-xl);
    border: 1px solid var(--gray-200);
    padding: 0.5rem 0;
    z-index: 1100;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-header {
    padding: 1rem 1rem 0.75rem 1rem;
    border-bottom: 1px solid var(--gray-200);
    margin-bottom: 0.5rem;
}

.dropdown-header h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--gray-800);
}

.dropdown-header p {
    margin: 0.25rem 0 0 0;
    font-size: 0.75rem;
    color: var(--gray-500);
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    color: var(--gray-700);
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.dropdown-item:hover {
    background: var(--gray-50);
    color: var(--gray-800);
}

.dropdown-item.logout {
    color: var(--danger-color);
    border-top: 1px solid var(--gray-200);
    margin-top: 0.5rem;
    padding-top: 0.75rem;
}

.dropdown-item.logout:hover {
    background: var(--danger-light);
    color: var(--danger-hover);
}

/* ============== ESTILOS PARA IMPRESIÓN ============== */
@media print {
    /* Ocultar completamente el header */
    .header-container {
        display: none !important;
    }
    
    /* Eliminar el margin-top del contenido principal para que ocupe todo el espacio */
    .container,
    body > *:not(.header-container) {
        margin-top: 0 !important;
        padding-top: 0 !important;
    }
    
    /* Reset del body para impresión */
    body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        color: black !important;
    }
    
    /* Asegurar que el contenido principal sea visible */
    main,
    .main-content,
    .content {
        margin-top: 0 !important;
        padding-top: 0 !important;
    }
    
    /* Opcional: Agregar un pequeño encabezado solo para impresión */
    .print-header {
        display: block !important;
        text-align: center;
        padding: 10px 0;
        border-bottom: 1px solid #ccc;
        margin-bottom: 20px;
        font-size: 18px;
        font-weight: bold;
    }
}

/* Clase para encabezado solo visible en impresión (opcional) */
.print-header {
    display: none;
}

/* Responsive Design */
@media (max-width: 768px) {
    .header-container {
        padding: 0 0.75rem;
    }
    
    .header-content {
        gap: 0.5rem;
    }
    
    .company-name {
        font-size: 1rem;
        max-width: 100px;
    }
    
    .nav-btn span:not(.icon-arrow-left):not(.icon-home) {
        display: none;
    }
    
    .nav-btn {
        padding: 0.5rem;
        min-width: 40px;
    }
    
    .user-name {
        display: none;
    }
    
    .dropdown {
        width: 200px;
        right: -0.5rem;
    }
}

@media (max-width: 640px) {
    :root {
        --header-height: 60px;
    }
    
    .header-container {
        padding: 0 0.5rem;
    }
    
    .company-name {
        display: none;
    }
    
    .logo-img,
    .logo-fallback {
        width: 36px;
        height: 36px;
    }
    
    .user-avatar {
        width: 28px;
        height: 28px;
        font-size: 12px;
    }
    
    .nav-buttons {
        gap: 0.25rem;
    }
    
    .dropdown {
        width: 180px;
        right: -1rem;
    }
}

@media (max-width: 480px) {
    .logo-section {
        gap: 0.5rem;
    }
    
    .nav-btn {
        padding: 0.375rem;
        min-width: 36px;
    }
    
    .user-btn {
        padding: 0.375rem 0.5rem;
        min-width: 36px;
    }
}

/* Iconos usando caracteres Unicode mejorados */
.icon-arrow-left::before { 
    content: '←'; 
    font-size: 16px;
    font-weight: bold;
}
.icon-home::before { 
    content: '🏠'; 
    font-size: 14px;
}
.icon-bell::before { 
    content: '🔔'; 
    font-size: 14px;
}
.icon-user::before { 
    content: '👤'; 
    font-size: 12px;
}
.icon-chevron::before { 
    content: '▼'; 
    font-size: 10px;
}
.icon-settings::before { 
    content: '⚙️'; 
    font-size: 14px;
}
.icon-logout::before { 
    content: '🚪'; 
    font-size: 14px;
}

/* Animaciones adicionales */
@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.header-container {
    animation: slideIn 0.5s ease-out;
}

/* Mejoras de accesibilidad */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

.nav-btn:focus,
.user-btn:focus,
.dropdown-item:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
}
</style>

<header class="header-container">
    <div class="header-content">
        
        <!-- Logo de la empresa - Lado izquierdo -->
        <div class="logo-section">
            <img src="<?php echo $companyLogo; ?>" 
                 alt="Logo <?php echo $companyName; ?>" 
                 class="logo-img"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <!-- Fallback si no se encuentra la imagen -->
            <div class="logo-fallback">
                ME
            </div>
            <h1 class="company-name">
                <?php echo htmlspecialchars($companyName); ?>
            </h1>
        </div>

        <!-- Botones de navegación - Centro -->
        <div class="nav-buttons">
            <button onclick="window.location.href = '../Views/ManagerDB.php'" 
                    class="nav-btn btn-back" 
                    title="Volver atrás"
                    aria-label="Volver atrás">
                <span class="icon-arrow-left"></span>
                <span>Atrás</span>
            </button>

            <button onclick="window.location.href='../Views/ManagerDB.php'" 
                    class="nav-btn btn-home" 
                    title="Ir al inicio"
                    aria-label="Ir al inicio">
                <span class="icon-home"></span>
                <span>Inicio</span>
            </button>
        </div>

        <!-- Usuario y menú - Lado derecho -->
        <div class="user-section">
            <!-- Usuario y dropdown -->
            <div class="user-menu">
                <button class="user-btn" 
                        onclick="toggleDropdown()" 
                        id="userMenuButton"
                        aria-label="Menú de usuario"
                        aria-expanded="false"
                        aria-haspopup="true">
                    <div class="user-avatar">
                        <span class="icon-user"></span>
                    </div>
                    <span class="user-name"><?php echo htmlspecialchars($username); ?></span>
                    <span class="chevron-icon">▼</span>
                </button>

                <!-- Dropdown menu -->
                <div id="userDropdown" 
                     class="dropdown"
                     role="menu"
                     aria-labelledby="userMenuButton">
                    <div class="dropdown-header">
                        <h4><?php echo htmlspecialchars($username); ?></h4>
                        <p>Sesión activa</p>
                    </div>
                    
                    <button class="dropdown-item logout" 
                            onclick="logout()"
                            role="menuitem"
                            aria-label="Cerrar sesión">
                        <span class="icon-logout"></span>
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</header>

<script>
// Variables globales
let dropdownTimeout;
const userButton = document.getElementById('userMenuButton');
const dropdown = document.getElementById('userDropdown');

function toggleDropdown() {
    const isOpen = dropdown.classList.contains('show');
    
    if (isOpen) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

function openDropdown() {
    clearTimeout(dropdownTimeout);
    dropdown.classList.add('show');
    userButton.classList.add('active');
    userButton.setAttribute('aria-expanded', 'true');
    
    // Focus en el primer elemento del menú
    const firstItem = dropdown.querySelector('.dropdown-item');
    if (firstItem) {
        setTimeout(() => firstItem.focus(), 100);
    }
}

function closeDropdown() {
    dropdown.classList.remove('show');
    userButton.classList.remove('active');
    userButton.setAttribute('aria-expanded', 'false');
}

// Cerrar dropdown al hacer click fuera
document.addEventListener('click', function(event) {
    if (!userButton.contains(event.target) && !dropdown.contains(event.target)) {
        closeDropdown();
    }
});

// Cerrar dropdown con tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && dropdown.classList.contains('show')) {
        closeDropdown();
        userButton.focus();
    }
});

// Mejorar navegación por teclado en el dropdown
dropdown.addEventListener('keydown', function(event) {
    const items = dropdown.querySelectorAll('.dropdown-item');
    const currentIndex = Array.from(items).indexOf(document.activeElement);
    
    switch(event.key) {
        case 'ArrowDown':
            event.preventDefault();
            const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            items[nextIndex].focus();
            break;
        case 'ArrowUp':
            event.preventDefault();
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            items[prevIndex].focus();
            break;
        case 'Enter':
        case ' ':
            event.preventDefault();
            if (document.activeElement) {
                document.activeElement.click();
            }
            break;
    }
});

function logout() {
    // Crear modal de confirmación más elegante
    const confirmed = confirm('¿Estás seguro de que quieres cerrar sesión?');
    if (confirmed) {
        // Mostrar loading si es necesario
        userButton.innerHTML = '<div style="width: 20px; height: 20px; border: 2px solid #ccc; border-top: 2px solid #666; border-radius: 50%; animation: spin 1s linear infinite;"></div>';
        
        // Redirigir después de un breve delay para mostrar el loading
        setTimeout(() => {
            window.location.href = '../logout.php';
        }, 500);
    }
}

// Animación de loading
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Prevenir múltiples clicks en botones
let isNavigating = false;

document.querySelectorAll('.nav-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        if (isNavigating) {
            e.preventDefault();
            return;
        }
        isNavigating = true;
        
        // Reset después de 2 segundos
        setTimeout(() => {
            isNavigating = false;
        }, 2000);
    });
});

// Mejorar la experiencia en dispositivos táctiles
if ('ontouchstart' in window) {
    document.querySelectorAll('.nav-btn, .user-btn').forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'translateY(0)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
}
</script>