import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate} from 'react-router-dom';
import { Search, Trash2Icon, UserPlus, Edit, Trash2, Power, CheckCircle, XCircle, RotateCcw, Loader2 } from 'lucide-react';
import { empleadoService, authService, type Empleado } from '../../services/Emp-Auth';


export default function Empleados() {
  const { workMode } = useOutletContext<{ workMode: boolean }>();
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [filteredEmpleados, setFilteredEmpleados] = useState<Empleado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUser = authService.getCurrentEmpleado();

  useEffect(() => {
    loadEmpleados();
  }, []);

  useEffect(() => {
    filterEmpleados();
  }, [searchTerm, empleados]);

  const navigate = useNavigate();

  const loadEmpleados = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await empleadoService.getAll(currentUser?.SucursalID);
      if (result.success) {
        setEmpleados(result.data);
        setFilteredEmpleados(result.data);
      } else {
        setError(result.error || 'Error al cargar empleados');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterEmpleados = () => {
    if (!searchTerm.trim()) {
      setFilteredEmpleados(empleados);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = empleados.filter(emp => 
      emp.Nombre.toLowerCase().includes(term) ||
      emp.Apellido.toLowerCase().includes(term) ||
      emp.EmpleadoID.toLowerCase().includes(term) ||
      emp.Usuario.toLowerCase().includes(term) ||
      emp.Correo.toLowerCase().includes(term) ||
      emp.CI.toString().includes(term)
    );
    setFilteredEmpleados(filtered);
  };

  const handleToggleActivo = async (empleadoID: string, currentState: boolean) => {
    if (!confirm(`¿Estás seguro de ${currentState ? 'desactivar' : 'activar'} este empleado?`)) {
      return;
    }

    try {
      const result = await empleadoService.toggleActivo(empleadoID, !currentState);
      if (result.success) {
        loadEmpleados();
      } else {
        alert(result.error || 'Error al cambiar estado');
      }
    } catch (err) {
      alert('Error de conexión');
      console.error(err);
    }
  };

  const handleDelete = async (empleadoID: string) => {
    if (!confirm('¿Estás seguro de eliminar este empleado? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const result = await empleadoService.delete(empleadoID);
      if (result.success) {
        loadEmpleados();
      } else {
        alert(result.error || 'Error al eliminar');
      }
    } catch (err) {
      alert('Error de conexión');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className={`w-8 h-8 animate-spin ${workMode ? 'text-gray-600' : 'text-pink-500'}`} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Empleados</h1>
          <p className="text-gray-600 mt-1">Administra el personal de tu sucursal</p>
        </div>
        <div className="flex gap-3">
          <button className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
            workMode
              ? 'bg-gray-700 hover:bg-gray-800'
              : 'bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
          }`}>
            <UserPlus className="w-5 h-5" />
            Nuevo Empleado (Coming Soon)
          </button>
          <button className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
            workMode
              ? 'bg-gray-700 hover:bg-gray-800'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
          }`} onClick={loadEmpleados}>
            <RotateCcw className="w-5 h-5" />
            Actualizar
          </button>
          <button className={`flex items-center gap-2 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 ${
            workMode
              ? 'bg-gray-600 hover:bg-gray-700'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
          }`} onClick={() => navigate('/manager/papelera-empleados')}>
            <Trash2Icon className="w-5 h-5" />
            Papelera
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Buscador */}
      <div className={`rounded-xl shadow-md p-6 transition-colors duration-300 ${
        workMode ? 'bg-white' : 'bg-white'
      }`}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID, usuario, correo o CI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-4 transition-all outline-none ${
              workMode
                ? 'border-gray-300 focus:border-gray-600 focus:ring-gray-200'
                : 'border-gray-200 focus:border-pink-400 focus:ring-pink-100'
            }`}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Mostrando {filteredEmpleados.length} de {empleados.length} empleados
        </p>
      </div>

      {/* Lista de empleados */}
      <div className="grid gap-4">
        {filteredEmpleados.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No se encontraron empleados</p>
          </div>
        ) : (
          filteredEmpleados.map((empleado) => (
            <div
              key={empleado.EmpleadoID}
              className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 border-l-4 ${
                workMode ? 'border-gray-600' : 'border-pink-400'
              }`}
            >
              <div className="flex items-center justify-between">
                {/* Info del empleado */}
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${
                    workMode
                      ? 'bg-gray-600'
                      : 'bg-gradient-to-br from-pink-500 to-amber-500'
                  }`}>
                    <span className="text-white font-bold text-xl">
                      {empleado.Nombre.charAt(0)}{empleado.Apellido.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-gray-800">
                        {empleado.NombreCompleto}
                      </h3>
                      {empleado.Activo ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Activo
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Inactivo
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-500">ID</p>
                        <p className="font-semibold text-gray-800">{empleado.EmpleadoID}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Usuario</p>
                        <p className="font-semibold text-gray-800">{empleado.Usuario}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">CI</p>
                        <p className="font-semibold text-gray-800">{empleado.CI}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Correo</p>
                        <p className="font-semibold text-gray-800 truncate">{empleado.Correo}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActivo(empleado.EmpleadoID, empleado.Activo || false)}
                    className={`p-3 rounded-xl transition-all ${
                      empleado.Activo
                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        : 'bg-green-100 hover:bg-green-200 text-green-600'
                    }`}
                    title={empleado.Activo ? 'Desactivar' : 'Activar'}
                  >
                    <Power className="w-5 h-5" />
                  </button>

                  <button
                    className="p-3 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => handleDelete(empleado.EmpleadoID)}
                    className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}