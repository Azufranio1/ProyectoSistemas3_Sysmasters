<?php if (isset($_SESSION['idUser']) && isset($_SESSION['username'])): ?>
    <li class="nav-item mx-1 mb-1">
        <a class="nav-link" href="views/StartSession.php">
        <i class="bi bi-activity" aria-hidden="true"></i>
        <?php 
            if (isset($_SESSION['idUser']) && isset($_SESSION['username'])) {
                $prefix = strtoupper(substr($_SESSION['idUser'], 0, 3));
                if($prefix == 'MGR'){
                    $text = 'Administración';
                }
                elseif($prefix == 'EMP'){
                    $text = 'Registros';
                }
            }
            echo $text;
        ?></a>
    </li>

    <li class="nav-item mx-1 mb-1">
        <a class="nav-link" href="views/StartSession.php">
        <i class="bi bi-person-circle" aria-hidden="true"></i> <?php echo htmlspecialchars($_SESSION['username']); ?></a>
    </li>
<?php else: ?>
    <li class="nav-item mx-1 mb-1">
        <a class="nav-link" href="views/StartSession.php">
        <i class="bi bi-person-circle" aria-hidden="true"></i> Iniciar Sesión</a>
    </li>
<?php endif; ?>