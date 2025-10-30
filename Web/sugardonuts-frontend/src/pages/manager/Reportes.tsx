// src/pages/manager/Reportes.tsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, FileText, TrendingUp, Loader2, Download } from 'lucide-react';
import { reporteService, type ReporteParams } from '../../services/Reportes';
import { format, subDays, subYears } from 'date-fns';
import ReporteVentas from '../../components/reportes/ReporteVentas';
import ReporteProductos from '../../components/reportes/ReporteProductos';
import ReporteClientes from '../../components/reportes/ReporteClientes';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Reportes() {
  const { workMode } = useOutletContext<{ workMode: boolean }>();
  const [fechaInicio, setFechaInicio] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [fechaFin, setFechaFin] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tipoReporte, setTipoReporte] = useState<'ventas' | 'productos' | 'clientes'>('ventas');
  const [tipoReporteGenerado, setTipoReporteGenerado] = useState<string>(''); // Nuevo estado
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState<any>(null);
  const [error, setError] = useState('');

  const fechaMinima = format(subYears(new Date(), 2), 'yyyy-MM-dd');
  const fechaMaxima = format(new Date(), 'yyyy-MM-dd');

  const handleGenerarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Por favor selecciona ambas fechas');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      setError('La fecha de inicio no puede ser posterior a la fecha de fin');
      return;
    }

    if (new Date(fechaInicio) < new Date(fechaMinima)) {
      setError('La fecha de inicio no puede ser anterior a dos años atrás');
      return;
    }

    setLoading(true);
    setError('');
    setReporteData(null);
    setTipoReporteGenerado(''); // Limpiar tipo generado

    try {
      const params: ReporteParams = {
        tipo: tipoReporte,
        fechaInicio,
        fechaFin
      };

      const result = await reporteService.generar(params);

      if (result.success) {
        setReporteData(result);
        setTipoReporteGenerado(tipoReporte); // Guardar el tipo que se generó
      } else {
        setError(result.error || 'Error al generar el reporte');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Limpiar datos cuando cambia el tipo de reporte
  const handleTipoChange = (nuevoTipo: 'ventas' | 'productos' | 'clientes') => {
    setTipoReporte(nuevoTipo);
    // Si hay datos y el tipo es diferente al generado, limpiar
    if (reporteData && tipoReporteGenerado !== nuevoTipo) {
      setReporteData(null);
      setTipoReporteGenerado('');
      setError('');
    }
  };

  // Exportar a PDF mejorado
  const handleExportarPDF = () => {
    if (!reporteData || !tipoReporteGenerado) return;

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
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Reportes y Estadísticas</h1>
        <p className="text-gray-600 mt-1">Analiza el rendimiento de tu negocio</p>
      </div>

      {/* Filtros */}
      <div className={`rounded-xl shadow-md p-6 transition-colors duration-300 ${
        workMode ? 'bg-white' : 'bg-white'
      }`}>
        <div className="grid md:grid-cols-4 gap-4">
          {/* Fecha Inicio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              min={fechaMinima}
              max={fechaFin}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                workMode
                  ? 'border-gray-300 focus:border-gray-600 focus:ring-4 focus:ring-gray-200'
                  : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
              }`}
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              min={fechaInicio}
              max={fechaMaxima}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                workMode
                  ? 'border-gray-300 focus:border-gray-600 focus:ring-4 focus:ring-gray-200'
                  : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
              }`}
            />
          </div>

          {/* Tipo de Reporte */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Tipo de Reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => handleTipoChange(e.target.value as any)}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                workMode
                  ? 'border-gray-300 focus:border-gray-600 focus:ring-4 focus:ring-gray-200'
                  : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
              }`}
            >
              <option value="ventas">📊 Ventas</option>
              <option value="productos">📦 Productos</option>
              <option value="clientes">👥 Clientes</option>
            </select>
          </div>

          {/* Botones */}
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

            {reporteData && tipoReporteGenerado === tipoReporte && (
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
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-in fade-in">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Indicador de cambio de tipo */}
        {reporteData && tipoReporteGenerado !== tipoReporte && (
          <div className="mt-4 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-blue-700">
              ℹ️ Has cambiado el tipo de reporte. Haz clic en "Generar" para ver el nuevo reporte de <strong>{tipoReporte}</strong>.
            </p>
          </div>
        )}
      </div>

      {/* Reporte */}
      {renderReporte()}
    </div>
  );
}