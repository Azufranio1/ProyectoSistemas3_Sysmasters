import { useOutletContext } from 'react-router-dom';
import Papelera from '../../components/Papelera';
import { empleadoService } from '../../services/Emp-Auth';

export default function PapeleraEmpleados() {
  const { workMode } = useOutletContext<{ workMode: boolean }>();

  const fetchDeletedEmpleados = async () => {
    return await empleadoService.getDeleted();
  };

  const restoreEmpleado = async (id: string) => {
    return await empleadoService.recover(id);
  };

  const permanentDeleteEmpleado = async (id: string) => {
    return await empleadoService.permanentDelete(id);
  };

  const renderEmpleadoDetails = (empleado: any) => (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-xl">
          {empleado.Nombre.charAt(0)}{empleado.Apellido.charAt(0)}
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold text-gray-800">{empleado.NombreCompleto}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
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
  );

  return (
    <Papelera
      workMode={workMode}
      title="Papelera de Empleados"
      description="Empleados eliminados que pueden ser restaurados"
      icon="👥"
      fetchDeletedItems={fetchDeletedEmpleados}
      restoreItem={restoreEmpleado}
      permanentDelete={permanentDeleteEmpleado}
      renderItemDetails={renderEmpleadoDetails}
      getItemId={(emp) => emp.EmpleadoID}
      getItemName={(emp) => emp.NombreCompleto}
    />
  );
}