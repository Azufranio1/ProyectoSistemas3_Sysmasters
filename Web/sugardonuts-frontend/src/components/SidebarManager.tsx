// src/components/SidebarManager.tsx
import React from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { authService } from "../services/api";
import logo from "../Resources/imgs/SugarDonutsTD.png";

const SidebarManager: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/log-in');
  };

  return (
    <aside className="w-64 bg-white shadow-lg min-h-screen flex flex-col justify-between">
      <div className="p-6 flex flex-col items-center">
        <Link to="/" className="group">
            <img 
              src={logo} 
              alt="SugarDonuts Logo" 
              className="max-h-12 md:max-h-16 max-w-32 md:max-w-40 object-contain group-hover:scale-105 transition-transform"
            />
          </Link>
      </div>

      <nav className="flex-1">
        <ul className="flex flex-col gap-2 p-4">
          <li>
            <NavLink to="/manager/home" className={({ isActive }) => isActive ? "font-bold text-pink-600" : "text-gray-700"}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/manager/ventas" className={({ isActive }) => isActive ? "font-bold text-pink-600" : "text-gray-700"}>
              Ventas
            </NavLink>
          </li>
          <li>
            <NavLink to="/manager/reservas" className={({ isActive }) => isActive ? "font-bold text-pink-600" : "text-gray-700"}>
              Reservas
            </NavLink>
          </li>
          <li>
            <NavLink to="/manager/productos" className={({ isActive }) => isActive ? "font-bold text-pink-600" : "text-gray-700"}>
              Gestión de Productos
            </NavLink>
          </li>
          <li>
            <NavLink to="/manager/empleado" className={({ isActive }) => isActive ? "font-bold text-pink-600" : "text-gray-700"}>
              Gestión de Empleados
            </NavLink>
          </li>
          <li>
            <NavLink to="/manager/sucursal" className={({ isActive }) => isActive ? "font-bold text-pink-600" : "text-gray-700"}>
              Gestión de Sucursal
            </NavLink>
          </li>
          <li>
            <NavLink to="/manager/reportes" className={({ isActive }) => isActive ? "font-bold text-pink-600" : "text-gray-700"}>
              Reportes
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleLogout} 
          className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default SidebarManager;
