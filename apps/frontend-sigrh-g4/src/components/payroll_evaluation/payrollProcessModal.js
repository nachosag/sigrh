"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config";
import Cookies from "js-cookie";
import { useEmployees } from "@/hooks/useEmployees";
import { toastAlerts } from "@/utils/toastAlerts";
import FormAlert from "../customsAlerts/formAlert";

export default function ProcessPayrollModal({
  open,
  onClose,
  defaultEmployeeId,
  defaultStartDate,
  defaultEndDate,
}) {
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId || "");
  const [startDate, setStartDate] = useState(defaultStartDate || "");
  const [endDate, setEndDate] = useState(defaultEndDate || "");
  const token = Cookies.get("token");
  const { employees } = useEmployees();
  const [openFormAlert, setOpenFormAlert] = useState(false);
  const [formAlertMessage, setFormAlertMessage] = useState("");

  useEffect(() => {
    setEmployeeId(defaultEmployeeId || "");
    setStartDate(defaultStartDate || "");
    setEndDate(defaultEndDate || "");
  }, [defaultEmployeeId, defaultStartDate, defaultEndDate]);

  const handleProcess = async () => {
    if (!employeeId || !startDate || !endDate) {
      setFormAlertMessage("Complete todos los campos.");
      setOpenFormAlert(true);
      return;
    }

    if (!startDate || !endDate) {
      setFormAlertMessage("Seleccione un rango de fechas.");
      setOpenFormAlert(true);
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setFormAlertMessage("La fecha inicial no puede ser mayor a la final.");
      setOpenFormAlert(true);
      return;
    }

    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    if (endDate > today) {
      setFormAlertMessage("La fecha final no puede ser futura.");
      setOpenFormAlert(true);
      return;
    }

    try {
      await axios.post(
        `${config.API_URL}/payroll/calculate`,
        {
          employee_id: parseInt(employeeId),
          start_date: startDate,
          end_date: endDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toastAlerts.showSuccess("Horas procesadas correctamente");
      onClose();
    } catch (error) {
      console.error(error);
      toastAlerts.showError(
        "Hubo un error al procesar las horas, recargue la página e intente nuevamente"
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo oscuro detrás del modal */}
      <div className="absolute inset-0 bg-black opacity-50 z-40"></div>

      {/* Contenido del modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-1/3 h-auto overflow-y-auto p-6 border border-gray-300 z-50">
        <h2 className="text-lg font-semibold mb-4">Procesar Horas</h2>

        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          className="w-full mb-3 border border-gray-300 rounded px-3 py-2"
        >
          <option value="">Seleccione empleado</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.first_name} {emp.last_name} #{emp.user_id}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full mb-3 border border-gray-300 rounded px-3 py-2"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full mb-4 border border-gray-300 rounded px-3 py-2"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded-full"
          >
            Cancelar
          </button>
          <button
            onClick={handleProcess}
            className="bg-blue-600 text-white px-4 py-2 rounded-full"
          >
            Procesar
          </button>
        </div>

        <FormAlert
          open={openFormAlert}
          onClose={() => setOpenFormAlert(false)}
          message={formAlertMessage}
        />
      </div>
    </div>
  );
}
