import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import SidebarManager from "../components/SidebarManager";
import Header from "../components/Header";
import { authService, type Empleado } from "../services/api";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [workMode, setWorkMode] = useState(false);
  const [empleado, setEmpleado] = useState<Empleado | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem("workMode");
    if (savedMode !== null) {
      setWorkMode(JSON.parse(savedMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("workMode", JSON.stringify(workMode));
  }, [workMode]);

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
    <div className="flex min-h-screen">
      <SidebarManager workMode={workMode} />
      
      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col">
        <Header 
          nombreCompleto={empleado.NombreCompleto}
          nombreSucursal={empleado.NombreSucursal || "Sucursal Desconocida"}
          workMode={workMode}
          setWorkMode={setWorkMode}
        />
        <main
          className={`flex-1 p-6 overflow-auto transition-colors duration-300 ${
            workMode
              ? 'bg-gray-50'
              : 'bg-gradient-to-br from-pink-50 via-white to-amber-50'
          }`}
        >
          <Outlet context={{ workMode }} />
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
