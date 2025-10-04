import { Search, Settings, Palette, Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  nombreCompleto: string;
  workMode: boolean;
  setWorkMode: (mode: boolean) => void;
}

const Header = ({ nombreCompleto, workMode, setWorkMode }: HeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
          </div>
        </div>

        {/* Lado derecho */}
        <div className="flex items-center gap-3">
          {/* Buscador */}
          <div className="relative">
            {searchOpen ? (
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-transparent outline-none text-gray-700 w-48"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-3 hover:bg-white/50 rounded-full transition-colors"
                title="Buscar"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>
            )}
          </div>

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

          {/* Configuración */}
          <button 
            className="p-3 hover:bg-white/50 rounded-full transition-colors"
            title="Configuración"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

          {/* Separador */}
          <div className="w-px h-8 bg-gray-300 mx-2"></div>

          {/* Avatar/Perfil */}
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-white/50 rounded-full transition-all group">
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
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;