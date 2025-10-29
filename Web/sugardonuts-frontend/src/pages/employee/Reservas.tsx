import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Package, CheckCircle, XCircle, AlertCircle, Loader2, ChevronDown, ChevronUp, Search } from 'lucide-react';

const API_URL = 'http://localhost/sugardonuts-api';

type EstadoReserva = 'Pendiente' | 'Confirmada' | 'Lista' | 'Entregada' | 'Cancelada';

interface DetalleReserva {
  ProductoID: string;
  ProductoNombre: string;
  ProductoDescripcion?: string;
  Cantidad: number;
  Subtotal: number;
  CategoriaNombre?: string;
}

interface Reserva {
  ReservaID: string;
  ClienteID: string;
  ClienteNombre: string;
  FechaReserva: string;
  FechaRecogida: string;
  Estado: EstadoReserva;
  Total: number;
  Archivada : boolean;
  Detalles?: DetalleReserva[];
}

export default function ReservasGestion() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoReserva | 'Todas'>('Todas');
  const [expandedReserva, setExpandedReserva] = useState<string | null>(null);
  const [detallesReserva, setDetallesReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarReservas();
  }, []);

  useEffect(() => {
    filterReservas();
  }, [searchTerm, filtroEstado, reservas]);

  const cargarReservas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/reservas.php`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setReservas(result.data);
        setFilteredReservas(result.data);
      } else {
        setError(result.error || 'Error al cargar reservas');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterReservas = () => {
    let filtered = reservas;

    // Filtrar por estado
    if (filtroEstado !== 'Todas') {
      filtered = filtered.filter(r => r.Estado === filtroEstado);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(reserva => 
        reserva.ReservaID.toLowerCase().includes(term) ||
        reserva.ClienteNombre.toLowerCase().includes(term) ||
        reserva.Estado.toLowerCase().includes(term) ||
        formatFecha(reserva.FechaReserva).includes(term) || reserva.FechaReserva.toLowerCase().includes(term) ||
        formatFecha(reserva.FechaRecogida).includes(term) || reserva.FechaRecogida.includes(term) ||
        reserva.Total.toString().includes(term)
      );
    }

    setFilteredReservas(filtered);
  };

  const handleToggleExpand = async (reservaID: string) => {
    if (expandedReserva === reservaID) {
      setExpandedReserva(null);
      setDetallesReserva(null);
    } else {
      setExpandedReserva(reservaID);
      setLoadingDetalle(true);
      try {
        const response = await fetch(`${API_URL}/reservas.php?id=${reservaID}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setDetallesReserva(result.data);
        }
      } catch (err) {
        console.error('Error al cargar detalles:', err);
      } finally {
        setLoadingDetalle(false);
      }
    }
  };

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return `Bs. ${price.toFixed(2)}`;
  };

  const getCategoryIcon = (categoryName: string): string => {
    const category = categoryName?.toLowerCase().trim() || '';
    if (category.includes('donas') || category.includes('dona')) return '🍩';
    if (category.includes('cafe') || category.includes('café')) return '☕';
    if (category.includes('te') || category.includes('té')) return '🍵';
    if (category.includes('batido')) return '🥛';
    if (category.includes('sandwiches') || category.includes('sandwich')) return '🥪';
    if (category.includes('refresco') || category.includes('bebida')) return '🥤';
    return '🍩';
  };

  const getEstadoConfig = (estado: EstadoReserva) => {
    const configs = {
      'Pendiente': { 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300', 
        icon: Clock,
        gradient: 'from-yellow-400 to-orange-500'
      },
      'Confirmada': { 
        color: 'bg-blue-100 text-blue-700 border-blue-300', 
        icon: CheckCircle,
        gradient: 'from-blue-400 to-blue-500'
      },
      'Lista': { 
        color: 'bg-green-100 text-green-700 border-green-300', 
        icon: Package,
        gradient: 'from-green-400 to-emerald-500'
      },
      'Entregada': { 
        color: 'bg-gray-100 text-gray-700 border-gray-300', 
        icon: CheckCircle,
        gradient: 'from-gray-400 to-gray-500'
      },
      'Cancelada': { 
        color: 'bg-red-100 text-red-700 border-red-300', 
        icon: XCircle,
        gradient: 'from-red-400 to-red-500'
      }
    };
    return configs[estado] || configs['Pendiente'];
  };

  const estados: Array<EstadoReserva | 'Todas'> = ['Todas', 'Pendiente', 'Confirmada', 'Lista', 'Entregada', 'Cancelada'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className= "w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Reservas</h1>
        <p className="text-gray-600 mt-1">Visualiza los pedidos para recoger</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
        {/* Filtros por Estado */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Estado</label>
          <div className="flex gap-2 flex-wrap">
            {estados.map(estado => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className="px-4 py-2 rounded-xl font-semibold transition-all bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md">
                {estado}
              </button>
            ))}
          </div>
        </div>

        {/* Buscador */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, cliente, estado o fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.replace(/\s+/g, ' '))}
              className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none border-gray-200 focus:border-pink-400 focus:ring-pink-100" />
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Mostrando {filteredReservas.length} de {reservas.length} reservas
        </p>
      </div>

      {/* Lista de Reservas */}
      <div className="space-y-4">
        {filteredReservas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">
              No se encontraron reservas
              {filtroEstado !== 'Todas' && ` en estado "${filtroEstado}"`}
            </p>
          </div>
        ) : (
          filteredReservas.map((reserva) => {
            const estadoConfig = getEstadoConfig(reserva.Estado);
            const EstadoIcon = estadoConfig.icon;

            return (
              <div
                key={reserva.ReservaID}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 border-pink-400">

                {/* Cabecera de la reserva */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icono */}
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300 bg-gradient-to-br from-amber-400 to-orange-500" >
                        <span className="text-white text-2xl">📦</span>
                      </div>

                      {/* Info principal */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">
                            {reserva.ReservaID}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border-2 ${estadoConfig.color}`}>
                            <EstadoIcon className="w-3 h-3" />
                            {reserva.Estado}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 flex items-center gap-1">
                              <User className="w-4 h-4" />
                              Cliente
                            </p>
                            <p className="font-semibold text-gray-800">{reserva.ClienteNombre}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Fecha Reserva
                            </p>
                            <p className="font-semibold text-gray-800">{formatFecha(reserva.FechaReserva)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Fecha Recogida
                            </p>
                            <p className="font-semibold text-gray-800">{formatFecha(reserva.FechaRecogida)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              Total
                            </p>
                            <p className="font-bold text-green-600 text-lg">{formatPrice(reserva.Total)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón expandir */}
                    <div className="ml-4">
                      <button
                        onClick={() => handleToggleExpand(reserva.ReservaID)}
                        className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all"
                        title="Ver detalles"
                      >
                        {expandedReserva === reserva.ReservaID ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detalles expandidos */}
                {expandedReserva === reserva.ReservaID && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {loadingDetalle ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                      </div>
                    ) : detallesReserva ? (
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5 text-pink-500" />
                          Detalles de la Reserva
                        </h4>

                        {/* Tabla de productos */}
                        {detallesReserva.Detalles && detallesReserva.Detalles.length > 0 && (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="bg-gray-200">
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Producto</th>
                                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Categoría</th>
                                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Cantidad</th>
                                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {detallesReserva.Detalles.map((detalle, index) => (
                                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getCategoryIcon(detalle.CategoriaNombre || '')}</span>
                                        <div>
                                          <p className="font-semibold text-gray-800">{detalle.ProductoNombre}</p>
                                          {detalle.ProductoDescripcion && (
                                            <p className="text-sm text-gray-500">{detalle.ProductoDescripcion}</p>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                                        {detalle.CategoriaNombre || 'Sin categoría'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-semibold">
                                      {detalle.Cantidad}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold text-green-600">
                                      {formatPrice(detalle.Subtotal)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-green-100">
                                <tr>
                                  <td colSpan={3} className="px-4 py-4 text-right font-bold text-gray-800 text-lg">
                                    TOTAL:
                                  </td>
                                  <td className="px-4 py-4 text-right font-bold text-green-700 text-xl">
                                    {formatPrice(detallesReserva.Total)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center">No se pudieron cargar los detalles</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}