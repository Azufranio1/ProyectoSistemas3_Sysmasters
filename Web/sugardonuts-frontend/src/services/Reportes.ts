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