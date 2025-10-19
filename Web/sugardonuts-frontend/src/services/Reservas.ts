// src/services/Reservas.ts
const API_URL = 'http://localhost/sugardonuts-api';
export type EstadoReserva = 'Pendiente' | 'Confirmada' | 'Lista' | 'Entregada' | 'Cancelada';

export interface DetalleReserva {
  ProductoID: string;
  ProductoNombre?: string;
  CategoriaNombre?: string;
  PrecioUnitario?: number;
  Cantidad: number;
  Subtotal: number;
}

export interface Reserva {
  ReservaID: string;
  ClienteID: string;
  ClienteNombre?: string;
  EmpleadoID?: string;
  EmpleadoNombre?: string;
  FechaReserva: string;
  FechaRecogida: string;
  Estado: EstadoReserva;
  Total: number;
  Archivada: boolean;
  Detalles?: DetalleReserva[];
}

export interface CreateReservaData {
  ClienteID: string;
  EmpleadoID?: string;
  FechaRecogida: string;
  Detalles: Array<{
    ProductoID: string;
    Cantidad: number;
    Subtotal: number;
  }>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
  message?: string;
  ReservaID?: string;
}

class ReservaService {
  private baseUrl = `${API_URL}/reservas.php`;

  // Obtener todas las reservas
  async getAll(): Promise<ApiResponse<Reserva[]>> {
    try {
      const response = await fetch(this.baseUrl);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }

  // Obtener reservas por estado
  async getByEstado(estado: EstadoReserva): Promise<ApiResponse<Reserva[]>> {
    try {
      const response = await fetch(`${this.baseUrl}?estado=${estado}`);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }

  // Obtener reserva específica con detalles
  async getById(reservaID: string): Promise<ApiResponse<Reserva>> {
    try {
      const response = await fetch(`${this.baseUrl}?id=${reservaID}`);
      return await response.json();
    } catch (error) {
      console.error('Error al obtener reserva:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }

  // Crear nueva reserva
  async create(data: CreateReservaData): Promise<ApiResponse<Reserva>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Error al crear reserva:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }

  // Actualizar estado de reserva
  async updateEstado(
    reservaID: string, 
    estado: EstadoReserva, 
    empleadoID?: string
  ): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ReservaID: reservaID, Estado: estado, EmpleadoID: empleadoID })
      });
      return await response.json();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }


  // Cancelar reserva
  async cancel(reservaID: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ReservaID: reservaID })
      });
      return await response.json();
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      return { success: false, error: 'Error de conexión' };
    }
  }

  // Helper: Formatear fecha para display
  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-BO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Helper: Obtener color por estado
  getEstadoColor(estado: EstadoReserva): string {
    const colors = {
      'Pendiente': 'bg-yellow-100 text-yellow-700',
      'Confirmada': 'bg-blue-100 text-blue-700',
      'Lista': 'bg-green-100 text-green-700',
      'Entregada': 'bg-gray-100 text-gray-700',
      'Cancelada': 'bg-red-100 text-red-700'
    };
    return colors[estado] || 'bg-gray-100 text-gray-700';
  }

  // Helper: Obtener estados disponibles para transición
  getNextEstados(currentEstado: EstadoReserva): EstadoReserva[] {
    const transitions: Record<EstadoReserva, EstadoReserva[]> = {
      'Pendiente': ['Confirmada', 'Cancelada'],
      'Confirmada': ['Lista', 'Cancelada'],
      'Lista': ['Entregada', 'Cancelada'],
      'Entregada': [],
      'Cancelada': []
    };
    return transitions[currentEstado] || [];
  }
}

export const reservaService = new ReservaService();