// src/components/reportes/ReporteProductos.tsx
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Package, TrendingUp, DollarSign, Layers } from 'lucide-react';
import { getCategoryIcon } from '../../utils/CategoryIcons';

interface ReporteProductosProps {
  data: any;
  workMode: boolean;
}

export default function ReporteProductos({ data, workMode }: ReporteProductosProps) {
  const { resumen, productos, top10, categorias } = data;

  const COLORS = ['#ec4899', '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#84cc16'];

  const formatCurrency = (value: number) => `Bs. ${value.toFixed(2)}`;

  const cardBase = workMode
    ? 'bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg shadow-black/30'
    : 'bg-gradient-to-br from-white to-gray-50 text-gray-800 shadow-md';

  const tableHeader = workMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-600';
  const tableRowHover = workMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const textColor = workMode ? 'text-gray-100' : 'text-gray-800';
  const borderColor = workMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="space-y-6">
      {/* Cards de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
          <Package className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Total Productos</p>
          <p className="text-3xl font-bold">{resumen.TotalProductos}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
          <DollarSign className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Ingresos Totales</p>
          <p className="text-2xl font-bold">{formatCurrency(resumen.TotalIngresos)}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
          <TrendingUp className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Unidades Vendidas</p>
          <p className="text-3xl font-bold">{resumen.TotalUnidades}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-6 shadow-lg">
          <Layers className="w-8 h-8 mb-2 opacity-80" />
          <p className="text-sm opacity-90">Promedio/Producto</p>
          <p className="text-2xl font-bold">{formatCurrency(resumen.PromedioIngresoPorProducto)}</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top 10 Productos */}
        <div className={`${cardBase} rounded-xl p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${textColor}`}>Top 10 Productos Más Vendidos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top10}>
              <CartesianGrid strokeDasharray="3 3" stroke={workMode ? '#444' : '#ccc'} />
              <XAxis dataKey="Nombre" angle={-45} textAnchor="end" height={100} stroke={workMode ? '#ddd' : '#333'} />
              <YAxis stroke={workMode ? '#ddd' : '#333'} />
              <Tooltip contentStyle={{ backgroundColor: workMode ? '#1f2937' : '#fff', color: workMode ? '#fff' : '#000' }} />
              <Legend />
              <Bar dataKey="CantidadTotal" fill="#ec4899" name="Unidades Vendidas" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Ventas por Categoría */}
        <div className={`${cardBase} rounded-xl p-6`}>
          <h3 className={`text-xl font-bold mb-4 ${textColor}`}>Ingresos por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorias}
                dataKey="IngresoTotal"
                nameKey="Categoria"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={(entry: any) => {
                  // entry puede venir con formas distintas dependiendo de la versión y contexto:
                  // - entry.payload: el objeto original
                  // - entry.value: valor numérico calculado
                  // - entry.name: nombre de la categoría
                  const payload = entry.payload ?? {};
                  const categoriaName = payload.Categoria ?? entry.name ?? 'Sin categoría';
                  const ingresoRaw = payload.IngresoTotal ?? entry.value ?? 0;
                  const ingresoNum = Number(ingresoRaw) || 0;
                  return `${categoriaName}: ${formatCurrency(ingresoNum)}`;
                }}
              >
                {categorias.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: workMode ? '#1f2937' : '#fff', color: workMode ? '#fff' : '#000' }}
                // formatter recibe (value, name, props) — defensivo también
                formatter={(value: any) => {
                  const num = Number(value) || 0;
                  return formatCurrency(num);
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className={`${cardBase} overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${borderColor}`}>
          <h3 className={`text-xl font-bold ${textColor}`}>Detalle de Productos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={tableHeader}>
              <tr>
                {['Producto', 'Categoría', 'Precio Unit.', 'Veces Vendido', 'Cant. Total', 'Ingreso Total'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {productos.map((producto: any) => (
                <tr key={producto.ProductoID} className={tableRowHover}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCategoryIcon(producto.CategoriaNombre)}</span>
                      <div>
                        <p className={`text-sm font-medium ${textColor}`}>{producto.Nombre}</p>
                        <p className="text-xs text-gray-400">{producto.ProductoID}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{producto.CategoriaNombre}</td>
                  <td className="px-6 py-4 text-sm">{formatCurrency(producto.PrecioUnitario)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-blue-400">{producto.VecesVendido}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-purple-400">{producto.CantidadTotal}</td>
                  <td className="px-6 py-4 text-sm font-bold text-green-400">{formatCurrency(producto.IngresoTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla de Categorías */}
      <div className={`${cardBase} overflow-hidden`}>
        <div className={`px-6 py-4 border-b ${borderColor}`}>
          <h3 className={`text-xl font-bold ${textColor}`}>Resumen por Categoría</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={tableHeader}>
              <tr>
                {['Categoría', 'Ventas Realizadas', 'Unidades Vendidas', 'Ingreso Total', '% del Total'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {categorias.map((cat: any, index: number) => {
                const porcentaje = (cat.IngresoTotal / resumen.TotalIngresos * 100).toFixed(1);
                return (
                  <tr key={index} className={tableRowHover}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getCategoryIcon(cat.Categoria)}</span>
                        <span className={`text-sm font-medium ${textColor}`}>{cat.Categoria}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{cat.VentasRealizadas}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-purple-400">{cat.UnidadesVendidas}</td>
                    <td className="px-6 py-4 text-sm font-bold text-green-400">{formatCurrency(cat.IngresoTotal)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-600 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full"
                            style={{ width: `${porcentaje}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold w-12 text-right">{porcentaje}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
