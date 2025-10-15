import { useForm } from 'react-hook-form';
import { Loader2, Package, DollarSign, NotepadText, Tag } from 'lucide-react';
import { useState, useEffect } from 'react';
import { productoService, categoriaService, type Producto } from '../services/Prod-DetVenta';

interface FormularioProductoProps {
  producto?: Producto | null; // Si viene producto, es edición
  onSuccess: () => void;
  onCancel: () => void;
}

interface ProductoFormData {
  Nombre: string;
  PrecioUnitario: number;
  Descripcion: string;
  CategoriaID: string;
}

export default function FormularioProducto({ producto, onSuccess, onCancel }: FormularioProductoProps) {
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<any[]>([]);
  const isEditing = !!producto;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProductoFormData>({
    defaultValues: {
      Nombre: '',
      PrecioUnitario: 0.0,
      Descripcion: '',
      CategoriaID: ''
    }
  });

  useEffect(() => {
    loadCategorias();
  }, []);

  useEffect(() => {
    if (producto) {
      reset({
        Nombre: producto.Nombre,
        PrecioUnitario: producto.PrecioUnitario,
        Descripcion: producto.Descripcion,
        CategoriaID: producto.CategoriaID
      });
    }
  }, [producto, reset]);

  const loadCategorias = async () => {
    try {
      const result = await categoriaService.getAll();
      if (result.success) {
        setCategorias(result.data);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const onSubmit = async (data: ProductoFormData) => {
    setLoading(true);
    try {
      let result;
      if (isEditing && producto) {
        result = await productoService.update(producto.ProductoID, data);
      } else {
        result = await productoService.create(data);
      }

      if (result.success) {
        alert(isEditing ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
        reset();
        onSuccess();
      } else {
        alert(result.error || 'Error al guardar el producto');
      }
    } catch (err) {
      alert('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre del producto */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Package className="w-4 h-4 inline mr-1" />
          Nombre del Producto *
        </label>
        <input
          type="text"
          {...register('Nombre', {
            required: 'El nombre es requerido',
            minLength: { value: 3, message: 'Mínimo 3 caracteres' },
            maxLength: { value: 100, message: 'Máximo 100 caracteres' }
          })}
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
            errors.Nombre
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
          }`}
          placeholder="Ej: Dona de Chocolate Premium"
          disabled={loading}
        />
        {errors.Nombre && (
          <p className="mt-1 text-sm text-red-600">{errors.Nombre.message}</p>
        )}
      </div>

      {/* Descripción del producto */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <NotepadText className="w-4 h-4 inline mr-1" />
          Descripción del Producto *
        </label>
        <textarea
          {...register('Descripcion', {
            required: 'La descripción es requerida',
            minLength: { value: 10, message: 'Mínimo 10 caracteres' },
            maxLength: { value: 250, message: 'Máximo 250 caracteres' }
          })}
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
            errors.Descripcion
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
          }`}
          placeholder="Ej: Cubierta de chocolate negro con chispas de colores."
          disabled={loading}
        />
        {errors.Descripcion && (
          <p className="mt-1 text-sm text-red-600">{errors.Descripcion.message}</p>
        )}
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <DollarSign className="w-4 h-4 inline mr-1" />
          Precio Unitario (Bs.) *
        </label>
        <input
          type="number"
          step="0.01"
          {...register('PrecioUnitario', {
            required: 'El precio es requerido',
            min: { value: 3, message: 'El precio debe ser mayor a 3' },
            max: { value: 30, message: 'El precio es demasiado alto' }
          })}
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
            errors.PrecioUnitario
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
          }`}
          placeholder="Ej: 8.50"
          disabled={loading}
        />
        {errors.PrecioUnitario && (
          <p className="mt-1 text-sm text-red-600">{errors.PrecioUnitario.message}</p>
        )}
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <Tag className="w-4 h-4 inline mr-1" />
          Categoría *
        </label>
        <select
          {...register('CategoriaID', {
            required: 'La categoría es requerida'
          })}
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none ${
            errors.CategoriaID
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
          }`}
          disabled={loading}
        >
          <option value="">Selecciona una categoría</option>
          {categorias.map((cat) => (
            <option key={cat.CategoriaID} value={cat.CategoriaID}>
              {cat.Nombre}
            </option>
          ))}
        </select>
        {errors.CategoriaID && (
          <p className="mt-1 text-sm text-red-600">{errors.CategoriaID.message}</p>
        )}
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> Los campos marcados con * son obligatorios.
        </p>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isEditing ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            isEditing ? 'Actualizar Producto' : 'Crear Producto'
          )}
        </button>
      </div>
    </form>
  );
}
