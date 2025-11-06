const API_URL = 'http://localhost/sugardonuts-api';

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