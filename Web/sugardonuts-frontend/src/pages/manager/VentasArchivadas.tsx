import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Search, ArchiveRestore, Notebook, ChevronDown, ChevronUp, Calendar, User, DollarSign, Package, Loader2 } from 'lucide-react';
import { ventaService, type Venta } from '../../services/Venta';

export default function VentasMAr() {
  const { workMode } = useOutletContext<{ workMode: boolean }>();
  const navigate = useNavigate();
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedVenta, setExpandedVenta] = useState<string | null>(null);
  const [detallesVenta, setDetallesVenta] = useState<any>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    loadVentas();
  }, []);

  useEffect(() => {
    filterVentas();
  }, [searchTerm, ventas]);

  const loadVentas = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await ventaService.getArchivadas();
      if (result.success) {
        setVentas(result.data);
        setFilteredVentas(result.data);
      } else {
        setError(result.error || 'Error al cargar ventas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterVentas = () => {
    if (!searchTerm.trim()) {
      setFilteredVentas(ventas);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = ventas.filter(venta => 
      venta.VentaID.toLowerCase().includes(term) ||
      venta.EmpleadoNombre.toLowerCase().includes(term) ||
      venta.ClienteNombre.toLowerCase().includes(term) ||
      venta.FechaVenta.includes(term) ||
      venta.Total.toString().includes(term)
    );
    setFilteredVentas(filtered);
  };

  const handleToggleExpand = async (ventaID: string) => {
    if (expandedVenta === ventaID) {
      setExpandedVenta(null);
      setDetallesVenta(null);
    } else {
      setExpandedVenta(ventaID);
      setLoadingDetalle(true);
      try {
        const result = await ventaService.getById(ventaID);
        if (result.success) {
          setDetallesVenta(result.data);
        }
      } catch (err) {
        console.error('Error al cargar detalles:', err);
      } finally {
        setLoadingDetalle(false);
      }
    }
  };

  const handleArchivar = async (ventaID: string) => {
    if (!confirm('¿Estás seguro de desarchivar esta venta?')) return;

    try {
      const result = await ventaService.toggleArchivada(ventaID, false);
      if (result.success) {
        loadVentas();
      } else {
        alert(result.error || 'Error al archivar');
      }
    } catch (err) {
      alert('Error de conexión');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price: number) => {
    return `Bs. ${price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`w-8 h-8 animate-spin ${workMode ? 'text-gray-600' : 'text-pink-500'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Ventas Archivadas</h1>
          <p className="text-gray-600 mt-1">Historial de ventas realizadas</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/manager/ventas')}
            className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
              workMode
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
            }`}
          >
            <Notebook className="w-5 h-5" />
            Ventas Activas
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
          <Package className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por ID, empleado, cliente, fecha o total..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
              workMode
                ? 'border-gray-300 focus:border-gray-600 focus:ring-gray-200'
                : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
            }`}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Mostrando {filteredVentas.length} de {ventas.length} ventas
        </p>
      </div>

      {/* Lista de ventas */}
      <div className="space-y-4">
        {filteredVentas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">No se encontraron ventas</p>
          </div>
        ) : (
          filteredVentas.map((venta) => (
            <div
              key={venta.VentaID}
              className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 ${
                workMode ? 'border-gray-600' : 'border-green-400'
              }`}
            >
              {/* Cabecera de la venta */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Icono */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${
                      workMode ? 'bg-gray-600' : 'bg-gradient-to-br from-green-400 to-emerald-500'
                    }`}>
                      <span className="text-white text-2xl">🛒</span>
                    </div>

                    {/* Info principal */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {venta.VentaID}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {venta.CantidadProductos} {venta.CantidadProductos === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Fecha
                          </p>
                          <p className="font-semibold text-gray-800">{formatDate(venta.FechaVenta)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Cliente
                          </p>
                          <p className="font-semibold text-gray-800">{venta.ClienteNombre}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <User className="w-4 h-4" />
                            Empleado
                          </p>
                          <p className="font-semibold text-gray-800">{venta.EmpleadoNombre}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            Total
                          </p>
                          <p className="font-bold text-green-600 text-lg">{formatPrice(venta.Total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleExpand(venta.VentaID)}
                      className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all"
                      title="Ver detalles"
                    >
                      {expandedVenta === venta.VentaID ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => handleArchivar(venta.VentaID)}
                      className="p-3 bg-amber-100 hover:bg-amber-200 text-amber-600 rounded-xl transition-all"
                      title="Archivar"
                    >
                      <ArchiveRestore className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Detalles expandidos */}
              {expandedVenta === venta.VentaID && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  {loadingDetalle ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                    </div>
                  ) : detallesVenta ? (
                    <div className="space-y-4">
                      <h4 className="font-bold text-gray-800 text-lg mb-4">Detalles de la Venta</h4>
                      
                      {/* Tabla de productos */}
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Producto</th>
                              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Cantidad</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">P. Unitario</th>
                              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detallesVenta.Detalles.map((detalle: any, index: number) => (
                              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-gray-800">{detalle.ProductoNombre}</p>
                                  {detalle.ProductoDescripcion && (
                                    <p className="text-sm text-gray-500">{detalle.ProductoDescripcion}</p>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                    {detalle.CategoriaNombre}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center font-semibold">
                                  {detalle.Cantidad}
                                </td>
                                <td className="px-4 py-3 text-right text-gray-700">
                                  {formatPrice(detalle.PrecioUnitario)}
                                </td>
                                <td className="px-4 py-3 text-right font-bold text-green-600">
                                  {formatPrice(detalle.Subtotal)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-100">
                            <tr>
                              <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-800">
                                Descuento:
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-red-600">
                                -{formatPrice(detallesVenta.Descuento)}
                              </td>
                            </tr>
                            <tr className="bg-green-100">
                              <td colSpan={4} className="px-4 py-4 text-right font-bold text-gray-800 text-lg">
                                TOTAL:
                              </td>
                              <td className="px-4 py-4 text-right font-bold text-green-700 text-xl">
                                {formatPrice(detallesVenta.Total)}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center">No se pudieron cargar los detalles</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}