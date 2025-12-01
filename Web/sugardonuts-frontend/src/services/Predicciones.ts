const API_URL = 'http://localhost/sugardonuts-api';

export interface PrediccionParams {
  tipo: 'ventas' | 'productos';
}

export const prediccionService = {
  obtenerDatos: async (params: { tipo: string }) => {
    const response = await fetch(`${API_URL}/predicciones.php?tipo=${params.tipo}`);
    return response.json();
  }
};