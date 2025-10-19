import { useOutletContext } from 'react-router-dom';
import Papelera from '../../components/Papelera';
import { productoService } from '../../services/Prod-DetVenta';
import { DollarSign, Tag } from 'lucide-react';
import { getCategoryIcon } from '../../utils/CategoryIcons';

export default function PapeleraProductos() {
  const { workMode } = useOutletContext<{ workMode: boolean }>();

  const fetchDeletedProductos = async () => {
    return await productoService.getDeleted();
  };

  const restoreProducto = async (id: string) => {
    return await productoService.recover(id);
  };

  const permanentDeleteProducto = async (id: string) => {
    return await productoService.permanentDelete(id);
  };

  const renderProductoDetails = (producto: any) => (
    <div className="flex items-center gap-4">
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-colors duration-300 ${
                          workMode
                            ? 'bg-gray-600'
                            : 'bg-gradient-to-br from-amber-400 to-orange-500'
                        }`}>
                          <span className="text-white text-3xl">{getCategoryIcon(producto.CategoriaNombre)}</span>
                        </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-800">{producto.Nombre}</h3>
        {producto.Descripcion && (
          <p className="text-sm text-gray-600 mt-1">{producto.Descripcion}</p>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm">
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <Tag className="w-4 h-4" />
              ID
            </p>
            <p className="font-semibold text-gray-800">{producto.ProductoID}</p>
          </div>
          <div>
            <p className="text-gray-500 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Precio
            </p>
            <p className="font-bold text-green-600">Bs. {producto.PrecioUnitario.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-500">Categoría</p>
            <p className="font-semibold text-gray-800">{producto.CategoriaNombre || 'Sin categoría'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Papelera
      workMode={workMode}
      title="Papelera de Productos"
      description="Productos eliminados que pueden ser restaurados"
      icon="📦"
      fetchDeletedItems={fetchDeletedProductos}
      restoreItem={restoreProducto}
      permanentDelete={permanentDeleteProducto}
      renderItemDetails={renderProductoDetails}
      getItemId={(prod) => prod.ProductoID}
      getItemName={(prod) => prod.Nombre}
    />
  );
}