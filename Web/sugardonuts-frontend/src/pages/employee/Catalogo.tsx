// src/pages/manager/Catalogo.tsx
import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { productoService, type Producto } from '../../services/Prod-DetVenta';
import { clienteService, type Cliente } from '../../services/Cliente-Auth';
import { categoriaService, type Categoria } from '../../services/CategoriaService';

interface CartItem {
  ProductoID: string;
  Nombre: string;
  quantity: number;
  PrecioUnitario: number;
}

type Empleado = { EmpleadoID: string; Nombre?: string; Apellido?: string; [k: string]: any } | null;

function getCurrentEmpleado(): Empleado {
  let empleadoStr = localStorage.getItem('empleado');
  if (!empleadoStr) empleadoStr = sessionStorage.getItem('empleado');
  return empleadoStr ? JSON.parse(empleadoStr) : null;
}

// Función de iconos según categoría
export const getCategoryIcon = (categoryName?: string): string => {
  if (!categoryName) return '🍩'; 
  const category = categoryName.toLowerCase();
  if (category.includes('donas') || category.includes('clasica')) return '🍩';
  if (category.includes('cafe')) return '☕';
  if (category.includes('gaseosa')) return '🥤';
  if (category.includes('te')) return '🍵';
  if (category.includes('batido')) return '🥛';
  if (category.includes('jugo')) return '🧃';
  if (category.includes('sandwiches')) return '🥪';
  if (category.includes('galleta')) return '🍪';
  if (category.includes('pastel')) return '🎂';
  if (category.includes('pan')) return '🥐';
  return '🍩';
};

export default function Ventas(): React.ReactElement {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const [EmpleadoID, setEmpleadoID] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const [searchTermProducto, setSearchTermProducto] = useState('');

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // ---------------- Cargar datos ----------------
  const loadProductos = async () => {
    try {
      setLoading(true);
      const res = await productoService.getAll();
      if (res.success) setProductos(res.data);
      else setErrorMsg(res.error || "Error al cargar productos");
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const loadClientes = async () => {
    try {
      const res = await clienteService.getAll();
      if (res.success) setClientes(res.clientes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCategorias = async () => {
    try {
      const res = await categoriaService.getAll();
      if (res.success) setCategorias(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const emp = getCurrentEmpleado();
    if (emp && emp.EmpleadoID) setEmpleadoID(emp.EmpleadoID);
    loadProductos();
    loadClientes();
    loadCategorias();
  }, []);

  // ---------------- Funciones carrito ----------------
  const addToCart = () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!selectedProduct) {
      setErrorMsg("Por favor, selecciona un producto.");
      return;
    }
    if (!quantity || quantity < 1) {
      setErrorMsg("La cantidad debe ser mayor a 0.");
      return;
    }
    if (quantity > 100) {
      setErrorMsg("La cantidad máxima permitida es 100.");
      return;
    }

    const existing = cart.find(c => c.ProductoID === selectedProduct.ProductoID);
    if (existing) {
      setCart(prev => prev.map(c => c.ProductoID === existing.ProductoID ? { ...c, quantity: c.quantity + quantity } : c));
      setSuccessMsg("Cantidad actualizada en el carrito.");
    } else {
      setCart(prev => [
        ...prev,
        {
          ProductoID: selectedProduct.ProductoID,
          Nombre: selectedProduct.Nombre,
          quantity,
          PrecioUnitario: selectedProduct.PrecioUnitario
        }
      ]);
      setSuccessMsg("Producto agregado al carrito.");
    }

    setQuantity(1);
    setSelectedProduct(null);
  };

  const formatPrice = (price: number) => `Bs. ${Number(price).toFixed(2)}`;

  // ---------------- Render ----------------
  return (
    <div className="min-h-[80vh] px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Catálogo — <span className="text-pink-600">SugarDonuts</span></h1>

      {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">{errorMsg}</div>}
      {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">{successMsg}</div>}

      <div className="mb-8">
        <div className="flex gap-4 flex-wrap mb-4 items-center">
          <select
            className="border p-2 rounded"
            value={selectedCategoria}
            onChange={e => setSelectedCategoria(e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map(c => (
              <option key={c.CategoriaID} value={c.CategoriaID}>{c.Categoria}</option>
            ))}
          </select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTermProducto}
              onChange={e => setSearchTermProducto(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-xl w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {productos
            .filter(p => (!selectedCategoria || p.CategoriaID === selectedCategoria) &&
              p.Nombre.toLowerCase().includes(searchTermProducto.toLowerCase()))
            .map(p => (
              <div key={p.ProductoID} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center hover:shadow-xl transition cursor-pointer" onClick={() => { setSelectedProduct(p); setQuantity(1); }}>
                <div className="text-4xl mb-2">{getCategoryIcon(p.Nombre)}</div>
                <div className="font-semibold">{p.Nombre}</div>
                {p.Descripcion && <div className="text-xs text-gray-500 mt-1">{p.Descripcion}</div>}
                <div className="font-bold mt-2">{formatPrice(p.PrecioUnitario)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
