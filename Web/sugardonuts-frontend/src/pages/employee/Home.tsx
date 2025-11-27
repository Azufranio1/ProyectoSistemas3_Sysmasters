import React, { useEffect, useState } from "react";
import { TrendingUp, ClipboardList, DollarSign, ShoppingBag, Award, TrendingDown } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from "recharts";

interface VentaReciente {
  VentaID: string;
  FechaVenta: string;
  Total: number;
  NombreCliente: string;
}

interface EstadisticasEmpleado {
  ventasMes: {
    cantidad: number;
    monto: number;
  };
  ventasHoy: {
    cantidad: number;
    monto: number;
  };
  reservasPendientes: number;
  crecimientoMensual: number;
  actividadReciente: VentaReciente[];
  productoTop: {
    nombre: string;
    cantidad: number;
  } | null;
}

const Home: React.FC = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasEmpleado | null>(null);
  const [loading, setLoading] = useState(true);
  const [empleadoNombre, setEmpleadoNombre] = useState("");

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      let empleadoData = localStorage.getItem("empleado");
      if (!empleadoData) {
        empleadoData = sessionStorage.getItem("empleado");
      }
      
      if (!empleadoData) {
        console.error("❌ No hay datos de empleado en storage");
        alert("No se encontraron datos de sesión. Por favor inicia sesión nuevamente.");
        window.location.href = "/login";
        return;
      }

      const empleado = JSON.parse(empleadoData);
      setEmpleadoNombre(empleado.NombreCompleto || empleado.Nombre || "Empleado");

      if (!empleado.EmpleadoID) {
        console.error("❌ No se encontró EmpleadoID");
        return;
      }

      const apiUrl = `http://localhost/sugardonuts-api/estadisticas_empleado.php?empleadoID=${empleado.EmpleadoID}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success) {
        setEstadisticas(data.data);
      } else {
        console.error("❌ Error al cargar estadísticas:", data.error);
        alert("Error al cargar estadísticas: " + data.error);
      }
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      alert("Error de conexión con el servidor. Verifica que la API esté activa.");
    } finally {
      setLoading(false);
    }
  };

  const formatearMonto = (monto: number) => {
    return `Bs ${monto.toFixed(2)}`;
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generar datos reales para los últimos 7 días
  const generarDatosGrafico = () => {
    if (!estadisticas) return [];
    
    const hoy = new Date();
    const ultimosSieteDias = [];
    
    // Generar las fechas de los últimos 7 días (de hace 7 días hasta ayer)
    for (let i = 7; i >= 1; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      
      const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'short' });
      const diaNumero = fecha.getDate();
      const mes = fecha.toLocaleDateString('es-ES', { month: 'short' });
      
      ultimosSieteDias.push({
        fecha: fecha.toISOString().split('T')[0],
        diaCompleto: `${diaSemana} ${diaNumero}`,
        dia: diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1),
        ventas: 0,
        monto: 0,
      });
    }
    
    // Procesar las ventas recientes y asignarlas a los días correspondientes
    if (estadisticas.actividadReciente && estadisticas.actividadReciente.length > 0) {
      estadisticas.actividadReciente.forEach((venta) => {
        const fechaVenta = new Date(venta.FechaVenta);
        const fechaVentaStr = fechaVenta.toISOString().split('T')[0];
        
        const diaEncontrado = ultimosSieteDias.find(d => d.fecha === fechaVentaStr);
        if (diaEncontrado) {
          diaEncontrado.ventas += 1;
          diaEncontrado.monto += venta.Total;
        }
      });
    }
    
    // Redondear los montos a 2 decimales
    ultimosSieteDias.forEach(dia => {
      dia.monto = Math.round(dia.monto * 100) / 100;
    });
    
    return ultimosSieteDias;
  };

  const datosGrafico = generarDatosGrafico();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-gray-600">No se pudieron cargar las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] px-6 py-8 bg-gradient-to-br from-gray-50 to-pink-50">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          ¡Hola, <span className="text-pink-600">{empleadoNombre}!</span>
        </h1>
        <p className="text-gray-600">Aquí está el resumen de tu desempeño</p>
      </div>

      {/* Tarjetas principales */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Ventas del mes */}
        <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-pink-400 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Mis ventas este mes</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {estadisticas.ventasMes.cantidad}
              </h2>
              <p className="text-lg font-semibold text-pink-600 mt-1">
                {formatearMonto(estadisticas.ventasMes.monto)}
              </p>
            </div>
            <ShoppingBag className="w-10 h-10 text-pink-500" />
          </div>
          <div className="flex items-center mt-3">
            {estadisticas.crecimientoMensual >= 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <p className="text-xs text-green-600 font-medium">
                  +{estadisticas.crecimientoMensual}% vs mes anterior
                </p>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                <p className="text-xs text-red-600 font-medium">
                  {estadisticas.crecimientoMensual}% vs mes anterior
                </p>
              </>
            )}
          </div>
        </div>

        {/* Ventas de hoy */}
        <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-amber-400 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Ventas hoy</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {estadisticas.ventasHoy.cantidad}
              </h2>
              <p className="text-lg font-semibold text-amber-600 mt-1">
                {formatearMonto(estadisticas.ventasHoy.monto)}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-amber-500" />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {estadisticas.ventasHoy.cantidad > 0
              ? "¡Sigue así!"
              : "Aún no hay ventas"}
          </p>
        </div>

        {/* Reservas pendientes */}
        <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-rose-400 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Reservas pendientes</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {estadisticas.reservasPendientes}
              </h2>
            </div>
            <ClipboardList className="w-10 h-10 text-rose-500" />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            {estadisticas.reservasPendientes > 0
              ? "Atender pronto"
              : "Todo al día"}
          </p>
        </div>

        {/* Producto más vendido */}
        <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-purple-400 hover:shadow-lg transition-shadow duration-300">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm text-gray-500">Producto más vendido</p>
              {estadisticas.productoTop ? (
                <>
                  <h2 className="text-lg font-bold text-gray-800 mt-1 truncate">
                    {estadisticas.productoTop.nombre}
                  </h2>
                  <p className="text-sm text-purple-600 font-semibold mt-1">
                    {estadisticas.productoTop.cantidad} vendidos
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-400 mt-2">Sin ventas aún</p>
              )}
            </div>
            <Award className="w-10 h-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Sección inferior con gráfico grande */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Gráfico principal - Más grande */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 mb-1">
              Rendimiento Semanal
            </h3>
            <p className="text-sm text-gray-500">
              Ventas y montos de los últimos 7 días
            </p>
          </div>
          
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={datosGrafico}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="dia" 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => {
                  if (name === 'ventas') return [value, 'Ventas'];
                  if (name === 'monto') return [`Bs ${value.toFixed(2)}`, 'Monto'];
                  return [value, name];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                formatter={(value) => {
                  if (value === 'ventas') return 'Cantidad de Ventas';
                  if (value === 'monto') return 'Monto Generado (Bs)';
                  return value;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="ventas" 
                stroke="#ec4899" 
                fillOpacity={1} 
                fill="url(#colorVentas)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="monto" 
                stroke="#f59e0b" 
                fillOpacity={1} 
                fill="url(#colorMonto)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Indicadores debajo del gráfico */}
          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {estadisticas.crecimientoMensual >= 0 ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                    <span className="text-2xl font-bold text-green-600">
                      +{estadisticas.crecimientoMensual}%
                    </span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-orange-600">
                      {estadisticas.crecimientoMensual}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Crecimiento mensual</p>
            </div>
            <div className="text-center">
              <div className="mb-2">
                <span className="text-2xl font-bold text-pink-600">
                  {estadisticas.ventasMes.cantidad}
                </span>
              </div>
              <p className="text-sm text-gray-600">Total ventas del mes</p>
            </div>
          </div>
        </div>

        {/* Columna derecha con últimas ventas y motivación */}
        <div className="lg:col-span-4 space-y-6">
          {/* Últimas ventas - Más compacto */}
          <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
            <h3 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-pink-500" /> 
              Últimas Ventas
            </h3>
            {estadisticas.actividadReciente.length > 0 ? (
              <ul className="space-y-2 max-h-64 overflow-y-auto">
                {estadisticas.actividadReciente.slice(0, 5).map((venta) => (
                  <li
                    key={venta.VentaID}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {venta.NombreCliente}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {formatearFecha(venta.FechaVenta)}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-green-600 whitespace-nowrap">
                        {formatearMonto(venta.Total)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center py-8 text-sm">
                Aún no tienes ventas registradas
              </p>
            )}
          </div>

          {/* Mensaje motivacional */}
          <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-amber-100 rounded-2xl shadow-md p-5 border border-pink-200">
            <div className="text-center">
              <div className="text-4xl mb-3">🍩</div>
              <h4 className="text-lg font-bold text-gray-800 mb-2">
                {estadisticas.ventasMes.cantidad === 0
                  ? "¡Comienza tu día!"
                  : estadisticas.crecimientoMensual >= 0
                  ? "¡Excelente trabajo!"
                  : "¡Sigue adelante!"}
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {estadisticas.ventasMes.cantidad === 0
                  ? "Cada gran logro comienza con una primera venta. ¡Tú puedes hacerlo!"
                  : `Has realizado ${estadisticas.ventasMes.cantidad} ${
                      estadisticas.ventasMes.cantidad === 1 ? "venta" : "ventas"
                    } este mes. ${
                      estadisticas.crecimientoMensual >= 0
                        ? "¡Sigue mejorando!"
                        : "El esfuerzo constante traerá grandes resultados."
                    }`}
              </p>
              {estadisticas.ventasMes.cantidad > 0 && (
                <div className="mt-4 pt-4 border-t border-pink-300">
                  <p className="text-xs text-gray-600 mb-1">Monto generado</p>
                  <p className="text-xl font-bold text-pink-600">
                    {formatearMonto(estadisticas.ventasMes.monto)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;