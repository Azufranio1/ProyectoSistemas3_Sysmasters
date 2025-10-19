// src/pages/manager/Ventas.tsx
import React, { useEffect, useState } from "react";
import { ShoppingBag, DollarSign, CheckCircle } from "lucide-react";
import { productoService, type Producto } from '../../services/Prod-DetVenta';
import { ventaService } from '../../services/ventaService';
import { clienteService, type Cliente } from '../../services/Cliente-Auth';

interface CartItem {
  ProductoID: string;
  Nombre: string;
  quantity: number;
  PrecioUnitario: number;
}

export default function Ventas(): React.ReactElement {
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

  const [EmpleadoID, setEmpleadoID] = useState<string>('EMP-001'); // empleado simulado

  // ---------------- Cargar datos ----------------
  const loadProductos = async () => {
    setLoading(true);
    try {
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

  const fetchOrders = async () => {
    try {
      const res = await ventaService.getAll(true);
      if (res.success) setOrders(res.ventas || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadProductos();
    loadClientes();
    fetchOrders();
  }, []);

  // ---------------- Funciones ----------------
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

    if (!EmpleadoID) {
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
      const Detalles = cart.map(i => ({
        ProductoID: i.ProductoID,
        Cantidad: i.quantity,
        PrecioUnitario: i.PrecioUnitario
      }));

     const payload = {
      EmpleadoID,
      ClienteID: selectedCliente!.ClienteID,
      Descuento: 0,
      items: cart.map(i => ({
        ProductoID: i.ProductoID,
        Cantidad: i.quantity,
        PrecioUnitario: i.PrecioUnitario
      }))
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

      // refrescar ventas
      const ventasRes = await ventaService.getAll(true);
      if (ventasRes.success) setOrders(ventasRes.ventas || []);
    } catch (err: any) {
      console.error("Error al llamar a createSale:", err);
      setErrorMsg(err.message || "Ocurrió un error al procesar la compra.");
    }
  };

  const createNewClient = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!newClientName || !newClientApellido || !newClientCINIT) {
      setErrorMsg("Completa todos los campos del nuevo cliente.");
      return;
    }

    try {
      const payload = {
        Nombre: newClientName,
        Apellido: newClientApellido,
        CINIT: newClientCINIT
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

  const formatMoney = (n: number) => `Bs. ${Number(n).toFixed(2)}`;

  // ---------------- Render ----------------
  return (
    <div className="min-h-[80vh] px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Ventas — <span className="text-pink-600">SugarDonuts</span></h1>

      {/* Mensajes */}
      {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">{errorMsg}</div>}
      {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded border border-green-300">{successMsg}</div>}

      {/* Selección cliente */}
      <div className="mb-4 bg-white rounded-2xl shadow-md p-4">
        <label className="block font-medium text-gray-700 mb-1">Cliente:</label>
        <div className="flex gap-2 mb-2">
          <select
            value={selectedCliente?.ClienteID || ""}
            onChange={e => {
              const cli = clientes.find(c => c.ClienteID === e.target.value) || null;
              setSelectedCliente(cli);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="border p-2 rounded flex-1"
          >
            <option value="">Selecciona un cliente</option>
            {clientes.map(c => (
              <option key={c.ClienteID} value={c.ClienteID}>
                {c.Nombre} {c.Apellido} — {c.CINIT}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="bg-blue-500 text-white px-3 rounded hover:bg-blue-600"
            onClick={() => setShowNewClientForm(prev => !prev)}
          >
            Nuevo
          </button>
        </div>

        {showNewClientForm && (
          <div className="mt-2 p-3 border border-gray-300 rounded bg-gray-50">
            <input type="text" placeholder="Nombre" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="border p-2 rounded w-full mb-2" />
            <input type="text" placeholder="Apellido" value={newClientApellido} onChange={e => setNewClientApellido(e.target.value)} className="border p-2 rounded w-full mb-2" />
            <input type="text" placeholder="CINIT" value={newClientCINIT} onChange={e => setNewClientCINIT(e.target.value)} className="border p-2 rounded w-full mb-2" />
            <button type="button" onClick={createNewClient} className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600">Guardar cliente</button>
          </div>
        )}
      </div>

      {/* Selección producto */}
      <div className="mb-6 bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-pink-500" /> Carrito
        </h2>

        <div className="flex gap-3 flex-wrap">
          <select
            value={selectedProduct?.ProductoID || ""}
            onChange={e => {
              const prod = productos.find(p => p.ProductoID === e.target.value) || null;
              setSelectedProduct(prod);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className="border p-2 rounded flex-1"
          >
            <option value="">Selecciona un producto</option>
            {productos.map(p => (
              <option key={p.ProductoID} value={p.ProductoID}>
                {p.Nombre} - Bs. {p.PrecioUnitario.toFixed(2)}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            max={100}
            value={quantity}
            onChange={e => {
              const val = parseInt(e.target.value || "1", 10);
              setQuantity(isNaN(val) ? 1 : Math.min(val, 100));
            }}
            className="border p-2 rounded w-24"
          />

          <button onClick={addToCart} className="bg-pink-500 text-white px-4 rounded hover:bg-pink-600">Agregar</button>
        </div>

        {cart.length > 0 && (
          <div className="mt-4">
            <ul className="divide-y divide-gray-200 mb-3">
              {cart.map((item, idx) => (
                <li key={idx} className="py-2 flex justify-between">
                  <span>{item.Nombre} x{item.quantity}</span>
                  <span>{formatMoney(item.quantity * item.PrecioUnitario)}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <button onClick={checkout} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Finalizar compra</button>
              <button onClick={() => { setCart([]); setErrorMsg(""); setSuccessMsg(""); }} className="bg-gray-100 px-4 py-2 rounded hover:bg-gray-200">Vaciar carrito</button>
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
                  <span>{formatMoney(item.quantity * item.PrecioUnitario)}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-green-600 font-medium mt-1">
              Total: {formatMoney(lastCheckout.reduce((acc, i) => acc + i.quantity * i.PrecioUnitario, 0))}
            </p>
          </div>
        )}
      </div>

      {/* Órdenes existentes */}
      <div className="grid gap-4">
        <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-pink-500" /> Ventas registradas
        </h2>

        {orders.length === 0 ? (
          <p>No hay ventas registradas</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {orders.map((o, idx) => (
              <li key={idx} className="py-2 flex justify-between items-center">
                <div>
                  <div className="font-medium">{o.VentaID} — Empleado: {o.EmpleadoID} — Cliente: {o.ClienteID}</div>
                  <div className="text-sm text-gray-500">{o.FechaVenta} — Total: Bs. {Number(o.Total).toFixed(2)}</div>
                  {o.detalles && o.detalles.length > 0 && (
                    <div className="text-sm mt-1">
                      <strong>Detalles:</strong> {o.detalles.map((d: any) => `${d.ProductoID} x${d.Cantidad} (${d.Subtotal}Bs)`).join(', ')}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
