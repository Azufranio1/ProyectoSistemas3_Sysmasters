<?php
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["IdCosa"])) {
    include("../includes/Connection.php");
    include("../includes/VerifySession.php");
    $con = connection();

    $id_falso = $_POST["IdCosa"];
    $prefix = strtoupper(substr($id_falso, 0, 3));
    $mensaje = "";
    $tipo_mensaje = "";
    $errores = [];

    // Función para validar campos de texto (solo letras y espacios)
    function validarTexto($texto, $nombre_campo) {
        $texto = trim($texto);
        if (empty($texto)) {
            return "El campo $nombre_campo es obligatorio.";
        }
        if (!preg_match('/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/', $texto)) {
            return "El campo $nombre_campo solo puede contener letras y espacios.";
        }
        return null;
    }

    // Función para validar campos alfanuméricos (texto con números permitidos)
    function validarAlfanumerico($texto, $nombre_campo) {
        $texto = trim($texto);
        if (empty($texto)) {
            return "El campo $nombre_campo es obligatorio.";
        }
        if (!preg_match('/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.\-]+$/', $texto)) {
            return "El campo $nombre_campo contiene caracteres no válidos.";
        }
        return null;
    }

    // Función para validar email
    function validarEmail($email, $nombre_campo) {
        $email = trim($email);
        if (empty($email)) {
            return "El campo $nombre_campo es obligatorio.";
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return "El formato del $nombre_campo no es válido.";
        }
        return null;
    }

    // Función para validar fechas
    function validarFecha($fecha, $nombre_campo, $fecha_min = null, $fecha_max = null) {
        if (empty($fecha)) {
            return "El campo $nombre_campo es obligatorio.";
        }
        
        $fecha_obj = DateTime::createFromFormat('Y-m-d', $fecha);
        if (!$fecha_obj || $fecha_obj->format('Y-m-d') !== $fecha) {
            return "El formato de $nombre_campo no es válido.";
        }

        if ($fecha_min && $fecha < $fecha_min) {
            return "La fecha de $nombre_campo no puede ser anterior a " . date('d/m/Y', strtotime($fecha_min)) . ".";
        }

        if ($fecha_max && $fecha > $fecha_max) {
            return "La fecha de $nombre_campo no puede ser posterior a " . date('d/m/Y', strtotime($fecha_max)) . ".";
        }

        return null;
    }

    // Función para validar números
    function validarNumero($numero, $nombre_campo, $min = null, $max = null) {
        if (empty($numero) && $numero !== "0") {
            return "El campo $nombre_campo es obligatorio.";
        }
        
        if (!is_numeric($numero)) {
            return "El campo $nombre_campo debe ser un número válido.";
        }

        $numero = floatval($numero);

        if ($min !== null && $numero < $min) {
            return "El campo $nombre_campo debe ser mayor o igual a $min.";
        }

        if ($max !== null && $numero > $max) {
            return "El campo $nombre_campo debe ser menor o igual a $max.";
        }

        return null;
    }

    // Función para validar teléfono
    function validarTelefono($telefono, $nombre_campo) {
        $telefono = trim($telefono);
        if (empty($telefono)) {
            return "El campo $nombre_campo es obligatorio.";
        }
        if (!preg_match('/^[0-9\+\-\s\(\)]+$/', $telefono)) {
            return "El campo $nombre_campo solo puede contener números, espacios, paréntesis, guiones y el símbolo +.";
        }
        if (strlen($telefono) < 7 || strlen($telefono) > 15) {
            return "El campo $nombre_campo debe tener entre 7 y 15 caracteres.";
        }
        return null;
    }

    // Función para validar CI
    function validarCI($ci, $nombre_campo) {
        $ci = trim($ci);
        if (empty($ci)) {
            return "El campo $nombre_campo es obligatorio.";
        }
        if (!preg_match('/^[0-9\-]+$/', $ci)) {
            return "El campo $nombre_campo solo puede contener números y guiones.";
        }
        if (strlen($ci) < 6 || strlen($ci) > 15) {
            return "El campo $nombre_campo debe tener entre 6 y 15 caracteres.";
        }
        return null;
    }

    $tablasConfiguradas = [
        'PRD' => [
            'tabla' => 'Producto',
            'id_col' => 'ProductoID',
            'nombre_entidad' => 'Producto',
            'campos' => [
                'CategoriaID' => ['tipo' => 'select_categoria', 'label' => 'Categoría'],
                'ColorID1' => ['tipo' => 'select_color', 'label' => 'Color Principal'],
                'ColorID2' => ['tipo' => 'select_color', 'label' => 'Color Secundario'],
                'Nombre' => ['tipo' => 'text', 'label' => 'Nombre del Producto'],
                'PrecioUnitario' => ['tipo' => 'number', 'label' => 'Precio Unitario (Renta)', 'clase' => 'precio'],
                'PrecioVenta' => ['tipo' => 'number', 'label' => 'Precio de Venta', 'clase' => 'precio']
            ]
        ],
        'EMP' => [
            'tabla' => 'Empleado',
            'id_col' => 'EmpleadoID',
            'nombre_entidad' => 'Empleado',
            'campos' => [
                'Nombre' => ['tipo' => 'text', 'label' => 'Nombre'],
                'Apellido' => ['tipo' => 'text', 'label' => 'Apellido'],
                'CI' => ['tipo' => 'text', 'label' => 'CI'],
                'FechaContrato' => ['tipo' => 'date', 'label' => 'Fecha de Contrato', 'clase' => 'fecha'],
                'FechaNacimiento' => ['tipo' => 'date', 'label' => 'Fecha de Nacimiento', 'clase' => 'fecha'],
                'Salario' => ['tipo' => 'number', 'label' => 'Salario', 'clase' => 'precio']
            ],
            'tabla_relacion' => 'UsuarioEmp',
            'id_col_relacion' => 'EmpleadoID',
            'campos_relacion' => [
                'Usuario' => ['tipo' => 'text', 'label' => 'Usuario'],
                'Correo' => ['tipo' => 'email', 'label' => 'Correo']
            ]
        ],
        'MGR' => [
            'tabla' => 'Empleado',
            'id_col' => 'EmpleadoID',
            'nombre_entidad' => 'Gerente',
            'campos' => [
                'Nombre' => ['tipo' => 'text', 'label' => 'Nombre'],
                'Apellido' => ['tipo' => 'text', 'label' => 'Apellido'],
                'CI' => ['tipo' => 'text', 'label' => 'CI'],
                'FechaContrato' => ['tipo' => 'date', 'label' => 'Fecha de Contrato', 'clase' => 'fecha'],
                'FechaNacimiento' => ['tipo' => 'date', 'label' => 'Fecha de Nacimiento', 'clase' => 'fecha'],
                'Salario' => ['tipo' => 'number', 'label' => 'Salario', 'clase' => 'precio']
            ],
            'tabla_relacion' => 'UsuarioEmp',
            'id_col_relacion' => 'EmpleadoID',
            'campos_relacion' => [
                'Usuario' => ['tipo' => 'text', 'label' => 'Usuario'],
                'Correo' => ['tipo' => 'email', 'label' => 'Correo']
            ]
        ],
        'CTM' => [
            'tabla' => 'Cliente',
            'id_col' => 'ClienteID',
            'nombre_entidad' => 'Cliente',
            'campos' => [
                'Nombre' => ['tipo' => 'text', 'label' => 'Nombre'],
                'Telefono' => ['tipo' => 'text', 'label' => 'Teléfono'],
                'Correo' => ['tipo' => 'email', 'label' => 'Correo']
            ]
        ],
        'PRV' => [
            'tabla' => 'Proveedor',
            'id_col' => 'ProveedorID',
            'nombre_entidad' => 'Proveedor',
            'campos' => [
                'Nombre' => ['tipo' => 'text', 'label' => 'Nombre'],
                'NombreContacto' => ['tipo' => 'text', 'label' => 'Nombre de Contacto'],
                'ApellidoContacto' => ['tipo' => 'text', 'label' => 'Apellido de Contacto'],
                'TituloContacto' => ['tipo' => 'text', 'label' => 'Título de Contacto'],
                'Correo' => ['tipo' => 'email', 'label' => 'Correo'],
                'Telefono' => ['tipo' => 'text', 'label' => 'Teléfono']
            ]
        ],
        'GNT' => [
            'tabla' => 'Garantia',
            'id_col' => 'GarantiaID',
            'nombre_entidad' => 'Garantía',
            'campos' => [
                'Tipo' => ['tipo' => 'text', 'label' => 'Tipo de Garantía'],
                'Descripcion' => ['tipo' => 'textarea', 'label' => 'Descripción']
            ]
        ],
    ];

    // Procesar nuevas categorías y colores con validación
    if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['nueva_categoria']) && !empty($_POST['nueva_categoria'])) {
        $nueva_categoria = trim($_POST['nueva_categoria']);
        $error_categoria = validarTexto($nueva_categoria, "nueva categoría");
        
        if ($error_categoria) {
            $errores[] = $error_categoria;
        } else {
            $nuevo_cat_id = generarIdCategoria($con);
            
            $stmt = $con->prepare("INSERT INTO Categoria (CategoriaID, Categoria) VALUES (?, ?)");
            $stmt->bind_param("ss", $nuevo_cat_id, $nueva_categoria);
            $stmt->execute();
            $stmt->close();
            
            $_POST['CategoriaID'] = $nuevo_cat_id;
        }
    }

    if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['nuevo_color1']) && !empty($_POST['nuevo_color1'])) {
        $nuevo_color = trim($_POST['nuevo_color1']);
        $error_color = validarTexto($nuevo_color, "nuevo color");
        
        if ($error_color) {
            $errores[] = $error_color;
        } else {
            $nuevo_color_id = generarIdColor($con);
            
            $stmt = $con->prepare("INSERT INTO Color (ColorID, Color) VALUES (?, ?)");
            $stmt->bind_param("ss", $nuevo_color_id, $nuevo_color);
            $stmt->execute();
            $stmt->close();
            
            $_POST['ColorID1'] = $nuevo_color_id;
        }
    }

    if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['nuevo_color2']) && !empty($_POST['nuevo_color2'])) {
        $nuevo_color = trim($_POST['nuevo_color2']);
        $error_color = validarTexto($nuevo_color, "nuevo color");
        
        if ($error_color) {
            $errores[] = $error_color;
        } else {
            $nuevo_color_id = generarIdColor($con);
            
            $stmt = $con->prepare("INSERT INTO Color (ColorID, Color) VALUES (?, ?)");
            $stmt->bind_param("ss", $nuevo_color_id, $nuevo_color);
            $stmt->execute();
            $stmt->close();
            
            $_POST['ColorID2'] = $nuevo_color_id;
        }
    }

    if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['guardar'])) {
        $tipo_entidad = $_POST['tipo_entidad'];
        
        if (array_key_exists($tipo_entidad, $tablasConfiguradas)) {
            $config = $tablasConfiguradas[$tipo_entidad];
            
            // Validar campos principales
            foreach ($config['campos'] as $campo => $atributos) {
                if (isset($_POST[$campo]) && $_POST[$campo] !== "" && $_POST[$campo] !== 'sin_color') {
                    $valor = $_POST[$campo];
                    $label = $atributos['label'];
                    
                    switch ($campo) {
                        case 'Nombre':
                        case 'Apellido':
                        case 'NombreContacto':
                        case 'ApellidoContacto':
                        case 'TituloContacto':
                        case 'Tipo':
                            $error = validarTexto($valor, $label);
                            if ($error) $errores[] = $error;
                            break;
                            
                        case 'CI':
                            $error = validarCI($valor, $label);
                            if ($error) $errores[] = $error;
                            break;
                            
                        case 'Telefono':
                            $error = validarTelefono($valor, $label);
                            if ($error) $errores[] = $error;
                            break;
                            
                        case 'Correo':
                            $error = validarEmail($valor, $label);
                            if ($error) $errores[] = $error;
                            break;
                            
                        case 'FechaNacimiento':
                            $fecha_min = date('Y-m-d', strtotime('-80 years'));
                            $fecha_max = date('Y-m-d', strtotime('-18 years'));
                            $error = validarFecha($valor, $label, $fecha_min, $fecha_max);
                            if ($error) $errores[] = $error;
                            break;
                            
                        case 'FechaContrato':
                            $fecha_min = date('Y-m-d', strtotime('-10 years'));
                            $fecha_max = date('Y-m-d');
                            $error = validarFecha($valor, $label, $fecha_min, $fecha_max);
                            if ($error) $errores[] = $error;
                            break;
                            
                        case 'PrecioUnitario':
                            $error = validarNumero($valor, $label, 10, 200);
                            if ($error) $errores[] = $error;
                            break;
                            
                        case 'PrecioVenta':
                            $error = validarNumero($valor, $label, 50, 1000);
                            if ($error) $errores[] = $error;
                            break;
                            
                        case 'Salario':
                            $error = validarNumero($valor, $label, 1, 50000);
                            if ($error) $errores[] = $error;
                            break;
                            
                        case 'Descripcion':
                            $valor_limpio = trim($valor);
                            if (empty($valor_limpio)) {
                                $errores[] = "El campo $label es obligatorio.";
                            } else {
                                $_POST[$campo] = $valor_limpio;
                            }
                            break;
                    }
                }
            }
            
            // Validar campos de relación si existen
            if (isset($config['campos_relacion'])) {
                foreach ($config['campos_relacion'] as $campo => $atributos) {
                    if (isset($_POST[$campo]) && $_POST[$campo] !== "") {
                        $valor = $_POST[$campo];
                        $label = $atributos['label'];
                        
                        switch ($campo) {
                            case 'Usuario':
                                $error = validarAlfanumerico($valor, $label);
                                if ($error) $errores[] = $error;
                                break;
                                
                            case 'Correo':
                                $error = validarEmail($valor, $label);
                                if ($error) $errores[] = $error;
                                break;
                        }
                    }
                }
            }
            
            // Si no hay errores, proceder con la inserción
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
                    
                    // Para productos, agregar campos por defecto
                    if ($tipo_entidad === 'PRD') {
                        $campos[] = 'Stock';
                        $valores[] = 0;
                        $placeholders[] = "?";
                        $tipos .= "i";
                        
                        $campos[] = 'Disponible';
                        $valores[] = 0;
                        $placeholders[] = "?";
                        $tipos .= "i";
                        
                        $campos[] = 'Habilitado';
                        $valores[] = 0;
                        $placeholders[] = "?";
                        $tipos .= "i";
                    }
                    
                    foreach ($config['campos'] as $campo => $atributos) {
                        if (isset($_POST[$campo]) && $_POST[$campo] !== "") {
                            // Para colores, permitir valores vacíos (NULL)
                            if (($campo === 'ColorID1' || $campo === 'ColorID2') && $_POST[$campo] === 'sin_color') {
                                continue; // No agregar al query si es "sin_color"
                            }
                            
                            $campos[] = $campo;
                            $valores[] = trim($_POST[$campo]);
                            $placeholders[] = "?";
                            
                            // Determinar tipo de dato
                            if ($atributos['tipo'] === 'number' || in_array($campo, ['PrecioUnitario', 'PrecioVenta', 'Salario'])) {
                                $tipos .= "d"; // decimal para precios
                            } else {
                                $tipos .= "s";
                            }
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
                            $mensaje = ucfirst($config['nombre_entidad']) . " agregado exitosamente con ID: $nuevo_id";
                            $tipo_mensaje = "exito";
                        }
                        
                        $stmt->close();
                    }
                    
                    // Procesar tabla de relación si existe
                    if (isset($config['tabla_relacion']) && isset($config['campos_relacion']) && $tipo_mensaje !== "error") {
                        $tabla_rel = $config['tabla_relacion'];
                        $id_col_rel = $config['id_col_relacion'];
                        
                        $campos_rel = [$id_col_rel];
                        $valores_rel = [$nuevo_id];
                        $placeholders_rel = ["?"];
                        $tipos_rel = "s";
                        
                        foreach ($config['campos_relacion'] as $campo => $atributos) {
                            if (isset($_POST[$campo]) && $_POST[$campo] !== "") {
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
                                $mensaje = "Error al insertar datos relacionados: " . $con->error;
                                $tipo_mensaje = "error";
                            } elseif (empty($mensaje)) {
                                $mensaje = "Datos insertados exitosamente";
                                $tipo_mensaje = "exito";
                            }
                            
                            $stmt_rel->close();
                        }
                    }
                }
            } else {
                $mensaje = "Se encontraron los siguientes errores:<br>• " . implode("<br>• ", $errores);
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
        
        echo "<form class='edit-form' method='POST'>";
        echo "<input type='hidden' name='tipo_entidad' value='$prefix'>";
        echo "<input type='hidden' name='IdCosa' value='$id_falso'>";
        
        foreach ($config['campos'] as $campo => $atributos) {
            $label = $atributos['label'];
            $tipo_campo = $atributos['tipo'];
            $clase = $atributos['clase'] ?? '';
            
            echo "<div class='form-group $clase'>";
            echo "<label for='$campo'>$label:</label>";
            
            $attrs = "";
            $valor = isset($_POST[$campo]) ? htmlspecialchars(trim($_POST[$campo])) : "";
            
            if (($prefix == 'EMP' || $prefix == 'MGR') && $campo == 'FechaContrato') {
                $valor = date('Y-m-d');
                $attrs = " readonly";
            }
            
            if ($campo == 'FechaNacimiento') {
                $min_date = date('Y-m-d', strtotime('-80 years'));
                $max_date = date('Y-m-d', strtotime('-18 years'));
                $attrs = " min='$min_date' max='$max_date'";
            }
            
            if ($campo == 'FechaContrato') {
                $min_date = date('Y-m-d', strtotime('-10 years'));
                $max_date = date('Y-m-d');
                $attrs = " min='$min_date' max='$max_date'";
            }
            
            switch ($tipo_campo) {
                case 'select_categoria':
                    echo "<select class='form-control' id='$campo' name='$campo' required onchange='toggleNuevaCategoria(this)'>";
                    echo "<option value=''>Seleccione una categoría</option>";
                    
                    $result = $con->query("SELECT CategoriaID, Categoria FROM Categoria ORDER BY Categoria");
                    while ($row = $result->fetch_assoc()) {
                        $selected = ($valor == $row['CategoriaID']) ? 'selected' : '';
                        echo "<option value='{$row['CategoriaID']}' $selected>{$row['Categoria']}</option>";
                    }
                    echo "</select>";
                    
                    echo "<div class='nueva-categoria' style='display:none; margin-top:10px;'>";
                    echo "<input type='text' class='form-control' name='nueva_categoria' placeholder='Nombre de la nueva categoría' pattern='[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+' title='Solo letras y espacios'>";
                    echo "</div>";
                    break;
                    
                case 'select_color':
                    $campo_nuevo = ($campo === 'ColorID1') ? 'nuevo_color1' : 'nuevo_color2';
                    echo "<select class='form-control' id='$campo' name='$campo' onchange='toggleNuevoColor(this, \"$campo_nuevo\")'>";
                    echo "<option value='sin_color'>Sin declarar color</option>";
                    
                    $result = $con->query("SELECT ColorID, Color FROM Color ORDER BY Color");
                    while ($row = $result->fetch_assoc()) {
                        $selected = ($valor == $row['ColorID']) ? 'selected' : '';
                        echo "<option value='{$row['ColorID']}' $selected>{$row['Color']}</option>";
                    }
                    echo "<option value='nuevo'>+ Agregar Nuevo Color</option>";
                    echo "</select>";
                    
                    echo "<div class='nuevo-color-$campo' style='display:none; margin-top:10px;'>";
                    echo "<input type='text' class='form-control' name='$campo_nuevo' placeholder='Nombre del nuevo color' pattern='[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+' title='Solo letras y espacios'>";
                    echo "</div>";
                    break;
                    
                case 'textarea':
                    echo "<textarea class='form-control' id='$campo' name='$campo'>$valor</textarea>";
                    break;
                case 'select':
                    echo "<select class='form-control' id='$campo' name='$campo'>";
                    foreach ($atributos['opciones'] as $val => $texto) {
                        $selected = ($valor == $val) ? 'selected' : '';
                        echo "<option value='$val' $selected>$texto</option>";
                    }
                    echo "</select>";
                    break;
                case 'number':
                    $step = "1";
                    $min_val = "0";
                    $max_val = "";
                    
                    if ($campo === 'PrecioUnitario') {
                        $min_val = "10";
                        $max_val = "200";
                    } elseif ($campo === 'PrecioVenta') {
                        $min_val = "50";
                        $max_val = "1000";
                    } elseif ($campo === 'Salario') {
                        $min_val = "2000";
                        $max_val = "5000";
                    }
                    
                    $max_attr = $max_val ? " max='$max_val'" : "";
                    echo "<input type='$tipo_campo' class='form-control' id='$campo' name='$campo' value='$valor' step='$step' min='$min_val'$max_attr$attrs>";
                    break;
                case 'email':
                    echo "<input type='$tipo_campo' class='form-control' id='$campo' name='$campo' value='$valor'$attrs>";
                    break;
                default:
                    $pattern = "";
                    $title = "";
                    
                    if (in_array($campo, ['Nombre', 'Apellido', 'NombreContacto', 'ApellidoContacto', 'TituloContacto', 'Tipo'])) {
                        $pattern = " pattern='[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+' title='Solo letras y espacios'";
                    } elseif ($campo === 'CI') {
                        $pattern = " pattern='[0-9\\-]+' title='Solo números y guiones'";
                    } elseif ($campo === 'Telefono') {
                        $pattern = " pattern='[0-9\\+\\-\\s\\(\\)]+' title='Solo números, espacios, paréntesis, guiones y símbolo +'";
                    } elseif ($campo === 'Usuario') {
                        $pattern = " pattern='[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s\\.\\-]+' title='Letras, números, espacios, puntos y guiones'";
                    }
                    
                    echo "<input type='$tipo_campo' class='form-control' id='$campo' name='$campo' value='$valor'$pattern$attrs>";
            }
            
            echo "</div>";
        }
        
        if (isset($config['tabla_relacion']) && isset($config['campos_relacion'])) {            
            foreach ($config['campos_relacion'] as $campo => $atributos) {
                $label = $atributos['label'];
                $tipo_campo = $atributos['tipo'];
                $clase = $atributos['clase'] ?? '';
                $valor = isset($_POST[$campo]) ? htmlspecialchars(trim($_POST[$campo])) : "";
                
                echo "<div class='form-group $clase'>";
                echo "<label for='$campo'>$label:</label>";
                
                $pattern = "";
                if ($campo === 'Usuario') {
                    $pattern = " pattern='[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s\\.\\-]+' title='Letras, números, espacios, puntos y guiones'";
                }
                
                switch ($tipo_campo) {
                    case 'textarea':
                        echo "<textarea class='form-control' id='$campo' name='$campo'>$valor</textarea>";
                        break;
                    case 'select':
                        echo "<select class='form-control' id='$campo' name='$campo'>";
                        foreach ($atributos['opciones'] as $val => $texto) {
                            $selected = ($valor == $val) ? 'selected' : '';
                            echo "<option value='$val' $selected>$texto</option>";
                        }
                        echo "</select>";
                        break;
                    default:
                        echo "<input type='$tipo_campo' class='form-control' id='$campo' name='$campo' value='$valor'$pattern>";
                }
                
                echo "</div>";
            }
        }
        
        echo "<div class='btn-container'>";
        echo "<button type='button' class='btn btn-volver' onclick=\"window.location.href='../views/ManagerDB.php'\"><i class='bi bi-arrow-left'></i> Volver</button>";
        echo "<button type='submit' name='guardar' class='btn btn-guardar'><i class='bi bi-save'></i> Guardar</button>";
        echo "</div>";
        
        echo "</form>";
        
        // JavaScript para manejar los campos dinámicos y validaciones
        echo "<script>
        function toggleNuevaCategoria(select) {
            const nuevaCategoriaDiv = select.parentNode.querySelector('.nueva-categoria');
            if (select.value === 'nueva') {
                nuevaCategoriaDiv.style.display = 'block';
                nuevaCategoriaDiv.querySelector('input').required = true;
            } else {
                nuevaCategoriaDiv.style.display = 'none';
                nuevaCategoriaDiv.querySelector('input').required = false;
                nuevaCategoriaDiv.querySelector('input').value = '';
            }
        }
        
        function toggleNuevoColor(select, inputName) {
            const nuevoColorDiv = select.parentNode.querySelector('.nuevo-color-' + select.name);
            if (select.value === 'nuevo') {
                nuevoColorDiv.style.display = 'block';
                nuevoColorDiv.querySelector('input').required = true;
            } else {
                nuevoColorDiv.style.display = 'none';
                nuevoColorDiv.querySelector('input').required = false;
                nuevoColorDiv.querySelector('input').value = '';
            }
        }
        
        // Validación en tiempo real para campos de texto
        document.addEventListener('DOMContentLoaded', function() {
            // Validar campos que solo permiten letras
            const camposTexto = document.querySelectorAll('input[pattern*=\"a-zA-Z\"]');
            camposTexto.forEach(function(campo) {
                campo.addEventListener('input', function() {
                    let valor = this.value;
                    // Remover caracteres no válidos
                    valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]/g, '');
                    this.value = valor;
                });
            });
            
            // Validar campos de teléfono
            const camposTelefono = document.querySelectorAll('input[name=\"Telefono\"]');
            camposTelefono.forEach(function(campo) {
                campo.addEventListener('input', function() {
                    let valor = this.value;
                    // Remover caracteres no válidos para teléfono
                    valor = valor.replace(/[^0-9\\+\\-\\s\\(\\)]/g, '');
                    this.value = valor;
                });
            });
            
            // Validar campos de CI
            const camposCI = document.querySelectorAll('input[name=\"CI\"]');
            camposCI.forEach(function(campo) {
                campo.addEventListener('input', function() {
                    let valor = this.value;
                    // Remover caracteres no válidos para CI
                    valor = valor.replace(/[^0-9\\-]/g, '');
                    this.value = valor;
                });
            });
            
            // Validar campos de Usuario
            const camposUsuario = document.querySelectorAll('input[name=\"Usuario\"]');
            camposUsuario.forEach(function(campo) {
                campo.addEventListener('input', function() {
                    let valor = this.value;
                    // Remover caracteres no válidos para usuario
                    valor = valor.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\\s\\.\\-]/g, '');
                    this.value = valor;
                });
            });
            
            // Validar precios en tiempo real
            const precioUnitario = document.querySelector('input[name=\"PrecioUnitario\"]');
            if (precioUnitario) {
                precioUnitario.addEventListener('blur', function() {
                    const valor = parseFloat(this.value);
                    if (valor < 10) {
                        alert('El precio unitario debe ser mayor o igual a 10');
                        this.focus();
                    } else if (valor > 200) {
                        alert('El precio unitario debe ser menor o igual a 200');
                        this.focus();
                    }
                });
            }
            
            const precioVenta = document.querySelector('input[name=\"PrecioVenta\"]');
            if (precioVenta) {
                precioVenta.addEventListener('blur', function() {
                    const valor = parseFloat(this.value);
                    if (valor < 50) {
                        alert('El precio de venta debe ser mayor o igual a 50');
                        this.focus();
                    } else if (valor > 1000) {
                        alert('El precio de venta debe ser menor o igual a 1000');
                        this.focus();
                    }
                });
            }
            
            // Validar salario
            const salario = document.querySelector('input[name=\"Salario\"]');
            if (salario) {
                salario.addEventListener('blur', function() {
                    const valor = parseFloat(this.value);
                    if (valor < 1) {
                        alert('El salario debe ser mayor o igual a 1');
                        this.focus();
                    } else if (valor > 50000) {
                        alert('El salario debe ser menor o igual a 50000');
                        this.focus();
                    }
                });
            }
            
            // Trim automático en todos los campos de texto al perder el foco
            const todosCampos = document.querySelectorAll('input[type=\"text\"], input[type=\"email\"], textarea');
            todosCampos.forEach(function(campo) {
                campo.addEventListener('blur', function() {
                    this.value = this.value.trim();
                });
            });
        });
        </script>";
        
    } else {
        echo "<div class='mensaje error'>Tipo de registro no válido.</div>";
    }
    
    $con->close();
} else {
    echo "<div class='mensaje error'>Acceso no válido. Se requiere especificar un ID para determinar el tipo de registro.</div>";
}

function generarNuevoID($con, $tipo_entidad) {
    switch ($tipo_entidad) {
        case 'PRD':
            return generarIdProducto($con);
        case 'EMP':
            return generarIdEmpleado($con);
        case 'MGR':
            return generarIdGerente($con);
        case 'CTM':
            return generarIdCliente($con);
        case 'PRV':
            return generarIdProveedor($con);
        case 'GNT':
            return generarIdGarantia($con);
        default:
            return false;
    }
}

function generarIdProducto($con) {
    $result = $con->query("SELECT MAX(CAST(SUBSTRING(ProductoID, 5) AS UNSIGNED)) as max_id FROM Producto WHERE ProductoID LIKE 'PRD-%'");
    $row = $result->fetch_assoc();
    $maxId = $row['max_id'] ?? 0;
    $newNumericId = $maxId + 1;
    $newId = 'PRD-' . str_pad($newNumericId, 3, '0', STR_PAD_LEFT);
    return $newId;
}

function generarIdCategoria($con) {
    $result = $con->query("SELECT MAX(CAST(SUBSTRING(CategoriaID, 5) AS UNSIGNED)) as max_id FROM Categoria WHERE CategoriaID LIKE 'CAT-%'");
    $row = $result->fetch_assoc();
    $maxId = $row['max_id'] ?? 0;
    $newNumericId = $maxId + 1;
    $newId = 'CAT-' . str_pad($newNumericId, 3, '0', STR_PAD_LEFT);
    return $newId;
}

function generarIdColor($con) {
    $result = $con->query("SELECT MAX(CAST(SUBSTRING(ColorID, 5) AS UNSIGNED)) as max_id FROM Color WHERE ColorID LIKE 'COL-%'");
    $row = $result->fetch_assoc();
    $maxId = $row['max_id'] ?? 0;
    $newNumericId = $maxId + 1;
    $newId = 'COL-' . str_pad($newNumericId, 3, '0', STR_PAD_LEFT);
    return $newId;
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

function generarIdCliente($con) {
    $result = $con->query("SELECT MAX(CAST(SUBSTRING(ClienteID, 5) AS UNSIGNED)) as max_id FROM Cliente WHERE ClienteID LIKE 'CTM-%'");
    $row = $result->fetch_assoc();
    $maxId = $row['max_id'] ?? 0;
    $newNumericId = $maxId + 1;
    $newId = 'CTM-' . str_pad($newNumericId, 3, '0', STR_PAD_LEFT);
    return $newId;
}

function generarIdProveedor($con) {
    $result = $con->query("SELECT MAX(CAST(SUBSTRING(ProveedorID, 5) AS UNSIGNED)) as max_id FROM Proveedor WHERE ProveedorID LIKE 'PRV-%'");
    $row = $result->fetch_assoc();
    $maxId = $row['max_id'] ?? 0;
    $newNumericId = $maxId + 1;
    $newId = 'PRV-' . str_pad($newNumericId, 3, '0', STR_PAD_LEFT);
    return $newId;
}

function generarIdGarantia($con) {
    $result = $con->query("SELECT MAX(CAST(SUBSTRING(GarantiaID, 5) AS UNSIGNED)) as max_id FROM Garantia WHERE GarantiaID LIKE 'GNT-%'");
    $row = $result->fetch_assoc();
    $maxId = $row['max_id'] ?? 0;
    $newNumericId = $maxId + 1;
    $newId = 'GNT-' . str_pad($newNumericId, 3, '0', STR_PAD_LEFT);
    return $newId;
}
?>