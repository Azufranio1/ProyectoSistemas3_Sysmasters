import React from "react";
import { TrendingUp, ClipboardList, Users2, DollarSign, ShoppingBag } from "lucide-react";

const Home: React.FC = () => {
  return (
    <div className="min-h-[80vh] px-6 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Panel general — <span className="text-pink-600">SugarDonuts</span>
        </h1>
      </div>

      {/* Tarjetas principales */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Ventas de hoy */}
        <div className={`bg-white rounded-2xl shadow-md p-5 border-t-4 'border-pink-400' hover:shadow-lg transition-shadow duration-300`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Ventas hoy</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">$1,250</h2>
            </div>
            <DollarSign className="w-10 h-10 text-pink-500" />
          </div>
          <p className="text-xs text-gray-400 mt-3">+12% respecto a ayer</p>
        </div>

        {/* Pedidos pendientes */}
        <div className={`bg-white rounded-2xl shadow-md p-5 border-t-4 border-amber-400 hover:shadow-lg transition-shadow duration-300`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Pedidos pendientes</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">7</h2>
            </div>
            <ClipboardList className="w-10 h-10 text-amber-500" />
          </div>
          <p className="text-xs text-gray-400 mt-3">3 en preparación</p>
        </div>

        {/* Clientes activos */}
                <div className={`bg-white rounded-2xl shadow-md p-5 border-t-4 border-rose-400 hover:shadow-lg transition-shadow duration-300`}>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Clientes activos</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">28</h2>
            </div>
            <Users2 className="w-10 h-10 text-rose-500" />
          </div>
          <p className="text-xs text-gray-400 mt-3">+4 nuevos esta semana</p>
        </div>

        {/* Ganancia mensual */}
                <div className={`bg-white rounded-2xl shadow-md p-5 border-t-4 border-green-400 hover:shadow-lg transition-shadow duration-300`}>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Ganancia mensual</p>
              <h2 className="text-2xl font-bold text-gray-800 mt-1">$12,560</h2>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
          <p className="text-xs text-gray-400 mt-3">En crecimiento</p>
        </div>
      </div>

      {/* Sección inferior con resumen gráfico simulado */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-pink-500" /> Actividad reciente
          </h3>
          <ul className="divide-y divide-gray-100">
            <li className="py-3 flex justify-between text-gray-600">
              <span>Pedido #1059 — Completado</span>
              <span className="text-green-600 font-semibold">+ $45</span>
            </li>
            <li className="py-3 flex justify-between text-gray-600">
              <span>Pedido #1061 — Cancelado</span>
              <span className="text-red-600 font-semibold">- $15</span>
            </li>
            <li className="py-3 flex justify-between text-gray-600">
              <span>Pedido #1062 — En preparación</span>
              <span className="text-amber-600 font-semibold">...$32</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-pink-100 to-amber-100 rounded-2xl shadow-inner p-6 flex flex-col justify-center items-center border border-pink-200">
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Dulce día para crecer 🍩
          </p>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Revisa las estadísticas de ventas, gestiona tus productos y mantén el ritmo del sabor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
