import { useState, useEffect } from 'react';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import logo from "../Resources/imgs/SugarDonutsTD.png";
import donitas from "../Resources/imgs/donitas-bg.png";
import { authService, type Empleado } from '../services/api';

export default function LogIn() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState(localStorage.getItem('recordarCorreo') || '');
  const [password, setPassword] = useState('');
  const [recordarme, setRecordarme] = useState(!!localStorage.getItem('recordarCorreo'));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // useEffect para saltarse login si ya hay sesión activa
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const empleado = authService.getCurrentEmpleado();
      redirectByRole(empleado);
    }
  }, []);

  const redirectByRole = (empleado: Empleado | null) => {
    if (!empleado) return navigate('/');
    const id = empleado.EmpleadoID;
    if (id.startsWith('MGR-')) return navigate('/manager');
    if (id.startsWith('EMP-')) return navigate('/employee');
    if (id.startsWith('CLI-')) return navigate('/client');
    return navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!correo || !password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    if (!correo.includes('@')) {
      setError('Por favor ingresa un correo válido');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.login(correo, password);

      if (result.success) {
        const storage = recordarme ? localStorage : sessionStorage;
        storage.setItem('token', result.token ?? '');
        storage.setItem('empleado', JSON.stringify(result.empleado));
        recordarme ? localStorage.setItem('recordarCorreo', correo) : localStorage.removeItem('recordarCorreo');

        redirectByRole(result.empleado ?? null);
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión. Verifica que XAMPP esté ejecutándose.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondos */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-pink-200 to-amber-300"></div>
      <div className="absolute inset-0 opacity-20" style={{backgroundImage: `url(${donitas})`, backgroundRepeat:'repeat', backgroundSize:'120px 120px'}}></div>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>

      {/* Formulario */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-pink-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Link to="/"><img src={logo} alt="SugarDonuts Logo" className="max-h-20 max-w-40 object-contain hover:scale-105 transition"/></Link>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-amber-600 bg-clip-text text-transparent">Bienvenido</h2>
            <p className="text-gray-600 mt-2">Inicia sesión en SugarDonuts</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3 animate-pulse">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Correo electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="email" value={correo} onChange={e => setCorreo(e.target.value)} placeholder="tu@email.com"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  onKeyDown={e => e.key==='Enter' && handleSubmit(e)}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  onKeyDown={e => e.key==='Enter' && handleSubmit(e)}
                />
              </div>
            </div>

            {/* Recordarme */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={recordarme} onChange={e => setRecordarme(e.target.checked)}
                  disabled={loading} className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400 disabled:cursor-not-allowed"/>
                <span className="text-sm text-gray-600">Recordarme</span>
              </label>
              <a href="#" className="text-sm text-pink-600 hover:text-pink-700 font-medium">¿Olvidaste tu contraseña?</a>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin"/> Iniciando sesión...</> : 'Iniciar sesión'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
