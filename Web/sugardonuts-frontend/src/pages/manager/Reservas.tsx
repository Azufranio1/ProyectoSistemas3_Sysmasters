// src/pages/empleado/Reservas.tsx
import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Package,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Search
} from 'lucide-react';

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
  Archivada?: boolean;
  Detalles?: DetalleReserva[];
}

export default function ReservasEmpleado(): React.ReactElement {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [filteredReservas, setFilteredReservas] = useState<Reserva[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoReserva | 'Todas'>('Todas');
  const [expandedReserva, setExpandedReserva] = useState<string | null>(null);
  const [detallesReserva, setDetallesReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [error, setError] = useState('');
  // para cambio de estado UI
  const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState<EstadoReserva | ''>('');
  const [updatingEstadoReserva, setUpdatingEstadoReserva] = useState(false);

  useEffect(() => {
    cargarReservas();
  }, []);

  useEffect(() => {
    filterReservas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filtroEstado, reservas]);

  const cargarReservas = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/reservas.php`);
      const result = await response.json();

      if (result && result.success && (result.data || Array.isArray(result.data))) {
        setReservas(result.data || []);
        setFilteredReservas(result.data || []);
      } else {
        setError(result?.error || 'Error al cargar reservas');
        setReservas([]);
        setFilteredReservas([]);
      }
    } catch (err) {
      console.error('cargarReservas -> error', err);
      setError('Error de conexión con el servidor');
      setReservas([]);
      setFilteredReservas([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReservas = () => {
    let filtered = Array.isArray(reservas) ? reservas.slice() : [];

    if (filtroEstado !== 'Todas') filtered = filtered.filter((r) => r.Estado === filtroEstado);

    if (searchTerm && searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((reserva) => {
        const fechaReservaFmt = safeFormatFecha(reserva.FechaReserva).toLowerCase();
        const fechaRecogidaFmt = safeFormatFecha(reserva.FechaRecogida).toLowerCase();
        return (
          String(reserva.ReservaID || '').toLowerCase().includes(term) ||
          String(reserva.ClienteNombre || '').toLowerCase().includes(term) ||
          String(reserva.Estado || '').toLowerCase().includes(term) ||
          fechaReservaFmt.includes(term) ||
          fechaRecogidaFmt.includes(term) ||
          String(reserva.Total || '').toLowerCase().includes(term)
        );
      });
    }

    setFilteredReservas(filtered);
  };

  const handleToggleExpand = async (reservaID: string) => {
    if (expandedReserva === reservaID) {
      setExpandedReserva(null);
      setDetallesReserva(null);
      setNuevoEstadoSeleccionado('');
      return;
    }

    setExpandedReserva(reservaID);
    setLoadingDetalle(true);
    setDetallesReserva(null);
    setNuevoEstadoSeleccionado('');

    try {
      const response = await fetch(`${API_URL}/reservas.php?id=${encodeURIComponent(reservaID)}`);
      const result = await response.json();

      if (result && result.success && result.data) {
        setDetallesReserva(result.data);
        // preseleccionar el estado actual para el dropdown
        setNuevoEstadoSeleccionado(result.data.Estado as EstadoReserva);
      } else {
        console.warn('handleToggleExpand: no data', result);
      }
    } catch (err) {
      console.error('handleToggleExpand -> error', err);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const safeFormatFecha = (fecha?: string) => {
    if (!fecha) return '';
    try {
      const date = new Date(fecha);
      if (isNaN(date.getTime())) return fecha;
      return date.toLocaleDateString('es-BO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return fecha;
    }
  };

  const formatPrice = (price?: number) => {
    const n = typeof price === 'number' ? price : 0;
    return `Bs. ${n.toFixed(2)}`;
  };

  const getCategoryIcon = (categoryName?: string): string => {
    const category = (categoryName || '').toLowerCase().trim();
    if (category.includes('donas') || category.includes('dona')) return '🍩';
    if (category.includes('cafe') || category.includes('café')) return '☕';
    if (category.includes('te') || category.includes('té')) return '🍵';
    if (category.includes('batido')) return '🥛';
    if (category.includes('sandwiches') || category.includes('sandwich')) return '🥪';
    if (category.includes('refresco') || category.includes('bebida')) return '🥤';
    return '📦';
  };

  const getEstadoConfig = (estado: EstadoReserva) => {
    const configs: Record<string, any> = {
      Pendiente: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: Clock
      },
      Confirmada: {
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        icon: CheckCircle
      },
      Lista: {
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: Package
      },
      Entregada: {
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        icon: CheckCircle
      },
      Cancelada: {
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: XCircle
      }
    };
    return configs[estado] || configs['Pendiente'];
  };

  const estados: Array<EstadoReserva | 'Todas'> = ['Todas', 'Pendiente', 'Confirmada', 'Lista', 'Entregada', 'Cancelada'];

  // ---- Cambiar estado en backend ----
  const updateReservaEstado = async (reservaID: string, nuevoEstado: EstadoReserva) => {
    setUpdatingEstadoReserva(true);
    setError('');
    try {
      // Haga POST con action=updateStatus (ajusta si tu API espera otro formato)
      const res = await fetch(`${API_URL}/reservas.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', ReservaID: reservaID, Estado: nuevoEstado })
      });
      const data = await res.json();

      if (!data || !data.success) {
        const msg = data?.error || 'Error al actualizar estado';
        setError(msg);
        return false;
      }

      // Actualización optimista local: actualiza arrays reservas y filteredReservas
      setReservas(prev => prev.map(r => (r.ReservaID === reservaID ? { ...r, Estado: nuevoEstado } : r)));
      setFilteredReservas(prev => prev.map(r => (r.ReservaID === reservaID ? { ...r, Estado: nuevoEstado } : r)));

      // Si detalles abiertos corresponden, actualizarlo también
      setDetallesReserva(prev => (prev && prev.ReservaID === reservaID ? { ...prev, Estado: nuevoEstado } : prev));

      return true;
    } catch (err) {
      console.error('updateReservaEstado -> error', err);
      setError('Error de conexión al actualizar estado');
      return false;
    } finally {
      setUpdatingEstadoReserva(false);
    }
  };

  // quick helper que se usa al click de confirmar cambio
  const handleConfirmEstadoChange = async () => {
    if (!detallesReserva || !nuevoEstadoSeleccionado) return;
    if (detallesReserva.Estado === nuevoEstadoSeleccionado) {
      // nada que hacer
      return;
    }

    const ok = await updateReservaEstado(detallesReserva.ReservaID, nuevoEstadoSeleccionado as EstadoReserva);
    if (ok) {
      // feedback: la UI ya se actualizó optimísticamente
      // puedes mostrar un mensaje breve con success (aquí uso console)
      console.log(`Estado de ${detallesReserva.ReservaID} actualizado a ${nuevoEstadoSeleccionado}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
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
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Filtrar por Estado</label>
          <div className="flex gap-2 flex-wrap">
            {estados.map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  filtroEstado === estado ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Buscar</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, cliente, estado o fecha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.replace(/\s+/g, ' '))}
              className="w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none border-gray-200 focus:border-pink-400 focus:ring-pink-100"
            />
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
              No se encontraron reservas {filtroEstado !== 'Todas' && ` en estado "${filtroEstado}"`}
            </p>
          </div>
        ) : (
          filteredReservas.map((reserva) => {
            const estadoConfig = getEstadoConfig(reserva.Estado);
            const EstadoIcon = estadoConfig.icon;

            return (
              <div key={reserva.ReservaID} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 border-pink-400">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300 bg-gradient-to-br from-amber-400 to-orange-500">
                        <span className="text-white text-2xl">📦</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{reserva.ReservaID}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border-2 ${estadoConfig.color}`}>
                            <EstadoIcon className="w-3 h-3" />
                            {reserva.Estado}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 flex items-center gap-1"><User className="w-4 h-4" /> Cliente</p>
                            <p className="font-semibold text-gray-800">{reserva.ClienteNombre}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> Fecha Reserva</p>
                            <p className="font-semibold text-gray-800">{safeFormatFecha(reserva.FechaReserva)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center gap-1"><Clock className="w-4 h-4" /> Fecha Recogida</p>
                            <p className="font-semibold text-gray-800">{safeFormatFecha(reserva.FechaRecogida)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center gap-1"><Package className="w-4 h-4" /> Total</p>
                            <p className="text-bold text-green-600 text-lg">{formatPrice(reserva.Total)}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón expandir */}
                    <div className="ml-4">
                      <button onClick={() => handleToggleExpand(reserva.ReservaID)} className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all" title="Ver detalles">
                        {expandedReserva === reserva.ReservaID ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Detalles expandidos */}
                {expandedReserva === reserva.ReservaID && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {loadingDetalle ? (
                      <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-pink-500" /></div>
                    ) : detallesReserva ? (
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-pink-500" /> Detalles de la Reserva</h4>

                        {/* Tabla de productos */}
                        {Array.isArray(detallesReserva.Detalles) && detallesReserva.Detalles.length > 0 && (
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
                                {detallesReserva.Detalles!.map((detalle, index) => (
                                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getCategoryIcon(detalle.CategoriaNombre)}</span>
                                        <div>
                                          <p className="font-semibold text-gray-800">{detalle.ProductoNombre}</p>
                                          {detalle.ProductoDescripcion && <p className="text-sm text-gray-500">{detalle.ProductoDescripcion}</p>}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{detalle.CategoriaNombre || 'Sin categoría'}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-semibold">{detalle.Cantidad}</td>
                                    <td className="px-4 py-3 text-right font-bold text-green-600">{formatPrice(detalle.Subtotal)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-green-100">
                                <tr>
                                  <td colSpan={3} className="px-4 py-4 text-right font-bold text-gray-800 text-lg">TOTAL:</td>
                                  <td className="px-4 py-4 text-right font-bold text-green-700 text-xl">{formatPrice(detallesReserva.Total)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}

                        {/* Cambio de estado */}
                        <div className="flex items-center gap-3 mt-3">
                          <label className="font-medium">Cambiar estado:</label>

                          <select
                            value={nuevoEstadoSeleccionado}
                            onChange={(e) => setNuevoEstadoSeleccionado(e.target.value as EstadoReserva)}
                            className="border p-2 rounded"
                            disabled={updatingEstadoReserva}
                          >
                            {/* mantenemos las mismas opciones */}
                            <option value="Pendiente">Pendiente</option>
                            <option value="Confirmada">Confirmada</option>
                            <option value="Lista">Lista</option>
                            <option value="Entregada">Entregada</option>
                            <option value="Cancelada">Cancelada</option>
                          </select>

                          <button
                            onClick={handleConfirmEstadoChange}
                            className={`px-4 py-2 rounded font-semibold ${updatingEstadoReserva ? 'bg-gray-300 text-gray-700' : 'bg-green-500 text-white hover:bg-green-600'}`}
                            disabled={updatingEstadoReserva || nuevoEstadoSeleccionado === '' || nuevoEstadoSeleccionado === detallesReserva.Estado}
                          >
                            {updatingEstadoReserva ? 'Actualizando...' : 'Confirmar'}
                          </button>

                          {/* Botones rápidos (opcional) */}
                          <div className="ml-auto flex gap-2">
                            <button
                              onClick={() => { setNuevoEstadoSeleccionado('Lista'); }}
                              className="px-3 py-1 rounded bg-amber-100 text-amber-700 text-sm"
                            >
                              Marcar Lista
                            </button>
                            <button
                              onClick={() => { setNuevoEstadoSeleccionado('Entregada'); }}
                              className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm"
                            >
                              Marcar Entregada
                            </button>
                          </div>
                        </div>
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
