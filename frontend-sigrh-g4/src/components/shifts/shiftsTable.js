"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import { MdVisibility } from "react-icons/md";
import ShiftModal from "./shiftsModal";
import { toastAlerts } from "@/utils/toastAlerts";

export default function ShiftsTable() {
  const [shifts, setShifts] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const token = Cookies.get("token");

  const fetchShifts = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/shift`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShifts(res.data);
    } catch {
      console.error("Error al obtener los turnos");
      toastAlerts.showError(
        "Hubo un error al obtener los turnos, recargue la página e intente nuevamente"
      );
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">⏰ Turnos</h1>
      <div className="overflow-x-auto rounded-lg max-h-[70vh] overflow-y-auto">
        <table className="min-w-full bg-white text-xs">
          <thead className="bg-emerald-50  sticky top-0 ">
            <tr className="text-emerald-700 font-semibold">
              <th className="py-2 px-4 text-left  ">ID</th>
              <th className="py-2 px-4 text-left  ">Descripcion</th>
              <th className="py-2 px-4 text-left  ">Tipo</th>
              <th className="py-2 px-4 text-left  ">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length > 0 ? (
              shifts.map((shift) => (
                <tr
                  key={shift.id}
                  className="border-b border-gray-100 hover:bg-gray-50 text-gray-700"
                >
                  <td
                    className="py-2 px-4  cursor-pointer"
                    onClick={() => setSelectedShift(shift)}
                  >
                    {shift.id}
                  </td>
                  <td
                    className="py-2 px-4  cursor-pointer"
                    onClick={() => setSelectedShift(shift)}
                  >
                    {shift.description}
                  </td>
                  <td
                    className="py-2 px-4  cursor-pointer"
                    onClick={() => setSelectedShift(shift)}
                  >
                    {shift.type}
                  </td>
                  <td className="py-2 px-4 ">
                    <button
                      onClick={() => setSelectedShift(shift)}
                      className="flex items-center gap-1  bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full"
                    >
                      <MdVisibility /> Ver detalles
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No se encontraron shifts.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedShift && (
        <ShiftModal
          shift={selectedShift}
          onClose={() => setSelectedShift(null)}
        />
      )}
    </div>
  );
}
