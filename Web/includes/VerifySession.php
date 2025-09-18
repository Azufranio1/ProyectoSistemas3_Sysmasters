<?php 
// Start output buffering to prevent header issues
if (!ob_get_level()) {
    ob_start();
}

// Check if session is already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if user is logged in
if (!isset($_SESSION['idUser']) || !isset($_SESSION['username'])) {
    // Clean any output buffer before redirect
    if (ob_get_level()) {
        ob_end_clean();
    }
    header("Location: ../views/StartSession.php?expired=1");
    exit();
}

// Check if session has expired
if (isset($_SESSION['expire_time']) && time() > $_SESSION['expire_time']) {
    session_unset();
    session_destroy();
    
    // Clean any output buffer before redirect
    if (ob_get_level()) {
        ob_end_clean();
    }
    header("Location: ../views/StartSession.php?expired=1");
    exit();
}
?>