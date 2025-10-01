<?php if (isset($_SESSION['idUser']) && isset($_SESSION['username'])): ?>
    <b>Bienvenido, <?php echo htmlspecialchars($_SESSION['username']); ?></b>
<?php endif; ?>