// src/services/sucursalService.ts
const API_URL = 'http://localhost/sugardonuts-api'; // ajusta según tu entorno

export const sucursalService = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/sucursales.php`);
    return res.json();
  }
};
