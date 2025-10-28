import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useState } from 'react';
import logo from "../Resources/imgs/SugarDonutsTD.png";
import donitas from "../Resources/imgs/donitas-bg.png";
import { authService, type Empleado } from '../services/Emp-Auth';

interface LoginFormData {
  correo: string;
  password: string;
  recordarme: boolean;
}

export default function LogIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
    watch
  } = useForm<LoginFormData>({
    defaultValues: {
      correo: localStorage.getItem('recordarCorreo') || '',
      password: '',
      recordarme: !!localStorage.getItem('recordarCorreo')
    }
  });

  const passwordValue = watch('password');

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const empleado = authService.getCurrentEmpleado();
      redirectByRole(empleado);
    }
  }, []);

  const redirectByRole = (empleado: Empleado | null) => {
    if (!empleado) return navigate('/');
    const id = empleado.EmpleadoID;
    if (id.startsWith('MGR-')) return navigate('/manager/home', { replace: true });
    if (id.startsWith('EMP-')) return navigate('/employee/home', { replace: true });
    if (id.startsWith('CLI-')) return navigate('/client/home', { replace: true });
    return navigate('/', { replace: true });
  };

  const onSubmit = async (data: LoginFormData) => {
    const correoLimpio = data.correo.trim();
    const passwordLimpia = data.password.trim();

    try {
      const result = await authService.login(correoLimpio, passwordLimpia);

      if (result.success && result.empleado && result.token) {
        const storage = data.recordarme ? localStorage : sessionStorage;
        storage.setItem('token', result.token);
        storage.setItem('empleado', JSON.stringify(result.empleado));
        
        if (data.recordarme) {
          localStorage.setItem('recordarCorreo', correoLimpio);
        } else {
          localStorage.removeItem('recordarCorreo');
        }

        redirectByRole(result.empleado);
      } else {
        setFormError('root', {
          type: 'manual',
          message: result.error || 'Credenciales incorrectas'
        });
      }
    } catch (err) {
      console.error(err);
      setFormError('root', {
        type: 'manual',
        message: 'Error de conexión. Verifica que el servidor esté activo.'
      });
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
              <Link to="/">
                <img src={logo} alt="SugarDonuts Logo" className="max-h-20 max-w-40 object-contain hover:scale-105 transition"/>
              </Link>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-amber-600 bg-clip-text text-transparent">
              Bienvenido
            </h2>
            <p className="text-gray-600 mt-2">Inicia sesión en SugarDonuts</p>
          </div>

          {/* Error general */}
          {errors.root && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
              <p className="text-sm text-red-700">{errors.root.message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email"
                  {...register('correo', {
                    required: 'El correo es requerido',
                    validate: {
                      // 1. No puede estar vacío después del trim
                      notEmpty: (value) => value.trim() !== '' || 'El correo no puede estar vacío',
                      
                      // 2. Debe tener formato válido
                      validFormat: (value) => {
                        const trimmed = value.trim();
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        return emailRegex.test(trimmed) || 'Formato de correo inválido';
                      },
                      
                      // 3. No permitir espacios
                      noSpaces: (value) => !/\s/.test(value) || 'El correo no puede contener espacios',
                      
                      // 4. Solo caracteres válidos antes del @ (SIN PUNTOS)
                      noSpecialCharsBeforeAt: (value) => {
                        const beforeAt = value.trim().split('@')[0];
                        // Solo letras, números, guiones y guiones bajos (SIN PUNTOS)
                        const validChars = /^[a-zA-Z0-9_-]+$/;
                        return validChars.test(beforeAt) || 'El correo no puede contener puntos, espacios o caracteres especiales antes del @';
                      },
                      
                      // 5. Dominio válido (debe tener punto)
                      validDomain: (value) => {
                        const parts = value.trim().split('@');
                        if (parts.length !== 2) return 'Formato de correo inválido';
                        const domain = parts[1];
                        // El dominio SÍ debe tener punto
                        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/;
                        return domainRegex.test(domain) || 'Dominio de correo inválido';
                      },
                      
                      // 6. No puntos consecutivos en el dominio
                      noConsecutiveDots: (value) => {
                        const domain = value.split('@')[1];
                        if (domain) {
                          return !domain.includes('..') || 'El dominio no puede tener puntos consecutivos';
                        }
                        return true;
                      },
                      
                      // 7. Longitud máxima
                      maxLength: (value) => value.trim().length <= 100 || 'El correo es demasiado largo'
                    }
                  })}
                  placeholder="tu@email.com"
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    const input = e.currentTarget;
                    const cursorPosition = input.selectionStart || 0;
                    const textBeforeCursor = input.value.substring(0, cursorPosition);
                    const hasAt = textBeforeCursor.includes('@');
                    
                    // Prevenir espacios siempre
                    if (e.key === ' ') {
                      e.preventDefault();
                    }
                    
                    // Prevenir punto ANTES del @
                    if (e.key === '.' && !hasAt) {
                      e.preventDefault();
                    }
                  }}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.correo 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
                  }`}
                />
              </div>
              {errors.correo && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.correo.message}
                </p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                <input 
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  autoCapitalize="off"
                  spellCheck="false"
                  inputMode="text" 
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    validate: {
                      notEmpty: (value) => value.trim() !== '' || 'La contraseña no puede estar vacía',
                      minLength: (value) => value.trim().length >= 6 || 'La contraseña debe tener al menos 6 caracteres',
                      hasAlphanumeric: (value) => /[a-zA-Z0-9]/.test(value.trim()) || 'Debe contener al menos una letra o número'
                    }
                  })}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl transition-all outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                      : 'border-gray-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Recordarme */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  {...register('recordarme')}
                  disabled={isSubmitting}
                  className="w-4 h-4 rounded border-gray-300 text-pink-500 focus:ring-pink-400 disabled:cursor-not-allowed"
                />
                <span className="text-sm text-gray-600">Recordarme</span>
              </label>
              <Link to="/recuperar-password" className="text-sm text-pink-600 hover:text-pink-700 font-medium hover:underline">
                ¿Olvidaste tu contraseña? (Coming Soon)
              </Link>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin"/>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}