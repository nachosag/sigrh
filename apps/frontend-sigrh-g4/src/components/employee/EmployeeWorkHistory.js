import { useState } from "react";
import axios from "axios";
import config from "@/config";
import Select from "react-select";
import { useJob } from "@/hooks/useJob";
import { MdOutlineModeEdit, MdDeleteOutline } from "react-icons/md";
import { toastAlerts } from "@/utils/toastAlerts";

export default function EmployeeWorkHistory({ employeeData }) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingHistory, setEditingHistory] = useState(null);
  const [workHistoryList, setWorkHistoryList] = useState(
    employeeData?.work_histories || []
  );
  const { jobs, loading, error } = useJob();

  const [formData, setFormData] = useState({
    job_title: "",
    company_name: "",
    from_date: "",
    to_date: "",
    notes: "",
  });

  const openAddModal = () => {
    setFormData({
      job_title: "",
      company_name: "",
      from_date: "",
      to_date: "",
      notes: "",
    });
    setEditingHistory(null);
    setIsOpenModal(true);
  };

  const openEditModal = (history) => {
    setFormData({
      job_id: history.job_id, // <-- AGREGAR ESTA LÍNEA
      job_title: history.job_title,
      company_name: history.company_name,
      from_date: history.from_date,
      to_date: history.to_date,
      notes: history.notes,
    });
    setEditingHistory(history);
    setIsOpenModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHistory) {
        // Editar (PATCH)
        const response = await axios.patch(
          `${config.API_URL}/work-history/${employeeData.id}/${editingHistory.id}`,
          formData
        );
        const updated = response.data;
        setWorkHistoryList((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
      } else {
        // Agregar (POST)
        const response = await axios.post(
          `${config.API_URL}/work-history/${employeeData.id}`,
          formData
        );
        const newHistory = response.data;
        setWorkHistoryList((prev) => [...prev, newHistory]);
      }
      setIsOpenModal(false);
    } catch (error) {
      toastAlerts.showError(
        "Hubo un error al guardar la historia laboral. Por favor, inténtalo de nuevo."
      );
      console.error(error);
    }
  };

  const handleDelete = async (historyId) => {
    const confirmDelete = confirm(
      "¿Estás seguro de que deseas eliminar esta historia laboral?"
    );
    if (!confirmDelete) return;
    try {
      await axios.delete(
        `${config.API_URL}/work-history/${employeeData.id}/${historyId}`
      );
      setWorkHistoryList((prev) =>
        prev.filter((item) => item.id !== historyId)
      );
    } catch (error) {
      toastAlerts.showError(
        "Hubo un error al eliminar la historia laboral. Por favor, inténtalo de nuevo."
      );
      console.error(error);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={openAddModal}
        className="px-4 py-2 bg-emerald-500 rounded-full text-white text-sm font-semibold flex items-center gap-2"
      >
        + Agregar
      </button>

      <table className="min-w-full table-auto mt-4">
        <thead className="bg-emerald-50">
          <tr>
            <th className="py-2 px-4 text-left text-sm font-medium text-emerald-700">
              Título de Trabajo
            </th>
            <th className="py-2 px-4 text-left text-sm font-medium text-emerald-700">
              Compañía
            </th>
            <th className="py-2 px-4 text-left text-sm font-medium text-emerald-700">
              Fecha de Inicio
            </th>
            <th className="py-2 px-4 text-left text-sm font-medium text-emerald-700">
              Fecha de Fin
            </th>
            <th className="py-2 px-4 text-left text-sm font-medium text-emerald-700">
              Notas
            </th>
            <th className="py-2 px-4 text-left text-sm font-medium text-emerald-700">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {workHistoryList.map((history) => (
            <tr
              key={history.id}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-2">
                {jobs.find((job) => job.id === history.job_id)?.name ||
                  history.job_title}
              </td>
              <td className="px-4 py-2">{history.company_name}</td>
              <td className="px-4 py-2">{history.from_date}</td>
              <td className="px-4 py-2">{history.to_date}</td>
              <td className="px-4 py-2">{history.notes}</td>
              <td className="px-4 py-2 flex gap-2">
                <button
                  onClick={() => openEditModal(history)}
                  className="px-2 py-1 text-emerald-500 cursor-pointer"
                >
                  <MdOutlineModeEdit />
                </button>
                <button
                  onClick={() => handleDelete(history.id)}
                  className="px-2 py-1 text-red-500 cursor-pointer"
                >
                  <MdDeleteOutline />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isOpenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">
              {editingHistory
                ? "Editar Historia Laboral"
                : "Agregar Historia Laboral"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Select
                options={jobs.map((job) => ({
                  value: job.id,
                  label: job.name,
                }))}
                value={
                  jobs.find((job) => job.id === formData.job_id)
                    ? {
                        value: formData.job_id,
                        label: jobs.find((job) => job.id === formData.job_id)
                          .name,
                      }
                    : null
                }
                onChange={(selectedOption) =>
                  setFormData((prev) => ({
                    ...prev,
                    job_id: selectedOption ? selectedOption.value : "",
                  }))
                }
                placeholder="Selecciona un título de trabajo"
                isClearable
              />

              <input
                type="text"
                name="company_name"
                placeholder="Compañía"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full border border-emerald-300 p-2 rounded"
                required
              />
              <input
                type="date"
                name="from_date"
                placeholder="Fecha de Inicio"
                value={formData.from_date}
                onChange={handleChange}
                className="w-full border border-emerald-300 p-2 rounded"
                required
              />
              <input
                type="date"
                name="to_date"
                placeholder="Fecha de Fin"
                value={formData.to_date}
                onChange={handleChange}
                className="w-full border border-emerald-300 p-2 rounded"
              />
              <textarea
                name="notes"
                placeholder="Notas"
                value={formData.notes}
                onChange={handleChange}
                className="w-full border border-emerald-300 p-2 rounded"
              ></textarea>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="px-4 py-2 bg-emerald-300 rounded-full"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 text-white rounded-full"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
