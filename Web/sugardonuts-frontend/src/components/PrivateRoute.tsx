import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';
import { authService, type Empleado } from '../services/Emp-Auth';

interface PrivateRouteProps {
  children: JSX.Element;
  allowedRoles: string[]; // ['MGR', 'EMP', 'CLI']
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const empleado: Empleado | null = authService.getCurrentEmpleado();

  if (!empleado || !authService.isAuthenticated()) {
    // No hay sesión activa
    return <Navigate to="/log-in" replace />;
  }

  const prefix = empleado.EmpleadoID.split('-')[0];
  if (!allowedRoles.includes(prefix)) {
    // Rol no autorizado
    return <Navigate to="/log-in" replace />;
  }

  return children;
};

export default PrivateRoute;
