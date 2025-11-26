// src/pages/RecuperarPassword.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Mail, Lock, AlertCircle, Loader2, Eye, EyeOff, CheckCircle, Send, KeyRound, ArrowLeft, User } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import logo from "../Resources/imgs/SugarDonutsTD.png";
import donitas from "../Resources/imgs/donitas-bg.png";

const API_URL = 'http://localhost/SugarDonuts-API';

interface Step1Form {
  usuario: string;
  correoPersonal: string;
}

interface Step2Form {
  codigo: string;
}

interface Step3Form {
  nuevaPassword: string;
  confirmarPassword: string;
}

type Step = 1 | 2 | 3;

export default function RecuperarPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [correoPersonal, setCorreoPersonal] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correoOculto, setCorreoOculto] = useState('');

  // STEP 1: Ingresar usuario y correo personal
  const step1Form = useForm<Step1Form>({
    defaultValues: { 
      usuario: '',
      correoPersonal: ''
    }
  });

  const onSubmitStep1 = async (data: Step1Form) => {
    console.log('🚀 Iniciando paso 1...');
    console.log('📍 URL:', `${API_URL}/recuperar-password.php`);
    console.log('📦 Datos a enviar:', {
      action: 'enviar-codigo',
      usuario: data.usuario.trim(),
      correoPersonal: data.correoPersonal.trim()
    });

    try {
      const response = await fetch(`${API_URL}/recuperar-password.php`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({
          action: 'enviar-codigo',
          usuario: data.usuario.trim(),
          correoPersonal: data.correoPersonal.trim()
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Obtener el texto de la respuesta primero para debug
      const responseText = await response.text();
      console.log('📄 Response text:', responseText);

      // Intentar parsear como JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Error al parsear JSON:', parseError);
        console.error('📄 Respuesta completa recibida:', responseText);
        throw new Error('El servidor devolvió una respuesta inválida. Revisa la consola para más detalles.');
      }

      console.log('📧 Respuesta del servidor:', result);

      if (result.success) {
        setUsuario(data.usuario.trim());
        setCorreoPersonal(data.correoPersonal.trim());
        setCorreoOculto(result.correoEnviado || data.correoPersonal.trim());
        setStep(2);
      } else {
        step1Form.setError('root', {
          type: 'manual',
          message: result.error || 'Error al enviar el código'
        });
      }
    } catch (err: any) {
      console.error('❌ Error completo:', err);
      console.error('❌ Error tipo:', err.name);
      console.error('❌ Error mensaje:', err.message);
      
      let errorMessage = 'Error de conexión con el servidor';
      
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'No se puede conectar con el servidor. Verifica que XAMPP esté corriendo.';
      } else if (err.message.includes('NetworkError')) {
        errorMessage = 'Error de red. Verifica tu conexión.';
      } else if (err.message.includes('HTTP error')) {
        errorMessage = `Error del servidor: ${err.message}`;
      }
      
      step1Form.setError('root', {
        type: 'manual',
        message: errorMessage
      });
    }
  };

  // STEP 2: Verificar código
  const step2Form = useForm<Step2Form>({
    defaultValues: { codigo: '' }
  });

  const onSubmitStep2 = async (data: Step2Form) => {
    try {
      const response = await fetch(`${API_URL}/recuperar-password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verificar-codigo',
          usuario: usuario,
          codigo: parseInt(data.codigo.trim())
        })
      });

      const result = await response.json();
      console.log('✅ Respuesta verificar código:', result);

      if (result.success) {
        setCodigo(data.codigo.trim());
        setNombreUsuario(result.nombreCompleto || '');
        setStep(3);
      } else {
        step2Form.setError('root', {
          type: 'manual',
          message: result.error || 'Código incorrecto'
        });
      }
    } catch (err) {
      console.error('❌ Error:', err);
      step2Form.setError('root', {
        type: 'manual',
        message: 'Error de conexión con el servidor'
      });
    }
  };

  // STEP 3: Cambiar contraseña
  const step3Form = useForm<Step3Form>({
    defaultValues: { nuevaPassword: '', confirmarPassword: '' }
  });

  const onSubmitStep3 = async (data: Step3Form) => {
    try {
      const response = await fetch(`${API_URL}/recuperar-password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cambiar-password',
          usuario: usuario,
          codigo: parseInt(codigo),
          nuevaPassword: data.nuevaPassword.trim()
        })
      });

      const result = await response.json();
      console.log('🔑 Respuesta cambiar password:', result);

      if (result.success) {
        // Mostrar mensaje de éxito y redirigir al login
        setTimeout(() => {
          navigate('/log-in', { replace: true });
        }, 2500);
      } else {
        step3Form.setError('root', {
          type: 'manual',
          message: result.error || 'Error al cambiar la contraseña'
        });
      }
    } catch (err) {
      console.error('❌ Error:', err);
      step3Form.setError('root', {
        type: 'manual',
        message: 'Error de conexión con el servidor'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondos */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-300 via-pink-200 to-amber-300"></div>
      <div className="absolute inset-0 opacity-20" style={{backgroundImage: `url(${donitas})`, backgroundRepeat:'repeat', backgroundSize:'120px 120px'}}></div>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]"></div>

      {/* Contenedor principal */}
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
              Recuperar Contraseña
            </h2>
            <p className="text-gray-600 mt-2">
              {step === 1 && 'Ingresa tu información'}
              {step === 2 && 'Verifica tu código'}
              {step === 3 && 'Crea tu nueva contraseña'}
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s 
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && <div className={`h-1 w-full mt-5 -mx-2 ${step > s ? 'bg-pink-500' : 'bg-gray-200'}`}></div>}
              </div>
            ))}
          </div>

          {/* STEP 1: Usuario y Correo Personal */}
          {step === 1 && (
            <form onSubmit={step1Form.handleSubmit(onSubmitStep1)} className="space-y-6">
              {step1Form.formState.errors.root && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-sm text-red-700">{step1Form.formState.errors.root.message}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    {...step1Form.register('usuario', {
                      required: 'El nombre de usuario es requerido',
                      validate: {
                        notEmpty: (value) => value.trim() !== '' || 'El usuario no puede estar vacío',
                        minLength: (value) => value.trim().length >= 3 || 'Mínimo 3 caracteres'
                      }
                    })}
                    placeholder="tu_usuario"
                    disabled={step1Form.formState.isSubmitting}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all disabled:bg-gray-100"
                  />
                </div>
                {step1Form.formState.errors.usuario && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {step1Form.formState.errors.usuario.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tu Correo Personal
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email"
                    {...step1Form.register('correoPersonal', {
                      required: 'Tu correo personal es requerido',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Formato de correo inválido'
                      }
                    })}
                    placeholder="tu@gmail.com"
                    disabled={step1Form.formState.isSubmitting}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all disabled:bg-gray-100"
                  />
                </div>
                {step1Form.formState.errors.correoPersonal && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {step1Form.formState.errors.correoPersonal.message}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  📧 Enviaremos el código de recuperación a este correo
                </p>
              </div>

              <button 
                type="submit"
                disabled={step1Form.formState.isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {step1Form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin"/>
                    Enviando código...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Enviar Código
                  </>
                )}
              </button>

              <Link to="/log-in" className="flex items-center justify-center gap-2 text-sm text-pink-600 hover:text-pink-700 font-medium hover:underline">
                <ArrowLeft className="w-4 h-4" />
                Volver al login
              </Link>
            </form>
          )}

          {/* STEP 2: Código de verificación */}
          {step === 2 && (
            <form onSubmit={step2Form.handleSubmit(onSubmitStep2)} className="space-y-6">
              {step2Form.formState.errors.root && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-sm text-red-700">{step2Form.formState.errors.root.message}</p>
                </div>
              )}

              <div className="p-4 bg-pink-50 border-2 border-pink-200 rounded-xl">
                <p className="text-sm text-pink-700">
                  📧 Hemos enviado un código de 8 dígitos a <strong>{correoOculto}</strong>
                </p>
                <p className="text-xs text-pink-600 mt-1">
                  Revisa tu bandeja de entrada y carpeta de spam
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Código de Verificación
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    {...step2Form.register('codigo', {
                      required: 'El código es requerido',
                      pattern: {
                        value: /^\d{8}$/,
                        message: 'El código debe tener 8 dígitos'
                      }
                    })}
                    placeholder="12345678"
                    maxLength={8}
                    disabled={step2Form.formState.isSubmitting}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all text-center text-2xl tracking-widest font-bold disabled:bg-gray-100"
                  />
                </div>
                {step2Form.formState.errors.codigo && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {step2Form.formState.errors.codigo.message}
                  </p>
                )}
              </div>

              <button 
                type="submit"
                disabled={step2Form.formState.isSubmitting}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {step2Form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin"/>
                    Verificando...
                  </>
                ) : (
                  'Verificar Código'
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-pink-600 hover:text-pink-700 font-medium hover:underline flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Cambiar datos
              </button>
            </form>
          )}

          {/* STEP 3: Nueva contraseña */}
          {step === 3 && (
            <form onSubmit={step3Form.handleSubmit(onSubmitStep3)} className="space-y-6">
              {step3Form.formState.errors.root && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"/>
                  <p className="text-sm text-red-700">{step3Form.formState.errors.root.message}</p>
                </div>
              )}

              {step3Form.formState.isSubmitSuccessful && (
                <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"/>
                  <div>
                    <p className="text-sm text-green-700 font-semibold">¡Contraseña actualizada exitosamente!</p>
                    <p className="text-xs text-green-600 mt-1">Redirigiendo al login...</p>
                  </div>
                </div>
              )}

              {nombreUsuario && (
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-700">
                    👤 Actualizando contraseña para: <strong>{nombreUsuario}</strong>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    {...step3Form.register('nuevaPassword', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 6,
                        message: 'Mínimo 6 caracteres'
                      },
                      validate: {
                        hasAlphanumeric: (value) => /[a-zA-Z]/.test(value) && /\d/.test(value) || 'Debe contener letras y números'
                      }
                    })}
                    placeholder="••••••••"
                    disabled={step3Form.formState.isSubmitting}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {step3Form.formState.errors.nuevaPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {step3Form.formState.errors.nuevaPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...step3Form.register('confirmarPassword', {
                      required: 'Confirma tu contraseña',
                      validate: (value) => 
                        value === step3Form.watch('nuevaPassword') || 'Las contraseñas no coinciden'
                    })}
                    placeholder="••••••••"
                    disabled={step3Form.formState.isSubmitting}
                    className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all disabled:bg-gray-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {step3Form.formState.errors.confirmarPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {step3Form.formState.errors.confirmarPassword.message}
                  </p>
                )}
              </div>

              <button 
                type="submit"
                disabled={step3Form.formState.isSubmitting || step3Form.formState.isSubmitSuccessful}
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transform hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {step3Form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin"/>
                    Actualizando...
                  </>
                ) : (
                  'Cambiar Contraseña'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}