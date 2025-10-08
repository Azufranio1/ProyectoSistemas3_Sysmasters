const API_URL = 'http://localhost/sugardonuts-api';

export interface Cliente {
    ClienteID?: string;
    Nombre: string;
    Apellido: string;
    CINIT: string;
    Habilitado?: boolean;
}

export interface AuthResponse {
    success: boolean;
    cliente?: Cliente;
    token?: string;
    error?: string;
    message?: string;
}

export const authService = {
    login: async (cinit: string, password: string): Promise<AuthResponse> => {
        const response = await fetch(`${API_URL}/cliente-auth.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'login', cinit, password })
        });
        return response.json();
    }
};

export const clienteService = {
    getAll: async (): Promise<Cliente[]> => {
        const response = await fetch(`${API_URL}/clientes.php`);
        return response.json();
    },

    getById: async (clienteID: string): Promise<Cliente | null> => {
        const response = await fetch(`${API_URL}/clientes.php?id=${encodeURIComponent(clienteID)}`);
        const clientes = await response.json();
        return clientes.length > 0 ? clientes[0] : null;
    },

    create: async (cliente: Required<Cliente>) => {
        const response = await fetch(`${API_URL}/clientes.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'create', ...cliente })
        });
        return response.json();
    },

    update: async (clienteID: string, cliente: Partial<Cliente>) => {
        const response = await fetch(`${API_URL}/clientes.php`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', ClienteID: clienteID, ...cliente })
        });
        return response.json();
    },

    delete: async (clienteID: string) => {
        const response = await fetch(`${API_URL}/clientes.php`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', ClienteID: clienteID })
        });
        return response.json();
    },

    recover: async (clienteID: string) => {
        const response = await fetch(`${API_URL}/clientes.php`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'recover', ClienteID: clienteID })
        });
        return response.json();
    }
};