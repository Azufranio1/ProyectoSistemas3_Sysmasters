// src/pages/manager/Reportes.tsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, FileText, TrendingUp, Loader2, Brain, Download } from 'lucide-react';
import { reporteService, type ReporteParams } from '../../services/Reportes';
import { format, subDays } from 'date-fns';
import ReporteVentas from '../../components/reportes/ReporteVentas';
import ReporteProductos from '../../components/reportes/ReporteProductos';
import ReporteClientes from '../../components/reportes/ReporteClientes';
import PrediccionVentas from '../../components/reportes/PrediccionVentas';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type TipoReporte = 'ventas' | 'productos' | 'clientes' | 'prediccion';

export default function Reportes() {
  const { workMode } = useOutletContext<{ workMode: boolean }>();
  const [fechaInicio, setFechaInicio] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [fechaFin, setFechaFin] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('ventas');
  const [tipoReporteGenerado, setTipoReporteGenerado] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerarReporte = async () => {
    // Si es predicción, no necesita fechas
    if (tipoReporte === 'prediccion') {
      setReporteData({ tipo: 'prediccion' });
      setTipoReporteGenerado('prediccion');
      return;
    }

    if (!fechaInicio || !fechaFin) {
      setError('Por favor selecciona ambas fechas');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('La fecha de inicio debe ser anterior a la fecha fin');
      return;
    }

    setLoading(true);
    setError('');
    setReporteData(null);
    setTipoReporteGenerado('');

    try {
      const params: ReporteParams = {
        tipo: tipoReporte as 'ventas' | 'productos' | 'clientes',
        fechaInicio,
        fechaFin
      };

      const result = await reporteService.generar(params);

      if (result.success) {
        setReporteData(result);
        setTipoReporteGenerado(tipoReporte);
      } else {
        setError(result.error || 'Error al generar reporte');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeTipo = (nuevoTipo: TipoReporte) => {
    setTipoReporte(nuevoTipo);
    // Limpiar datos si el tipo es diferente al generado
    if (reporteData && tipoReporteGenerado !== nuevoTipo) {
      setReporteData(null);
      setTipoReporteGenerado('');
    }
    setError('');
    
    // Si es predicción, generar automáticamente
    if (nuevoTipo === 'prediccion') {
      setReporteData({ tipo: 'prediccion' });
      setTipoReporteGenerado('prediccion');
    }
  };

  // Exportar a PDF (solo para reportes, no para predicción)
  const handleExportarPDF = () => {
    if (!reporteData || !tipoReporteGenerado || tipoReporteGenerado === 'prediccion') return;

    const doc = new jsPDF();
    
    // Configuración de colores según workMode
    const colorPrimario = workMode ? [75, 85, 99] : [236, 72, 153]; // gray-600 : pink-500
    const colorSecundario = workMode ? [107, 114, 128] : [251, 146, 60]; // gray-500 : orange-400

    // Encabezado
    doc.setFontSize(18);
    doc.setTextColor(...colorPrimario);
    doc.text('SugarDonuts - Reporte', 14, 20);
    
    doc.setFontSize(14);
    doc.text(`${tipoReporteGenerado.charAt(0).toUpperCase() + tipoReporteGenerado.slice(1)}`, 14, 28);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Período: ${fechaInicio} hasta ${fechaFin}`, 14, 35);
    doc.text(`Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 40);

    let yPos = 50;

    // Resumen según tipo de reporte
    if (reporteData.resumen) {
      doc.setFontSize(12);
      doc.setTextColor(...colorPrimario);
      doc.text('Resumen', 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);

      switch (tipoReporteGenerado) {
        case 'ventas':
          doc.text(`Total Ventas: ${reporteData.resumen.TotalVentas}`, 14, yPos);
          doc.text(`Monto Total: Bs. ${reporteData.resumen.MontoTotal.toFixed(2)}`, 14, yPos + 6);
          doc.text(`Promedio: Bs. ${reporteData.resumen.PromedioVenta.toFixed(2)}`, 14, yPos + 12);
          yPos += 25;
          break;
        case 'productos':
          doc.text(`Total Productos: ${reporteData.resumen.TotalProductos}`, 14, yPos);
          doc.text(`Ingresos: Bs. ${reporteData.resumen.TotalIngresos.toFixed(2)}`, 14, yPos + 6);
          doc.text(`Unidades: ${reporteData.resumen.TotalUnidades}`, 14, yPos + 12);
          yPos += 25;
          break;
        case 'clientes':
          doc.text(`Total Clientes: ${reporteData.resumen.TotalClientes}`, 14, yPos);
          doc.text(`Monto Total: Bs. ${reporteData.resumen.MontoTotal.toFixed(2)}`, 14, yPos + 6);
          doc.text(`Promedio: Bs. ${reporteData.resumen.PromedioGastoPorCliente.toFixed(2)}`, 14, yPos + 12);
          yPos += 25;
          break;
      }
    }

    // Tabla según tipo de reporte
    let encabezados: string[] = [];
    let filas: any[][] = [];

    switch (tipoReporteGenerado) {
      case 'ventas':
        if (reporteData.ventas && reporteData.ventas.length > 0) {
          encabezados = ['ID', 'Fecha', 'Cliente', 'Empleado', 'Total'];
          filas = reporteData.ventas.map((v: any) => [
            v.VentaID,
            v.FechaVenta,
            v.ClienteNombre,
            v.EmpleadoNombre,
            `Bs. ${v.Total.toFixed(2)}`
          ]);
        }
        break;
      case 'productos':
        if (reporteData.productos && reporteData.productos.length > 0) {
          encabezados = ['Producto', 'Categoría', 'Veces', 'Cantidad', 'Ingreso'];
          filas = reporteData.productos.slice(0, 20).map((p: any) => [
            p.Nombre,
            p.CategoriaNombre,
            p.VecesVendido,
            p.CantidadTotal,
            `Bs. ${p.IngresoTotal.toFixed(2)}`
          ]);
        }
        break;
      case 'clientes':
        if (reporteData.clientes && reporteData.clientes.length > 0) {
          encabezados = ['Cliente', 'CI/NIT', 'Compras', 'Monto Total'];
          filas = reporteData.clientes.slice(0, 20).map((c: any) => [
            c.NombreCompleto,
            c.CINIT,
            c.TotalCompras,
            `Bs. ${c.MontoTotal.toFixed(2)}`
          ]);
        }
        break;
    }

    if (encabezados.length > 0 && filas.length > 0) {
      autoTable(doc, {
        head: [encabezados],
        body: filas,
        startY: yPos,
        styles: { 
          fontSize: 9, 
          cellPadding: 3,
          textColor: [60, 60, 60]
        },
        headStyles: { 
          fillColor: colorPrimario,
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 10 }
      });
    }

    // Pie de página
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(`SugarDonuts_Reporte_${tipoReporteGenerado}_${fechaInicio}_${fechaFin}.pdf`);
  };

  const renderReporte = () => {
    // Solo renderizar si hay datos Y el tipo coincide
    if (!reporteData || tipoReporteGenerado !== tipoReporte) return null;

    switch (tipoReporteGenerado) {
      case 'ventas':
        return <ReporteVentas data={reporteData} workMode={workMode} />;
      case 'productos':
        return <ReporteProductos data={reporteData} workMode={workMode} />;
      case 'clientes':
        return <ReporteClientes data={reporteData} workMode={workMode} />;
      case 'prediccion':
        return <PrediccionVentas workMode={workMode} />;
      default:
        return null;
    }
  };

  const necesitaFechas = tipoReporte !== 'prediccion';
  const puedeExportarPDF = reporteData && 
                          tipoReporteGenerado === tipoReporte && 
                          tipoReporteGenerado !== 'prediccion';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reportes y Estadísticas</h1>
        <p className="text-gray-600 mt-1">Analiza el rendimiento de tu negocio</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className={`grid gap-4 ${necesitaFechas ? 'md:grid-cols-4' : 'md:grid-cols-2'}`}>
          {/* Fecha Inicio */}
          {necesitaFechas && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                  workMode
                    ? 'border-gray-300 focus:border-gray-600 focus:ring-gray-200'
                    : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
                }`}
              />
            </div>
          )}

          {/* Fecha Fin */}
          {necesitaFechas && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Fecha Fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                  workMode
                    ? 'border-gray-300 focus:border-gray-600 focus:ring-gray-200'
                    : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
                }`}
              />
            </div>
          )}

          {/* Tipo de Reporte */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Tipo de Reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => handleChangeTipo(e.target.value as TipoReporte)}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                workMode
                  ? 'border-gray-300 focus:border-gray-600 focus:ring-gray-200'
                  : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
              }`}
            >
              <option value="ventas">📊 Ventas</option>
              <option value="productos">📦 Productos</option>
              <option value="clientes">👥 Clientes</option>
              <option value="prediccion">🔮 Predicción de Ventas (IA)</option>
            </select>
          </div>

          {/* Botones */}
          {necesitaFechas && (
            <div className="flex items-end gap-2">
              <button
                onClick={handleGenerarReporte}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                  workMode
                    ? 'bg-gray-700 hover:bg-gray-800'
                    : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Generar
                  </>
                )}
              </button>

              {puedeExportarPDF && (
                <button
                  onClick={handleExportarPDF}
                  className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-white ${
                    workMode
                      ? 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                  }`}
                >
                  <Download className="w-5 h-5" />
                  PDF
                </button>
              )}
            </div>
          )}
        </div>

        {/* Información adicional para predicción */}
        {tipoReporte === 'prediccion' && (
          <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl flex items-start gap-3">
            <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-purple-800">Predicción con Inteligencia Artificial</p>
              <p className="text-sm text-purple-700 mt-1">
                Este módulo utiliza regresión polinomial para predecir ventas futuras basándose en datos históricos de los últimos 12 meses. No requiere selección de fechas.
              </p>
            </div>
          </div>
        )}

        {/* Indicador de cambio de tipo */}
        {reporteData && tipoReporteGenerado !== tipoReporte && tipoReporte !== 'prediccion' && (
          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-blue-700">
              ℹ️ Has cambiado el tipo de reporte. Haz clic en "Generar" para ver el nuevo reporte de <strong>{tipoReporte}</strong>.
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}
      </div>

      {/* Reporte */}
      {renderReporte()}
    </div>
  );
}