"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import { FaPlus } from "react-icons/fa";
import { MdDeleteOutline, MdOutlineModeEdit } from "react-icons/md";
import SectorModal from "./sectorModal";
import { toastAlerts } from "@/utils/toastAlerts";

export default function SectorsTable() {
  const [sectors, setSectors] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSector, setEditingSector] = useState(null);
  const token = Cookies.get("token");

  const fetchSectors = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/sectors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSectors(res.data);
    } catch {
      console.error("Error al obtener los sectores");
      toastAlerts.showError(
        "Hubo un error al obtener los sectores, recargue la página e intente nuevamente"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este sector?")) return;
    try {
      await axios.delete(`${config.API_URL}/sectors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSectors();
    } catch {
      console.error("Error al eliminar el sector");
      toastAlerts.showError(
        "Hubo un error al eliminar el sector, recargue la página e intente nuevamente"
      );
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">🏢 Sectores</h1>
        <button
          onClick={() => {
            setEditingSector(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full "
        >
          <FaPlus /> Agregar
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg max-h-[70vh] overflow-y-auto">
        <table className="min-w-full bg-white text-xs">
          <thead className="bg-emerald-50 sticky top-0">
            <tr className="text-emerald-700 font-semibold">
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sectors.length > 0 ? (
              sectors.map((sector) => (
                <tr
                  key={sector.id}
                  className="border-b border-gray-100 hover:bg-gray-50 text-gray-700"
                >
                  <td className="py-2 px-4 ">{sector.id}</td>
                  <td className="py-2 px-4 ">{sector.name}</td>
                  <td className="py-2 px-4  text-center flex gap-3 justify-center">
                    <button
                      className="cursor-pointer text-emerald-500 hover:text-emerald-600"
                      onClick={() => {
                        setEditingSector(sector);
                        setModalOpen(true);
                      }}
                    >
                      <MdOutlineModeEdit />
                    </button>
                    <button
                      className="cursor-pointer text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(sector.id)}
                    >
                      <MdDeleteOutline />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No se encontraron sectores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <SectorModal
          sector={editingSector}
          onClose={() => {
            setModalOpen(false);
            setEditingSector(null);
          }}
          onSuccess={() => {
            fetchSectors();
            setModalOpen(false);
            setEditingSector(null);
          }}
        />
      )}
    </div>
  );
}
