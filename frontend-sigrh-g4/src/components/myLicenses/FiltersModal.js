import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";

export default function FiltersModal({
  open,
  onClose,
  onApply,
  initialFilters = {},
}) {
  const [licensesTypes, setLicensesTypes] = useState([]);
  const [typeSelected, setTypeSelected] = useState(initialFilters.type || "");
  const [statusSelected, setStatusSelected] = useState(
    initialFilters.status || ""
  );
  const [month, setMonth] = useState(initialFilters.month || "");
  const [year, setYear] = useState(initialFilters.year || "");
  const token = Cookies.get("token");

  // Cuando cambian los filtros iniciales (por ejemplo, al reabrir el modal), actualiza los estados
  useEffect(() => {
    setTypeSelected(initialFilters.type || "");
    setStatusSelected(initialFilters.status || "");
    setMonth(initialFilters.month || "");
    setYear(initialFilters.year || "");
  }, [initialFilters, open]);

  useEffect(() => {
    if (open) {
      axios
        .get(`${config.API_URL}/leaves/types`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setLicensesTypes(res.data))
        .catch(() => setLicensesTypes([]));
    }
  }, [open, token]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50"></div>
      <div className="relative bg-white p-6 rounded-lg shadow-lg w-[90vw] max-w-md z-10">
        <h2 className="text-xl font-bold text-emerald-700 mb-4">
          Filtrar Licencias
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onApply({
              type: typeSelected,
              status: statusSelected,
              month,
              year,
            });
            onClose();
          }}
        >
          {/* Tipo de licencia */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">Tipo de licencia</label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={typeSelected}
              onChange={(e) => setTypeSelected(e.target.value)}
            >
              <option value="">Todas</option>
              {licensesTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.type}
                </option>
              ))}
            </select>
          </div>
          {/* Estado de aceptación */}
          <div className="mb-4">
            <label className="block mb-1 font-semibold">
              Estado de aceptación
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={statusSelected}
              onChange={(e) => setStatusSelected(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="ACEPTADO">Aceptado</option>
              <option value="RECHAZADO">Rechazado</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>
          {/* Mes y año */}
          <div className="mb-4 flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 font-semibold">
                Mes de solicitud
              </label>
              <input
                type="number"
                min="1"
                max="12"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="MM"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold">
                Año de solicitud
              </label>
              <input
                type="number"
                min="2000"
                max={new Date().getFullYear()}
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="AAAA"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded-full bg-red-400 hover:bg-red-500 text-white"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
