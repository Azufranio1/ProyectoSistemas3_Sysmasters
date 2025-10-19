import { Bell, Search, Settings, Moon, Sun, Calendar, Clock } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  nombreCompleto: string;
}

const Header = ({ nombreCompleto }: HeaderProps) => {
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
    <header className="h-20 bg-white shadow-md border-b-4 border-pink-200 sticky top-0 z-40">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Lado izquierdo - Saludo y fecha */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">
            Bienvenido, <span className="bg-gradient-to-r from-pink-600 to-amber-600 bg-clip-text text-transparent">
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

        {/* Lado derecho - Acciones */}
        <div className="flex items-center gap-3">
          {/* Separador */}
          <div className="w-px h-8 bg-gray-300 mx-2"></div>

          {/* Avatar/Perfil */}
          <button className="flex items-center gap-3 px-3 py-2 hover:bg-pink-50 rounded-full transition-all group">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-amber-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-sm">
                {nombreCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="text-left hidden xl:block">
              <p className="text-sm font-semibold text-gray-700">{nombreCompleto}</p>
              <p className="text-xs text-gray-500">Empleado</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;