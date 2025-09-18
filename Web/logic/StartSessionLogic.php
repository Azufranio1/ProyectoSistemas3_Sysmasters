<?php
session_start();
include('../includes/Connection.php');

date_default_timezone_set('America/La_Paz');

define('MAX_LOGIN_ATTEMPTS', 2);
define('LOCKOUT_TIME', 0.5 * 60);
define('SESSION_LIFETIME', 30 * 60);
define('MAX_LOCKOUTS', 2); 

if (isset($_SESSION['expire_time']) && time() > $_SESSION['expire_time']) {
    session_unset();
    session_destroy();
    session_start();
}

if (isset($_SESSION['idUser']) && isset($_SESSION['username'])) {
    $prefix = strtoupper(substr($_SESSION['idUser'], 0, 3));
    if($prefix == 'EMP'){
        header("Location: EmployeeDB.php");
    }
    elseif($prefix == 'MGR'){
        header("Location: ManagerDB.php");
    }
    exit();
}

function isSystemLocked() {
    if (isset($_SESSION['lockout_time'])) {
        $time_left = $_SESSION['lockout_time'] - time();
        if ($time_left > 0) {
            return $time_left;
        } else {
            unset($_SESSION['lockout_time']);
            return false;
        }
    }
    return false;
}

function incrementLoginAttempts() {
    if (!isset($_SESSION['login_attempts'])) {
        $_SESSION['login_attempts'] = 1;
    } else {
        $_SESSION['login_attempts']++;
        
        if ($_SESSION['login_attempts'] % MAX_LOGIN_ATTEMPTS === 0) {
            if (!isset($_SESSION['lockout_count'])) {
                $_SESSION['lockout_count'] = 1;
            } else {
                $_SESSION['lockout_count']++;
            }
            
            $_SESSION['lockout_time'] = time() + LOCKOUT_TIME;
            return true;
        }
    }
    return false;
}

function shouldDeactivateAccount() {
    return isset($_SESSION['lockout_count']) && $_SESSION['lockout_count'] >= MAX_LOCKOUTS;
}

function deactivateUserAccount($username) {
    $con = connection();
    $stmt = $con->prepare("SELECT e.empleadoID FROM UsuarioEmp ue INNER JOIN Empleado e ON e.empleadoID = ue.empleadoID WHERE (usuario = ? OR correo = ?)");
    $stmt->bind_param("ss", $username, $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 1) {
        $row = $result->fetch_assoc();
        $empleadoID = $row['empleadoID'];
        
        $update_stmt = $con->prepare("UPDATE Empleado SET Activo = 0 WHERE empleadoID = ?");
        $update_stmt->bind_param("s", $empleadoID);
        $success = $update_stmt->execute();
        $update_stmt->close();
        
        // Opcional: Registrar el bloqueo de cuenta en un log
        /*$log_stmt = $con->prepare("INSERT INTO LogSeguridad (empleadoID, accion, fecha) VALUES (?, 'Cuenta desactivada por múltiples intentos fallidos', NOW())");
        if ($log_stmt) {
            $log_stmt->bind_param("s", $empleadoID);
            $log_stmt->execute();
            $log_stmt->close();
        }*/
        return $success;
    }
    
    $stmt->close();
    $con->close();
    return false;
}

function getRemainingAttempts() {
    if (!isset($_SESSION['login_attempts'])) {
        return MAX_LOGIN_ATTEMPTS;
    }
    $current_cycle = $_SESSION['login_attempts'] % MAX_LOGIN_ATTEMPTS;
    if ($current_cycle === 0) {
        return MAX_LOGIN_ATTEMPTS;
    }
    $remaining = MAX_LOGIN_ATTEMPTS - $current_cycle;
    return max(0, $remaining);
}

$error = '';
$lockout_time_left = isSystemLocked();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if ($lockout_time_left) {
        $minutes = ceil($lockout_time_left / 60);
        $error = "Sistema bloqueado. Intente nuevamente en $minutes minutos.";
    } else {
        $username = filter_input(INPUT_POST, 'username', FILTER_SANITIZE_STRING);
        $password = $_POST['password'];
        $remember_me = isset($_POST['remember_me']) ? true : false;

        if (empty($username) || empty($password)) {
            $error = "Por favor, complete todos los campos.";
        } else {
            $con = connection();
            $stmt = $con->prepare("SELECT ue.empleadoID, usuario, Keyword, e.Activo FROM UsuarioEmp ue inner join Empleado e on e.empleadoID = ue.empleadoID WHERE (usuario = ? OR correo = ?) and ue.habilitado = 1 and e.habilitado = 1");
            $stmt->bind_param("ss", $username, $username);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows === 1) {
                $user = $result->fetch_assoc();
                if((int)$user['Activo'] === 0){
                    $error = 'Cuenta bloqueada. Contacte al administrador si cree que se trata de un error.';
                }
                else{
                    if (password_verify($password, $user['Keyword'])) {
                        unset($_SESSION['login_attempts']);
                        unset($_SESSION['lockout_time']);
                        unset($_SESSION['lockout_count']);
                        
                        $_SESSION['idUser'] = $user['empleadoID'];
                        $_SESSION['username'] = $user['usuario'];
                        
                        if (!$remember_me) {
                            $_SESSION['expire_time'] = time() + SESSION_LIFETIME;
                        } else {
                            if (isset($_SESSION['expire_time'])) {
                                unset($_SESSION['expire_time']);
                            }
                        }
    
                        $fecha_hora = date('Y-m-d H:i:s');
                        $accion = 1;
    
                        $stmt->close();
                        $con->close();
    
                        $prefix = strtoupper(substr($_SESSION['idUser'], 0, 3));
                        if($prefix == 'EMP'){
                            header("Location: EmployeeDB.php");
                        }
                        elseif($prefix == 'MGR'){
                            header("Location: ManagerDB.php");
                        }
                        exit();
                    } else {
                        if (incrementLoginAttempts()) {
                            if (shouldDeactivateAccount()) {
                                if (deactivateUserAccount($username)) {
                                    $error = "Cuenta desactivada por múltiples intentos fallidos. Contacte al administrador.";
                                    unset($_SESSION['login_attempts']);
                                    unset($_SESSION['lockout_time']);
                                    unset($_SESSION['lockout_count']);
                                } else {
                                    $error = "Error al procesar la solicitud. Por favor, contacte al administrador.";
                                }
                            } else {
                                $error = "Sistema bloqueado por exceder el número máximo de intentos. Por favor, espere " . (LOCKOUT_TIME / 60) . " minutos.";
                            }
                        } else {
                            $remaining = getRemainingAttempts();
                            $error = "Usuario o contraseña incorrectos. ";
                            if ($remaining > 0) {
                                $error .= "Intentos restantes: $remaining";
                            }
                        }
                    }
                }
            } else {
                if (incrementLoginAttempts()) {
                    $error = "Sistema bloqueado por exceder el número máximo de intentos. Por favor, espere " . (LOCKOUT_TIME / 60) . " minutos.";
                } else {
                    $remaining = getRemainingAttempts();
                    $error = "Usuario o contraseña incorrectos. ";
                    if ($remaining > 0) {
                        $error .= "Intentos restantes: $remaining";
                    }
                }
            }
            $stmt->close();
            $con->close();
        }
    }
}

if ($lockout_time_left) {
    $minutes = ceil($lockout_time_left / 60);
    $error = "Sistema bloqueado. Intente nuevamente en $minutes minutos.";
}
?>