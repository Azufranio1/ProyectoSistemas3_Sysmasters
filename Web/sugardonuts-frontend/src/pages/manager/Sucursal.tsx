import React, { useEffect, useState } from "react";
import { sucursalService } from '../../services/sucursalService';

interface ProductoData {
  Nombre: string;
  CantidadVendida: number;
}

interface SucursalData {
  SucursalID: string;
  HoraApertura: string;
  HoraCierre: string;
  Departamento: string;
  Zona: string;
  totalVentas: number;
  productos: ProductoData[];
}

export default function Sucursal() {
  const [sucursales, setSucursales] = useState<SucursalData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSucursales = async () => {
    setLoading(true);
    try {
      const res = await sucursalService.getAll();
      if (res.success) setSucursales(res.sucursales);
      else console.error(res.error);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, []);

  return (
    <div className="min-h-[80vh] px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Gestión de Sucursales — <span className="text-pink-600">SugarDonuts</span>
      </h1>

      {loading ? (
        <p>Cargando sucursales...</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sucursales.map((s) => (
            <div key={s.SucursalID} className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-pink-400 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-800">{s.SucursalID}</h3>
              <p className="text-gray-600">{s.Departamento} — {s.Zona}</p>
              <p className="text-gray-500 mt-2">Apertura: {s.HoraApertura}</p>
              <p className="text-gray-500">Cierre: {s.HoraCierre}</p>

              <p className="text-gray-700 mt-3 font-semibold">Ventas totales: Bs {s.totalVentas}</p>

              {s.productos.length > 0 && (
                <>
                  <p className="text-gray-700 mt-2 font-semibold">Productos más vendidos:</p>
                  <ul className="list-disc list-inside text-gray-500">
                    {s.productos.map(p => (
                      <li key={p.Nombre}>{p.Nombre} ({p.CantidadVendida})</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
