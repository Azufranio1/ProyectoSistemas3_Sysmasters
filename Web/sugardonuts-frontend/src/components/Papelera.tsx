import { useState, useEffect } from 'react';
import { Search, RotateCcw, Trash2, Loader2, AlertTriangle } from 'lucide-react';

interface PapeleraProps {
  workMode?: boolean;
  title: string;
  description: string;
  icon: string;
  fetchDeletedItems: () => Promise<any>;
  restoreItem: (id: string) => Promise<any>;
  permanentDelete: (id: string) => Promise<any>;
  renderItemDetails: (item: any) => React.ReactNode;
  getItemId: (item: any) => string;
  getItemName: (item: any) => string;
}

export default function Papelera({
  workMode = false,
  title,
  description,
  icon,
  fetchDeletedItems,
  restoreItem,
  permanentDelete,
  renderItemDetails,
  getItemId,
  getItemName
}: PapeleraProps) {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, items]);

  const loadItems = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchDeletedItems();
      if (result.success) {
        setItems(result.data || []);
        setFilteredItems(result.data || []);
      } else {
        setError(result.error || 'Error al cargar elementos eliminados');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = items.filter(item => {
      const itemName = getItemName(item).toLowerCase();
      const itemId = getItemId(item).toLowerCase();
      return itemName.includes(term) || itemId.includes(term);
    });
    setFilteredItems(filtered);
  };

  const handleRestore = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de restaurar "${name}"?`)) {
      return;
    }

    try {
      const result = await restoreItem(id);
      if (result.success) {
        loadItems();
        alert('Elemento restaurado exitosamente');
      } else {
        alert(result.error || 'Error al restaurar');
      }
    } catch (err) {
      alert('Error de conexión');
      console.error(err);
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!confirm(`⚠️ ADVERTENCIA: ¿Estás seguro de eliminar PERMANENTEMENTE "${name}"?\n\nEsta acción NO se puede deshacer.`)) {
      return;
    }

    try {
      const result = await permanentDelete(id);
      if (result.success) {
        loadItems();
        alert('Elemento eliminado permanentemente');
      } else {
        alert(result.error || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
      console.error(err);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
              <p className="text-gray-600 mt-1">{description}</p>
            </div>
          </div>
        </div>
        <button
          onClick={loadItems}
          className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
            workMode
              ? 'bg-gray-700 hover:bg-gray-800'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          Actualizar
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en papelera..."
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
          {filteredItems.length} elementos en papelera
        </p>
      </div>

      {/* Lista de elementos */}
      <div className="grid gap-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🗑️</div>
            <p className="text-gray-500 text-lg font-semibold">La papelera está vacía</p>
            <p className="text-gray-400 text-sm mt-2">No hay elementos eliminados</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={getItemId(item)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 border-red-400"
            >
              <div className="flex items-center justify-between">
                {/* Detalles del item */}
                <div className="flex-1">
                  {renderItemDetails(item)}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleRestore(getItemId(item), getItemName(item))}
                    className="p-3 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-all flex items-center gap-2 px-4"
                    title="Restaurar"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span className="font-semibold">Restaurar</span>
                  </button>

                  <button
                    onClick={() => handlePermanentDelete(getItemId(item), getItemName(item))}
                    className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all"
                    title="Eliminar permanentemente"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}