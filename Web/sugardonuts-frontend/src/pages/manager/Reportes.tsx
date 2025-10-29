// src/pages/manager/Reportes.tsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, FileText, TrendingUp, Loader2, Download } from 'lucide-react';
import { reporteService, type ReporteParams } from '../../services/Reportes';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
//import ReporteVentas from '../../components/reportes/ReporteVentas';
//import ReporteProductos from '../../components/reportes/ReporteProductos';
//import ReporteClientes from '../../components/reportes/ReporteClientes';

export default function Reportes() {
  const { workMode } = useOutletContext<{ workMode: boolean }>();
  const [fechaInicio, setFechaInicio] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [fechaFin, setFechaFin] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tipoReporte, setTipoReporte] = useState<'ventas' | 'productos' | 'clientes'>('ventas');
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerarReporte = async () => {
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

    try {
      const params: ReporteParams = {
        tipo: tipoReporte,
        fechaInicio,
        fechaFin
      };

      const result = await reporteService.generar(params);

      if (result.success) {
        setReporteData(result);
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

  const renderReporte = () => {
    if (!reporteData) return null;

    switch (tipoReporte) {
      case 'ventas':
        return //<ReporteVentas data={reporteData} workMode={workMode} />;
      case 'productos':
        return //<ReporteProductos data={reporteData} workMode={workMode} />;
      case 'clientes':
        return //<ReporteClientes data={reporteData} workMode={workMode} />;
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
      <div className="bg-white rounded-xl shadow-md p-6">
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
              max={format(new Date(), 'yyyy-MM-dd')}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                workMode
                  ? 'border-gray-300 focus:border-gray-600 focus:ring-gray-200'
                  : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
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
              max={format(new Date(), 'yyyy-MM-dd')}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                workMode
                  ? 'border-gray-300 focus:border-gray-600 focus:ring-gray-200'
                  : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
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
              onChange={(e) => setTipoReporte(e.target.value as any)}
              className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
                workMode
                  ? 'border-gray-300 focus:border-gray-600 focus:ring-gray-200'
                  : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
              }`}
            >
              <option value="ventas">📊 Ventas</option>
              <option value="productos">📦 Productos</option>
              <option value="clientes">👥 Clientes</option>
            </select>
          </div>

          {/* Botón Generar */}
          <div className="flex items-end">
            <button
              onClick={handleGenerarReporte}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
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
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      {/* Reporte */}
      {renderReporte()}
    </div>
  );
}