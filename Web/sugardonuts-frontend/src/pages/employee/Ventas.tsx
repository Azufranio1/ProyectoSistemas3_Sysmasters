// src/pages/manager/Ventas.tsx
import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  DollarSign,
  CheckCircle,
  Search,
  Archive,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Loader2,
  Package
} from "lucide-react";
import { productoService, type Producto } from '../../services/Prod-DetVenta';
import { ventaService } from '../../services/ventaService';
import { clienteService, type Cliente } from '../../services/Cliente-Auth';

interface CartItem {
  ProductoID: string;
  Nombre: string;
  quantity: number;
  PrecioUnitario: number;
}

type Empleado = { EmpleadoID: string; Nombre?: string; Apellido?: string; [k: string]: any } | null;

function getCurrentEmpleado(): Empleado {
  let empleadoStr = localStorage.getItem('empleado');
  if (!empleadoStr) {
    empleadoStr = sessionStorage.getItem('empleado');
  }
  return empleadoStr ? JSON.parse(empleadoStr) : null;
}

export default function Ventas(): React.ReactElement {
  // Si quieres usar workMode desde contexto, reemplaza la siguiente línea por:
  // const { workMode } = useOutletContext<{ workMode: boolean }>();
  const workMode = false;

  // --- Estados para tu UI de empleado (se mantiene tal cual pediste)
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [orders, setOrders] = useState<any[]>([]);
  const [lastCheckout, setLastCheckout] = useState<CartItem[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientApellido, setNewClientApellido] = useState("");
  const [newClientCINIT, setNewClientCINIT] = useState("");

  const [EmpleadoID, setEmpleadoID] = useState<string | null>(null); // viene de almacenamiento

  // --- Estados para la lista estilo manager
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVentas, setFilteredVentas] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [listError, setListError] = useState<string>('');
  const [expandedVenta, setExpandedVenta] = useState<string | null>(null);
  const [detallesVenta, setDetallesVenta] = useState<any>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

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

  const fetchOrders = async (empleadoId?: string | null) => {
    try {
      setLoadingList(true);
      setListError('');
      const res = await ventaService.getAll(true, empleadoId || undefined);
      if (res.success) {
        // algunos endpoints retornan 'ventas' o 'data' -> normalizamos
        const arr = res.ventas || res.data || [];
        setOrders(arr);
        setFilteredVentas(arr);
      } else {
        setOrders([]);
        setFilteredVentas([]);
        setListError(res.error || 'Error al cargar ventas');
      }
    } catch (err) {
      console.error('fetchOrders -> error:', err);
      setOrders([]);
      setFilteredVentas([]);
      setListError('Error de conexión con el servidor');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    // obtener empleado actual desde local/session storage
    const emp = getCurrentEmpleado();
    if (emp && emp.EmpleadoID) {
      setEmpleadoID(emp.EmpleadoID);
    } else {
      setEmpleadoID(null);
    }

    loadProductos();
    loadClientes();
    // fetchOrders será llamado por el efecto siguiente cuando EmpleadoID esté listo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchOrders(EmpleadoID);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [EmpleadoID]);

  useEffect(() => {
    // filtrar lista cuando cambie searchTerm u orders
    if (!searchTerm.trim()) {
      setFilteredVentas(orders);
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = orders.filter((venta: any) =>
      (venta.VentaID || '').toString().toLowerCase().includes(term) ||
      (venta.EmpleadoNombre || venta.EmpleadoID || '').toString().toLowerCase().includes(term) ||
      (venta.ClienteNombre || venta.ClienteID || '').toString().toLowerCase().includes(term) ||
      (venta.FechaVenta || '').toString().toLowerCase().includes(term) ||
      (venta.Total || '').toString().toLowerCase().includes(term)
    );
    setFilteredVentas(filtered);
  }, [searchTerm, orders]);

  // ---------------- Validadores (mismos que tenías) ----------------
  const handleNewClientNameChange = (value: string) => {
    const filtered = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '');
    setNewClientName(filtered);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleNewClientApellidoChange = (value: string) => {
    const filtered = value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s'-]/g, '');
    setNewClientApellido(filtered);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleNewClientCINITChange = (value: string) => {
    const filtered = value.replace(/\D/g, '');
    setNewClientCINIT(filtered);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // ---------------- Funciones carrito (idénticas) ----------------
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

  const checkout = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const empleadoId = EmpleadoID;
    if (!empleadoId) {
      setErrorMsg("Empleado no logueado.");
      return;
    }
    if (!selectedCliente) {
      setErrorMsg("Debes seleccionar un cliente.");
      return;
    }
    if (cart.length === 0) {
      setErrorMsg("El carrito está vacío.");
      return;
    }

    try {
      const items = cart.map(i => ({
        ProductoID: i.ProductoID,
        Cantidad: i.quantity,
        PrecioUnitario: i.PrecioUnitario
      }));

      const payload = {
        EmpleadoID: empleadoId,
        ClienteID: selectedCliente!.ClienteID as string,
        Descuento: 0,
        items
      };

      console.log("Payload enviado:", payload);

      const res = await ventaService.createSale(payload);

      console.log("Respuesta del backend:", res);

      if (!res.success) {
        setErrorMsg(res.error || "Ocurrió un error al procesar la compra.");
        return;
      }

      setLastCheckout(cart);
      setCart([]);
      setSelectedCliente(null);
      setSuccessMsg("¡Compra realizada con éxito! ID: " + (res.VentaID || ""));

      // refrescar lista de ventas
      await fetchOrders(empleadoId);
    } catch (err: any) {
      console.error("Error al llamar a createSale:", err);
      setErrorMsg(err.message || "Ocurrió un error al procesar la compra.");
    }
  };

  const createNewClient = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    const nameTrim = newClientName.trim();
    const apTrim = newClientApellido.trim();
    const cinitTrim = newClientCINIT.trim();

    if (!nameTrim || !apTrim || !cinitTrim) {
      setErrorMsg("Completa todos los campos del nuevo cliente.");
      return;
    }

    const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
    const cinitRegex = /^\d+$/;

    if (!nameRegex.test(nameTrim)) {
      setErrorMsg("El nombre solo puede contener letras, espacios, guiones o apóstrofes.");
      return;
    }
    if (!nameRegex.test(apTrim)) {
      setErrorMsg("El apellido solo puede contener letras, espacios, guiones o apóstrofes.");
      return;
    }
    if (!cinitRegex.test(cinitTrim)) {
      setErrorMsg("El CINIT solo puede contener números.");
      return;
    }

    try {
      const payload = {
        Nombre: nameTrim,
        Apellido: apTrim,
        CINIT: cinitTrim
      };

      const res = await clienteService.create(payload as Required<Cliente>);
      if (!res.success) {
        setErrorMsg(res.error || "Error al crear cliente.");
        return;
      }

      setClientes(prev => [...prev, res.cliente!]);
      setSelectedCliente(res.cliente!);
      setShowNewClientForm(false);
      setNewClientName("");
      setNewClientApellido("");
      setNewClientCINIT("");
      setSuccessMsg("Cliente creado exitosamente.");
    } catch (err) {
      console.error(err);
      setErrorMsg("Error de conexión al crear cliente.");
    }
  };

  // ---------------- Lista estilo manager: detalles / acciones ----------------
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
        } else {
          setDetallesVenta(null);
        }
      } catch (err) {
        console.error('Error al cargar detalles:', err);
        setDetallesVenta(null);
      } finally {
        setLoadingDetalle(false);
      }
    }
  };

 
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => `Bs. ${Number(price).toFixed(2)}`;

  // ---------------- Render ----------------
  return (
    <div className="min-h-[80vh] px-6 py-8 bg-gradient-to-br from-yellow-50 to-pink-100">
      <h1 className="text-3xl font-bold mb-6">Ventas — <span className="text-pink-600">SugarDonuts</span></h1>

      {/* Mensajes (carrito) */}
      {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">{errorMsg}</div>}
      {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">{successMsg}</div>}

      {/* ---------------- Selección cliente (MANTENIDO tal cual pediste) ---------------- */}
      <div className="mb-4 bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl shadow-lg p-6 border border-pink-200">
        <label className="block font-bold text-gray-800 mb-3 flex items-center gap-2 text-lg">
          <User className="w-5 h-5 text-pink-600" /> Seleccionar Cliente
        </label>
        <div className="flex gap-3 mb-2">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400 pointer-events-none" />
            <select
              value={selectedCliente?.ClienteID || ""}
              onChange={e => {
                const cli = clientes.find(c => c.ClienteID === e.target.value) || null;
                setSelectedCliente(cli);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-pink-300 rounded-xl bg-white shadow-sm hover:border-pink-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all appearance-none cursor-pointer font-medium text-gray-700"
            >
              <option value="">🔍 Selecciona un cliente...</option>
              {clientes.map(c => (
                <option key={c.ClienteID} value={c.ClienteID}>
                  👤 {c.Nombre} {c.Apellido} — CI/NIT: {c.CINIT}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400 pointer-events-none" />
          </div>

          <button
            type="button"
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all font-semibold flex items-center gap-2"
            onClick={() => setShowNewClientForm(prev => !prev)}
          >
            <span className="text-lg">+</span> Nuevo
          </button>
        </div>

        {showNewClientForm && (
          <div className="mt-4 p-5 border-2 border-pink-300 rounded-xl bg-gradient-to-br from-white to-pink-50 shadow-inner">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">👤</span> Nuevo Cliente
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Ingresa el nombre"
                  value={newClientName}
                  onChange={e => handleNewClientNameChange(e.target.value)}
                  className="border-2 border-gray-300 p-3 rounded-xl w-full focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  aria-label="Nombre cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Apellido</label>
                <input
                  type="text"
                  placeholder="Ingresa el apellido"
                  value={newClientApellido}
                  onChange={e => handleNewClientApellidoChange(e.target.value)}
                  className="border-2 border-gray-300 p-3 rounded-xl w-full focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  aria-label="Apellido cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CI/NIT</label>
                <input
                  type="text"
                  placeholder="Ingresa el CI o NIT"
                  value={newClientCINIT}
                  onChange={e => handleNewClientCINITChange(e.target.value)}
                  className="border-2 border-gray-300 p-3 rounded-xl w-full focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
                  aria-label="CINIT cliente"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={12}
                />
              </div>
              <button
                type="button"
                onClick={createNewClient}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 font-semibold shadow-md hover:shadow-lg transition-all w-full flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Guardar cliente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- Selección producto (MANTENIDO tal cual pediste) ---------------- */}
      <div className="mb-6 bg-gradient-to-br from-pink-50 to-rose-100 rounded-2xl shadow-lg p-6 border border-pink-200">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Carrito de Compras</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 mb-6">
          <div className="relative">
            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400 pointer-events-none" />
            <select
              value={selectedProduct?.ProductoID || ""}
              onChange={e => {
                const prod = productos.find(p => p.ProductoID === e.target.value) || null;
                setSelectedProduct(prod);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className="w-full pl-10 pr-10 py-3 border-2 border-pink-300 rounded-xl bg-white shadow-sm hover:border-pink-400 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all appearance-none cursor-pointer font-medium text-gray-700"
            >
              <option value="">🍩 Selecciona un producto...</option>
              {productos.map(p => (
                <option key={p.ProductoID} value={p.ProductoID}>
                  {p.Nombre} - 👛 Bs. {p.PrecioUnitario.toFixed(2)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pink-400 pointer-events-none" />
          </div>

          <div className="relative">
            <input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={e => {
                const val = parseInt(e.target.value || "1", 10);
                setQuantity(isNaN(val) ? 1 : Math.min(val, 100));
              }}
              className="w-full md:w-28 px-4 py-3 border-2 border-pink-300 rounded-xl text-center font-bold text-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all"
              placeholder="Cant."
            />
          </div>

          <button 
            onClick={addToCart} 
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" /> Agregar
          </button>
        </div>

        {cart.length > 0 && (
          <div className="mt-6 bg-white rounded-xl p-5 shadow-inner border-2 border-pink-200">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">🛒</span> Productos en el carrito
            </h3>
            <ul className="divide-y divide-pink-100 mb-4">
              {cart.map((item, idx) => (
                <li key={idx} className="py-3 flex justify-between items-center hover:bg-pink-50 px-2 rounded transition-colors">
                  <span className="font-medium text-gray-700">
                    <span className="text-pink-600 font-bold">{item.quantity}x</span> {item.Nombre}
                  </span>
                  <span className="font-bold text-green-600">{formatPrice(item.quantity * item.PrecioUnitario)}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3 pt-3 border-t-2 border-pink-200">
              <button 
                onClick={checkout} 
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 shadow-md hover:shadow-lg transition-all font-bold flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Finalizar compra
              </button>
              <button 
                onClick={() => { setCart([]); setErrorMsg(""); setSuccessMsg(""); }} 
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all border-2 border-gray-300"
              >
                Vaciar
              </button>
            </div>
          </div>
        )}

        {lastCheckout && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <CheckCircle className="w-5 h-5" /> Compra realizada:
            </div>
            <ul className="divide-y divide-green-200">
              {lastCheckout.map((item, idx) => (
                <li key={idx} className="py-1 flex justify-between">
                  <span>{item.Nombre} x{item.quantity}</span>
                  <span>{formatPrice(item.quantity * item.PrecioUnitario)}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-green-600 font-medium mt-1">
              Total: {formatPrice(lastCheckout.reduce((acc, i) => acc + i.quantity * i.PrecioUnitario, 0))}
            </p>
          </div>
        )}
      </div>

      {/* ---------------- Lista "Ventas registradas" con estilo del manager ---------------- */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Ventas registradas</h2>
            <p className="text-gray-600 mt-1">Historial de ventas realizadas (filtrado por tu sesión)</p>
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por ID, cliente, fecha o total..."
                className="pl-10 pr-4 py-2 border rounded-xl outline-none w-64"
              />
            </div>
            <button
              onClick={() => fetchOrders(EmpleadoID)}
              className={`px-4 py-2 rounded-xl font-semibold transition ${workMode ? 'bg-gray-600 text-white' : 'bg-amber-500 text-white'}`}
              title="Refrescar"
            >
              <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" /> Refrescar
            </button>
          </div>
        </div>

        {loadingList ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          </div>
        ) : listError ? (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
            <Package className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{listError}</p>
          </div>
        ) : filteredVentas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 text-lg">No se encontraron ventas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVentas.map((venta: any) => (
              <div key={venta.VentaID} className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 ${workMode ? 'border-gray-600' : 'border-pink-400'}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${workMode ? 'bg-gray-600' : 'bg-gradient-to-br from-pink-100 to-pink-300'}`}>
                        <span className="text-white text-2xl">🛒</span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{venta.VentaID}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            {venta.CantidadProductos ?? (venta.detalles ? venta.detalles.length : '-')} {((venta.CantidadProductos ?? (venta.detalles ? venta.detalles.length : 0)) === 1) ? 'producto' : 'productos'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> Fecha</p>
                            <p className="font-semibold text-gray-800">{formatDate(venta.FechaVenta)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center gap-1"><User className="w-4 h-4" /> Cliente</p>
                            <p className="font-semibold text-gray-800">{venta.ClienteNombre ?? venta.ClienteID}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center gap-1"><User className="w-4 h-4" /> Empleado</p>
                            <p className="font-semibold text-gray-800">{venta.EmpleadoNombre ?? venta.EmpleadoID}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 flex items-center gap-1"><DollarSign className="w-4 h-4" /> Total</p>
                            <p className="font-bold text-green-600 text-lg">{formatPrice(Number(venta.Total || 0))}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleExpand(venta.VentaID)}
                        className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all"
                        title="Ver detalles"
                      >
                        {expandedVenta === venta.VentaID ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>

          
                    </div>
                  </div>
                </div>

                {expandedVenta === venta.VentaID && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {loadingDetalle ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
                      </div>
                    ) : detallesVenta ? (
                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-800 text-lg mb-4">Detalles de la Venta</h4>

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
                              {detallesVenta.Detalles && detallesVenta.Detalles.map((detalle: any, index: number) => (
                                <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                                  <td className="px-4 py-3">
                                    <p className="font-semibold text-gray-800">{detalle.ProductoNombre}</p>
                                    {detalle.ProductoDescripcion && <p className="text-sm text-gray-500">{detalle.ProductoDescripcion}</p>}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{detalle.CategoriaNombre}</span>
                                  </td>
                                  <td className="px-4 py-3 text-center font-semibold">{detalle.Cantidad}</td>
                                  <td className="px-4 py-3 text-right text-gray-700">{formatPrice(Number(detalle.PrecioUnitario || 0))}</td>
                                  <td className="px-4 py-3 text-right font-bold text-green-600">{formatPrice(Number(detalle.Subtotal || 0))}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-100">
                              <tr>
                                <td colSpan={4} className="px-4 py-3 text-right font-bold text-gray-800">Descuento:</td>
                                <td className="px-4 py-3 text-right font-bold text-red-600">-{formatPrice(Number(detallesVenta.Descuento || 0))}</td>
                              </tr>
                              <tr className="bg-green-100">
                                <td colSpan={4} className="px-4 py-4 text-right font-bold text-gray-800 text-lg">TOTAL:</td>
                                <td className="px-4 py-4 text-right font-bold text-green-700 text-xl">{formatPrice(Number(detallesVenta.Total || 0))}</td>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
