"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config";
import Cookies from "js-cookie";
import { MdOutlineModeEdit, MdDeleteOutline } from "react-icons/md";
import { toastAlerts } from "@/utils/toastAlerts";

export default function AttendanceChecksEventsDetailsModal({
  open,
  employeeId,
  employeeData,
  fecha,
  onClose,
  onFichadasChanged,
}) {
  const [fichadas, setFichadas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    event_date: "",
    event_type: "in",
  });

  const token = Cookies.get("token");

  const fetchFichadas = async () => {
    if (!open || !employeeId || !fecha) return;
    setLoading(true);
    try {
      const res = await axios.get(`${config.API_URL}/clock_events`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { employee_id: employeeId, fecha },
      });
      setFichadas(res.data);
    } catch {
      toastAlerts.showError(
        "Hubo un error al obtener las fichadas, recargue la página e intente nuevamente"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && fecha && !editingId) {
      // Formateamos a yyyy-MM-ddTHH:mm para el input datetime-local
      const defaultDateTime = `${fecha}T00:00`; // o la hora que quieras por defecto
      setFormData((prev) => ({
        ...prev,
        event_date: defaultDateTime,
      }));
    }
  }, [open, fecha, editingId]);

  useEffect(() => {
    if (!open) {
      setEditingId(null);
      setFormData({
        event_date: "",
        event_type: "in",
      });
      setFichadas([]);
    }
  }, [open]);

  useEffect(() => {
    fetchFichadas();
  }, [open, employeeId, fecha]);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar fichada?")) return;
    try {
      await axios.delete(`${config.API_URL}/clock_events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFichadas();
      onFichadasChanged();
    } catch {
      toastAlerts.showError(
        "Hubo un error al eliminar la fichada, recargue la página e intente nuevamente"
      );
    }
  };

  const handleEdit = (fichada) => {
    setEditingId(fichada.id);
    setFormData({
      event_date: fichada.event_date.slice(0, 19), // yyyy-mm-ddThh:mm:ss
      event_type: fichada.event_type,
    });
    onFichadasChanged();
  };

  const handleUpdate = async () => {
    try {
      await axios.patch(
        `${config.API_URL}/clock_events/${editingId}`,
        {
          employee_id: employeeId,
          ...formData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      fetchFichadas();
      onFichadasChanged();
    } catch {
      toastAlerts.showError(
        "Hubo un error al actualizar la fichada, recargue la página e intente nuevamente"
      );
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(
        `${config.API_URL}/clock_events`,
        {
          employee_id: employeeId,
          ...formData,
          source: "portal-web",
          device_id: "portal-web",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormData({ event_date: "", event_type: "in" });
      fetchFichadas();
      onFichadasChanged();
    } catch {
      toastAlerts.showError(
        "Hubo un error al crear la fichada, recargue la página e intente nuevamente"
      );
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold mb-4">
          Fichadas {`${employeeData.first_name} ${employeeData.last_name}`} (
          {new Date(fecha + "T12:00:00").toLocaleDateString()})
        </h2>

        {/* Formulario nueva fichada */}
        <div className="flex gap-2 mb-4">
          <input
            type="datetime-local"
            value={formData.event_date}
            onChange={(e) =>
              setFormData((p) => ({ ...p, event_date: e.target.value }))
            }
            className="border border-gray-300 px-3 py-2 rounded w-full text-sm"
          />
          <select
            value={formData.event_type}
            onChange={(e) =>
              setFormData((p) => ({ ...p, event_type: e.target.value }))
            }
            className="border border-gray-300 px-3 py-2 rounded text-sm"
          >
            <option value="in">Entrada</option>
            <option value="out">Salida</option>
          </select>
          {editingId ? (
            <button
              onClick={handleUpdate}
              className="bg-amber-500 text-white px-4 py-2 rounded text-sm"
            >
              Actualizar
            </button>
          ) : (
            <button
              onClick={handleCreate}
              className="bg-emerald-500 text-white px-4 py-2 rounded text-sm"
            >
              Agregar
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Cargando...</p>
        ) : fichadas.length > 0 ? (
          <ul className="space-y-2 max-h-[300px] overflow-y-auto">
            {fichadas.map((f) => (
              <li
                key={f.id}
                className="border border-gray-300 p-2 rounded text-sm flex justify-between items-center"
              >
                <div>
                  <span className="block">
                    {new Date(f.event_date).toLocaleTimeString("es-AR", {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span
                    className={
                      f.event_type === "in"
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold"
                    }
                  >
                    {f.event_type === "in" ? "Entrada" : "Salida"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(f)}
                    className="text-gray-400 hover:underline text-xs"
                  >
                    <MdOutlineModeEdit className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="text-red-500 hover:underline text-xs"
                  >
                    <MdDeleteOutline className="w-6 h-6" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">Sin fichadas encontradas</p>
        )}
      </div>
    </div>
  );
}
