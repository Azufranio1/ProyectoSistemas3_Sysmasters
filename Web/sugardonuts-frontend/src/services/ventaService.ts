const API_URL = 'http://localhost/sugardonuts-api'; // ajusta según tu ruta

export const ventaService = {
  getAll: async (withDetails = false, empleadoID?: string) => {
    const params = new URLSearchParams();
    if (withDetails) params.append('withDetails', '1');
    if (empleadoID) params.append('EmpleadoID', empleadoID);
    const url = `${API_URL}/vendiendo.php${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url);
    return res.json();
  },

  getById: async (ventaID: string, empleadoID?: string) => {
  const params = new URLSearchParams();
  params.append('id', ventaID);
  if (empleadoID) params.append('EmpleadoID', empleadoID);
  const url = `${API_URL}/vendiendo.php?${params.toString()}`;
  
  const res = await fetch(url);
  // opcional: revisar que la respuesta sea JSON
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Respuesta no es JSON:', text);
    throw err;
  }
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
