const API_URL = 'http://localhost/sugardonuts-api';

export interface Cliente {
  ClienteID: string;
  Nombre: string;
  Apellido: string;
  CINIT: number;
  Habilitado: boolean;
}

export const clienteService = {
  getAll: async () => {
    const response = await fetch(`${API_URL}/clientes.php`);
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/clientes.php?id=${id}`);
    return response.json();
  },

  create: async (cliente: Partial<Cliente>) => {
    const response = await fetch(`${API_URL}/clientes.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cliente)
    });
    return response.json();
  }
};