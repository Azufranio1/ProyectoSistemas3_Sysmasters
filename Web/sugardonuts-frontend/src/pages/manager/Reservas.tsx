import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Package, CheckCircle, XCircle, AlertCircle, Loader2, Eye, Plus, X } from 'lucide-react';
import { reservaService, type Reserva, type EstadoReserva } from '../../services/Reservas';

// ============= COMPONENTE PRINCIPAL =============
export default function ReservasGestion() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [filtroEstado, setFiltroEstado] = useState<EstadoReserva | 'Todas'>('Todas');
  const [selectedReserva, setSelectedReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar reservas al inicio
  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    setLoading(true);
    setError(null);
    const result = await reservaService.getAll();
    
    if (result.success && result.data) {
      setReservas(result.data);
    } else {
      setError(result.error || 'Error al cargar reservas');
    }
    setLoading(false);
  };

  const reservasFiltradas = filtroEstado === 'Todas' 
    ? reservas 
    : reservas.filter(r => r.Estado === filtroEstado);

  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCambiarEstado = async (reservaID: string, nuevoEstado: EstadoReserva) => {
    setLoading(true);
    const result = await reservaService.updateEstado(reservaID, nuevoEstado);
    
    if (result.success) {
      setSuccessMessage(`Estado actualizado a ${nuevoEstado}`);
      await cargarReservas();
      setSelectedReserva(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(result.error || 'Error al actualizar estado');
    }
    setLoading(false);
  };

  const handleCancelar = async (reservaID: string) => {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;
    
    setLoading(true);
    const result = await reservaService.cancel(reservaID);
    
    if (result.success) {
      setSuccessMessage('Reserva cancelada exitosamente');
      await cargarReservas();
      setSelectedReserva(null);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setError(result.error || 'Error al cancelar reserva');
    }
    setLoading(false);
  };

  const handleVerDetalles = async (reserva: Reserva) => {
    if (reserva.Detalles) {
      setSelectedReserva(reserva);
    } else {
      const result = await reservaService.getById(reserva.ReservaID);
      if (result.success && result.data) {
        setSelectedReserva(result.data);
      }
    }
  };

  const estados: Array<EstadoReserva | 'Todas'> = ['Todas', 'Pendiente', 'Confirmada', 'Lista', 'Entregada', 'Cancelada'];

  const getCategoryIcon = (categoryName: string): string => {
    const category = categoryName?.toLowerCase() || '';
    if (category.includes('donas')) return '🍩';
    if (category.includes('cafe')) return '☕';
    if (category.includes('te')) return '🍵';
    if (category.includes('batido')) return '🥛';
    if (category.includes('sandwiches')) return '🥪';
    return '🍩';
  };

  const getEstadoConfig = (estado: EstadoReserva) => {
    const configs = {
      'Pendiente': { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
      'Confirmada': { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle },
      'Lista': { color: 'bg-green-100 text-green-700 border-green-300', icon: Package },
      'Entregada': { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: CheckCircle },
      'Cancelada': { color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle }
    };
    return configs[estado] || configs['Pendiente'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Mensajes de Notificación */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Reservas</h1>
            <p className="text-gray-600 mt-1">Administra los pedidos para recoger</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Plus className="w-5 h-5" />
            Nueva Reserva
          </button>
        </div>

        {/* Filtros por Estado */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="flex gap-2 flex-wrap">
            {estados.map(estado => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filtroEstado === estado
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {estado}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Mostrando {reservasFiltradas.length} de {reservas.length} reservas
          </p>
        </div>

        {/* Lista de Reservas */}
        <div className="grid gap-4">
          {loading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-md">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-3" />
                <p className="text-gray-600">Cargando reservas...</p>
              </div>
            </div>
          ) : reservasFiltradas.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">
                No hay reservas {filtroEstado !== 'Todas' && `en estado "${filtroEstado}"`}
              </p>
            </div>
          ) : (
            reservasFiltradas.map((reserva) => {
              const estadoConfig = getEstadoConfig(reserva.Estado);
              const EstadoIcon = estadoConfig.icon;

              return (
                <div
                  key={reserva.ReservaID}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 border-pink-400"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
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
                            Recogida
                          </p>
                          <p className="font-semibold text-gray-800">{formatFecha(reserva.FechaRecogida)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            Total
                          </p>
                          <p className="font-semibold text-gray-800">{reserva.Total} Bs.</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Creada</p>
                          <p className="font-semibold text-gray-800">{formatFecha(reserva.FechaReserva)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => handleVerDetalles(reserva)}
                        className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all"
                        title="Ver Detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {reserva.Estado === 'Pendiente' && (
                        <button
                          onClick={() => handleCambiarEstado(reserva.ReservaID, 'Confirmada')}
                          className="p-3 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-all"
                          title="Confirmar"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}

                      {reserva.Estado === 'Confirmada' && (
                        <button
                          onClick={() => handleCambiarEstado(reserva.ReservaID, 'Lista')}
                          className="p-3 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-all"
                          title="Marcar como Lista"
                        >
                          <Package className="w-5 h-5" />
                        </button>
                      )}

                      {reserva.Estado === 'Lista' && (
                        <button
                          onClick={() => handleCambiarEstado(reserva.ReservaID, 'Entregada')}
                          className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all"
                          title="Marcar como Entregada"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                      )}

                      {!['Entregada', 'Cancelada'].includes(reserva.Estado) && (
                        <button
                          onClick={() => handleCancelar(reserva.ReservaID)}
                          className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all"
                          title="Cancelar"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal de Detalles */}
        {selectedReserva && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white rounded-t-2xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedReserva.ReservaID}</h2>
                    <p className="text-pink-100 mt-1">Detalles de la reserva</p>
                  </div>
                  <button
                    onClick={() => setSelectedReserva(null)}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-pink-500" />
                    Información del Cliente
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Cliente</p>
                      <p className="font-semibold text-gray-800">{selectedReserva.ClienteNombre}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">ID Cliente</p>
                      <p className="font-semibold text-gray-800">{selectedReserva.ClienteID}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-pink-500" />
                    Fechas
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Fecha Reserva</p>
                      <p className="font-semibold text-gray-800">{formatFecha(selectedReserva.FechaReserva)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha Recogida</p>
                      <p className="font-semibold text-gray-800">{formatFecha(selectedReserva.FechaRecogida)}</p>
                    </div>
                  </div>
                </div>

                {selectedReserva.Detalles && selectedReserva.Detalles.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-pink-500" />
                      Productos Reservados
                    </h3>
                    <div className="space-y-2">
                      {selectedReserva.Detalles.map((detalle, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getCategoryIcon(detalle.CategoriaNombre || '')}</span>
                            <div>
                              <p className="font-semibold text-gray-800">{detalle.ProductoNombre}</p>
                              <p className="text-sm text-gray-500">Cantidad: {detalle.Cantidad}</p>
                            </div>
                          </div>
                          <p className="font-bold text-gray-800">{detalle.Subtotal} Bs.</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <span className="text-2xl font-bold text-pink-600">{selectedReserva.Total} Bs.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Crear Reserva */}
        {showCreateModal && (
          <ModalCrearReserva 
            onClose={() => setShowCreateModal(false)}
            onSuccess={async () => {
              setShowCreateModal(false);
              await cargarReservas();
              setSuccessMessage('Reserva creada exitosamente');
              setTimeout(() => setSuccessMessage(null), 3000);
            }}
          />
        )}
      </div>
    </div>
  );
}

// ============= MODAL CREAR RESERVA =============
function ModalCrearReserva({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [clienteID, setClienteID] = useState('');
  const [fechaRecogida, setFechaRecogida] = useState('');
  const [productos, setProductos] = useState<Array<{ ProductoID: string; Cantidad: number; Precio: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agregarProducto = () => {
    setProductos([...productos, { ProductoID: '', Cantidad: 1, Precio: 0 }]);
  };

  const eliminarProducto = (index: number) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const actualizarProducto = (index: number, field: string, value: any) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index] = { ...nuevosProductos[index], [field]: value };
    setProductos(nuevosProductos);
  };

  const calcularTotal = () => {
    return productos.reduce((sum, p) => sum + (p.Cantidad * p.Precio), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clienteID || !fechaRecogida || productos.length === 0) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    const detalles = productos.map(p => ({
      ProductoID: p.ProductoID,
      Cantidad: p.Cantidad,
      Subtotal: p.Cantidad * p.Precio
    }));

    setLoading(true);
    const result = await reservaService.create({
      ClienteID: clienteID,
      FechaRecogida: fechaRecogida,
      Detalles: detalles
    });

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Error al crear reserva');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Nueva Reserva</h2>
            <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 p-2 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-700 font-semibold mb-2">ID Cliente *</label>
            <input
              type="text"
              value={clienteID}
              onChange={(e) => setClienteID(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Ej: CLI-001"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">Fecha y Hora de Recogida *</label>
            <input
              type="datetime-local"
              value={fechaRecogida}
              onChange={(e) => setFechaRecogida(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-gray-700 font-semibold">Productos *</label>
              <button
                type="button"
                onClick={agregarProducto}
                className="flex items-center gap-1 bg-pink-500 text-white px-3 py-1 rounded-lg hover:bg-pink-600 text-sm"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>

            {productos.map((producto, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="ID Producto (Ej: PRD-001)"
                  value={producto.ProductoID}
                  onChange={(e) => actualizarProducto(index, 'ProductoID', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Precio"
                  value={producto.Precio || ''}
                  onChange={(e) => actualizarProducto(index, 'Precio', parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  min="0"
                  step="0.01"
                  required
                />
                <input
                  type="number"
                  placeholder="Cant."
                  value={producto.Cantidad}
                  onChange={(e) => actualizarProducto(index, 'Cantidad', parseInt(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  min="1"
                  required
                />
                <button
                  type="button"
                  onClick={() => eliminarProducto(index)}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}

            {productos.length === 0 && (
              <p className="text-gray-500 text-sm italic">No hay productos agregados. Haz clic en "Agregar" para añadir productos.</p>
            )}

            {productos.length > 0 && (
              <div className="mt-4 pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-pink-600">{calcularTotal()} Bs.</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Crear Reserva
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}