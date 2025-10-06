import { NavLink, useNavigate, Link } from "react-router-dom";
import { 
  Home, 
  ShoppingCart,
  LogOut,
  ChevronRight 
} from "lucide-react";
import { authService, type Empleado } from "../services/api";
import logo from "../Resources/imgs/SugarDonutsTD.png";
import { useState, useEffect } from "react";

const SidebarEmployee = () => {
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState<Empleado | null>(null);

  useEffect(() => {
    const empleadoData = authService.getCurrentEmpleado();
    setEmpleado(empleadoData);
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate('/log-in');
  };

  const menuItems = [
    { to: "/employee/home", icon: Home, label: "Home" },
    { to: "/employee/ventas", icon: ShoppingCart, label: "Ventas" }];

  return (
    <aside className="w-64 bg-gradient-to-b from-white to-pink-50 shadow-2xl min-h-screen flex flex-col border-r-4 border-pink-200">
      {/* Logo */}
      <div className="p-6 border-b-2 border-pink-200">
        <Link to="/" className="group block">
          <img 
            src={logo} 
            alt="SugarDonuts Logo" 
            className="h-16 w-auto mx-auto object-contain group-hover:scale-110 transition-transform duration-300"
          />
        </Link>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg scale-105"
                      : "text-gray-700 hover:bg-pink-100 hover:scale-105"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 ${isActive ? "" : "group-hover:scale-110 transition-transform"}`} />
                    <span className="font-medium flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer con botón de cerrar sesión */}
      <div className="p-4 border-t-2 border-pink-200 bg-white">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <LogOut className="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

export default SidebarEmployee;