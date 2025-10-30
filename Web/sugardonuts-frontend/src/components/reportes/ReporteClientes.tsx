// src/components/reportes/ReporteClientes.tsx
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, TrendingUp, Award } from 'lucide-react';

interface ReporteClientesProps {
  data: any;
  workMode: boolean;
}

export default function ReporteClientes({ data, workMode }: ReporteClientesProps) {
  const { resumen, clientes, top10, frecuencia } = data;

  // Colores adaptativos según workMode
  const getCardColors = (baseColors: string) => {
    return workMode 
      ? 'bg-gradient-to-br from-gray-600 to-gray-700'
      : `bg-gradient-to-br ${baseColors}`;
  };

  const getChartColors = () => ({
    primary: workMode ? '#6b7280' : '#10b981',
    secondary: workMode ? '#9ca3af' : '#8b5cf6',
  });

  const colors = getChartColors();
  const COLORS = workMode 
    ? ['#4b5563', '#6b7280', '#9ca3af', '#d1d5db']
    : ['#10b981', '#ec4899', '#f59e0b', '#8b5cf6'];

  const formatCurrency = (value: number) => `Bs. ${value.toFixed(2)}`;

  return (
    <div className="space-y-6">
      {/* Cards de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className={`${getCardColors('from-blue-500 to-blue-600')} text-white rounded-xl p-6 shadow-lg`}>
          <Users className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Total Clientes</p>
          <p className="text-3xl font-bold">{resumen.TotalClientes}</p>
        </div>

        <div className={`${getCardColors('from-green-500 to-green-600')} text-white rounded-xl p-6 shadow-lg`}>
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Monto Total</p>
          <p className="text-2xl font-bold">{formatCurrency(resumen.MontoTotal)}</p>
        </div>

        <div className={`${getCardColors('from-purple-500 to-purple-600')} text-white rounded-xl p-6 shadow-lg`}>
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Promedio por Cliente</p>
          <p className="text-2xl font-bold">{formatCurrency(resumen.PromedioGastoPorCliente)}</p>
        </div>

        <div className={`${getCardColors('from-amber-500 to-amber-600')} text-white rounded-xl p-6 shadow-lg`}>
          <Award className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Cliente Más Fiel</p>
          <p className="text-2xl font-bold">{resumen.ClienteMasFrecuente || '—'}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top 10 Clientes */}
        <div className={`rounded-xl shadow-md p-6 transition-colors duration-300 ${workMode ? 'bg-white' : 'bg-white'}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Top 10 Clientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top10}>
              <CartesianGrid strokeDasharray="3 3" stroke={workMode ? '#e5e7eb' : '#f3f4f6'} />
              <XAxis dataKey="NombreCompleto" angle={-45} textAnchor="end" height={100} stroke={workMode ? '#6b7280' : '#9ca3af'} />
              <YAxis stroke={workMode ? '#6b7280' : '#9ca3af'} />
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="MontoTotal" fill={colors.primary} name="Monto Total (Bs.)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución por Frecuencia */}
        <div className={`rounded-xl shadow-md p-6 transition-colors duration-300 ${workMode ? 'bg-white' : 'bg-white'}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Frecuencia de Compra</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={frecuencia}
                dataKey="CantidadClientes"
                nameKey="Rango"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry) => `${entry.Rango}: ${entry.CantidadClientes}`}
              >
                {frecuencia.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className={`rounded-xl shadow-md overflow-hidden transition-colors duration-300 ${workMode ? 'bg-white' : 'bg-white'}`}>
        <div className={`px-6 py-4 border-b transition-colors duration-300 ${workMode ? 'border-gray-300 bg-gray-50' : 'border-gray-200'}`}>
          <h3 className="text-xl font-bold text-gray-800">Detalle de Clientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={workMode ? 'bg-gray-100' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">CI/NIT</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Compras</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Monto Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Promedio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Primera Compra</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Última Compra</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clientes.map((cliente: any) => (
                <tr key={cliente.ClienteID} className={workMode ? 'hover:bg-gray-50' : 'hover:bg-gray-50'}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {cliente.NombreCompleto.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{cliente.NombreCompleto}</p>
                        <p className="text-xs text-gray-500">{cliente.ClienteID}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.CINIT}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-600">{cliente.TotalCompras}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">{formatCurrency(cliente.MontoTotal)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(cliente.PromedioCompra)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.PrimeraCompra}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{cliente.UltimaCompra}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
