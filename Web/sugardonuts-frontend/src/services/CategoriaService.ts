const API_URL = 'http://localhost/sugardonuts-api'; // Ajusta según tu ruta

export const categoriaService = {
  /**
   * Obtiene todas las categorías
   */
  getAll: async () => {
    try {
      const res = await fetch(`${API_URL}/vendiendo.php`);
      const data = await res.json();
      // Normalizamos la respuesta para que siempre tenga success y data
      return {
        success: data.success ?? false,
        data: data.categorias ?? [],
        error: data.error ?? null
      };
    } catch (err) {
      console.error('Error cargando categorías', err);
      return { success: false, data: [], error: 'Error de conexión' };
    }
  }
};
