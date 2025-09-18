<?php
session_start();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Mary'sS Carnaval - Vestuario tradicional para fiestas carnavaleras en Bolivia">
    <title>Mary'sS Carnaval - Vestuario Tradicional Boliviano</title>
    
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&family=Racing+Sans+One&display=swap" as="style">
    <link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" as="style">
    
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-icons/1.11.1/font/bootstrap-icons.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&family=Racing+Sans+One&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="CSS/Index.css">
    <link rel="icon" type="image/png" href="Resources/imgs/MarysSLogoIcon.png">
    
    
</head>
<body>
    <header class="site-header" aria-label="Navegación principal">
        <nav class="navbar navbar-expand-lg">
            <div class="container">
                <div class="logo-container">
                    <a href="/" aria-label="Inicio - Mary'sS Carnaval">
                        <img src="Resources/imgs/MarysSLogoTB.png" alt="Logo Mary'sS Carnaval" class="logo-img" width="150" height="120">
                    </a>
                </div>
                
                <button class="navbar-toggler"  data-bs-toggle="collapse" data-bs-target="#navbarNav" 
                        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon">
                    </span>
                </button>
                
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto">
                        <li class="nav-item mx-1 mb-1">
                            <a class="nav-link" href="#inicio" aria-current="page">
                                <i class="bi bi-house-door me-1" aria-hidden="true"></i>Inicio
                            </a>
                        </li>
                        <li class="nav-item mx-1 mb-1">
                            <a class="nav-link" href="#por-que-elegirnos">
                                <i class="bi bi-star me-1" aria-hidden="true"></i>¿Por qué elegirnos?
                            </a>
                        </li>
                        <li class="nav-item mx-1 mb-1">
                            <a class="nav-link" href="#nuestra-empresa">
                                <i class="bi bi-building me-1" aria-hidden="true"></i>Nuestra Empresa
                            </a>
                        </li>
                        <li class="nav-item mx-1 mb-1">
                            <a class="nav-link" href="#ubicacion">
                                <i class="bi bi-pin-map me-1" aria-hidden="true"></i>Ubicación
                            </a>
                        </li>
                        <?php include('logic/Index.php');?>
                    </ul>
                </div>
                
            </div>
            
        </nav>
    </header>

    <section id="inicio" class="hero" aria-labelledby="hero-heading">
        <div class="container">
            <h1 id="hero-heading" class="hero-title">¡Prepárate para el Carnaval!</h1>
            <p class="hero-text">Encuentra tu vestuario perfecto para brillar en la celebración. Asesoramiento personalizado, diseños únicos y la mejor calidad te esperan.</p>
            <!-- <a href="/catalogo" class="btn btn-primary">Ver catálogo <i class="bi bi-arrow-right ms-2" aria-hidden="true"></i></a>-->
        </div>
    </section>

    <section id="por-que-elegirnos" class="features" aria-labelledby="features-heading">
        <div class="container ">
            <h2 id="features-heading" class="text-center section-title">¿Por qué elegirnos?</h2>
            <div class="row g-4">
                <div class="col-md-4">
                    <article class="feature-box h-100" tabindex="0">
                        <div class="feature-icon" aria-hidden="true">
                            <i class="bi bi-shield-check"></i>
                        </div>
                        <h3 class="feature-title">Calidad Garantizada</h3>
                        <p>Confección impecable por artesanos especializados en vestuario carnavalero.</p>
                    </article>
                </div>
                <div class="col-md-4">
                    <article class="feature-box h-100" tabindex="0">
                        <div class="feature-icon" aria-hidden="true">
                            <i class="bi bi-tags"></i>
                        </div>
                        <h3 class="feature-title">Precios Competitivos</h3>
                        <p>Descuentos especiales en compras al por mayor y paquetes completos de vestuario.</p>
                    </article>
                </div>
                <div class="col-md-4">
                    <article class="feature-box h-100" tabindex="0">
                        <div class="feature-icon" aria-hidden="true">
                            <i class="bi bi-basket2"></i>
                        </div>
                        <h3 class="feature-title">Variedad Carnavalera</h3>
                        <p>Amplio catálogo: chutas, pepinos, corbatas, sombreros y accesorios únicos.</p>
                    </article>
                </div>
            </div>
        </div>
    </section>

    <section id="nuestra-empresa" class="mission-vision-values py-5 bg-light" aria-labelledby="mission-heading">
        <div class="container text-center">
            <h2 id="mission-heading" class="section-title mb-4">Nuestra Empresa</h2>
            <div class="row g-4">
                <div class="col-md-4">
                    <article class="card mission-card h-100" tabindex="0">
                        <div class="card-body">
                            <i class="bi bi-fire display-4 text-danger" aria-hidden="true"></i>
                            <h3 class="fw-bold mt-3">Misión</h3>
                            <p>Crear y confeccionar vestuarios de carnaval que captures la esencia y la alegría de nuestra cultura, brindando prendas únicas que permitan a nuestros clientes brillar en cada celebración.</p>
                        </div>
                    </article>
                </div>
                <div class="col-md-4">
                    <article class="card mission-card h-100" tabindex="0">
                        <div class="card-body">
                            <i class="bi bi-flag display-4 text-success" aria-hidden="true"></i>
                            <h3 class="fw-bold mt-3">Visión</h3>
                            <p>Convertirnos en el referente nacional de vestuario carnavalero, reconocidos por nuestra creatividad, autenticidad y pasión por preservar y celebrar las tradiciones festivas de Bolivia.</p>
                        </div>
                    </article>
                </div>
                <div class="col-md-4">
                    <article class="card mission-card h-100" tabindex="0">
                        <div class="card-body">
                            <i class="bi bi-heart display-4 text-warning" aria-hidden="true"></i>
                            <h3 class="fw-bold mt-3">Valores</h3>
                            <ul class="list-unstyled mt-2 text-start">
                                <li class="mb-2">
                                    <i class="bi bi-check-circle text-primary me-2" aria-hidden="true"></i> 
                                    Autenticidad Cultural
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check-circle text-primary me-2" aria-hidden="true"></i> 
                                    Creatividad Artesanal
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check-circle text-primary me-2" aria-hidden="true"></i> 
                                    Pasión por el Carnaval
                                </li>
                                <li class="mb-2">
                                    <i class="bi bi-check-circle text-primary me-2" aria-hidden="true"></i> 
                                    Compromiso con la Tradición
                                </li>
                            </ul>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    </section>

    <section id="ubicacion" class="ubicacion-section py-5 bg-light">
        <div class="container">
            <div class="text-center mb-5">
                <h2 class="section-title fw-bold display-5 text-carnival">Encuéntranos Fácilmente</h2>
                <div class="divider mx-auto my-3 bg-warning" style="height: 3px; width: 80px;"></div>
                <p class="lead text-muted">Visítanos en nuestra tienda y descubre la magia del carnaval</p>
            </div>
            
            <div class="row justify-content-center">
                <div class="col-lg-8 col-xl-6">
                    <div class="contact-info p-4 bg-white rounded shadow-sm">
                        <h3 class="fw-bold mb-4 border-bottom pb-2 text-carnival">
                            <i class="bi bi-shop me-2"></i> Mary'sS Carnaval
                        </h3>
                        
                        <address class="contact-details">
                            <div class="d-flex mb-3">
                                <div class="contact-icon me-3 text-carnival">
                                    <i class="bi bi-geo-alt-fill fs-4"></i>
                                </div>
                                <div>
                                    <strong class="d-block">Dirección:</strong>
                                    Zona Panamericana AV. Juan Pablo II <br>
                                    Al lado de la fabrica de pepsi #2558
                                </div>
                            </div>
                            
                            <div class="d-flex mb-3">
                                <div class="contact-icon me-3 text-carnival">
                                    <i class="bi bi-telephone-fill fs-4"></i>
                                </div>
                                <div>
                                    <strong class="d-block">Teléfono:</strong>
                                    <a href="tel:+59171224301" class="text-decoration-none">+591 71224301</a>
                                </div>
                            </div>
                            
                            <div class="d-flex mb-3">
                                <div class="contact-icon me-3 text-carnival">
                                    <i class="bi bi-envelope-fill fs-4"></i>
                                </div>
                                <div>
                                    <strong class="d-block">Email:</strong>
                                    <a href="mailto:marinahuanapaco@gmail.com" class="text-decoration-none">marinahuanapaco@gmail.com</a>
                                </div>
                            </div>
                            
                            <div class="d-flex">
                                <div class="contact-icon me-3 text-carnival">
                                    <i class="bi bi-clock-fill fs-4"></i>
                                </div>
                                <div>
                                    <strong class="d-block">Horario:</strong>
                                    Lun-Vie: 7:00 - 21:00<br>
                                    Sábado: 7:00 - 20:00
                                </div>
                            </div>
                        </address>
                        
                        <div class="text-center mt-4">
                            <a href="https://wa.me/59171224301" class="btn btn-success btn-lg">
                                <i class="bi bi-whatsapp me-2"></i> Contactar por WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer-section">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand-section">
                    <img src="Resources/imgs/MarysSLogoTB.png" alt="Logo Mary'sS Carnaval" class="logo-img" width="150" height="120">
                    <p class="footer-text">Especialistas en vestuario carnavalero, creando momentos únicos y preservando la tradición desde hace más de 15 años.</p>
                </div>
                
                <div class="footer-brand-section">
                    <h2 class="footer-brand">Síguenos en Redes</h2>
                    <p class="footer-text">Únete a nuestra fiesta carnavalera</p>
                    
                    <div class="social-links">
                        <a href="https://www.facebook.com/share/1KM6pGDxtc/" class="social-icon" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                            <i class="bi bi-facebook" aria-hidden="true"></i>
                        </a>
                        <a href="https://www.instagram.com/mary_ss_oficial?igsh=YzljYTk1ODg3Zg==" class="social-icon" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                            <i class="bi bi-instagram" aria-hidden="true"></i>
                        </a>
                        <a href="https://www.tiktok.com/@userolpcp1hgg8?_t=ZM-8v4Y3Fo3Q73&_r=1" class="social-icon" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
                            <i class="bi bi-tiktok" aria-hidden="true"></i>
                        </a>
                        <a href="https://wa.me/59171224301" class="social-icon" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                            <i class="bi bi-whatsapp" aria-hidden="true"></i>
                        </a>
                    </div>
                    
                    <p class="footer-text footer-highlight">¡Compártenos tus fotos usando #MarysSCarnaval!</p>
                </div>
                
                <div class="footer-brand-section">
                    <h2 class="footer-brand">Visítanos</h2>
                    <p class="footer-contact">
                        <i class="bi bi-geo-alt-fill text-warning me-2"></i>
                        Zona Panamericana AV. Juan Pablo II <br>
                                    Al lado de la fabrica de pepsi #2558
                    </p>
                    
                    <h2 class="footer-brand">Contáctanos</h2>
                    <p class="footer-contact">
                        <i class="bi bi-telephone-fill text-warning me-2"></i> +591 76203143<br>
                        <i class="bi bi-envelope-fill text-warning me-2"></i> marinahuanapaco@gmail.
                    </p>
                    
                </div>
            </div>
            
            <div class="footer-copyright">
                <p>© 2025 Mary'sS Carnaval. Todos los derechos reservados.</p>
            </div>
        </div>
    </footer>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>
    <script src="JS/Index.js"></script>
</body>
</html>