const API_URL = 'http://localhost/sugardonuts-api';

export interface Producto {
  ProductoID: string;
  Nombre: string;
  Descripcion?: string;
  Precio: number;
  CategoriaID: string;
  CategoriaNombre?: string;
  Habilitado?: boolean;
}

export interface DetalleVenta {
  VentaID: string;
  ProductoID: string;
  Cantidad: number;
  Subtotal: number;
}

export const productoService = {
  getAll: async (): Promise<Producto[]> => {
    const response = await fetch(`${API_URL}/productos.php`);
    return response.json();
  },

  getById: async (productoID: string): Promise<Producto | null> => {
    const response = await fetch(`${API_URL}/productos.php?id=${encodeURIComponent(productoID)}`);
    const productos = await response.json();
    return productos.length > 0 ? productos[0] : null;
  },

  create: async (producto: Required<Producto>) => {
    const response = await fetch(`${API_URL}/productos.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', ...producto })
    });
    return response.json();
  },

  update: async (productoID: string, producto: Partial<Producto>) => {
    const response = await fetch(`${API_URL}/productos.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', ProductoID: productoID, ...producto })
    });
    return response.json();
  },

  delete: async (productoID: string) => {
    const response = await fetch(`${API_URL}/productos.php`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', ProductoID: productoID })
    });
    return response.json();
  },

  recover: async (productoID: string) => {
    const response = await fetch(`${API_URL}/productos.php`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'recover', ProductoID: productoID })
    });
    return response.json();
  }
};

export const detalleVentaService = {
  add: async (detalle: DetalleVenta): Promise<{ success: boolean; message?: string }> => {
    const response = await fetch(`${API_URL}/detalles_venta.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', ...detalle })
    });
    return response.json();
  },
};