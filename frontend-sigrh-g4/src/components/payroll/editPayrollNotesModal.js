"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config";
import { toastAlerts } from "@/utils/toastAlerts";

export default function EditPayrollNotesModal({
  isOpen,
  onClose,
  onSave,
  initialNote,
  recordId,
}) {
  const [note, setNote] = useState("");

  const handleSave = async () => {
    try {
      const res = await axios.patch(
        `${config.API_URL}/employee_hours/${recordId}`,
        {
          notes: note,
        }
      );

      if (res.status === 200) {
        onSave(); // para recargar los datos
        onClose();
      } else {
        throw new Error("Error al actualizar nota");
      }
    } catch (error) {
      console.error("Error al guardar la nota:", error);
      toastAlerts.showError(
        "Hubo un error al guardar la nota, intente nuevamente"
      );
    }
  };

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg w-[90%] max-w-md shadow-lg">
        <h2 className="text-lg font-bold mb-4">Editar Nota</h2>
        <textarea
          value={note || ""}
          onChange={(e) => setNote(e.target.value)}
          rows={5}
          className="w-full border rounded p-2 text-sm"
        />
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
