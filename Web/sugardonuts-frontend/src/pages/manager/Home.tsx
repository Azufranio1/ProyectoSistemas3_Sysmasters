import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, ClipboardList, Users2, DollarSign, ShoppingBag, Award, Package, UserCheck, Calendar, Clock } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

const Home = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const workMode = false;

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const apiUrl = "http://localhost/sugardonuts-api/estadisticas_admin.php";
      console.log("📡 Llamando a:", apiUrl);
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      console.log("📊 Respuesta de estadísticas admin:", data);

      if (data.success) {
        setStats(data.data);
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

  const formatMonto = (m) => `Bs ${m.toLocaleString('es-BO', { minimumFractionDigits: 2 })}`;
  
  const formatFecha = (f) => {
    // Parsear la fecha manualmente para evitar problemas de zona horaria
    const [year, month, day] = f.split('-').map(Number);
    const d = new Date(year, month - 1, day); // month es 0-indexed
    const diaSemana = d.toLocaleDateString('es-ES', { weekday: 'short' });
    return `${diaSemana} ${day}`;
  };

  const COLORS = ['#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6'];

  // Procesar datos de la semana - rellenar días sin ventas
  const procesarDatosSemana = () => {
    if (!stats?.ventasSemana) return [];
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar a medianoche
    const resultado = [];
    
    // Generar los últimos 7 días (de hace 7 días hasta ayer inclusive)
    for (let i = 7; i >= 1; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() - i);
      
      // Formato YYYY-MM-DD para comparar con la BD
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      const fechaStr = `${year}-${month}-${day}`;
      
      // Buscar si hay datos para este día
      const datosDia = stats.ventasSemana.find(d => d.fecha === fechaStr);
      
      resultado.push({
        fecha: fechaStr,
        dia: formatFecha(fechaStr),
        ventas: datosDia ? datosDia.ventas : 0,
        monto: datosDia ? datosDia.monto : 0
      });
    }
    
    console.log("📅 Datos procesados del gráfico:", resultado);
    return resultado;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-amber-50">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No se pudieron cargar las estadísticas</p>
          <button 
            onClick={() => { setLoading(true); cargarEstadisticas(); }}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 bg-gradient-to-br from-gray-50 via-pink-50 to-amber-50">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Panel de Administración — <span className="text-pink-600">SugarDonuts</span>
        </h1>
        <p className="text-gray-500">Resumen general del negocio</p>
      </div>

      {/* Tarjetas KPI principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Ventas del mes */}
        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-pink-500 hover:shadow-lg transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Ventas del Mes</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">{stats.ventasMes.cantidad}</h2>
              <p className="text-lg font-semibold text-pink-600">{formatMonto(stats.ventasMes.monto)}</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-pink-600" />
            </div>
          </div>
          <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
            {stats.crecimientoMensual >= 0 ? (
              <><TrendingUp className="w-4 h-4 text-green-500 mr-1" /><span className="text-sm text-green-600 font-medium">+{stats.crecimientoMensual}%</span></>
            ) : (
              <><TrendingDown className="w-4 h-4 text-red-500 mr-1" /><span className="text-sm text-red-600 font-medium">{stats.crecimientoMensual}%</span></>
            )}
            <span className="text-xs text-gray-400 ml-2">vs mes anterior</span>
          </div>
        </div>

        {/* Ventas de hoy */}
        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-amber-500 hover:shadow-lg transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Ventas Hoy</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">{stats.ventasHoy.cantidad}</h2>
              <p className="text-lg font-semibold text-amber-600">{formatMonto(stats.ventasHoy.monto)}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
            {stats.ventasHoy.cantidad > 0 ? "🔥 ¡Buen día de ventas!" : "Esperando ventas..."}
          </p>
        </div>

        {/* Reservas activas */}
        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-purple-500 hover:shadow-lg transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Reservas Activas</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">{stats.reservas.activas}</h2>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{stats.reservas.porEstado.Pendiente} pend.</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{stats.reservas.porEstado.Lista} listas</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <ClipboardList className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Clientes */}
        <div className="bg-white rounded-2xl shadow-md p-5 border-l-4 border-emerald-500 hover:shadow-lg transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Clientes Totales</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">{stats.clientes.total}</h2>
              <p className="text-sm text-emerald-600 font-medium mt-1">+{stats.clientes.nuevosEsteMes} nuevos</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl">
              <Users2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">Este mes</p>
        </div>
      </div>

      {/* Segunda fila: Mini KPIs */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="bg-blue-100 p-3 rounded-xl"><UserCheck className="w-5 h-5 text-blue-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Empleados</p>
            <p className="text-lg font-bold text-gray-800">{stats.empleados.activos}<span className="text-sm text-gray-400 font-normal">/{stats.empleados.total}</span></p>
            <p className="text-xs text-blue-600">activos ahora</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="bg-rose-100 p-3 rounded-xl"><Package className="w-5 h-5 text-rose-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Productos</p>
            <p className="text-lg font-bold text-gray-800">{stats.productos.total}</p>
            <p className="text-xs text-rose-600">en catálogo</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all">
          <div className="bg-indigo-100 p-3 rounded-xl"><Calendar className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <p className="text-xs text-gray-500">Reservas Entregadas</p>
            <p className="text-lg font-bold text-gray-800">{stats.reservas.porEstado.Entregada}</p>
            <p className="text-xs text-indigo-600">este mes</p>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid gap-6 lg:grid-cols-12 mb-8">
        {/* Gráfico de Ventas Semanal */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-800">Ventas - Últimos 7 Días</h3>
            <p className="text-sm text-gray-500">Cantidad y monto de ventas diarias</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={procesarDatosSemana()}>
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
              <XAxis dataKey="dia" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(v, n) => n === 'monto' ? [formatMonto(v), 'Monto'] : [v, 'Ventas']}
              />
              <Legend />
              <Area type="monotone" dataKey="ventas" stroke="#ec4899" fill="url(#colorVentas)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Area type="monotone" dataKey="monto" stroke="#f59e0b" fill="url(#colorMonto)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Ventas por Categoría */}
        <div className="lg:col-span-4 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Ventas por Categoría</h3>
          {stats.ventasPorCategoria && stats.ventasPorCategoria.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.ventasPorCategoria}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="monto"
                    nameKey="categoria"
                  >
                    {stats.ventasPorCategoria.map((e, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatMonto(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {stats.ventasPorCategoria.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-gray-600">{cat.categoria}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{formatMonto(cat.monto)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-400 text-center py-16 text-sm">Sin datos de categorías este mes</p>
          )}
        </div>
      </div>

      {/* Rankings y Actividad */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Productos */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-pink-500" /> Top Productos
          </h3>
          {stats.topProductos && stats.topProductos.length > 0 ? (
            <div className="space-y-3">
              {stats.topProductos.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-500">{p.cantidad} unidades</p>
                  </div>
                  <span className="text-sm font-semibold text-pink-600">{formatMonto(p.monto)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">Sin datos este mes</p>
          )}
        </div>

        {/* Top Empleados */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-500" /> Top Empleados
          </h3>
          {stats.topEmpleados && stats.topEmpleados.length > 0 ? (
            <div className="space-y-3">
              {stats.topEmpleados.map((e, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-600' : 'bg-gray-300'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{e.nombre}</p>
                    <p className="text-xs text-gray-500">{e.ventas} ventas</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{formatMonto(e.monto)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">Sin datos este mes</p>
          )}
        </div>

        {/* Últimas Ventas */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Últimas Ventas
          </h3>
          {stats.ultimasVentas && stats.ultimasVentas.length > 0 ? (
            <div className="space-y-3">
              {stats.ultimasVentas.map((v, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 truncate">{v.cliente}</p>
                      <p className="text-xs text-gray-500 truncate">por {v.empleado}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600 ml-2">{formatMonto(v.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8 text-sm">Sin ventas registradas</p>
          )}
        </div>
      </div>

      {/* Footer motivacional */}
      <div className="mt-8 bg-gradient-to-r from-pink-500 to-amber-500 rounded-2xl shadow-lg p-6 text-white text-center">
        <p className="text-2xl mb-2">🍩</p>
        <h3 className="text-xl font-bold mb-1">¡Dulce día para el negocio!</h3>
        <p className="text-white/80">Sigue monitoreando y creciendo con SugarDonuts</p>
      </div>
    </div>
  );
};

export default Home;