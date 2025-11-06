import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Activity, AlertCircle, Award, Calendar } from 'lucide-react';
import { prediccionService } from '../../services/Reportes';
import { RegresionPolinomica, type DatoRegresion } from '../../utils/regresionPolinomica';

interface PrediccionVentasProps {
  workMode: boolean;
}

export default function PrediccionVentas({ workMode }: PrediccionVentasProps) {

  const getCardColors = (baseColors: string) => {
    return workMode
      ? 'bg-gradient-to-br from-gray-600 to-gray-700'
      : `bg-gradient-to-br ${baseColors}`;
  };

  const getContainerColors = () => {
    return workMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800';
  };

  const getTextMuted = () => (workMode ? 'text-gray-400' : 'text-gray-600');
  const getTextStrong = () => (workMode ? 'text-gray-100' : 'text-gray-800');

  const [loading, setLoading] = useState(true);
  const [datos, setDatos] = useState<any[]>([]);
  const [mejorGrado, setMejorGrado] = useState(2);
  const [predicciones, setPredicciones] = useState<any[]>([]);
  const [metricas, setMetricas] = useState<any>(null);
  const [gradoManual, setGradoManual] = useState<number | null>(null);

  useEffect(() => {
    cargarYPredecir();
  }, []);

  const cargarYPredecir = async () => {
    setLoading(true);
    try {
      const result = await prediccionService.obtenerDatos({ tipo: 'ventas' });
      
      if (result.success && result.datos.length > 0) {
        // Preparar datos para regresión
        const datosRegresion: DatoRegresion[] = result.datos.map((d: any, index: number) => ({
          x: index,
          y: d.MontoTotal
        }));

        // Calcular mejor grado automáticamente
        const grado = RegresionPolinomica.calcularMejorGrado(datosRegresion);
        setMejorGrado(grado);

        // Realizar regresión con el mejor grado
        procesarRegresion(result.datos, datosRegresion, grado);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const procesarRegresion = (datosOriginales: any[], datosRegresion: DatoRegresion[], grado: number) => {
    // Regresión
    const resultado = RegresionPolinomica.regresion(datosRegresion, grado);
    
    // Predicción 1 mes adelante
    const prediccionesFuturas = RegresionPolinomica.predecirFuturo(datosRegresion, grado, 1);
    
    // Calcular métricas
    const metricas = RegresionPolinomica.calcularMetricas(datosRegresion, resultado);

    // Preparar datos para gráfico
    const datosGrafico = datosOriginales.map((d: any, index: number) => ({
      mes: d.Mes,
      real: d.MontoTotal,
      prediccion: resultado.predicciones[index].y,
      tipo: 'histórico'
    }));

    // Agregar predicciones futuras
    prediccionesFuturas.forEach(p => {
      datosGrafico.push({
        mes: p.mes,
        real: null,
        prediccion: p.y,
        tipo: 'predicción'
      });
    });

    setDatos(datosGrafico);
    setPredicciones(prediccionesFuturas);
    setMetricas({ ...metricas, grado, ecuacion: resultado.ecuacion });
  };

  const handleCambiarGrado = (nuevoGrado: number) => {
    setGradoManual(nuevoGrado);
    
    // Recalcular con el nuevo grado
    const datosRegresion: DatoRegresion[] = datos
      .filter(d => d.tipo === 'histórico')
      .map((d, index) => ({
        x: index,
        y: d.real
      }));

    const datosOriginales = datos
      .filter(d => d.tipo === 'histórico')
      .map(d => ({
        Mes: d.mes,
        MontoTotal: d.real
      }));

    procesarRegresion(datosOriginales, datosRegresion, nuevoGrado);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-pulse text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Calculando predicciones...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => `Bs. ${value.toFixed(2)}`;
  const colorPrimario = workMode ? '#4b5563' : '#ec4899';
  const colorPrediccion = workMode ? '#9ca3af' : '#f59e0b';

  return (
    <div className="space-y-6">
      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${getCardColors('from-pink-500 to-pink-600')} text-white rounded-xl p-6 shadow-lg`}>
          <Award className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Grado Polinomial</p>
          <p className="text-4xl font-bold">{gradoManual || mejorGrado}</p>
          <p className="text-xs opacity-75 mt-1">
            {gradoManual ? 'Manual' : 'Automático (mejor)'}
          </p>
        </div>

        <div className={`${getCardColors('from-blue-500 to-blue-600')} text-white rounded-xl p-6 shadow-lg`}>
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Coef. Determinación (R²)</p>
          <p className="text-4xl font-bold">{(metricas?.r2 * 100).toFixed(1)}%</p>
          <p className="text-xs opacity-75 mt-1">Bondad del ajuste</p>
        </div>

        <div className={`${getCardColors('from-green-500 to-green-600')} text-white rounded-xl p-6 shadow-lg`}>
          <Activity className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Precisión</p>
          <p className="text-4xl font-bold">{metricas?.precision.toFixed(1)}%</p>
          <p className="text-xs opacity-75 mt-1">Confiabilidad</p>
        </div>

        <div className={`${getCardColors('from-amber-500 to-amber-600')} text-white rounded-xl p-6 shadow-lg`}>
          <Calendar className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Predicción Próximo Mes</p>
          <p className="text-2xl font-bold">
            {predicciones.length > 0 ? formatCurrency(predicciones[0].y) : 'N/A'}
          </p>
          <p className="text-xs opacity-75 mt-1">{predicciones[0]?.mes}</p>
        </div>
      </div>

      {/* Control de Grado */}
      <div className={`${getContainerColors()} rounded-xl shadow-md p-6`}>
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-blue-500" />
          Selección del Grado Polinomial
        </h3>
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">
            Grado del polinomio:
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(g => (
              <button
                key={g}
                onClick={() => handleCambiarGrado(g)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  (gradoManual || mejorGrado) === g
                    ? workMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          {mejorGrado && (
            <span className="text-sm text-gray-600">
              (Recomendado: <strong>{mejorGrado}</strong>)
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-3">
          El grado {mejorGrado} fue seleccionado automáticamente como el mejor ajuste basado en R² ajustado.
          Puedes cambiar manualmente el grado para experimentar.
        </p>
      </div>

      {/* Gráfico */}
      <div className={`${getContainerColors()} rounded-xl shadow-md p-6`}>
        <h3 className={`text-xl font-bold ${getTextStrong()} mb-4`}>
          Ventas Históricas y Predicción
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="mes" 
              angle={-45} 
              textAnchor="end" 
              height={80}
            />
            <YAxis 
              tickFormatter={(value) => `Bs. ${value.toFixed(0)}`}
            />
            <Tooltip
              formatter={(value: any) => value ? formatCurrency(value) : 'N/A'}
              contentStyle={{
                backgroundColor: workMode ? '#1f2937' : '#ffffff',
                border: '1px solid #9ca3af',
                color: workMode ? '#f9fafb' : '#111827'
              }}
            />

            <Legend />
            
            {/* Línea vertical separando histórico de predicción */}
            <ReferenceLine 
              x={datos.find(d => d.tipo === 'predicción')?.mes} 
              stroke="#ef4444" 
              strokeDasharray="5 5"
              label={{ value: 'Predicción', position: 'top', fill: '#ef4444' }}
            />

            <Line 
              type="monotone" 
              dataKey="real" 
              stroke={colorPrimario}
              strokeWidth={3}
              dot={{ r: 5 }}
              name="Ventas Reales"
            />
            <Line 
              type="monotone" 
              dataKey="prediccion" 
              stroke={colorPrediccion}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              name="Ajuste/Predicción"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de Métricas Estadísticas */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className={`text-xl font-bold ${getTextStrong()} mb-4`}>Métricas del Modelo</h3>
        </div>
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Información del Modelo</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className={getTextMuted()}>Grado Polinomial:</dt>
                  <dd className="font-semibold">{metricas?.grado}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={getTextMuted()}>Ecuación:</dt>
                  <dd className="font-mono text-sm">{metricas?.ecuacion}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={getTextMuted()}>Datos Históricos:</dt>
                  <dd className="font-semibold">{datos.filter(d => d.tipo === 'histórico').length} meses</dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-3">Métricas de Error</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className={getTextMuted()}>R² (Determinación):</dt>
                  <dd className="font-semibold">{(metricas?.r2 * 100).toFixed(2)}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={getTextMuted()}>RMSE:</dt>
                  <dd className="font-semibold">{metricas?.rmse.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={getTextMuted()}>MAE:</dt>
                  <dd className="font-semibold">{metricas?.mae.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className={getTextMuted()}>MAPE:</dt>
                  <dd className="font-semibold">{metricas?.mape.toFixed(2)}%</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Interpretación */}
          <div className={`mt-6 p-4 rounded-lg ${
            metricas?.r2 > 0.8 ? 'bg-green-50 border border-green-200' :
            metricas?.r2 > 0.6 ? 'bg-yellow-50 border border-yellow-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-sm font-semibold ${
              metricas?.r2 > 0.8 ? 'text-green-700' :
              metricas?.r2 > 0.6 ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              Interpretación:
            </p>
            <p className={`text-sm mt-1 ${
              metricas?.r2 > 0.8 ? 'text-green-600' :
              metricas?.r2 > 0.6 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {metricas?.r2 > 0.8 && 
                `Excelente ajuste (R² > 80%). El modelo explica bien la variabilidad de los datos y las predicciones son confiables.`
              }
              {metricas?.r2 > 0.6 && metricas?.r2 <= 0.8 && 
                `Ajuste moderado (R² entre 60-80%). El modelo captura tendencias generales pero puede tener imprecisiones.`
              }
              {metricas?.r2 <= 0.6 && 
                `Ajuste débil (R² < 60%). El modelo tiene limitaciones. Considere recopilar más datos o revisar la estrategia de análisis.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}