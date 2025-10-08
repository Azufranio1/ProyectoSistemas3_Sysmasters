const API_URL = 'http://localhost/sugardonuts-api';

export interface Empleado {
  EmpleadoID: string;
  SucursalID?: string;
  Usuario: string;
  Correo: string;
  Nombre: string;
  Apellido: string;
  NombreCompleto: string;
  CI: number;
  FechaContrato?: string;
  FechaNacimiento?: string;
  Activo?: boolean;
  Habilitado?: boolean;
  NombreSucursal?: string;
}

export interface AuthResponse {
  success: boolean;
  empleado?: Empleado;
  token?: string;
  error?: string;
  message?: string;
}

export const authService = {
  login: async (correo: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth-emp.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', correo, password })
    });
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('empleado');
  },

  getCurrentEmpleado: (): Empleado | null => {
    const empleadoStr = localStorage.getItem('empleado');
    return empleadoStr ? JSON.parse(empleadoStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};

// Servicio de Empleados
export const empleadoService = {
  getAll: async (sucursalID?: string) => {
    const url = sucursalID 
      ? `${API_URL}/empleados.php?sucursal=${encodeURIComponent(sucursalID)}`
      : `${API_URL}/empleados.php`;
    const response = await fetch(url);
    return response.json();
  },

  getByCorreo: async (correo: string) => {
    const response = await fetch(`${API_URL}/empleados.php?correo=${encodeURIComponent(correo)}`);
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/empleados.php?id=${id}`);
    return response.json();
  },

  create: async (empleado: Partial<Empleado>) => {
    const response = await fetch(`${API_URL}/empleados.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empleado)
    });
    return response.json();
  },

  update: async (empleadoID: string, data: Partial<Empleado>) => {
    const response = await fetch(`${API_URL}/empleados.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ EmpleadoID: empleadoID, ...data })
    });
    return response.json();
  },

  toggleActivo: async (empleadoID: string, nuevoEstado: boolean) => {
    const response = await fetch(`${API_URL}/empleados.php`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        EmpleadoID: empleadoID, 
        cambiarActivo: nuevoEstado ? 1 : 0 
      })
    });
    return response.json();
  },

  delete: async (empleadoID: string) => {
    const response = await fetch(`${API_URL}/empleados.php`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ EmpleadoID: empleadoID })
    });
    return response.json();
  },

  recover: async (empleadoID: string) => {
    const response = await fetch(`${API_URL}/empleados.php`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ EmpleadoID: empleadoID })
    });
    return response.json();
  }
};