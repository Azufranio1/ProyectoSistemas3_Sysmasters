// src/pages/manager/Reportes.tsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, FileText, TrendingUp, Loader2, Brain } from 'lucide-react';
import { reporteService, type ReporteParams } from '../../services/Reportes';
import { format, subDays } from 'date-fns';
import ReporteVentas from '../../components/reportes/ReporteVentas';
import ReporteProductos from '../../components/reportes/ReporteProductos';
import ReporteClientes from '../../components/reportes/ReporteClientes';
import PrediccionVentas from '../../components/reportes/PrediccionVentas';

type TipoReporte = 'ventas' | 'productos' | 'clientes' | 'prediccion';

export default function Reportes() {
  const { workMode } = useOutletContext<{ workMode: boolean }>();
  const [fechaInicio, setFechaInicio] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [fechaFin, setFechaFin] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [tipoReporte, setTipoReporte] = useState<TipoReporte>('ventas');
  const [loading, setLoading] = useState(false);
  const [reporteData, setReporteData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerarReporte = async () => {
    // Si es predicción, no necesita fechas
    if (tipoReporte === 'prediccion') {
      setReporteData({ tipo: 'prediccion' });
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

    try {
      const params: ReporteParams = {
        tipo: tipoReporte as 'ventas' | 'productos' | 'clientes',
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

  const handleChangeTipo = (nuevoTipo: TipoReporte) => {
    setTipoReporte(nuevoTipo);
    setReporteData(null);
    setError('');
    
    // Si es predicción, generar automáticamente
    if (nuevoTipo === 'prediccion') {
      setReporteData({ tipo: 'prediccion' });
    }
  };

  const renderReporte = () => {
    if (!reporteData) return null;

    switch (reporteData.tipo) {
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

          {/* Botón Generar */}
          {necesitaFechas && (
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