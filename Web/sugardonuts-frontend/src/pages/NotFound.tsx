import { Home, ArrowLeft } from 'lucide-react';
import { Link } from "react-router-dom";
import logo from "../Resources/imgs/SugarDonutsTD.png";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 via-pink-300 to-amber-300 p-4 relative overflow-hidden">
      {/* Donas flotantes de fondo */}
      <div className="absolute top-10 left-10 text-7xl opacity-20 animate-spin-slow">🍩</div>
      <div className="absolute top-20 right-20 text-6xl opacity-20 animate-bounce">🍩</div>
      <div className="absolute bottom-20 left-20 text-8xl opacity-20 animate-pulse">🍩</div>
      <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-spin-slow">🍩</div>
      <div className="absolute top-1/2 left-1/4 text-4xl opacity-10 animate-bounce" style={{animationDelay: '0.5s'}}>🍩</div>
      <div className="absolute top-1/3 right-1/3 text-6xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}>🍩</div>

      {/* Contenido principal */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-12 text-center border-4 border-pink-200">
          {/* Dona gigante animada */}
          <div className="mb-6 animate-bounce">
            <div className="flex justify-center mb-6">
          <Link to="/">
            <img 
              src={logo} 
              alt="SugarDonuts Logo" 
              className="max-h-40 max-w-60 object-contain hover:scale-105 transition"
            />
          </Link>
        </div>
          </div>

          {/* Título 404 */}
          <h1 className="text-8xl md:text-9xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-pink-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
              404
            </span>
          </h1>

          {/* Mensaje principal */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            ¡Oops! Página no encontrada
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 mb-2">
            Parece que esta dona se cayó del mostrador... 😅
          </p>
          
          <p className="text-base md:text-lg text-gray-500 mb-8">
            La página que buscas no existe o fue movida a otra ubicación.
          </p>

          {/* Mensaje gracioso alternativo */}
          <div className="bg-pink-50 border-2 border-pink-200 rounded-2xl p-6 mb-8">
            <p className="text-gray-700 font-medium">
              💡 <span className="font-bold">Consejo:</span> Mientras decides qué hacer, 
              ¿qué tal si te imaginas el sabor de una deliciosa dona glaseada? 🤤
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              <Home className="w-6 h-6" />
              Volver al inicio
            </a>
            
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center gap-2 bg-white border-3 border-pink-500 text-pink-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-pink-50 transform hover:scale-105 transition-all shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-6 h-6" />
              Página anterior
            </button>
          </div>

          {/* Links adicionales */}
          <div className="mt-8 pt-8 border-t-2 border-gray-200">
            <p className="text-sm text-gray-500 mb-4">También podrías intentar:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="/#why" className="text-pink-600 hover:text-pink-700 font-semibold hover:underline">
                Por qué elegirnos
              </a>
              <span className="text-gray-400">•</span>
              <a href="/#about" className="text-pink-600 hover:text-pink-700 font-semibold hover:underline">
                Nosotros
              </a>
              <span className="text-gray-400">•</span>
              <a href="/#locations" className="text-pink-600 hover:text-pink-700 font-semibold hover:underline">
                Ubicaciones
              </a>
            </div>
          </div>
        </div>

        {/* Mensaje extra gracioso */}
        <p className="text-center text-white text-sm mt-6 drop-shadow-lg">
          Error 404: Dona no encontrada en el sistema 🍩❌
        </p>
      </div>

      {/* Estilos personalizados para animaciones */}
      <style>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}