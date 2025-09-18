<?php
        include('../includes/VerifySession.php');
        include('../includes/Connection.php');
        require_once('../libs/jpGraph/src/jpgraph.php');
        require_once('../libs/jpGraph/src/jpgraph_pie.php');
        require_once('../libs/jpGraph/src/jpgraph_pie3d.php');

        $con = connection();

        $idUser = $_SESSION['idUser'];

        $chipSeleccionado = isset($_POST['chipSelect']) ? $_POST['chipSelect'] : 'todos';

        $intervalo = isset($_POST['intervalo']) ? $_POST['intervalo'] : 'hoy';

        switch ($intervalo) {
            case 'hoy':
                $fechaInicio = date('Y-m-d 00:00:00');
                $fechaFin = date('Y-m-d 23:59:59');
                break;
            case 'semana':
                $fechaInicio = date('Y-m-d 00:00:00', strtotime('-7 days'));
                $fechaFin = date('Y-m-d 23:59:59');
                break;
            case 'mes':
                $fechaInicio = date('Y-m-d 00:00:00', strtotime('-1 month'));
                $fechaFin = date('Y-m-d 23:59:59');
                break;
            case 'manual':
                $fechaInicio = isset($_POST['fechaInicio']) ? $_POST['fechaInicio'] . ' 00:00:00' : '2024-09-30 00:00:00';
                $fechaFin = isset($_POST['fechaFin']) ? $_POST['fechaFin'] . ' 23:59:59' : '2024-09-30 23:59:59';
                break;
            default:
                $fechaInicio = date('Y-m-d 00:00:00');
                $fechaFin = date('Y-m-d 23:59:59');
                break;
        }

        $fechaInicioFormateada = new DateTime(str_replace("-", "/", substr($fechaInicio, 0, 11)));
        $fechaFinFormateada = new DateTime(str_replace("-", "/", substr($fechaFin, 0, 11)));

        echo "<h1>Reporte de Actividad: ". $fechaInicioFormateada->format('d/m/Y') . " - " . $fechaFinFormateada->format('d/m/Y') . "</h1>";

        try {
            if ($chipSeleccionado == 'todos') {
                $query = "SELECT idChip, etiqueta FROM chip WHERE idUser = '$idUser'";
            } else {
                $query = "SELECT idChip, etiqueta FROM chip WHERE idChip = '$chipSeleccionado' AND idUser = '$idUser'";
            }

            $resultChips = mysqli_query($con, $query);

            if (mysqli_num_rows($resultChips) == 0) {
                echo "<p>No se encontraron chips para el usuario o la selección.</p>";
                exit;
            }

            function convertirAHoras($segundos) {
                return round($segundos / 3600, 2);
            }

            while ($chipData = mysqli_fetch_assoc($resultChips)) {
                echo "<hr>";
                $chip = $chipData['idChip'];
                $etiquetaChip = $chipData['etiqueta'];

                echo "<h2>Reporte para el chip: $etiquetaChip</h2>";

                $queryEventos = "
                    SELECT etGeocerca, evento, fechaHora 
                    FROM reportes 
                    WHERE idChip = '$chip' 
                    AND fechaHora BETWEEN '$fechaInicio' AND '$fechaFin' 
                    ORDER BY fechaHora ASC
                ";

                $resultEventos = mysqli_query($con, $queryEventos);

                if (mysqli_num_rows($resultEventos) > 0) {
                    $eventos = mysqli_fetch_all($resultEventos, MYSQLI_ASSOC);
                } else {
                    echo "<p>No se encontraron eventos para el chip especificado en el rango de fechas.</p>";
                    continue;
                }

                $timestamps = [];
                $tiemposGeocercas = [];
                $tiempoFuera = 0;
                $ultimoEvento = null;

                foreach ($eventos as $evento) {
                    $idGeocerca = $evento['etGeocerca'];
                    $fechaHora = strtotime($evento['fechaHora']);
                    $tipoEvento = $evento['evento'];

                    if ($tipoEvento == 'entró') {
                        $timestamps[$idGeocerca]['entrada'] = $fechaHora;

                        if ($ultimoEvento == 'salió') {
                            $tiempoFuera += $fechaHora - $ultimoSalida;
                        }

                    } elseif ($tipoEvento == 'salió') {
                        if (isset($timestamps[$idGeocerca]['entrada'])) {
                            $tiempoEnGeocerca = $fechaHora - $timestamps[$idGeocerca]['entrada'];
                            if (!isset($tiemposGeocercas[$idGeocerca])) {
                                $tiemposGeocercas[$idGeocerca] = 0;
                            }
                            $tiemposGeocercas[$idGeocerca] += $tiempoEnGeocerca;
                            unset($timestamps[$idGeocerca]['entrada']);
                        }
                        $ultimoSalida = $fechaHora;
                    }

                    $ultimoEvento = $tipoEvento;
                }

                $vectorHoras = [convertirAHoras($tiempoFuera)];
                foreach ($tiemposGeocercas as $geocerca => $tiempo) {
                    echo "<p>Tiempo en $geocerca: " . convertirAHoras($tiempo) . " horas</p>";
                    $vectorHoras[] = convertirAHoras($tiempo);
                }
                echo "<p>Tiempo fuera de geocercas: " . convertirAHoras($tiempoFuera) . " horas</p>";

                $fileName = "../graficos/grafico_" . $chip . ".png";

                if (file_exists($fileName)) {
                    unlink($fileName);
                }

                $graph = new PieGraph(400, 300);
                $graph->clearTheme();
                $graph->SetShadow();

                $graph->title->Set("Distribución de tiempo por geocercas");
                $graph->title->SetFont(FF_FONT1, FS_BOLD);

                $p1 = new PiePlot3D($vectorHoras);
                $p1->SetSize(0.4);
                $p1->SetCenter(0.45);

                $leyendas = ["Afuera"];
                foreach (array_keys($tiemposGeocercas) as $geocerca) {
                    $leyendas[] = $geocerca;
                }
                $p1->SetLegends($leyendas);

                $graph->Add($p1);

                $graph->Stroke($fileName);

                echo "<img src='$fileName' alt='Gráfico de tiempo en geocercas'>";
            }

        } catch (Exception $e) {
            echo "<p>Error en la consulta: " . $e->getMessage() . "</p>";
        }
        mysqli_close($con);
        ?>