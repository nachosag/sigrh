"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config";
import Cookies from "js-cookie";
import { toastAlerts } from "@/utils/toastAlerts";

export default function JobModal({ job, onClose, onSuccess }) {
  const [formData, setFormData] = useState({ name: "", sector_id: "" });
  const [sectores, setSectores] = useState([]);
  const token = Cookies.get("token");

  const isEdit = !!job;

  useEffect(() => {
    if (job) {
      setFormData({ name: job.name, sector_id: job.sector_id });
    }
  }, [job]);

  useEffect(() => {
    const fetchSectores = async () => {
      try {
        const res = await axios.get(`${config.API_URL}/sectors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSectores(res.data);
      } catch {
        toastAlerts.showError(
          "Hubo un error al obtener los sectores, recargue la página e intente nuevamente"
        );
        console.error("Error al obtener sectores");
      }
    };
    fetchSectores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await axios.patch(`${config.API_URL}/jobs/${job.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${config.API_URL}/jobs/create`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onSuccess();
    } catch (err) {
      console.error("Error al guardar el puesto:", err);
      toastAlerts.showError(
        "Hubo un error al guardar el puesto, recargue la página e intente nuevamente"
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Fondo oscuro detrás del modal */}
      <div className="absolute inset-0 bg-black opacity-50 z-40"></div>

      {/* Contenido del modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-1/3 h-auto overflow-y-auto p-6 border border-gray-300 z-50">
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Editar Puesto" : "Nuevo Puesto"}
        </h2>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre del puesto"
          className="w-full mb-4 px-4 py-2 border border-gray-100 rounded"
        />
        <select
          name="sector_id"
          value={formData.sector_id}
          onChange={handleChange}
          className="w-full mb-4 px-4 py-2 border border-gray-100 rounded"
        >
          <option value="">Seleccionar sector</option>
          {sectores.map((sector) => (
            <option key={sector.id} value={sector.id}>
              {sector.name}
            </option>
          ))}
        </select>

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
