const API_URL = 'http://localhost/sugardonuts-api';

export interface Venta {
  VentaID: string;
  EmpleadoNombre: string;
  ClienteNombre: string;
  FechaVenta: string;
  Descuento: number;
  Total: number;
  Archivada: boolean;
  CantidadProductos: number;
}

export interface VentaDetalle extends Venta {
  EmpleadoID: string;
  ClienteID: string;
  ClienteCI: string;
  Detalles: DetalleVenta[];
}

export interface DetalleVenta {
  ProductoID: string;
  ProductoNombre: string;
  ProductoDescripcion?: string;
  PrecioUnitario: number;
  Cantidad: number;
  Subtotal: number;
  CategoriaNombre: string;
}

export const ventaService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/ventas.php`);
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/ventas.php?id=${id}`);
    return response.json();
  },

  getArchivadas: async () => {
    const response = await fetch(`${API_URL}/ventas.php?archivadas=true`);
    return response.json();
  },

  create: async (venta: any) => {
    const response = await fetch(`${API_URL}/ventas.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(venta)
    });
    return response.json();
  },

  toggleArchivada: async (ventaID: string, archivar: boolean) => {
    const response = await fetch(`${API_URL}/ventas.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        VentaID: ventaID, 
        Archivada: archivar ? 1 : 0 
      })
    });
    return response.json();
  }
};