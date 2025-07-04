"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import { FaPlus } from "react-icons/fa";
import Modal from "./jobModal"; // nuevo componente modal
import { MdDeleteOutline, MdOutlineModeEdit } from "react-icons/md";
import { toastAlerts } from "@/utils/toastAlerts";

export default function JobsTable() {
  const [jobs, setJobs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const token = Cookies.get("token");

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(res.data);
    } catch (error) {
      toastAlerts.showError(
        "Hubo un error al obtener los puestos de trabajo, recargue la página e intente nuevamente"
      );
      console.error("Error al obtener puestos de trabajo:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este puesto?")) return;
    try {
      await axios.delete(`${config.API_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchJobs();
    } catch (err) {
      toastAlerts.showError(
        "Hubo un error al eliminar el puesto, recargue la página e intente nuevamente"
      );
      console.error("Error al eliminar puesto:", err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">💼 Puestos de Trabajo</h1>
        <button
          onClick={() => {
            setEditingJob(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm"
        >
          <FaPlus /> Agregar
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg max-h-[70vh] overflow-y-auto">
        <table className="min-w-full bg-white text-xs">
          <thead className="bg-gray-100 sticky top-0">
            <tr className="text-emerald-700 bg-emerald-50 font-semibold">
              <th className="py-2 px-4 text-left">ID</th>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Sector</th>
              <th className="py-2 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-b border-gray-100 hover:bg-gray-50 text-gray-700"
                >
                  <td className="py-2 px-4 text-sm">{job.id}</td>
                  <td className="py-2 px-4 text-sm">{job.name}</td>
                  <td className="py-2 px-4 text-sm">
                    {job.sector?.name || "-"}
                  </td>
                  <td className="py-2 px-4 text-sm text-center flex gap-3 justify-center">
                    <button
                      className="cursor-pointer text-emerald-500 hover:text-emerald-600"
                      onClick={() => {
                        setEditingJob(job);
                        setModalOpen(true);
                      }}
                    >
                      <MdOutlineModeEdit />
                    </button>
                    <button
                      className="cursor-pointer text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(job.id)}
                    >
                      <MdDeleteOutline />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No se encontraron puestos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <Modal
          job={editingJob}
          onClose={() => {
            setModalOpen(false);
            setEditingJob(null);
          }}
          onSuccess={() => {
            fetchJobs();
            setModalOpen(false);
            setEditingJob(null);
          }}
        />
      )}
    </div>
  );
}
