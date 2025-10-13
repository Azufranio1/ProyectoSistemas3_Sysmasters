import { Routes, Route } from "react-router-dom";
import Index from "../pages/Index";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";

import PrivateRoute from '../components/PrivateRoute';

import ManagerDashboard from "../pages/ManagerDashboard";
import HomeM from "../pages/manager/Home";
import VentasM from "../pages/manager/Ventas";
import Reservas from "../pages/manager/Reservas";
import Productos from "../pages/manager/Productos";
import Empleados from "../pages/manager/Empleados";
import Sucursal from "../pages/manager/Sucursal";
import Reportes from "../pages/manager/Reportes";
import PapeleraEmpleados from "../pages/manager/PapeleraEmpleados";
import PapeleraProductos from "../pages/manager/PapeleraProductos";

import EmployeeDashboard from "../pages/EmployeeDashboard";
import HomeE from "../pages/employee/Home";
import VentasE from "../pages/employee/Ventas";


export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/log-in" element={<Login />} />
      <Route
          path="/manager"
          element={
            <PrivateRoute allowedRoles={['MGR']}>
              <ManagerDashboard />
            </PrivateRoute>
          }
        >
          <Route path="home" element={<HomeM />} />
          <Route path="ventas" element={<VentasM />} />
          <Route path="reservas" element={<Reservas />} />
          <Route path="productos" element={<Productos />} />
          <Route path="empleado" element={<Empleados />} />
          <Route path="sucursal" element={<Sucursal />} />
          <Route path="reportes" element={<Reportes />} />
          <Route path="papelera-empleados" element={<PapeleraEmpleados />} />
          <Route path="papelera-productos" element={<PapeleraProductos />} />
        </Route>

        <Route
          path="/employee"
          element={
            <PrivateRoute allowedRoles={['EMP']}>
              <EmployeeDashboard />
            </PrivateRoute>
          }
        >
          <Route path="home" element={<HomeE />} />
          <Route path="ventas" element={<VentasE />} />
        </Route>  
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}