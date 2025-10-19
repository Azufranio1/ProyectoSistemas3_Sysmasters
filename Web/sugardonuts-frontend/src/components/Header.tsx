import { Search, Palette, Calendar, LocateFixedIcon, ChevronDown, Home, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/Emp-Auth";

interface HeaderProps {
  nombreCompleto: string;
  nombreSucursal: string;
  workMode: boolean;
  setWorkMode: (mode: boolean) => void;
}

const Header = ({ nombreCompleto, nombreSucursal, workMode, setWorkMode }: HeaderProps) => {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      authService.logout();
      navigate('/log-in');
    }
  };

  const handleGoToIndex = () => {
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className={`h-20 shadow-md border-b-4 sticky top-0 z-40 transition-colors duration-300 ${
      workMode 
        ? 'bg-white border-gray-300' 
        : 'bg-gradient-to-r from-pink-50 to-amber-50 border-pink-300'
    }`}>
      <div className="h-full px-6 flex items-center justify-between">
        {/* Lado izquierdo */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">
            Bienvenido, <span className={`${
              workMode 
                ? 'text-gray-700' 
                : 'bg-gradient-to-r from-pink-600 to-amber-600 bg-clip-text text-transparent'
            }`}>
              {nombreCompleto}
            </span>
          </h1>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="capitalize">{formatDate(currentTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <LocateFixedIcon className="w-4 h-4" />
              <span className="capitalize">{nombreSucursal}</span>
            </div>
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center gap-3">
          {/* Toggle Modo Pastelería/Trabajo */}
          <div className="relative group">
            <button
              onClick={() => setWorkMode(!workMode)}
              className={`p-3 rounded-full transition-all ${
                workMode 
                  ? 'bg-gray-200 hover:bg-gray-300' 
                  : 'bg-gradient-to-r from-pink-200 to-amber-200 hover:from-pink-300 hover:to-amber-300'
              }`}
              title={workMode ? "Cambiar a Modo Pastelería" : "Cambiar a Modo Trabajo"}
            >
              <Palette className={`w-5 h-5 ${workMode ? 'text-gray-600' : 'text-pink-600'}`} />
            </button>
            
            {/* Tooltip */}
            <div className="absolute right-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {workMode ? "Modo Trabajo activo" : "Modo Pastelería activo"}
              <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
            </div>
          </div>

          {/* Separador */}
          <div className="w-px h-8 bg-gray-300 mx-2"></div>

          {/* Avatar/Perfil con menú desplegable */}
          <div className="relative user-menu-container">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-white/50 rounded-full transition-all group"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform ${
                workMode 
                  ? 'bg-gray-600' 
                  : 'bg-gradient-to-br from-pink-500 to-amber-500'
              }`}>
                <span className="text-white font-bold text-sm">
                  {nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-sm font-semibold text-gray-700">{nombreCompleto}</p>
                <p className="text-xs text-gray-500">Gerente</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border-2 border-pink-200 py-2 animate-in fade-in slide-in-from-top-2">
                {/* Info del usuario */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-bold text-gray-800 truncate">{nombreCompleto}</p>
                  <p className="text-sm text-gray-500">Gerente</p>
                </div>

                {/* Opciones del menú */}
                <div className="py-2">
                  <button
                    onClick={handleGoToIndex}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-colors text-left"
                  >
                    <Home className="w-5 h-5 text-pink-500" />
                    <span className="text-gray-700 font-medium">Volver al Inicio</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-5 h-5 text-red-500" />
                    <span className="text-gray-700 font-medium">Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;