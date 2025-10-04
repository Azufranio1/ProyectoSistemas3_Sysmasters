const API_URL = 'http://localhost/sugardonuts-api';

// Interfaces
export interface Empleado {
  EmpleadoID: string;
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
}

export interface AuthResponse {
  success: boolean;
  empleado?: Empleado;
  token?: string;
  error?: string;
  message?: string;
}

// Servicio de Autenticación
export const authService = {
  login: async (correo: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_URL}/auth.php`, {
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
  getByCorreo: async (correo: string) => {
    const response = await fetch(`${API_URL}/empleados.php?correo=${encodeURIComponent(correo)}`);
    return response.json();
  },

  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/empleados.php?id=${id}`);
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${API_URL}/empleados.php`);
    return response.json();
  }
};