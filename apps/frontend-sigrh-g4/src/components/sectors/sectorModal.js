"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config";
import Cookies from "js-cookie";
import { toastAlerts } from "@/utils/toastAlerts";

export default function SectorModal({ sector, onClose, onSuccess }) {
  const [name, setName] = useState("");
  const token = Cookies.get("token");

  const isEdit = !!sector;

  useEffect(() => {
    if (isEdit) {
      setName(sector.name);
    }
  }, [sector]);

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await axios.patch(
          `${config.API_URL}/sectors/${sector.id}`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${config.API_URL}/sectors/create`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      onSuccess();
    } catch {
      toastAlerts.showError(
        `Hubo un error al ${isEdit ? "editar" : "crear"} el sector, recargue la página e intente nuevamente`
      );
      console.error(
        `Error al ${isEdit ? "editar" : "crear"} el sector:`,
        error
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50 z-40"></div>
      <div className="relative bg-white rounded-lg shadow-lg w-1/3 h-auto p-6 z-50 border border-gray-300">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Editar Sector" : "Nuevo Sector"}
        </h2>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del sector"
          className="w-full mb-4 px-4 py-2 border rounded"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
