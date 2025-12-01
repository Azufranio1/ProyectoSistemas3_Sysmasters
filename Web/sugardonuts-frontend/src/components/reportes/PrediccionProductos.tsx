// src/components/reportes/PrediccionProductos.tsx
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, TrendingUp, Activity, AlertCircle, Award, ShoppingCart } from 'lucide-react';
import { prediccionService } from '../../services/Reportes';
import { RegresionPolinomica, type DatoRegresion } from '../../utils/regresionPolinomica';
import { getCategoryIcon } from '../../utils/CategoryIcons';

interface PrediccionProductosProps {
  workMode: boolean;
}

interface ProductoPrediccion {
  ProductoID: string;
  Nombre: string;
  CategoriaNombre: string;
  PromedioMensual: number;
  PrediccionProximoMes: number;
  Tendencia: 'creciente' | 'estable' | 'decreciente';
  Confianza: number;
  HistorialMensual: any[];
}

export default function PrediccionProductos({ workMode }: PrediccionProductosProps) {
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState<ProductoPrediccion[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoPrediccion | null>(null);
  const [top10, setTop10] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarYPredecir();
  }, []);

  const cargarYPredecir = async () => {
    setLoading(true);
    setError(null);
    try {
      // CAMBIO PRINCIPAL: usar 'productos-detallado' en lugar de 'productos'
      const result = await prediccionService.obtenerDatos({ tipo: 'productos-detallado' });
      
      console.log('Respuesta del servidor:', result); // Para debugging
      
      if (!result.success) {
        throw new Error(result.error || 'Error al obtener datos');
      }

      // Validar que estadisticas exista y tenga datos
      if (!result.estadisticas || !Array.isArray(result.estadisticas)) {
        throw new Error('Formato de respuesta inválido');
      }

      if (result.estadisticas.length === 0) {
        setError('No hay datos de productos disponibles');
        setLoading(false);
        return;
      }

      const predicciones: ProductoPrediccion[] = result.estadisticas.map((prod: any) => {
        const historial = prod.HistorialMensual || [];
        
        if (historial.length < 3) {
          return {
            ProductoID: prod.ProductoID,
            Nombre: prod.Nombre,
            CategoriaNombre: prod.CategoriaNombre,
            PromedioMensual: prod.PromedioMensual,
            PrediccionProximoMes: prod.PromedioMensual,
            Tendencia: 'estable' as const,
            Confianza: 50,
            HistorialMensual: historial
          };
        }

        // Preparar datos para regresión
        const datosRegresion: DatoRegresion[] = historial.map((h: any, index: number) => ({
          x: index,
          y: h.CantidadVendida
        }));

        // Calcular mejor grado
        const grado = RegresionPolinomica.calcularMejorGrado(datosRegresion);
        
        // Predecir próximo mes
        const prediccionFutura = RegresionPolinomica.predecirFuturo(datosRegresion, grado, 1);
        const prediccion = Math.max(0, Math.round(prediccionFutura[0].y));

        // Calcular métricas
        const resultado = RegresionPolinomica.regresion(datosRegresion, grado);
        const metricas = RegresionPolinomica.calcularMetricas(datosRegresion, resultado);

        // Determinar tendencia
        let tendencia: 'creciente' | 'estable' | 'decreciente' = 'estable';
        if (prediccion > prod.PromedioMensual * 1.1) tendencia = 'creciente';
        else if (prediccion < prod.PromedioMensual * 0.9) tendencia = 'decreciente';

        return {
          ProductoID: prod.ProductoID,
          Nombre: prod.Nombre,
          CategoriaNombre: prod.CategoriaNombre,
          PromedioMensual: prod.PromedioMensual,
          PrediccionProximoMes: prediccion,
          Tendencia: tendencia,
          Confianza: metricas.precision,
          HistorialMensual: historial
        };
      });

      // Ordenar por predicción descendente
      predicciones.sort((a, b) => b.PrediccionProximoMes - a.PrediccionProximoMes);
      
      setProductos(predicciones);
      setTop10(predicciones.slice(0, 10));
      
      if (predicciones.length > 0) {
        setProductoSeleccionado(predicciones[0]);
      }
    } catch (err) {
      console.error('Error al cargar predicciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getCardColors = (baseColors: string) => {
    return workMode
      ? 'bg-gradient-to-br from-gray-600 to-gray-700'
      : `bg-gradient-to-br ${baseColors}`;
  };

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'creciente': return 'text-green-600 bg-green-100';
      case 'decreciente': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'creciente': return '📈';
      case 'decreciente': return '📉';
      default: return '➡️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-pulse text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">Analizando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold mb-2">Error al cargar predicciones</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button
            onClick={cargarYPredecir}
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No hay datos suficientes para generar predicciones</p>
        </div>
      </div>
    );
  }

  const totalPrediccion = productos.reduce((sum, p) => sum + p.PrediccionProximoMes, 0);
  const confianzaPromedio = productos.reduce((sum, p) => sum + p.Confianza, 0) / productos.length;

  return (
    <div className="space-y-6">
      {/* Cards de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`${getCardColors('from-purple-500 to-purple-600')} text-white rounded-xl p-6 shadow-lg`}>
          <Package className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Productos Analizados</p>
          <p className="text-4xl font-bold">{productos.length}</p>
        </div>

        <div className={`${getCardColors('from-blue-500 to-blue-600')} text-white rounded-xl p-6 shadow-lg`}>
          <ShoppingCart className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Predicción Total (Mes)</p>
          <p className="text-4xl font-bold">{totalPrediccion}</p>
          <p className="text-xs opacity-75 mt-1">unidades</p>
        </div>

        <div className={`${getCardColors('from-green-500 to-green-600')} text-white rounded-xl p-6 shadow-lg`}>
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Confianza Promedio</p>
          <p className="text-4xl font-bold">{confianzaPromedio.toFixed(1)}%</p>
        </div>

        <div className={`${getCardColors('from-amber-500 to-amber-600')} text-white rounded-xl p-6 shadow-lg`}>
          <Award className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Producto Top</p>
          <p className="text-lg font-bold truncate">{productos[0]?.Nombre}</p>
          <p className="text-xs opacity-75 mt-1">{productos[0]?.PrediccionProximoMes} unidades</p>
        </div>
      </div>

      {/* Gráfico Top 10 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          Top 10 Productos Más Vendidos (Predicción Próximo Mes)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={top10} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              dataKey="Nombre" 
              type="category" 
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: any) => [`${value} unidades`, 'Predicción']}
            />
            <Bar 
              dataKey="PrediccionProximoMes" 
              fill={workMode ? '#4b5563' : '#ec4899'}
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Selector de Producto */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Análisis Detallado por Producto</h3>
        <select
          value={productoSeleccionado?.ProductoID || ''}
          onChange={(e) => {
            const prod = productos.find(p => p.ProductoID === e.target.value);
            setProductoSeleccionado(prod || null);
          }}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none"
        >
          {productos.map(p => (
            <option key={p.ProductoID} value={p.ProductoID}>
              {getCategoryIcon(p.CategoriaNombre)} {p.Nombre} - Predicción: {p.PrediccionProximoMes} unidades
            </option>
          ))}
        </select>
      </div>

      {/* Detalle del Producto Seleccionado */}
      {productoSeleccionado && (
        <>
          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Promedio Mensual Histórico</p>
              <p className="text-3xl font-bold text-gray-800">{productoSeleccionado.PromedioMensual.toFixed(1)}</p>
              <p className="text-xs text-gray-500 mt-1">unidades/mes</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Predicción Próximo Mes</p>
              <p className="text-3xl font-bold text-green-600">{productoSeleccionado.PrediccionProximoMes}</p>
              <p className="text-xs text-gray-500 mt-1">unidades</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-600 mb-1">Tendencia</p>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-semibold ${getTendenciaColor(productoSeleccionado.Tendencia)}`}>
                <span>{getTendenciaIcon(productoSeleccionado.Tendencia)}</span>
                <span className="capitalize">{productoSeleccionado.Tendencia}</span>
              </div>
            </div>
          </div>

          {/* Gráfico Histórico */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {getCategoryIcon(productoSeleccionado.CategoriaNombre)} {productoSeleccionado.Nombre} - Historial de Ventas
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productoSeleccionado.HistorialMensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Mes" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value: any) => [`${value} unidades`, 'Vendidas']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="CantidadVendida" 
                  stroke={workMode ? '#4b5563' : '#ec4899'}
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  name="Unidades Vendidas"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Confianza del modelo:</strong> {productoSeleccionado.Confianza.toFixed(1)}% - 
                {productoSeleccionado.Confianza > 80 ? ' Alta precisión' : productoSeleccionado.Confianza > 60 ? ' Precisión moderada' : ' Baja precisión, considere más datos históricos'}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Tabla de Todos los Productos */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">Predicción Completa de Productos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={workMode ? 'bg-gray-700 text-white' : 'bg-pink-500 text-white'}>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">#</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Producto</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Categoría</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Promedio Histórico</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Predicción</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Tendencia</th>
                <th className="px-6 py-3 text-center text-sm font-semibold">Confianza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productos.map((producto, index) => (
                <tr 
                  key={producto.ProductoID}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setProductoSeleccionado(producto)}
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(producto.CategoriaNombre)}</span>
                      <span className="font-semibold text-gray-800">{producto.Nombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{producto.CategoriaNombre}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{producto.PromedioMensual.toFixed(1)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-lg text-green-600">{producto.PrediccionProximoMes}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getTendenciaColor(producto.Tendencia)}`}>
                      {getTendenciaIcon(producto.Tendencia)} {producto.Tendencia}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            producto.Confianza > 80 ? 'bg-green-500' : 
                            producto.Confianza > 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${producto.Confianza}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold">{producto.Confianza.toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-purple-800 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Recomendaciones de Inventario
        </h3>
        <ul className="space-y-2 text-sm text-purple-700">
          <li>• Los productos con tendencia <strong className="text-green-600">creciente 📈</strong> requerirán mayor stock el próximo mes.</li>
          <li>• Productos con tendencia <strong className="text-red-600">decreciente 📉</strong> pueden requerir promociones o reducción de inventario.</li>
          <li>• La confianza indica qué tan precisa es la predicción. Mayor confianza = predicciones más confiables.</li>
          <li>• Considera factores externos (temporada, promociones, eventos) que el modelo no puede predecir.</li>
        </ul>
      </div>
    </div>
  );
}