import { useForm } from 'react-hook-form';
import { Loader2, Package, DollarSign, NotepadText, Tag, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { productoService, categoriaService, type Producto } from '../services/Prod-DetVenta';

interface FormularioProductoProps {
  producto?: Producto | null;
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
    reset,
    setError: setFormError
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
        Descripcion: producto.Descripcion || '',
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

  const normalizeSpaces = (text: string): string => {
    return text.replace(/\s+/g, ' ');
  };

  const onSubmit = async (data: ProductoFormData) => {
    setLoading(true);
    try {
      const cleanData = {
        Nombre: normalizeSpaces(data.Nombre.trim()),
        PrecioUnitario: Number(data.PrecioUnitario),
        Descripcion: normalizeSpaces(data.Descripcion.trim()),
        CategoriaID: data.CategoriaID
      };

      let result;
      if (isEditing && producto) {
        result = await productoService.update(producto.ProductoID, cleanData);
      } else {
        result = await productoService.create(cleanData);
      }

      if (result.success) {
        alert(isEditing ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente');
        reset();
        onSuccess();
      } else {
        setFormError('root', {
          type: 'manual',
          message: result.error || 'Error al guardar el producto'
        });
      }
    } catch (err) {
      setFormError('root', {
        type: 'manual',
        message: 'Error de conexión con el servidor'
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error general */}
      {errors.root && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
          <p className="text-sm text-red-700">{errors.root.message}</p>
        </div>
      )}

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
            validate: {
              notEmpty: (value) => value.trim() !== '' || 'El nombre no puede estar vacío',
              minLength: (value) => value.trim().length >= 3 || 'Mínimo 3 caracteres',
              maxLength: (value) => value.trim().length <= 100 || 'Máximo 100 caracteres',
              noOnlySpaces: (value) => value.trim().length > 0 || 'El nombre no puede ser solo espacios',
              noSpecialCharsStart: (value) => {
                const trimmed = value.trim();
                return /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ]/.test(trimmed) || 'Debe comenzar con una letra o número';
              },
              validChars: (value) => {
                const trimmed = value.trim();
                // Solo letras, números, espacios, tildes y algunos caracteres comunes
                return /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s\-\(\)\.]+$/.test(trimmed) || 'Contiene caracteres no permitidos';
              },
              noExcessiveSpaces: (value) => {
                return !/\s{2,}/.test(value) || 'No se permiten espacios múltiples consecutivos';
              }
            }
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
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.Nombre.message}
          </p>
        )}
      </div>

      {/* Descripción del producto */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          <NotepadText className="w-4 h-4 inline mr-1" />
          Descripción del Producto *
        </label>
        <textarea
          rows={3}
          {...register('Descripcion', {
            required: 'La descripción es requerida',
            validate: {
              notEmpty: (value) => value.trim() !== '' || 'La descripción no puede estar vacía',
              minLength: (value) => value.trim().length >= 10 || 'Mínimo 10 caracteres',
              maxLength: (value) => value.trim().length <= 250 || 'Máximo 250 caracteres',
              noOnlySpaces: (value) => value.trim().length > 0 || 'La descripción no puede ser solo espacios',
              validChars: (value) => {
                const trimmed = value.trim();
                // Permitir letras, números, espacios, puntuación común
                return /^[a-zA-Z0-9ñÑáéíóúÁÉÍÓÚ\s\.\,\-\(\)\;\:]+$/.test(trimmed) || 'Contiene caracteres no permitidos';
              },
              noExcessiveSpaces: (value) => {
                return !/\s{2,}/.test(value) || 'No se permiten espacios múltiples consecutivos';
              }
            }
          })}
          className={`w-full px-4 py-3 border-2 rounded-xl transition-all outline-none resize-none ${
            errors.Descripcion
              ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
              : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
          }`}
          placeholder="Ej: Deliciosa dona cubierta de chocolate belga con chispas de colores."
          disabled={loading}
        />
        {errors.Descripcion && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.Descripcion.message}
          </p>
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
            validate: {
              positive: (value) => Number(value) > 0 || 'El precio debe ser mayor a 0',
              minPrice: (value) => Number(value) >= 3 || 'El precio mínimo es Bs. 3.00',
              maxPrice: (value) => Number(value) <= 30 || 'El precio máximo es Bs. 30.00',
              validDecimals: (value) => {
                const decimals = value.toString().split('.')[1];
                return !decimals || decimals.length <= 2 || 'Máximo 2 decimales';
              },
              notZero: (value) => Number(value) !== 0 || 'El precio no puede ser 0'
            }
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
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.PrecioUnitario.message}
          </p>
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
            required: 'La categoría es requerida',
            validate: {
              notEmpty: (value) => value !== '' || 'Debes seleccionar una categoría'
            }
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
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.CategoriaID.message}
          </p>
        )}
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>Nota:</strong> Los campos marcados con * son obligatorios. 
          Los espacios al inicio y final serán eliminados automáticamente.
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