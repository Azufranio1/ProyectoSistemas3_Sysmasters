const API_URL = 'http://localhost/sugardonuts-api';

export interface Producto {
  ProductoID: string;
  Nombre: string;
  Descripcion?: string;
  PrecioUnitario: number;
  CategoriaID: string;
  CategoriaNombre?: string;
  Habilitado?: boolean;
}

export const productoService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/productos.php`);
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/productos.php?id=${id}`);
    return response.json();
  },

  create: async (producto: Partial<Producto>) => {
    const response = await fetch(`${API_URL}/productos.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(producto)
    });
    return response.json();
  },

  update: async (productoID: string, data: Partial<Producto>) => {
    const response = await fetch(`${API_URL}/productos.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ProductoID: productoID, ...data })
    });
    return response.json();
  },

  toggleHabilitado: async (productoID: string, nuevoEstado: boolean) => {
    const response = await fetch(`${API_URL}/productos.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ProductoID: productoID, 
        cambiarHabilitado: nuevoEstado ? 1 : 0 
      })
    });
    return response.json();
  },

  delete: async (productoID: string) => {
    const response = await fetch(`${API_URL}/productos.php`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ProductoID: productoID })
    });
    return response.json();
  }
};