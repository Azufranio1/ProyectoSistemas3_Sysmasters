<?php
session_start();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="SugarDonuts - Deliciosas donas artesanales en Bolivia">
    <title>SugarDonuts - Donas Artesanales y Tradicionales</title>
    
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&family=Racing+Sans+One&display=swap" as="style">
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" as="style">
    
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&family=Racing+Sans+One&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="CSS/Index.css">
    <link rel="icon" type="image/png" href="Resources/imgs/SugarDonutsLogo.png">
</head>
<body>
    <header class="site-header" aria-label="Navegación principal">
        <nav class="navbar navbar-expand-lg">
            <div class="container">
                <div class="logo-container">
                    <a href="/" aria-label="Inicio - SugarDonuts">
                        <img src="Resources/imgs/SugarDonutsTD.png" alt="Logo SugarDonuts" class="logo-img" width="150" height="120">
                    </a>
                </div>
                
                <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item mx-1 mb-1">
                            <a class="nav-link" href="#inicio">
                                <i class="bi bi-house-door me-1"></i>Inicio
                            </a>
                        </li>
                        <li class="nav-item mx-1 mb-1">
                            <a class="nav-link" href="#por-que-elegirnos">
                                <i class="bi bi-heart me-1"></i>¿Por qué SugarDonuts?
                            </a>
                        </li>
                        <li class="nav-item mx-1 mb-1">
                            <a class="nav-link" href="#nuestra-empresa">
                                <i class="bi bi-shop me-1"></i>Nuestra Empresa
                            </a>
                        </li>
                        <li class="nav-item mx-1 mb-1">
                            <a class="nav-link" href="#ubicacion">
                                <i class="bi bi-pin-map me-1"></i>Ubicación
                            </a>
                        </li>
                        <?php include('logic/Index.php'); ?>
                    </ul>
                </div>
            </div>
        </nav>
    </header>

    <!-- Hero -->
    <section id="inicio" class="hero text-center">
        <div class="container">
            <h1 class="hero-title">¡Endulza tu día con SugarDonuts!</h1>
            <p class="hero-text">Las mejores donas artesanales, frescas y con un sabor único que conquista a todos.</p>
        </div>
    </section>

    <!-- Features -->
    <section id="por-que-elegirnos" class="features py-5">
        <div class="container">
            <h2 class="text-center section-title">¿Por qué elegir SugarDonuts?</h2>
            <div class="row g-4">
                <div class="col-md-4">
                    <article class="feature-box h-100 text-center">
                        <div class="feature-icon"><i class="bi bi-emoji-smile"></i></div>
                        <h3>Sabores Únicos</h3>
                        <p>Variedades irresistibles: clásicas, rellenas, glaseadas y más.</p>
                    </article>
                </div>
                <div class="col-md-4">
                    <article class="feature-box h-100 text-center">
                        <div class="feature-icon"><i class="bi bi-flower3"></i></div>
                        <h3>Frescura Garantizada</h3>
                        <p>Donas recién hechas cada día, con ingredientes de la mejor calidad.</p>
                    </article>
                </div>
                <div class="col-md-4">
                    <article class="feature-box h-100 text-center">
                        <div class="feature-icon"><i class="bi bi-gift"></i></div>
                        <h3>Detalles Especiales</h3>
                        <p>Perfectas para regalar, compartir y acompañar cada momento.</p>
                    </article>
                </div>
            </div>
        </div>
    </section>

    <!-- Nuestra Empresa -->
    <section id="nuestra-empresa" class="mission-vision-values py-5 bg-light">
        <div class="container text-center">
            <h2 class="section-title mb-4">Nuestra Empresa</h2>
            <div class="row g-4">
                <div class="col-md-6">
                    <article class="card h-100">
                        <div class="card-body">
                            <i class="bi bi-cup-straw display-4 text-danger"></i>
                            <h3 class="fw-bold mt-3">Misión</h3>
                            <p>Endulzar la vida de nuestros clientes con donas irresistibles, frescas y llenas de sabor.</p>
                        </div>
                    </article>
                </div>
                <div class="col-md-6">
                    <article class="card h-100">
                        <div class="card-body">
                            <i class="bi bi-stars display-4 text-warning"></i>
                            <h3 class="fw-bold mt-3">Visión</h3>
                            <p>Convertirnos en la marca referente de donas artesanales en Bolivia, llevando alegría a cada mordida.</p>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    </section>

    <!-- Ubicación -->
    <section id="ubicacion" class="ubicacion-section py-5 bg-light">
        <div class="container text-center">
            <h2 class="section-title fw-bold">Encuéntranos</h2>
            <p class="lead text-muted">Visita nuestras tiendas y vive la experiencia SugarDonuts</p>
            <p><i class="bi bi-geo-alt-fill text-warning"></i> Av. Principal #1234, La Paz - Bolivia</p>
            <a href="https://wa.me/59170000000" class="btn btn-success btn-lg">
                <i class="bi bi-whatsapp me-2"></i> Haz tu pedido
            </a>
        </div>
    </section>

    <footer class="footer-section">
        <div class="container text-center">
            <img src="Resources/imgs/SugarDonutsTD.png" alt="Logo SugarDonuts" width="120">
            <p class="footer-text mt-3">SugarDonuts - Hechas con amor, para cada momento especial.</p>
            <div class="social-links mt-3">
                <a href="#" class="social-icon"><i class="bi bi-facebook"></i></a>
                <a href="#" class="social-icon"><i class="bi bi-instagram"></i></a>
                <a href="#" class="social-icon"><i class="bi bi-tiktok"></i></a>
            </div>
            <p class="mt-3">© 2025 SugarDonuts. Todos los derechos reservados.</p>
        </div>
    </footer>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    <script src="JS/Index.js"></script>
</body>
</html>
