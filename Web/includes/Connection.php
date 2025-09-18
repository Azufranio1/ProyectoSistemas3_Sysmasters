<?php
class Conector {
    private static $instancia = null;
    private $connection;
    
    private function __construct() {
        $this->connect();
    }

    private function connect() {
        $host = "127.0.0.1";
        $user = "root";
        $pass = "";
        $bd = "Mary_sS";
        
        $this->connection = mysqli_connect($host, $user, $pass);
        
        if (!$this->connection) {
            throw new Exception("Error en la conexión: " . mysqli_connect_error());
        }
        
        if (!mysqli_select_db($this->connection, $bd)) {
            throw new Exception("Error al seleccionar la base de datos: " . mysqli_error($this->connection));
        }
    }
    
    public static function instancia() {
        if (self::$instancia === null) {
            self::$instancia = new self();
        }
        return self::$instancia->connection;
    }
    
    public function __clone() {}
    public function __wakeup() {}
}

function connection() {
    return Conector::instancia();
}
?>

