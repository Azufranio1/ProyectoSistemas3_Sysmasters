// src/components/reportes/ReporteVentas.tsx
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, Award } from 'lucide-react';

interface ReporteVentasProps {
  data: any;
  workMode: boolean;
}

export default function ReporteVentas({ data, workMode }: ReporteVentasProps) {
  const { resumen, ventas, ventasPorDia, topEmpleados } = data;

  // Colores adaptativos según workMode
  const getCardColors = (baseColors: string) => {
    return workMode 
      ? 'bg-gradient-to-br from-gray-600 to-gray-700'
      : `bg-gradient-to-br ${baseColors}`;
  };

  const getChartColors = () => ({
    primary: workMode ? '#4b5563' : '#ec4899',
    secondary: workMode ? '#6b7280' : '#8b5cf6',
    success: workMode ? '#6b7280' : '#10b981',
  });

  const colors = getChartColors();
  const COLORS = workMode 
    ? ['#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb']
    : ['#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6'];

  const formatCurrency = (value: number) => `Bs. ${value.toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Cards de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className={`${getCardColors('from-pink-500 to-pink-600')} text-white rounded-xl p-6 shadow-lg`}>
          <ShoppingCart className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Total Ventas</p>
          <p className="text-3xl font-bold">{resumen.TotalVentas}</p>
        </div>

        <div className={`${getCardColors('from-green-500 to-green-600')} text-white rounded-xl p-6 shadow-lg`}>
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Monto Total</p>
          <p className="text-2xl font-bold">{formatCurrency(resumen.MontoTotal)}</p>
        </div>

        <div className={`${getCardColors('from-blue-500 to-blue-600')} text-white rounded-xl p-6 shadow-lg`}>
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Promedio</p>
          <p className="text-2xl font-bold">{formatCurrency(resumen.PromedioVenta)}</p>
        </div>

        <div className={`${getCardColors('from-purple-500 to-purple-600')} text-white rounded-xl p-6 shadow-lg`}>
          <Award className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Venta Máxima</p>
          <p className="text-2xl font-bold">{formatCurrency(resumen.VentaMaxima)}</p>
        </div>

        <div className={`${getCardColors('from-amber-500 to-amber-600')} text-white rounded-xl p-6 shadow-lg`}>
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Venta Mínima</p>
          <p className="text-2xl font-bold">{formatCurrency(resumen.VentaMinima)}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Ventas por Día */}
        <div className={`rounded-xl shadow-md p-6 transition-colors duration-300 ${workMode ? 'bg-white' : 'bg-white'}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Ventas por Día</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ventasPorDia}>
              <CartesianGrid strokeDasharray="3 3" stroke={workMode ? '#e5e7eb' : '#f3f4f6'} />
              <XAxis 
                dataKey="Fecha" 
                angle={-45} 
                textAnchor="end" 
                height={80}
                stroke={workMode ? '#6b7280' : '#9ca3af'}
              />
              <YAxis stroke={workMode ? '#6b7280' : '#9ca3af'} />
              <Tooltip 
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: workMode ? '#f9fafb' : '#ffffff',
                  border: `1px solid ${workMode ? '#d1d5db' : '#e5e7eb'}`
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="MontoTotal" stroke={colors.primary} strokeWidth={2} name="Monto (Bs.)" />
              <Line type="monotone" dataKey="CantidadVentas" stroke={colors.secondary} strokeWidth={2} name="Cantidad" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Top Empleados */}
        <div className={`rounded-xl shadow-md p-6 transition-colors duration-300 ${workMode ? 'bg-white' : 'bg-white'}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top 5 Empleados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topEmpleados} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={workMode ? '#e5e7eb' : '#f3f4f6'} />
              <XAxis type="number" stroke={workMode ? '#6b7280' : '#9ca3af'} />
              <YAxis 
                dataKey="Nombre" 
                type="category" 
                width={100}
                stroke={workMode ? '#6b7280' : '#9ca3af'}
              />
              <Tooltip 
                formatter={(value: any) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: workMode ? '#f9fafb' : '#ffffff',
                  border: `1px solid ${workMode ? '#d1d5db' : '#e5e7eb'}`
                }}
              />
              <Legend />
              <Bar dataKey="MontoTotal" fill={colors.success} name="Monto Total (Bs.)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Ventas Detallada */}
      <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${workMode ? 'bg-white' : 'bg-white'}`}>
        <div className={`px-6 py-4 border-b transition-colors duration-300 ${workMode ? 'border-gray-300 bg-gray-50' : 'border-gray-200'}`}>
          <h3 className="text-xl font-bold text-gray-800">Detalle de Ventas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={workMode ? 'bg-gray-100' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID Venta</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descuento</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ventas.map((venta: any) => (
                <tr key={venta.VentaID} className={workMode ? 'hover:bg-gray-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{venta.VentaID}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{venta.FechaVenta}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{venta.ClienteNombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{venta.EmpleadoNombre}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={venta.Productos}>
                    {venta.Productos}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(venta.Descuento)}</td>
                  <td className={`px-6 py-4 text-sm font-bold ${workMode ? 'text-gray-700' : 'text-green-600'}`}>
                    {formatCurrency(venta.Total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}