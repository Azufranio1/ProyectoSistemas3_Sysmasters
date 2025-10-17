const API_URL = 'http://localhost/SugarDonuts-API';

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

export const clienteService = {
    // Obtener todos los clientes
    getAll: async (): Promise<{ success: boolean; clientes?: Cliente[]; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/clientes.php`);
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err);
            return { success: false, error: "Error de conexión al obtener clientes" };
        }
    },

    // Obtener un cliente por ID
    getById: async (clienteID: string): Promise<Cliente | null> => {
        try {
            const response = await fetch(`${API_URL}/clientes.php?id=${encodeURIComponent(clienteID)}`);
            const data = await response.json();
            if (data.success && data.clientes && data.clientes.length > 0) {
                return data.clientes[0];
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    },

    // Crear un nuevo cliente
    create: async (cliente: Required<Cliente>): Promise<{ success: boolean; cliente?: Cliente; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/clientes.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'create', ...cliente })
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err);
            return { success: false, error: "Error de conexión al registrar cliente" };
        }
    },

    // Actualizar un cliente existente
    update: async (clienteID: string, cliente: Partial<Cliente>): Promise<{ success: boolean; cliente?: Cliente; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/clientes.php`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update', ClienteID: clienteID, ...cliente })
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err);
            return { success: false, error: "Error de conexión al actualizar cliente" };
        }
    },

    // Eliminar un cliente
    delete: async (clienteID: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/clientes.php`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete', ClienteID: clienteID })
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err);
            return { success: false, error: "Error de conexión al eliminar cliente" };
        }
    },

    // Recuperar un cliente eliminado
    recover: async (clienteID: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const response = await fetch(`${API_URL}/clientes.php`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'recover', ClienteID: clienteID })
            });
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err);
            return { success: false, error: "Error de conexión al recuperar cliente" };
        }
    }
};
