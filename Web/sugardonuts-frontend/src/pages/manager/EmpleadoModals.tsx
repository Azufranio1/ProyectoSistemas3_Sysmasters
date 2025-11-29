import { useState, useEffect } from 'react';
import { X, Save, Loader2, User, Mail, Lock, Calendar, CreditCard, Building2, AlertCircle } from 'lucide-react';
import { empleadoService, authService, type Empleado } from '../../services/Emp-Auth';

interface ModalProps {
  onClose: () => void;
  onSuccess: () => void;
  workMode?: boolean;
}

interface EditModalProps extends ModalProps {
  empleado: Empleado;
}

// ============================================
// FUNCIONES AUXILIARES DE VALIDACIÓN
// ============================================

const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const isValidAge = (birthDate: string): boolean => {
  if (!birthDate) return false;
  const age = calculateAge(birthDate);
  const birthYear = new Date(birthDate).getFullYear();
  
  // Validar que no sea año 1900 o anterior
  if (birthYear <= 1900) return false;
  
  // Validar que sea mayor de 18 años
  if (age < 18) return false;
  
  // Validar que no sea mayor de 100 años
  if (age > 100) return false;
  
  return true;
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && !email.includes(' ');
}

const removeOnlyNumbers = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};

const removeOnlyLetters = (value: string): string => {
  return value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
};

const trimExtraSpaces = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ');
};

const isOnlySpaces = (value: string): boolean => {
  return value.trim().length === 0;
};

// Validaciones para contraseña segura
interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

const checkPasswordStrength = (password: string): PasswordStrength => {
  return {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password),
  };
};

const isPasswordStrong = (password: string): boolean => {
  const strength = checkPasswordStrength(password);
  return Object.values(strength).every(value => value === true);
};

// ============================================
// MODAL DE EDITAR EMPLEADO
// ============================================
export function EditEmpleadoModal({ empleado, onClose, onSuccess, workMode = false }: EditModalProps) {
  const [formData, setFormData] = useState({
    Nombre: empleado.Nombre,
    Apellido: empleado.Apellido,
    Usuario: empleado.Usuario,
    CorreoPersonal: empleado.CorreoPersonal || '',
    Activo: empleado.Activo || false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar Nombre
    if (!formData.Nombre.trim()) {
      newErrors.Nombre = 'El nombre es requerido';
    } else if (isOnlySpaces(formData.Nombre)) {
      newErrors.Nombre = 'El nombre no puede contener solo espacios';
    } else if (formData.Nombre.trim().length < 2) {
      newErrors.Nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar Apellido
    if (!formData.Apellido.trim()) {
      newErrors.Apellido = 'El apellido es requerido';
    } else if (isOnlySpaces(formData.Apellido)) {
      newErrors.Apellido = 'El apellido no puede contener solo espacios';
    } else if (formData.Apellido.trim().length < 2) {
      newErrors.Apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    // Validar Usuario
    if (!formData.Usuario.trim()) {
      newErrors.Usuario = 'El usuario es requerido';
    } else if (isOnlySpaces(formData.Usuario)) {
      newErrors.Usuario = 'El usuario no puede contener solo espacios';
    } else if (formData.Usuario.trim().length < 3) {
      newErrors.Usuario = 'El usuario debe tener al menos 3 caracteres';
    } else if (/\s/.test(formData.Usuario)) {
      newErrors.Usuario = 'El usuario no puede contener espacios';
    }

    // Validar Correo Personal (opcional)
    if (formData.CorreoPersonal.trim()) {
      if (!isValidEmail(formData.CorreoPersonal.trim())) {
        newErrors.CorreoPersonal = 'El formato del correo personal no es válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      let processedValue = value;

      if (name === 'Nombre' || name === 'Apellido') {
        // Solo permitir letras y espacios
        processedValue = removeOnlyLetters(value);
        // Evitar múltiples espacios consecutivos
        processedValue = processedValue.replace(/\s{2,}/g, ' ');
        // No permitir espacios al inicio
        if (processedValue.startsWith(' ') && value.length === 1) {
          processedValue = '';
        }
      } else if (name === 'Usuario') {
        // No permitir espacios en el usuario
        processedValue = value.replace(/\s/g, '');
      } else if (name === 'CorreoPersonal') {
        // No permitir espacios en el correo
        processedValue = value.replace(/\s/g, '');
      }

      setFormData(prev => ({
        ...prev,
        [name]: processedValue,
      }));
    }

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const updateData: any = {
        Nombre: trimExtraSpaces(formData.Nombre),
        Apellido: trimExtraSpaces(formData.Apellido),
        Usuario: formData.Usuario.trim(),
        CorreoPersonal: formData.CorreoPersonal.trim() || null,
        Activo: formData.Activo ? 1 : 0,
      };

      const result = await empleadoService.update(empleado.EmpleadoID, updateData);
      if (result.success) {
        alert('✅ Empleado actualizado exitosamente');
        onSuccess();
      } else {
        alert('❌ ' + (result.error || 'Error al actualizar empleado'));
      }
    } catch (err) {
      alert('❌ Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          workMode ? 'bg-gray-50' : 'bg-gradient-to-r from-pink-100 to-pink-200'
        }`}>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-6 h-6" />
              Editar Empleado
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {empleado.NombreCompleto} ({empleado.EmpleadoID})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info del empleado (readonly) */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 font-medium">CI:</span>
                <span className="ml-2 font-semibold text-gray-800">{empleado.CI}</span>
              </div>
              <div>
                <span className="text-gray-500 font-medium">Correo Institucional:</span>
                <span className="ml-2 font-semibold text-gray-800">{empleado.Correo}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 italic">
              * CI y Correo Institucional no pueden ser modificados
            </p>
          </div>

          {/* Campos editables */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                name="Nombre"
                value={formData.Nombre}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                  errors.Nombre
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                }`}
              />
              {errors.Nombre && <p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>}
            </div>

            {/* Apellido */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Apellido *
              </label>
              <input
                type="text"
                name="Apellido"
                value={formData.Apellido}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                  errors.Apellido
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                }`}
              />
              {errors.Apellido && <p className="text-red-500 text-sm mt-1">{errors.Apellido}</p>}
            </div>

            {/* Usuario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usuario *
              </label>
              <input
                type="text"
                name="Usuario"
                value={formData.Usuario}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                  errors.Usuario
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                }`}
              />
              {errors.Usuario && <p className="text-red-500 text-sm mt-1">{errors.Usuario}</p>}
            </div>

            {/* Correo Personal */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Correo Personal (opcional)
              </label>
              <input
                type="email"
                name="CorreoPersonal"
                value={formData.CorreoPersonal}
                onChange={handleChange}
                placeholder="ejemplo@gmail.com"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                  errors.CorreoPersonal
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-gray-200 focus:border-blue-400 focus:ring-blue-100'
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">
                ℹ️ Usado para recuperación de contraseña
              </p>
              {errors.CorreoPersonal && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.CorreoPersonal}
                </p>
              )}
            </div>
          </div>

          {/* Nota sobre cambio de contraseña */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800 font-semibold mb-1">
              🔐 ¿Necesitas cambiar la contraseña?
            </p>
            <p className="text-xs text-blue-700">
              El empleado puede usar la opción <strong>"¿Olvidaste tu contraseña?"</strong> en la página de inicio de sesión para restablecer su contraseña de forma segura usando su correo personal.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                workMode
                  ? 'bg-gray-700 hover:bg-gray-800'
                  : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Actualizar Empleado
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// MODAL DE CREAR EMPLEADO
// ============================================
export function CreateEmpleadoModal({ onClose, onSuccess, workMode = false }: ModalProps) {
  const currentUser = authService.getCurrentEmpleado();
  
  const getSucursalID = () => {
    if (currentUser?.SucursalID) return currentUser.SucursalID;
    
    const storedUser = localStorage.getItem('empleado');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        return parsedUser.SucursalID || '';
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    return '';
  };
  
  const [formData, setFormData] = useState({
    CI: '',
    Nombre: '',
    Apellido: '',
    Usuario: '',
    Correo: '',
    CorreoPersonal: '',
    Keyword: '',
    FechaNacimiento: '',
    FechaContrato: new Date().toISOString().split('T')[0],
    SucursalID: getSucursalID(),
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [maxDate, setMaxDate] = useState('');
  const [minDate, setMinDate] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  useEffect(() => {
    console.log('🔍 Debug CreateEmpleadoModal:');
    console.log('Current User:', currentUser);
    console.log('SucursalID obtenido:', formData.SucursalID);
    
    // Calcular fecha máxima (18 años atrás desde hoy)
    const today = new Date();
    const maxDateObj = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    setMaxDate(maxDateObj.toISOString().split('T')[0]);
    
    // Calcular fecha mínima (100 años atrás desde hoy)
    const minDateObj = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    setMinDate(minDateObj.toISOString().split('T')[0]);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar CI
    if (!formData.CI.trim()) {
      newErrors.CI = 'El CI es requerido';
    } else if (!/^\d+$/.test(formData.CI)) {
      newErrors.CI = 'El CI debe contener solo números';
    } else if (formData.CI.length < 8) {
      newErrors.CI = 'El CI debe tener 8 dígitos';
    } else if (formData.CI.length > 8) {
      newErrors.CI = 'El CI no debe tener más de 8 dígitos';
    }

    // Validar Nombre
    if (!formData.Nombre.trim()) {
      newErrors.Nombre = 'El nombre es requerido';
    } else if (isOnlySpaces(formData.Nombre)) {
      newErrors.Nombre = 'El nombre no puede contener solo espacios';
    } else if (formData.Nombre.trim().length < 2) {
      newErrors.Nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar Apellido
    if (!formData.Apellido.trim()) {
      newErrors.Apellido = 'El apellido es requerido';
    } else if (isOnlySpaces(formData.Apellido)) {
      newErrors.Apellido = 'El apellido no puede contener solo espacios';
    } else if (formData.Apellido.trim().length < 2) {
      newErrors.Apellido = 'El apellido debe tener al menos 2 caracteres';
    }

    // Validar Usuario
    if (!formData.Usuario.trim()) {
      newErrors.Usuario = 'El usuario es requerido';
    } else if (isOnlySpaces(formData.Usuario)) {
      newErrors.Usuario = 'El usuario no puede contener solo espacios';
    } else if (formData.Usuario.trim().length < 3) {
      newErrors.Usuario = 'El usuario debe tener al menos 3 caracteres';
    } else if (/\s/.test(formData.Usuario)) {
      newErrors.Usuario = 'El usuario no puede contener espacios';
    }

    // Validar Correo
    if (!formData.Correo.trim()) {
      newErrors.Correo = 'El correo es requerido';
    } else if (!isValidEmail(formData.Correo)) {
      newErrors.Correo = 'El correo no es válido (ej: usuario@dominio.com)';
    } else if (/\s/.test(formData.Correo)) {
      newErrors.Correo = 'El correo no puede contener espacios';
    }

    // Validar Correo Personal (opcional)
    if (formData.CorreoPersonal.trim()) {
      if (!isValidEmail(formData.CorreoPersonal)) {
        newErrors.CorreoPersonal = 'El correo personal no es válido (ej: usuario@dominio.com)';
      } else if (/\s/.test(formData.CorreoPersonal)) {
        newErrors.CorreoPersonal = 'El correo personal no puede contener espacios';
      }
    }

    // Validar Contraseña
    if (!formData.Keyword) {
      newErrors.Keyword = 'La contraseña es requerida';
    } else if (!isPasswordStrong(formData.Keyword)) {
      newErrors.Keyword = 'La contraseña no cumple con todos los requisitos de seguridad';
    } else if (isOnlySpaces(formData.Keyword)) {
      newErrors.Keyword = 'La contraseña no puede contener solo espacios';
    }

    // Validar Fecha de Nacimiento
    if (!formData.FechaNacimiento) {
      newErrors.FechaNacimiento = 'La fecha de nacimiento es requerida';
    } else if (!isValidAge(formData.FechaNacimiento)) {
      const age = calculateAge(formData.FechaNacimiento);
      const birthYear = new Date(formData.FechaNacimiento).getFullYear();
      
      if (birthYear <= 1900) {
        newErrors.FechaNacimiento = 'La fecha de nacimiento no puede ser anterior a 1901';
      } else if (age < 16) {
        newErrors.FechaNacimiento = 'El empleado debe tener al menos 18 años';
      } else if (age > 100) {
        newErrors.FechaNacimiento = 'La fecha de nacimiento no es válida (máximo 100 años)';
      } else {
        newErrors.FechaNacimiento = 'La fecha de nacimiento no es válida';
      }
    }

    if (!formData.SucursalID) {
      newErrors.SucursalID = 'Error: No se pudo determinar la sucursal';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Procesar según el tipo de campo
    if (name === 'CI') {
      // Solo permitir números, eliminar cualquier otro carácter
      processedValue = removeOnlyNumbers(value);
    } else if (name === 'Nombre' || name === 'Apellido') {
      // Solo permitir letras y espacios
      processedValue = removeOnlyLetters(value);
      // Evitar múltiples espacios consecutivos
      processedValue = processedValue.replace(/\s{2,}/g, ' ');
      // No permitir espacios al inicio
      if (processedValue.startsWith(' ') && value.length === 1) {
        processedValue = '';
      }
    } else if (name === 'Usuario') {
      // No permitir espacios en el usuario
      processedValue = value.replace(/\s/g, '');
    } else if (name === 'Correo' || name === 'CorreoPersonal') {
      // No permitir espacios en el correo
      processedValue = value.replace(/\s/g, '');
    } else if (name === 'Keyword') {
      // Permitir cualquier carácter pero sin espacios al inicio o fin durante la escritura
      processedValue = value;
      // Actualizar la fortaleza de la contraseña
      setPasswordStrength(checkPasswordStrength(value));
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        CI: parseInt(formData.CI, 10),
        Nombre: trimExtraSpaces(formData.Nombre),
        Apellido: trimExtraSpaces(formData.Apellido),
        Usuario: formData.Usuario.trim(),
        Correo: formData.Correo.trim().toLowerCase(),
        CorreoPersonal: formData.CorreoPersonal.trim() ? formData.CorreoPersonal.trim().toLowerCase() : undefined,
        Keyword: formData.Keyword,
      };
      
      const result = await empleadoService.create(dataToSend);
      if (result.success) {
        alert('✅ Empleado creado exitosamente');
        onSuccess();
      } else {
        alert('❌ ' + (result.error || 'Error al crear empleado'));
      }
    } catch (err) {
      alert('❌ Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          workMode ? 'bg-gray-50' : 'bg-gradient-to-r from-pink-50 to-amber-50'
        }`}>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-6 h-6" />
              Nuevo Empleado
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Completa todos los campos requeridos
              {currentUser?.NombreSucursal && (
                <span className="ml-2 font-semibold text-pink-600">
                  • Sucursal: {currentUser.NombreSucursal}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Info de Sucursal Asignada */}
          {formData.SucursalID ? (
            <div className="bg-gradient-to-r from-pink-50 to-amber-50 rounded-xl p-4 border-2 border-pink-200">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-pink-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-700">Sucursal Asignada</p>
                  <p className="text-lg font-bold text-pink-600">
                    {currentUser?.NombreSucursal || formData.SucursalID}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                El nuevo empleado será asignado automáticamente a tu sucursal
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-700 font-semibold">⚠️ No se detectó la sucursal</p>
              <p className="text-red-600 text-sm mt-1">
                Por favor, verifica que hayas iniciado sesión correctamente. Si el problema persiste, contacta al administrador.
              </p>
            </div>
          )}

          {/* Información Personal */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-pink-500" />
              Información Personal
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* CI */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Carnet de Identidad (CI) *
                </label>
                <input
                  type="text"
                  name="CI"
                  value={formData.CI}
                  onChange={handleChange}
                  inputMode="numeric"
                  maxLength={8}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                    errors.CI
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
                  }`}
                  placeholder="12345678"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ℹ️ Solo se aceptan números (8 dígitos)
                </p>
                {errors.CI && <p className="text-red-500 text-sm mt-1">{errors.CI}</p>}
              </div>

              {/* Fecha de Nacimiento */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  name="FechaNacimiento"
                  value={formData.FechaNacimiento}
                  onChange={handleChange}
                  min={minDate}
                  max={maxDate}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                    errors.FechaNacimiento
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
                  }`}
                />
                {errors.FechaNacimiento && (
                  <p className="text-red-500 text-sm mt-1">{errors.FechaNacimiento}</p>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="Nombre"
                  value={formData.Nombre}
                  onChange={handleChange}
                  maxLength={50}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                    errors.Nombre
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
                  }`}
                  placeholder="Juan"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ℹ️ Solo se aceptan letras (mínimo 2 caracteres)
                </p>
                {errors.Nombre && <p className="text-red-500 text-sm mt-1">{errors.Nombre}</p>}
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  name="Apellido"
                  value={formData.Apellido}
                  onChange={handleChange}
                  maxLength={50}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                    errors.Apellido
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
                  }`}
                  placeholder="Pérez"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ℹ️ Solo se aceptan letras (mínimo 2 caracteres)
                </p>
                {errors.Apellido && <p className="text-red-500 text-sm mt-1">{errors.Apellido}</p>}
              </div>
            </div>
          </div>

          {/* Credenciales de Acceso */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-500" />
              Credenciales de Acceso
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {/* Usuario */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Usuario *
                </label>
                <input
                  type="text"
                  name="Usuario"
                  value={formData.Usuario}
                  onChange={handleChange}
                  maxLength={30}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                    errors.Usuario
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
                  }`}
                  placeholder="juanperez"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ℹ️ Sin espacios (mínimo 3 caracteres)
                </p>
                {errors.Usuario && <p className="text-red-500 text-sm mt-1">{errors.Usuario}</p>}
              </div>

              {/* Correo Institucional */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo Institucional *
                </label>
                <input
                  type="email"
                  name="Correo"
                  value={formData.Correo}
                  onChange={handleChange}
                  maxLength={100}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                    errors.Correo
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
                  }`}
                  placeholder="juan@sugardonuts.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ℹ️ Correo corporativo (sin espacios)
                </p>
                {errors.Correo && <p className="text-red-500 text-sm mt-1">{errors.Correo}</p>}
              </div>

              {/* Correo Personal */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Correo Personal (opcional)
                </label>
                <input
                  type="email"
                  name="CorreoPersonal"
                  value={formData.CorreoPersonal}
                  onChange={handleChange}
                  maxLength={100}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                    errors.CorreoPersonal
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
                  }`}
                  placeholder="juan@gmail.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ℹ️ Para recuperación de contraseña
                </p>
                {errors.CorreoPersonal && <p className="text-red-500 text-sm mt-1">{errors.CorreoPersonal}</p>}
              </div>

              {/* Contraseña */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Contraseña *
                </label>
                <input
                  type="password"
                  name="Keyword"
                  value={formData.Keyword}
                  onChange={handleChange}
                  maxLength={50}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
                    errors.Keyword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
                  }`}
                  placeholder="Crea una contraseña segura"
                />
                
                {/* Requisitos de contraseña */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Requisitos de seguridad:</p>
                  
                  <div className={`flex items-center gap-2 text-xs transition-all ${
                    passwordStrength.hasMinLength ? 'text-green-600' : 'text-red-500'
                  }`}>
                    <span className="font-bold">{passwordStrength.hasMinLength ? '✓' : '✗'}</span>
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  
                  <div className={`flex items-center gap-2 text-xs transition-all ${
                    passwordStrength.hasUpperCase ? 'text-green-600' : 'text-red-500'
                  }`}>
                    <span className="font-bold">{passwordStrength.hasUpperCase ? '✓' : '✗'}</span>
                    <span>Al menos una letra mayúscula (A-Z)</span>
                  </div>
                  
                  <div className={`flex items-center gap-2 text-xs transition-all ${
                    passwordStrength.hasLowerCase ? 'text-green-600' : 'text-red-500'
                  }`}>
                    <span className="font-bold">{passwordStrength.hasLowerCase ? '✓' : '✗'}</span>
                    <span>Al menos una letra minúscula (a-z)</span>
                  </div>
                  
                  <div className={`flex items-center gap-2 text-xs transition-all ${
                    passwordStrength.hasNumber ? 'text-green-600' : 'text-red-500'
                  }`}>
                    <span className="font-bold">{passwordStrength.hasNumber ? '✓' : '✗'}</span>
                    <span>Al menos un número (0-9)</span>
                  </div>
                  
                  <div className={`flex items-center gap-2 text-xs transition-all ${
                    passwordStrength.hasSpecialChar ? 'text-green-600' : 'text-red-500'
                  }`}>
                    <span className="font-bold">{passwordStrength.hasSpecialChar ? '✓' : '✗'}</span>
                    <span>Al menos un carácter especial (!@#$%^&*...)</span>
                  </div>
                </div>
                
                {errors.Keyword && <p className="text-red-500 text-sm mt-2 font-semibold">{errors.Keyword}</p>}
              </div>
            </div>
          </div>

          {/* Error de sucursal si existe */}
          {errors.SucursalID && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <p className="text-red-700 font-semibold">{errors.SucursalID}</p>
              <p className="text-red-600 text-sm mt-1">
                Por favor, recarga la página e intenta nuevamente.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                workMode
                  ? 'bg-gray-700 hover:bg-gray-800'
                  : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Crear Empleado
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}