import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Search, Trash2Icon, PackagePlus, Edit, Trash2, CheckCircle, XCircle, RotateCcw, Loader2, Tag } from 'lucide-react';
import { productoService, type Producto } from '../../services/Prod-DetVenta';
import { getCategoryIcon } from '../../utils/CategoryIcons';
import Modal from '../../components/Modal';
import FormularioProducto from '../../components/FormularioProducto';

export default function Productos() {
  const { workMode } = useOutletContext<{ workMode: boolean }>();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadProductos();
  }, []);

  useEffect(() => {
    filterProductos();
  }, [searchTerm, productos]);

  const loadProductos = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await productoService.getAll();
      if (result.success) {
        setProductos(result.data);
        setFilteredProductos(result.data);
      } else {
        setError(result.error || 'Error al cargar productos');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterProductos = () => {
    if (!searchTerm.trim()) {
      setFilteredProductos(productos);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = productos.filter(prod => 
      prod.Nombre.toLowerCase().includes(term) ||
      prod.ProductoID.toLowerCase().includes(term) ||
      prod.CategoriaNombre?.toLowerCase().includes(term) ||
      prod.Descripcion?.toLowerCase().includes(term) ||
      prod.PrecioUnitario.toString().includes(term)
    );
    setFilteredProductos(filtered);
  };

  // Funciones para manejar el modal
  const handleOpenCreate = () => {
    setEditingProducto(null);
    setShowModal(true);
  };

  const handleOpenEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProducto(null);
  };

  const handleSuccess = () => {
    handleCloseModal();
    loadProductos();
  };

  const handleDelete = async (productoID: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) {
      return;
    }

    try {
      const result = await productoService.delete(productoID);
      if (result.success) {
        loadProductos();
      } else {
        alert(result.error || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
      console.error(err);
    }
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
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Productos</h1>
          <p className="text-gray-600 mt-1">Administra el catálogo de productos</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOpenCreate}
            className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
              workMode
                ? 'bg-gray-700 hover:bg-gray-800'
                : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
            }`}
          >
            <PackagePlus className="w-5 h-5" />
            Nuevo Producto
          </button>
          <button 
            onClick={loadProductos}
            className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
              workMode
                ? 'bg-gray-700 hover:bg-gray-800'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
            }`}
          >
            <RotateCcw className="w-5 h-5" />
            Actualizar
          </button>
          <button 
            onClick={() => navigate('/manager/papelera-productos')}
            className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
              workMode
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
            }`}
          >
            <Trash2Icon className="w-5 h-5" />
            Papelera
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID, descripción, categoría o precio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/\s+/g, ' '))}
            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
              workMode
                ? 'border-gray-300 focus:border-gray-600 focus:ring-gray-200'
                : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
            }`}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Mostrando {filteredProductos.length} de {productos.length} productos
        </p>
      </div>

      {/* Lista de productos */}
      <div className="grid gap-4">
        {filteredProductos.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
        ) : (
          filteredProductos.map((producto) => (
            <div
              key={producto.ProductoID}
              className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 ${
                workMode ? 'border-gray-600' : 'border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Info del producto */}
                <div className="flex items-center gap-4 flex-1">
                  {/* Icono/Avatar del producto */}
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300 ${
                    workMode
                      ? 'bg-gray-600'
                      : 'bg-gradient-to-br from-amber-400 to-orange-500'
                  }`}>
                    <span className="text-white text-3xl">{getCategoryIcon(producto.CategoriaNombre)}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {producto.Nombre}
                      </h3>
                      {producto.Habilitado ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Disponible
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          No disponible
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          ID
                        </p>
                        <p className="font-semibold text-gray-800">{producto.ProductoID}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 flex items-center gap-1">
                          Precio
                        </p>
                        <p className="font-bold text-green-600 text-lg">{formatPrice(producto.PrecioUnitario)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Categoría</p>
                        <p className="font-semibold text-gray-800">
                          {producto.CategoriaNombre || 'Sin categoría'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Descripción</p>
                        <p className="font-semibold text-gray-800">
                          {producto.Descripcion || 'Sin Descripción'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">

                  <button
                    onClick={() => handleOpenEdit(producto)}
                    className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(producto.ProductoID)}
                    className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal con formulario */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
      >
        <FormularioProducto
          producto={editingProducto}
          onSuccess={handleSuccess}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
}