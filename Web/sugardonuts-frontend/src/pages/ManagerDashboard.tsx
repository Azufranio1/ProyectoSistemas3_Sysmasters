// src/pages/ManagerDashboard.tsx
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SidebarManager from "../components/SidebarManager";
import HeaderManager from "../components/Header";
import { authService, type Empleado } from "../services/api";

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState<Empleado | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/log-in');
      return;
    }
    const currentEmpleado = authService.getCurrentEmpleado();
    if (!currentEmpleado || !currentEmpleado.EmpleadoID.startsWith("MGR-")) {
      navigate('/log-in');
      return;
    }
    setEmpleado(currentEmpleado);
  }, [navigate]);

  if (!empleado) return null;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarManager />
      
      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col">
        <HeaderManager nombreCompleto={empleado.NombreCompleto} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
