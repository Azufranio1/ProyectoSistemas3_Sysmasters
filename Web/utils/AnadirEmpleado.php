<?php
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["IdCosa"]) || isset($_GET["IdCosa"])) {
    include("../includes/Connection.php");
    include("../includes/VerifySession.php");
    $con = connection();

    $id_falso = isset($_POST["IdCosa"]) ? $_POST["IdCosa"] : $_GET["IdCosa"];
    $prefix = strtoupper(substr($id_falso, 0, 3));
    $mensaje = "";
    $tipo_mensaje = "";

    if ($prefix !== 'EMP' && $prefix !== 'MGR') {
        echo "<div class='mensaje error'>Este formulario es sólo para empleados y gerentes.</div>";
        echo "<script>setTimeout(function() { window.location.href='Anadir.php?IdCosa=$id_falso'; }, 2000);</script>";
        exit();
    }

    $tablasConfiguradas = [
        'EMP' => [
            'tabla' => 'Empleado',
            'id_col' => 'EmpleadoID',
            'nombre_entidad' => 'Empleado',
            'campos' => [
                'Nombre' => ['tipo' => 'text', 'label' => 'Nombre', 'required' => true],
                'Apellido' => ['tipo' => 'text', 'label' => 'Apellido', 'required' => true],
                'CI' => ['tipo' => 'number', 'label' => 'CI', 'required' => true],
                'FechaContrato' => ['tipo' => 'date', 'label' => 'Fecha de Contrato', 'clase' => 'fecha', 'required' => true],
                'FechaNacimiento' => ['tipo' => 'date', 'label' => 'Fecha de Nacimiento', 'clase' => 'fecha', 'required' => true]
            ],
            'tabla_relacion' => 'UsuarioEmp',
            'id_col_relacion' => 'EmpleadoID',
            'campos_relacion' => [
                'Usuario' => ['tipo' => 'text', 'label' => 'Usuario', 'required' => true]
            ]
        ],
        'MGR' => [
            'tabla' => 'Empleado',
            'id_col' => 'EmpleadoID',
            'nombre_entidad' => 'Gerente',
            'campos' => [
                'Nombre' => ['tipo' => 'text', 'label' => 'Nombre', 'required' => true],
                'Apellido' => ['tipo' => 'text', 'label' => 'Apellido', 'required' => true],
                'CI' => ['tipo' => 'text', 'label' => 'CI', 'required' => true],
                'FechaContrato' => ['tipo' => 'date', 'label' => 'Fecha de Contrato', 'clase' => 'fecha', 'required' => true],
                'FechaNacimiento' => ['tipo' => 'date', 'label' => 'Fecha de Nacimiento', 'clase' => 'fecha', 'required' => true]
            ],
            'tabla_relacion' => 'UsuarioEmp',
            'id_col_relacion' => 'EmpleadoID',
            'campos_relacion' => [
                'Usuario' => ['tipo' => 'text', 'label' => 'Usuario', 'required' => true]
            ]
        ]
    ];

    // Función para validar que solo contenga letras y espacios
    function validarSoloLetras($texto) {
        return preg_match('/^[a-zA-ZÁáÉéÍíÓóÚúÑñ\s]+$/', $texto);
    }

    // Función para validar CI (solo números y guiones)
    function validarCI($ci) {
        return preg_match('/^[0-9]+$/', $ci);
    }

    // Función para validar fechas
    function validarFecha($fecha, $tipo) {
        $fechaObj = DateTime::createFromFormat('Y-m-d', $fecha);
        if (!$fechaObj) return false;
        
        $hoy = new DateTime();
        
        if ($tipo === 'nacimiento') {
            $hace50anos = clone $hoy;
            $hace50anos->modify('-50 years');
            $hace18anos = clone $hoy;
            $hace18anos->modify('-18 years');
            
            return $fechaObj >= $hace50anos && $fechaObj <= $hace18anos;
        }
        
        if ($tipo === 'contrato') {
            return $fechaObj <= $hoy;
        }
        
        return true;
    }

    if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['guardar'])) {
        $tipo_entidad = $_POST['tipo_entidad'];
        $errores = [];
        
        if (array_key_exists($tipo_entidad, $tablasConfiguradas)) {
            $config = $tablasConfiguradas[$tipo_entidad];
            
            // Validaciones de campos principales
            foreach ($config['campos'] as $campo => $atributos) {
                if ($atributos['required'] && (empty($_POST[$campo]) || trim($_POST[$campo]) === "")) {
                    $errores[] = "El campo {$atributos['label']} es obligatorio";
                } else if (!empty($_POST[$campo])) {
                    $valor = trim($_POST[$campo]);
                    
                    // Validar nombre y apellido (solo letras)
                    if (($campo === 'Nombre' || $campo === 'Apellido') && !validarSoloLetras($valor)) {
                        $errores[] = "{$atributos['label']} solo puede contener letras y espacios";
                    }
                    
                    // Validar longitud de campos de texto
                    if (in_array($campo, ['Nombre', 'Apellido', 'Usuario'])) {
                        if (strlen($valor) < 3) {
                            $errores[] = "{$atributos['label']} debe tener al menos 3 caracteres";
                        }
                        if (strlen($valor) > 25) {
                            $errores[] = "{$atributos['label']} no puede tener más de 25 caracteres";
                        }
                    }
                    
                    // Validar CI
                    if ($campo === 'CI') {
                        if (!validarCI($valor)) {
                            $errores[] = "CI solo puede contener números";
                        }
                        if (strlen($valor) < 7 || strlen($valor) > 15) {
                            $errores[] = "CI debe tener entre 7 y 15 caracteres";
                        }
                    }
                    
                    // Validar fechas
                    if ($campo === 'FechaNacimiento' && !validarFecha($valor, 'nacimiento')) {
                        $errores[] = "Fecha de nacimiento debe ser entre hace 50 años y hace 18 años";
                    }
                    
                    if ($campo === 'FechaContrato' && !validarFecha($valor, 'contrato')) {
                        $errores[] = "Fecha de contrato no puede ser futura";
                    }
                }
            }
            
            // Validaciones de campos de relación
            if (isset($config['campos_relacion'])) {
                foreach ($config['campos_relacion'] as $campo => $atributos) {
                    if ($atributos['required'] && (empty($_POST[$campo]) || trim($_POST[$campo]) === "")) {
                        $errores[] = "El campo {$atributos['label']} es obligatorio";
                    } else if (!empty($_POST[$campo])) {
                        $valor = trim($_POST[$campo]);
                        
                        // Validar longitud del usuario
                        if ($campo === 'Usuario') {
                            if (strlen($valor) < 3) {
                                $errores[] = "{$atributos['label']} debe tener al menos 3 caracteres";
                            }
                            if (strlen($valor) > 20) {
                                $errores[] = "{$atributos['label']} no puede tener más de 20 caracteres";
                            }
                            
                            // Verificar que el usuario no exista
                            $stmt_check = $con->prepare("SELECT Usuario FROM UsuarioEmp WHERE Usuario = ?");
                            $stmt_check->bind_param("s", $valor);
                            $stmt_check->execute();
                            $result_check = $stmt_check->get_result();
                            if ($result_check->num_rows > 0) {
                                $errores[] = "El usuario '$valor' ya existe";
                            }
                            $stmt_check->close();
                        }
                    }
                }
            }
            
            // Verificar que el CI no exista
            if (!empty($_POST['CI'])) {
                $ci_valor = trim($_POST['CI']);
                $stmt_ci = $con->prepare("SELECT CI FROM Empleado WHERE CI = ?");
                $stmt_ci->bind_param("s", $ci_valor);
                $stmt_ci->execute();
                $result_ci = $stmt_ci->get_result();
                if ($result_ci->num_rows > 0) {
                    $errores[] = "El CI '$ci_valor' ya está registrado";
                }
                $stmt_ci->close();
            }
            
            if (empty($errores)) {
                $tabla = $config['tabla'];
                $id_col = $config['id_col'];
                
                $nuevo_id = generarNuevoID($con, $tipo_entidad);
                
                if (!$nuevo_id) {
                    $mensaje = "Error al generar un nuevo ID";
                    $tipo_mensaje = "error";
                } else {
                    $campos = [$id_col];
                    $valores = [$nuevo_id];
                    $placeholders = ["?"];
                    $tipos = "s";
                    
                    foreach ($config['campos'] as $campo => $atributos) {
                        if (isset($_POST[$campo]) && trim($_POST[$campo]) !== "") {
                            $campos[] = $campo;
                            $valores[] = trim($_POST[$campo]);
                            $placeholders[] = "?";
                            $tipos .= "s";
                        }
                    }
                    
                    if (count($campos) > 1) {
                        $sql = "INSERT INTO $tabla (" . implode(", ", $campos) . ") VALUES (" . implode(", ", $placeholders) . ")";
                        $stmt = $con->prepare($sql);
                        $stmt->bind_param($tipos, ...$valores);
                        $result = $stmt->execute();
                        
                        if (!$result) {
                            $mensaje = "Error al insertar datos: " . $con->error;
                            $tipo_mensaje = "error";
                        } else {
                            if (isset($config['tabla_relacion']) && isset($config['campos_relacion'])) {
                                $tabla_rel = $config['tabla_relacion'];
                                $id_col_rel = $config['id_col_relacion'];
                                
                                $campos_rel = [$id_col_rel];
                                $valores_rel = [$nuevo_id];
                                $placeholders_rel = ["?"];
                                $tipos_rel = "s";
                                
                                foreach ($config['campos_relacion'] as $campo => $atributos) {
                                    if (isset($_POST[$campo]) && trim($_POST[$campo]) !== "") {
                                        $campos_rel[] = $campo;
                                        $valores_rel[] = trim($_POST[$campo]);
                                        $placeholders_rel[] = "?";
                                        $tipos_rel .= "s";
                                    }
                                }
                                
                                if (count($campos_rel) > 1) {
                                    $sql_rel = "INSERT INTO $tabla_rel (" . implode(", ", $campos_rel) . ") VALUES (" . implode(", ", $placeholders_rel) . ")";
                                    $stmt_rel = $con->prepare($sql_rel);
                                    $stmt_rel->bind_param($tipos_rel, ...$valores_rel);
                                    $result_rel = $stmt_rel->execute();
                                    
                                    if (!$result_rel) {
                                        $mensaje = "Error al insertar datos del usuario: " . $con->error;
                                        $tipo_mensaje = "error";
                                    } else {
                                        echo "<form id='redirectForm' action='../views/CorreoEmpleado.php' method='POST' style='display:none;'>";
                                        echo "<input type='hidden' name='id' value='" . htmlspecialchars($nuevo_id) . "'>";
                                        echo "<input type='hidden' name='tipo' value='" . htmlspecialchars($tipo_entidad) . "'>";
                                        echo "</form>";
                                        echo "<script>document.getElementById('redirectForm').submit();</script>";
                                        exit();
                                    }
                                    
                                    $stmt_rel->close();
                                }
                            } else {
                                $mensaje = "Datos del empleado guardados exitosamente";
                                $tipo_mensaje = "exito";
                            }
                        }
                        
                        $stmt->close();
                    }
                }
            } else {
                $mensaje = implode("<br>", $errores);
                $tipo_mensaje = "error";
            }
        } else {
            $mensaje = "Tipo de registro no válido";
            $tipo_mensaje = "error";
        }
    }

    if (!empty($mensaje)) {
        echo "<div class='mensaje $tipo_mensaje'>$mensaje</div>";
    }

    if (array_key_exists($prefix, $tablasConfiguradas)) {
        $config = $tablasConfiguradas[$prefix];
        $nombre_entidad = $config['nombre_entidad'];
        
        echo "<script>document.querySelector('.edit-card h2').innerText = 'Agregar $nombre_entidad';</script>";
        echo "<form class='edit-form' method='POST' novalidate>";
        echo "<input type='hidden' name='tipo_entidad' value='$prefix'>";
        echo "<input type='hidden' name='IdCosa' value='$id_falso'>";
        
        foreach ($config['campos'] as $campo => $atributos) {
            $label = $atributos['label'];
            $tipo_campo = $atributos['tipo'];
            $clase = $atributos['clase'] ?? '';
            $required = $atributos['required'] ?? false;
            $requiredAttr = $required ? 'required' : '';
            
            echo "<div class='form-group $clase'>";
            echo "<label for='$campo'>$label:" . ($required ? " *" : "") . "</label>";
            
            $attrs = "";
            $valor = isset($_POST[$campo]) ? htmlspecialchars($_POST[$campo]) : "";
            
            if (($prefix == 'EMP' || $prefix == 'MGR') && $campo == 'FechaContrato') {
                $valor = date('Y-m-d');
                $attrs = " readonly";
            }
            
            if ($campo == 'FechaNacimiento') {
                $min_date = date('Y-m-d', strtotime('-50 years'));
                $max_date = date('Y-m-d', strtotime('-18 years'));
                $attrs = " min='$min_date' max='$max_date'";
            }
            
            // Agregar atributos de validación según el campo
            if ($campo === 'Nombre' || $campo === 'Apellido') {
                $attrs .= " minlength='3' maxlength='25' pattern='[a-zA-ZÁáÉéÍíÓóÚúÑñ\\s]+' title='Solo se permiten letras y espacios'";
            }
            
            if ($campo === 'CI') {
                $attrs .= " minlength='7' maxlength='15' pattern='[0-9\\-]+' title='Solo se permiten números y guiones'";
            }
            
            switch ($tipo_campo) {
                case 'textarea':
                    echo "<textarea class='form-control' id='$campo' name='$campo' $requiredAttr$attrs>$valor</textarea>";
                    break;
                case 'select':
                    echo "<select class='form-control' id='$campo' name='$campo' $requiredAttr>";
                    if (!$required) echo "<option value=''>Seleccionar...</option>";
                    foreach ($atributos['opciones'] as $val => $texto) {
                        $selected = ($valor == $val) ? 'selected' : '';
                        echo "<option value='$val' $selected>$texto</option>";
                    }
                    echo "</select>";
                    break;
                default:
                    echo "<input type='$tipo_campo' class='form-control' id='$campo' name='$campo' value='$valor' $requiredAttr$attrs>";
            }
            
            echo "</div>";
        }
        
        if (isset($config['tabla_relacion']) && isset($config['campos_relacion'])) {            
            foreach ($config['campos_relacion'] as $campo => $atributos) {
                $label = $atributos['label'];
                $tipo_campo = $atributos['tipo'];
                $clase = $atributos['clase'] ?? '';
                $required = $atributos['required'] ?? false;
                $requiredAttr = $required ? 'required' : '';
                $valor = isset($_POST[$campo]) ? htmlspecialchars($_POST[$campo]) : "";
                
                echo "<div class='form-group $clase'>";
                echo "<label for='$campo'>$label:" . ($required ? " *" : "") . "</label>";
                
                $attrs = "";
                if ($campo === 'Usuario') {
                    $attrs = " minlength='3' maxlength='20'";
                }
                
                switch ($tipo_campo) {
                    case 'textarea':
                        echo "<textarea class='form-control' id='$campo' name='$campo' $requiredAttr$attrs>$valor</textarea>";
                        break;
                    case 'select':
                        echo "<select class='form-control' id='$campo' name='$campo' $requiredAttr>";
                        if (!$required) echo "<option value=''>Seleccionar...</option>";
                        foreach ($atributos['opciones'] as $val => $texto) {
                            $selected = ($valor == $val) ? 'selected' : '';
                            echo "<option value='$val' $selected>$texto</option>";
                        }
                        echo "</select>";
                        break;
                    default:
                        echo "<input type='$tipo_campo' class='form-control' id='$campo' name='$campo' value='$valor' $requiredAttr$attrs>";
                }
                
                echo "</div>";
            }
        }
        
        echo "<div class='btn-container'>";
        echo "<button type='button' class='btn btn-volver' onclick=\"window.location.href='../views/ManagerDB.php'\"><i class='bi bi-arrow-left'></i> Volver</button>";
        echo "<button type='submit' name='guardar' class='btn btn-guardar'><i class='bi bi-save'></i> Guardar</button>";
        echo "</div>";
        
        echo "</form>";
        
        // Agregar JavaScript para validación en tiempo real
        echo "<script>";
        echo "document.addEventListener('DOMContentLoaded', function() {";
        echo "  const form = document.querySelector('.edit-form');";
        echo "  const inputs = form.querySelectorAll('input, select, textarea');";
        echo "  ";
        echo "  inputs.forEach(input => {";
        echo "    input.addEventListener('blur', function() {";
        echo "      validateField(this);";
        echo "    });";
        echo "  });";
        echo "  ";
        echo "  function validateField(field) {";
        echo "    const value = field.value.trim();";
        echo "    let isValid = true;";
        echo "    let errorMessage = '';";
        echo "    ";
        echo "    if (field.hasAttribute('required') && !value) {";
        echo "      isValid = false;";
        echo "      errorMessage = 'Este campo es obligatorio';";
        echo "    } else if (value) {";
        echo "      if (field.hasAttribute('pattern') && !new RegExp(field.pattern).test(value)) {";
        echo "        isValid = false;";
        echo "        errorMessage = field.title || 'Formato inválido';";
        echo "      }";
        echo "      if (field.hasAttribute('minlength') && value.length < parseInt(field.minlength)) {";
        echo "        isValid = false;";
        echo "        errorMessage = 'Mínimo ' + field.minlength + ' caracteres';";
        echo "      }";
        echo "      if (field.hasAttribute('maxlength') && value.length > parseInt(field.maxlength)) {";
        echo "        isValid = false;";
        echo "        errorMessage = 'Máximo ' + field.maxlength + ' caracteres';";
        echo "      }";
        echo "    }";
        echo "    ";
        echo "    const existingError = field.parentNode.querySelector('.error-message');";
        echo "    if (existingError) existingError.remove();";
        echo "    ";
        echo "    if (!isValid) {";
        echo "      field.classList.add('error');";
        echo "      const errorDiv = document.createElement('div');";
        echo "      errorDiv.className = 'error-message';";
        echo "      errorDiv.textContent = errorMessage;";
        echo "      errorDiv.style.color = 'red';";
        echo "      errorDiv.style.fontSize = '12px';";
        echo "      errorDiv.style.marginTop = '5px';";
        echo "      field.parentNode.appendChild(errorDiv);";
        echo "    } else {";
        echo "      field.classList.remove('error');";
        echo "    }";
        echo "  }";
        echo "});";
        echo "</script>";
        
    } else {
        echo "<div class='mensaje error'>Tipo de registro no válido.</div>";
    }
    
    $con->close();
} else {
    echo "<div class='mensaje error'>Acceso no válido. Se requiere especificar un ID para determinar el tipo de registro.</div>";
}

function generarNuevoID($con, $tipo_entidad) {
    switch ($tipo_entidad) {
        case 'EMP':
            return generarIdEmpleado($con);
        case 'MGR':
            return generarIdGerente($con);
        default:
            return false;
    }
}

function generarIdEmpleado($con) {
    $result = $con->query("SELECT MAX(CAST(SUBSTRING(EmpleadoID, 5) AS UNSIGNED)) as max_id FROM Empleado WHERE EmpleadoID LIKE 'EMP-%'");
    $row = $result->fetch_assoc();
    $maxId = $row['max_id'] ?? 0;
    $newNumericId = $maxId + 1;
    $newId = 'EMP-' . str_pad($newNumericId, 3, '0', STR_PAD_LEFT);
    return $newId;
}

function generarIdGerente($con) {
    $result = $con->query("SELECT MAX(CAST(SUBSTRING(EmpleadoID, 5) AS UNSIGNED)) as max_id FROM Empleado WHERE EmpleadoID LIKE 'MGR-%'");
    $row = $result->fetch_assoc();
    $maxId = $row['max_id'] ?? 0;
    $newNumericId = $maxId + 1;
    $newId = 'MGR-' . str_pad($newNumericId, 3, '0', STR_PAD_LEFT);
    return $newId;
}
?>