import React, { useEffect, useState } from "react";
import { sucursalService } from '../../services/sucursalService';
import { Loader2 } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';


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
  const { workMode } = useOutletContext<{ workMode: boolean }>();

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
        Gestión de Sucursales
      </h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className={`w-8 h-8 animate-spin ${workMode ? 'text-gray-600' : 'text-pink-500'}`} />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {sucursales.map((s) => (
            <div key={s.SucursalID} className={`bg-white rounded-2xl shadow-md p-5 border-t-4 ${
                workMode ? 'border-gray-600' : 'border-pink-400'} hover:shadow-lg transition-shadow`}>
              <h3 className="text-xl font-bold text-gray-800">{s.Departamento} — {s.Zona}</h3>
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
