const API_URL = 'http://localhost/sugardonuts-api'; // ajusta ruta

export const ventaService = {
  getAll: async (withDetails = false) => {
    const res = await fetch(`${API_URL}/vendiendo.php${withDetails ? '?withDetails=1' : ''}`);
    return res.json();
  },

  createSale: async (payload: { EmpleadoID: string; ClienteID: string; Descuento?: number; items: Array<{ ProductoID: string; Cantidad: number; PrecioUnitario?: number }> }) => {
    const res = await fetch(`${API_URL}/vendiendo.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};
