"use client";
import { useState } from "react";
import axios from "axios";
import config from "@/config";
import Cookies from "js-cookie";
import { toastAlerts } from "@/utils/toastAlerts";

export default function EmployeeChangePasswordModal({
  employeeId,
  open,
  onClose,
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const token = Cookies.get("token");

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toastAlerts.showError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${config.API_URL}/employees/change_password`,
        { password, employee_id: employeeId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toastAlerts.showSuccess("Contraseña cambiada exitosamente");
      setPassword("");
      setConfirmPassword("");
      onClose();
    } catch (err) {
      console.error(err);
      toastAlerts.showError(
        "Hubo un error al cambiar la contraseña, recargue la página e intente nuevamente"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo oscuro detrás del modal */}
      <div className="absolute inset-0 bg-black opacity-50 z-40"></div>

      {/* Contenido del modal */}
      <div className="relative z-50 bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Cambiar contraseña</h2>
        <input
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            onClick={handleSubmit}
            disabled={loading}
          >
            Cambiar
          </button>
        </div>
      </div>
    </div>
  );
}
