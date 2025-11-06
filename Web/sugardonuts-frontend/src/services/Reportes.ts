const API_URL = 'http://localhost/sugardonuts-api';

export interface ReporteParams {
  tipo: 'ventas' | 'productos' | 'clientes';
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string;    // YYYY-MM-DD
}

export const reporteService = {
  generar: async (params: ReporteParams) => {
    const { tipo, fechaInicio, fechaFin } = params;
    const url = `${API_URL}/reportes.php?tipo=${tipo}&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
    const response = await fetch(url);
    return response.json();
  }
};

export interface PrediccionParams {
  tipo: 'ventas' | 'productos';
}

export const prediccionService = {
  obtenerDatos: async (params: PrediccionParams) => {
    const { tipo } = params;
    const response = await fetch(`${API_URL}/predicciones.php?tipo=${tipo}`);
    return response.json();
  }
};