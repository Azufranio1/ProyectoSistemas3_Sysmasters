// src/pages/ManagerDashboard.tsx
import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/HeaderEmp";
import SidebarEmployee from "../components/SidebarEmployee";
import { authService, type Empleado } from "../services/Emp-Auth";

const EmployeeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState<Empleado | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/log-in');
      return;
    }
    const currentEmpleado = authService.getCurrentEmpleado();
    if (!currentEmpleado || !currentEmpleado.EmpleadoID.startsWith("EMP-")) {
      navigate('/log-in');
      return;
    }
    setEmpleado(currentEmpleado);
  }, [navigate]);

  if (!empleado) return null;

  return (
    <div className="flex min-h-screen">
      <SidebarEmployee />
      <div className="flex-1 flex flex-col">
        <Header nombreCompleto={empleado.NombreCompleto} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
