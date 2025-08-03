"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import config from "@/config";
import Cookies from "js-cookie";
import { FaWandMagicSparkles } from "react-icons/fa6";
import PostulationsTable from "./postulationsTable";
import { toastAlerts } from "@/utils/toastAlerts";

export default function PostulationsContainer({ jobOpportunityId }) {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const token = Cookies.get("token");

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleEvaluateCVs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${config.API_URL}/matcher/${jobOpportunityId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status !== 200) throw new Error("Error al procesar los CVs");
    } catch (error) {
      console.error("Error al procesar los CVs:", error);
      toastAlerts.showError(
        "Hubo un error al evaluar los CVs, recargue la página e intente nuevamente"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="p-4">
        {/* Contenedor de filtros, buscador y botón */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          {/* Botón para evaluar CVs */}
          <button
            onClick={handleEvaluateCVs}
            className="flex items-center gap-2 px-4 py-2 cursor-pointer text-white rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 hover:from-indigo-600 hover:to-teal-500 transition-all"
          >
            <FaWandMagicSparkles />
            Evaluar CVs con IA
          </button>

          {/* Buscador */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            className="px-4 py-2 border border-gray-300 rounded-full w-80 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="🔍︎ Buscar por nombre o apellido..."
          />

          {/* Barra de filtro */}
          <div className="flex justify-center">
            <div className="bg-gray-200 rounded-full p-1 flex">
              <button
                onClick={() => handleFilterChange("all")}
                className={`px-4 py-2 rounded-full transition-all duration-300 ease-in-out ${
                  filter === "all"
                    ? "bg-emerald-500 text-white"
                    : "text-gray-700"
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => handleFilterChange("aptas")}
                className={`px-4 py-2 rounded-full transition-all duration-300 ease-in-out ${
                  filter === "aptas"
                    ? "bg-emerald-500 text-white"
                    : "text-gray-700"
                }`}
              >
                Aptas
              </button>
              <button
                onClick={() => handleFilterChange("no_aptas")}
                className={`px-4 py-2 rounded-full transition-all duration-300 ease-in-out ${
                  filter === "no_aptas"
                    ? "bg-emerald-500 text-white"
                    : "text-gray-700"
                }`}
              >
                No Aptas
              </button>
            </div>
          </div>
        </div>

        {/* Mostrar "Cargando" o la tabla */}
        {loading ? (
          <div className="flex flex-col gap-2 justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-500 border-solid"></div>
            <span className="ml-4 text-emerald-500 font-bold">Cargando...</span>
          </div>
        ) : (
          <PostulationsTable
            jobOpportunityId={jobOpportunityId}
            searchInput={searchTerm}
            filter={filter}
          />
        )}
      </div>
    </div>
  );
}
