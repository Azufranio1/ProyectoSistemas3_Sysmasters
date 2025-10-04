import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Sprout, HeartHandshake, Award, MapPin, Phone, Mail, Instagram, Facebook, Clock, Users, TrendingUp, Sparkles, LayoutDashboard, Menu, X, LogOut } from 'lucide-react';
import logo from "../Resources/imgs/SugarDonutsTD.png";
import { authService, type Empleado } from '../services/api';

export default function Index() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Verificar si hay sesión activa
    if (authService.isAuthenticated()) {
      const empleadoData = authService.getCurrentEmpleado();
      setEmpleado(empleadoData);
    }
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    authService.logout();
    setEmpleado(null);
    setShowUserMenu(false);
    window.location.reload(); // Recargar para actualizar el estado
  };

  // Obtener iniciales del nombre
  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="font-sans">
      <section id="up"></section>

      {/* HEADER MEJORADO CON SESIÓN */}
      <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-lg z-50 border-b-4 border-pink-400">
        <nav className="flex justify-between items-center px-6 md:px-8 py-3 max-w-7xl mx-auto">
          <Link to="/" className="group">
            <img 
              src={logo} 
              alt="SugarDonuts Logo" 
              className="max-h-12 md:max-h-16 max-w-32 md:max-w-40 object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Menú Desktop */}
          <ul className="hidden lg:flex space-x-8 font-medium text-gray-700 items-center">
            <li><a href="#up" className="hover:text-pink-500 transition-colors">Inicio</a></li>
            <li><a href="#why" className="hover:text-pink-500 transition-colors">Por qué elegirnos</a></li>
            <li><a href="#about" className="hover:text-amber-600 transition-colors">Nosotros</a></li>
            <li><a href="#locations" className="hover:text-green-600 transition-colors">Ubicaciones</a></li>
            
            {/* Si NO hay sesión activa - Mostrar botón login */}
            {!empleado ? (
              <li>
                <Link 
                  to="/log-in" 
                  className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-2 rounded-full hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Iniciar sesión
                </Link>
              </li>
            ) : (
              /* Si hay sesión activa - Mostrar menú de usuario */
              <li className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 px-4 py-2 rounded-full hover:bg-pink-50 transition-all group"
                >
                  {/* Avatar con iniciales */}
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-amber-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-sm">
                      {getInitials(empleado.Nombre, empleado.Apellido)}
                    </span>
                  </div>
                  {/* Nombre de usuario */}
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-pink-600 transition-colors">
                      {empleado.Usuario}
                    </p>
                    <p className="text-xs text-gray-500">{empleado.Nombre}</p>
                  </div>
                </button>

                {/* Dropdown del usuario */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-pink-200 py-2 animate-in fade-in slide-in-from-top-2">
                    {/* Info del usuario */}
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-bold text-gray-800">{empleado.NombreCompleto}</p>
                      <p className="text-sm text-gray-500">{empleado.Correo}</p>
                      <p className="text-xs text-gray-400 mt-1">ID: {empleado.EmpleadoID}</p>
                    </div>

                    {/* Opciones del menú */}
                    <div className="py-2">
                      <Link
                        to="/log-in"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <LayoutDashboard className="w-5 h-5 text-pink-500" />
                        <span className="text-gray-700 font-medium">Dashboard</span>
                      </Link>

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
              </li>
            )}
          </ul>

          {/* Botón Hamburguesa */}
          <button 
            onClick={toggleMenu}
            className="lg:hidden z-50 p-2 rounded-lg hover:bg-pink-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-7 h-7 text-pink-600" />
            ) : (
              <Menu className="w-7 h-7 text-pink-600" />
            )}
          </button>

          {/* Menú Mobile */}
          <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden z-40 ${
              isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={closeMenu}
          >
            <div 
              className={`fixed right-0 top-0 h-full w-72 bg-gradient-to-b from-white to-pink-50 shadow-2xl transform transition-transform duration-300 z-50 ${
                isMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 pt-20">
                {/* Si hay sesión - Mostrar info del usuario en mobile */}
                {empleado && (
                  <div className="mb-6 p-4 bg-gradient-to-br from-pink-100 to-amber-100 rounded-2xl border-2 border-pink-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-bold">
                          {getInitials(empleado.Nombre, empleado.Apellido)}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{empleado.Usuario}</p>
                        <p className="text-xs text-gray-600">{empleado.Nombre}</p>
                      </div>
                    </div>
                    <Link
                      to="/empleado"
                      className="block text-center bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors mt-3"
                      onClick={closeMenu}
                    >
                      Dashboard
                    </Link>
                  </div>
                )}

                <ul className="space-y-6 font-medium text-lg">
                  <li>
                    <a 
                      href="#up" 
                      className="block py-3 px-4 hover:bg-pink-50 hover:text-pink-500 rounded-lg transition-colors"
                      onClick={closeMenu}
                    >
                      🏠 Inicio
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#why" 
                      className="block py-3 px-4 hover:bg-pink-50 hover:text-pink-500 rounded-lg transition-colors"
                      onClick={closeMenu}
                    >
                      ⭐ Por qué elegirnos
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#about" 
                      className="block py-3 px-4 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors"
                      onClick={closeMenu}
                    >
                      🏢 Nosotros
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#locations" 
                      className="block py-3 px-4 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                      onClick={closeMenu}
                    >
                      📍 Ubicaciones
                    </a>
                  </li>
                  
                  {!empleado ? (
                    <li className="pt-4">
                      <Link
                        to="/log-in" 
                        className="block text-center bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-pink-700 transition-all shadow-md"
                        onClick={closeMenu}
                      >
                        Iniciar sesión
                      </Link>
                    </li>
                  ) : (
                    <li className="pt-4">
                      <button
                        onClick={handleLogout}
                        className="w-full text-center bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-5 h-5" />
                        Cerrar sesión
                      </button>
                    </li>
                  )}
                </ul>

                {/* Redes sociales en mobile */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500 text-center mb-4">Síguenos</p>
                  <div className="flex justify-center gap-4">
                    <a href="#" className="bg-pink-100 p-3 rounded-full hover:bg-pink-200 transition-colors">
                      <Instagram className="w-5 h-5 text-pink-600" />
                    </a>
                    <a href="#" className="bg-blue-100 p-3 rounded-full hover:bg-blue-200 transition-colors">
                      <Facebook className="w-5 h-5 text-blue-600" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 via-pink-400 to-amber-400 text-white relative overflow-hidden pt-20">
        {/* Elementos decorativos */}
        <div className="absolute top-20 left-10 text-6xl animate-bounce opacity-20">🍩</div>
        <div className="absolute bottom-20 right-10 text-6xl animate-bounce opacity-20" style={{animationDelay: '1s'}}>🍩</div>
        <div className="absolute top-40 right-20 text-4xl animate-pulse opacity-30">✨</div>
        
        <div className="text-center z-10 px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
            <h2 className="text-7xl font-extrabold drop-shadow-2xl">
              Bienvenido a <span className="text-yellow-200">SugarDonuts</span>
            </h2>
            <Sparkles className="w-12 h-12 text-yellow-300 animate-pulse" />
          </div>
          <p className="mt-6 text-2xl max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-lg">
            ¡Endulza tu día con donas artesanales que conquistan a todos!
          </p>
          <div className="flex gap-4 justify-center mt-10">
            <a 
              href="#why" 
              className="px-8 py-4 bg-white text-pink-600 font-bold rounded-full shadow-2xl hover:scale-110 transition-transform hover:shadow-pink-300/50 flex items-center gap-2"
            >
              <Award className="w-5 h-5" />
              Conócenos
            </a>
            <a 
              href="#locations" 
              className="px-8 py-4 bg-amber-600 text-white font-bold rounded-full shadow-2xl hover:scale-110 transition-transform hover:shadow-amber-400/50 flex items-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Encuéntranos
            </a>
          </div>
        </div>

        {/* Onda decorativa */}
        <div className="absolute bottom-0 w-full">
          <svg viewBox="0 0 1440 120" className="w-full">
            <path fill="#ffffff" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      {/* POR QUÉ ELEGIRNOS MEJORADO */}
      <section id="why" className="py-24 bg-gradient-to-b from-white to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-extrabold text-gray-800 mb-4">
              ¿Por qué elegirnos?
            </h3>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-amber-500 mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-amber-500">
              <div className="flex flex-col items-center text-center">
                <div className="bg-amber-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <Award className="w-16 h-16 text-amber-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-3">Sabor Único</h4>
                <p className="text-gray-600 leading-relaxed">
                  Recetas exclusivas con ingredientes premium de la más alta calidad. Cada dona es una obra maestra.
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="text-3xl">🏆</span>
                  <span className="text-3xl">⭐</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-green-500">
              <div className="flex flex-col items-center text-center">
                <div className="bg-green-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <Sprout className="w-16 h-16 text-green-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-3">100% Natural</h4>
                <p className="text-gray-600 leading-relaxed">
                  Sin conservantes artificiales. Frescura y calidad garantizada en cada bocado. Ingredientes naturales.
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="text-3xl">🌿</span>
                  <span className="text-3xl">🍃</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-pink-500">
              <div className="flex flex-col items-center text-center">
                <div className="bg-pink-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-16 h-16 text-pink-600" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-3">Hecho con Amor</h4>
                <p className="text-gray-600 leading-relaxed">
                  Cada dona es elaborada artesanalmente con dedicación, cariño y pasión por endulzar tu día.
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="text-3xl">❤️</span>
                  <span className="text-3xl">🤝</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <Users className="w-16 h-16 mb-4" />
              <div className="text-5xl font-bold mb-2">10K+</div>
              <div className="text-xl">Clientes Felices</div>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="w-16 h-16 mb-4" />
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-xl">Donas Diarias</div>
            </div>
            <div className="flex flex-col items-center">
              <Award className="w-16 h-16 mb-4" />
              <div className="text-5xl font-bold mb-2">5★</div>
              <div className="text-xl">Calificación</div>
            </div>
          </div>
        </div>
      </section>

      {/* NUESTRA EMPRESA MEJORADO */}
      <section id="about" className="py-24 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-5xl font-extrabold text-gray-800 mb-4">Nuestra Historia</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-pink-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl p-12 border-l-8 border-amber-500">
            <p className="text-xl text-gray-700 leading-relaxed text-center mb-8">
              En <span className="font-bold text-pink-600">SugarDonuts</span> creemos que una dona no es solo un postre, 
              es una <span className="font-bold text-amber-600">experiencia</span> que alegra el día.
              Desde nuestra fundación, nos hemos dedicado a ofrecer productos artesanales con un toque moderno y delicioso.
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <span className="bg-pink-100 text-pink-700 px-6 py-3 rounded-full font-semibold">Artesanal</span>
              <span className="bg-amber-100 text-amber-700 px-6 py-3 rounded-full font-semibold">Tradicional</span>
              <span className="bg-green-100 text-green-700 px-6 py-3 rounded-full font-semibold">Natural</span>
              <span className="bg-purple-100 text-purple-700 px-6 py-3 rounded-full font-semibold">Innovador</span>
            </div>
          </div>
        </div>
      </section>

      {/* ENCUÉNTRANOS MEJORADO */}
      <section id="locations" className="py-24 bg-gradient-to-b from-white to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-5xl font-extrabold text-gray-800 mb-4">Encuéntranos</h3>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-amber-500 mx-auto rounded-full"></div>
            <p className="text-xl text-gray-600 mt-6">Visítanos en nuestras sucursales</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Sucursal 1 */}
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden hover:shadow-pink-200 transition-all transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-8 h-8" />
                  <h4 className="text-2xl font-bold">Sucursal Central</h4>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 text-lg">Z/Miraflores, Av. Saavedra, entre Villalobos y Díaz Romero, La Paz</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-green-500" />
                  <p className="text-gray-700 text-lg">+591 2 234 5678</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-amber-500" />
                  <p className="text-gray-700 text-lg">Lun - Dom: 8:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>

            {/* Sucursal 2 */}
            <div className="bg-white shadow-2xl rounded-2xl overflow-hidden hover:shadow-amber-200 transition-all transform hover:-translate-y-2">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-8 h-8" />
                  <h4 className="text-2xl font-bold">Sucursal Secundaria</h4>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-amber-500 flex-shrink-0 mt-1" />
                  <p className="text-gray-700 text-lg">Z/Sopocachi, c. Andrés Muñoz, frente a la Universidad Nuestra Señora de La Paz, La Paz</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-green-500" />
                  <p className="text-gray-700 text-lg">+591 2 876 5432</p>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-pink-500" />
                  <p className="text-gray-700 text-lg">Lun - Dom: 9:00 AM - 7:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER MEJORADO */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            {/* Columna 1 */}
            <div>
              <h4 className="text-2xl font-bold mb-4 text-pink-400">SugarDonuts</h4>
              <p className="text-gray-300 leading-relaxed">
                Endulzando vidas desde 2020. Las mejores donas artesanales de Bolivia.
              </p>
            </div>

            {/* Columna 2 */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-amber-400">Contacto</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-pink-400" />
                  <span className="text-gray-300">info@sugardonuts.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-green-400" />
                  <span className="text-gray-300">+591 2 234 5678</span>
                </div>
              </div>
            </div>

            {/* Columna 3 */}
            <div>
              <h4 className="text-xl font-bold mb-4 text-amber-400">Síguenos</h4>
              <div className="flex gap-4">
                <a href="#" className="bg-pink-600 p-3 rounded-full hover:bg-pink-700 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="bg-blue-600 p-3 rounded-full hover:bg-blue-700 transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 text-center text-gray-400">
            <p>© {new Date().getFullYear()} SugarDonuts. Todos los derechos reservados. Hecho con ❤️ en Bolivia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}