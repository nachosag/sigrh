"use client";

import { useEffect, useState } from "react";
import RelationalInput from "../RelationalInput";
import axios from "axios";
import { cleanEmployeePayload } from "@/utils/cleanEmployeePayload";
import config from "@/config";
import { useRoles } from "@/hooks/useRoles";
import HasPermission from "../HasPermission";
import { PermissionIds } from "@/enums/permissions";
import EmployeeChangePasswordModal from "./EmployeeChangePasswordModal";
import { toastAlerts } from "@/utils/toastAlerts";

export default function EmployeeUser({ employeeData, id }) {
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
    role_id: "",
    role_name: "",
  });
  const [editing, setEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { roles, loading, error } = useRoles();
  const mappedRoles = roles.map((r) => ({
    value: r.id,
    label: r.name,
    description: r.description,
    permissions: r.permissions,
  }));

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setEditing(true);
  }

  const handleOpenChangePassword = () => {
    setModalOpen(true);
  };

  async function handleSave() {
    const dataToSend = { ...formData };
    delete dataToSend.password;

    const cleanedData = cleanEmployeePayload(dataToSend);

    try {
      let res;

      if (id !== "new") {
        res = await axios.patch(
          `${config.API_URL}/employees/${id}`,
          cleanedData
        );
      } else {
        res = await axios.post(
          `${config.API_URL}/employees/register`,
          cleanedData
        );
      }

      const expectedStatus = id !== "new" ? 200 : 201;
      if (res.status !== expectedStatus) {
        throw new Error(`Error inesperado al guardar. Código: ${res.status}`);
      }

      if (id === "new") {
        router.push(`/sigrh/employees/${res.data.id}`);
      }

      setEditing(false);
      toastAlerts.showSuccess("Datos del empleado guardados correctamente");
    } catch (error) {
      console.error(error);
      toastAlerts.showError(
        "Hubo un error al guardar los datos del empleado, recargue la página e intente nuevamente"
      );
    }
  }

  function handleCancel() {
    setFormData(employeeData);
    setEditing(false);
  }

  useEffect(() => {
    setFormData(employeeData);
  }, [employeeData]);

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex flex-col w-full">
              <label className="text-sm text-gray-500">Usuario</label>
              <input
                name="user_id"
                type="text"
                value={formData.user_id || ""}
                onChange={handleChange}
                className="bg-transparent text-black focus:outline-none hover:border-b hover:border-emerald-500 pb-1"
              />
            </div>
            <div className="flex flex-col w-full">
              <label className="text-sm text-gray-500">Password</label>
              <button
                className="cursor-pointer bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                onClick={handleOpenChangePassword}
              >
                Cambiar contraseña
              </button>
            </div>
          </div>

          <HasPermission id={PermissionIds.ASIGNACION_ROLES_CARGA}>
            <div className="flex flex-col w-full">
              <label className="text-sm text-gray-500">Rol</label>
              <RelationalInput
                options={mappedRoles}
                value={
                  mappedRoles.find((r) => r.value === formData.role_id) || null
                }
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    role_id: selected?.value || "",
                    role_name: selected?.label || "",
                  }));
                  setEditing(true);
                }}
                resourceUrl="/sigrh/roles"
                onCrearNuevo={() =>
                  toastAlerts.showInfo("Abrir modal para crear nuevo rol")
                }
              />
            </div>
          </HasPermission>
        </div>
      </div>

      {editing && (
        <div className="flex justify-start gap-4 mt-4">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
          >
            Guardar Cambios
          </button>
        </div>
      )}

      <EmployeeChangePasswordModal
        employeeId={employeeData.id}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
