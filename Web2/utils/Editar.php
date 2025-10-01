<?php
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST["IdCosa"])) {
    include("../includes/Connection.php");
    include("../includes/VerifySession.php");
    $con = connection();

    $id = $_POST["IdCosa"];
    $prefix = strtoupper(substr($id, 0, 3));
    $mensaje = "";
    $tipo_mensaje = "";

    $tablasConfiguradas = [
        'PRD' => [
            'tabla' => 'Producto',
            'id_col' => 'ProductoID',
            'campos' => [
                'Categoria' => ['tipo' => 'text', 'label' => 'Categoría'],
                'Color' => ['tipo' => 'text', 'label' => 'Color'],
                'PrecioUnitario' => ['tipo' => 'number', 'label' => 'Precio Unitario', 'clase' => 'precio'],
                'PrecioVenta' => ['tipo' => 'number', 'label' => 'Precio Venta', 'clase' => 'precio'], // Nuevo campo
                'Descripcion' => ['tipo' => 'textarea', 'label' => 'Descripción']
            ]
        ],
        'EMP' => [
            'tabla' => 'Empleado',
            'id_col' => 'EmpleadoID',
            'campos' => [
                'Nombre' => ['tipo' => 'text', 'label' => 'Nombre'],
                'Apellido' => ['tipo' => 'text', 'label' => 'Apellido'],
                'CI' => ['tipo' => 'text', 'label' => 'CI'],
                'FechaContrato' => ['tipo' => 'date', 'label' => 'Fecha de Contrato', 'clase' => 'fecha'],
                'FechaNacimiento' => ['tipo' => 'date', 'label' => 'Fecha de Nacimiento', 'clase' => 'fecha']
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
            'campos' => [
                'Nombre' => ['tipo' => 'text', 'label' => 'Nombre'],
                'Apellido' => ['tipo' => 'text', 'label' => 'Apellido'],
                'CI' => ['tipo' => 'text', 'label' => 'CI'],
                'FechaContrato' => ['tipo' => 'date', 'label' => 'Fecha de Contrato', 'clase' => 'fecha'],
                'FechaNacimiento' => ['tipo' => 'date', 'label' => 'Fecha de Nacimiento', 'clase' => 'fecha']
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
            'campos' => [
                'Nombre' => ['tipo' => 'text', 'label' => 'Nombre'],
                'Telefono' => ['tipo' => 'number', 'label' => 'Teléfono'],
                'Correo' => ['tipo' => 'email', 'label' => 'Correo']
            ]
        ],
        'PRV' => [
            'tabla' => 'Proveedor',
            'id_col' => 'ProveedorID',
            'campos' => [
                'Nombre' => ['tipo' => 'text', 'label' => 'Nombre'],
                'NombreContacto' => ['tipo' => 'text', 'label' => 'Nombre de Contacto'],
                'ApellidoContacto' => ['tipo' => 'text', 'label' => 'Apellido de Contacto'],
                'TituloContacto' => ['tipo' => 'text', 'label' => 'Título de Contacto'],
                'Telefono' => ['tipo' => 'text', 'label' => 'Teléfono']
            ]
        ],
        'GNT' => [
            'tabla' => 'Garantia',
            'id_col' => 'GarantiaID',
            'campos' => [
                'Descripcion' => ['tipo' => 'textarea', 'label' => 'Descripción'],
                'FechaInicio' => ['tipo' => 'date', 'label' => 'Fecha de Inicio', 'clase' => 'fecha'],
                'FechaFin' => ['tipo' => 'date', 'label' => 'Fecha de Fin', 'clase' => 'fecha']
            ]
        ],
    ];

        if (isset($_POST['guardar'])) {
            if (array_key_exists($prefix, $tablasConfiguradas)) {
                $config = $tablasConfiguradas[$prefix];
                $tabla = $config['tabla'];
                $id_col = $config['id_col'];
            
            $sets = [];
            $valores = [];
            $tipos = "";
            
            foreach ($config['campos'] as $campo => $atributos) {
                if (isset($_POST[$campo])) {
                    $sets[] = "$campo = ?";
                    $valores[] = $_POST[$campo];
                    $tipos .= "s";
                }
            }
            
            if (!empty($sets)) {
                $valores[] = $id;
                $tipos .= "s";
                
                $sql = "UPDATE $tabla SET " . implode(", ", $sets) . " WHERE $id_col = ?";
                $stmt = $con->prepare($sql);
                $stmt->bind_param($tipos, ...$valores);
                $result = $stmt->execute();
                
                if (!$result) {
                    $mensaje = "Error al actualizar datos: " . $con->error;
                    $tipo_mensaje = "error";
                } else {
                    $mensaje = "Datos actualizados exitosamente";
                    $tipo_mensaje = "exito";
                }
                
                $stmt->close();
            }
            
            if (isset($config['tabla_relacion']) && isset($config['campos_relacion'])) {
                $tabla_rel = $config['tabla_relacion'];
                $id_col_rel = $config['id_col_relacion'];
                
                $sets_rel = [];
                $valores_rel = [];
                $tipos_rel = "";
                
                foreach ($config['campos_relacion'] as $campo => $atributos) {
                    if (isset($_POST[$campo])) {
                        $sets_rel[] = "$campo = ?";
                        $valores_rel[] = $_POST[$campo];
                        $tipos_rel .= "s";
                    }
                }
                
                if (!empty($sets_rel)) {
                    $valores_rel[] = $id;
                    $tipos_rel .= "s";
                    
                    $sql_rel = "UPDATE $tabla_rel SET " . implode(", ", $sets_rel) . " WHERE $id_col_rel = ?";
                    $stmt_rel = $con->prepare($sql_rel);
                    $stmt_rel->bind_param($tipos_rel, ...$valores_rel);
                    $result_rel = $stmt_rel->execute();
                    
                    if (!$result_rel) {
                        $mensaje = "Error al actualizar datos relacionados: " . $con->error;
                        $tipo_mensaje = "error";
                    } elseif (empty($mensaje)) {
                        $mensaje = "Datos actualizados exitosamente";
                        $tipo_mensaje = "exito";
                    }
                    
                    $stmt_rel->close();
                }
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
        $tabla = $config['tabla'];
        $id_col = $config['id_col'];
        
        if (strpos($tabla, 'JOIN') !== false) {
            $consulta_select = "SELECT * FROM " . $tabla . " WHERE $id_col = ?";
        } else {
            $consulta_select = "SELECT * FROM $tabla WHERE $id_col = ?";
        }
        
        $stmt = $con->prepare($consulta_select);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        if ($resultado->num_rows > 0) {
            $datos = $resultado->fetch_assoc();
            
            $tipoEntidad = match($prefix) {
                'PRD' => 'Producto',
                'PRV' => 'Proveedor',
                'CTM' => 'Cliente',
                'GNT' => 'Garantía',
                'EMP', 'MGR' => 'Empleado',
                default => 'Registro'
            };
            
            echo "<script>document.querySelector('.edit-card h2').innerText = 'Editar $tipoEntidad';</script>";
            echo "<form class='edit-form' method='POST'>";
            echo "<input type='hidden' name='IdCosa' value='$id'>";
            
            foreach ($config['campos'] as $campo => $atributos) {
                if ($prefix == 'PRV' && ($campo == 'DireccionID' || $campo == 'Habilitado')) {
                    continue;
                }
                
                $valor = htmlspecialchars($datos[$campo] ?? '');
                $label = $atributos['label'];
                $tipo = $atributos['tipo'];
                $clase = $atributos['clase'] ?? '';
                
                echo "<div class='form-group $clase'>";
                echo "<label for='$campo'>$label:</label>";
                
                switch ($tipo) {
                    case 'textarea':
                        echo "<textarea class='form-control' id='$campo' name='$campo'>$valor</textarea>";
                        break;
                    case 'select':
                        echo "<select class='form-control' id='$campo' name='$campo'>";
                        foreach ($atributos['opciones'] as $val => $texto) {
                            $selected = ($datos[$campo] == $val) ? 'selected' : '';
                            echo "<option value='$val' $selected>$texto</option>";
                        }
                        echo "</select>";
                        break;
                    default:
                        echo "<input type='$tipo' class='form-control' id='$campo' name='$campo' value='$valor'>";
                }
                
                echo "</div>";
            }
            
            if (isset($config['tabla_relacion']) && isset($config['campos_relacion'])) {
                $tabla_rel = $config['tabla_relacion'];
                $id_col_rel = $config['id_col_relacion'];
                
                $sql_rel = "SELECT * FROM $tabla_rel WHERE $id_col_rel = ?";
                $stmt_rel = $con->prepare($sql_rel);
                $stmt_rel->bind_param("s", $id);
                $stmt_rel->execute();
                $resultado_rel = $stmt_rel->get_result();
                
                if ($resultado_rel->num_rows > 0) {
                    $datos_rel = $resultado_rel->fetch_assoc();
                    
                    foreach ($config['campos_relacion'] as $campo => $atributos) {
                        $valor = htmlspecialchars($datos_rel[$campo] ?? '');
                        $label = $atributos['label'];
                        $tipo = $atributos['tipo'];
                        $clase = $atributos['clase'] ?? '';
                        
                        echo "<div class='form-group $clase'>";
                        echo "<label for='$campo'>$label:</label>";
                        
                        switch ($tipo) {
                            case 'textarea':
                                echo "<textarea class='form-control' id='$campo' name='$campo'>$valor</textarea>";
                                break;
                            case 'select':
                                echo "<select class='form-control' id='$campo' name='$campo'>";
                                foreach ($atributos['opciones'] as $val => $texto) {
                                    $selected = ($datos_rel[$campo] == $val) ? 'selected' : '';
                                    echo "<option value='$val' $selected>$texto</option>";
                                }
                                echo "</select>";
                                break;
                            default:
                                echo "<input type='$tipo' class='form-control' id='$campo' name='$campo' value='$valor'>";
                        }
                        
                        echo "</div>";
                    }
                    
                    $stmt_rel->close();
                } else {
                    foreach ($config['campos_relacion'] as $campo => $atributos) {
                        $label = $atributos['label'];
                        $tipo = $atributos['tipo'];
                        $clase = $atributos['clase'] ?? '';
                        
                        echo "<div class='form-group $clase'>";
                        echo "<label for='$campo'>$label:</label>";
                        
                        switch ($tipo) {
                            case 'textarea':
                                echo "<textarea class='form-control' id='$campo' name='$campo'></textarea>";
                                break;
                            case 'select':
                                echo "<select class='form-control' id='$campo' name='$campo'>";
                                foreach ($atributos['opciones'] as $val => $texto) {
                                    echo "<option value='$val'>$texto</option>";
                                }
                                echo "</select>";
                                break;
                            default:
                                echo "<input type='$tipo' class='form-control' id='$campo' name='$campo' value=''>";
                        }
                        
                        echo "</div>";
                    }
                }
            }
            
            echo "<div class='btn-container'>";
            echo "<button type='button' class='btn btn-volver' onclick=\"window.location.href='../views/ManagerDB.php'\"><i class='bi bi-arrow-left'></i> Volver</button>";
            echo "<button type='submit' name='guardar' class='btn btn-guardar'><i class='bi bi-save'></i> Guardar Cambios</button>";
            echo "</div>";
            
            echo "</form>";
        } else {
            echo "<div class='mensaje error'>Registro no encontrado.</div>";
        }
        
        $stmt->close();
    } else {
        echo "<div class='mensaje error'>Tipo de registro no válido.</div>";
    }
    
    $con->close();
} else {
    echo "<div class='mensaje error'>Acceso no válido.</div>";
}
?>