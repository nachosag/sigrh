"use client";

import { FaFilter } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import JobOpportunityCard from "./jobOpportunityCard";
import JobOpportunityOptions from "./jobOpportunityOptions";
import JobOpportunitiesFilter from "./jobOpportunitiesFilter";
import config from "@/config";
import axios from "axios";
import Cookies from "js-cookie";
import { toastAlerts } from "@/utils/toastAlerts";

export default function JobOpportunityTable() {
  const [searchTerm, setSearchTerm] = useState(""); // Para guardar lo que se escribe en el buscador
  const [currentPage, setCurrentPage] = useState(0); // Indica la página actual
  const [isAdding, setIsAdding] = useState(false); // Para abrir y cerrar la pantalla de agregar una nueva convocatoria
  const [isEditing, setIsEditing] = useState(false); // Para abrir y cerrar la pantalla de editar una convocatoria
  const [isFiltering, setIsFiltering] = useState(false); // Para abrir y cerrar la pantalla de filtros
  const [selectedJobOpportunityTitle, setSelectedJobOpportunityTitle] =
    useState(""); // Para guardar el título de la convocatoria seleccionada
  const token = Cookies.get("token");
  const [workModeFilter, setWorkModeFilter] = useState(""); // Para guardar el filtro de modalidad
  const [countryFilter, setCountryFilter] = useState(""); // Para guardar el filtro de país
  const [stateFilter, setStateFilter] = useState(""); // Para guardar el filtro de estado
  const [jobOpportunities, setJobOpportunities] = useState([]); // Para guardar las convocatorias que se traen de la API
  const [filteredjobOportunity, setFilteredjobOportunity] =
    useState(jobOpportunities); // Para guardar las convocatorias que quedaron después de filtrar
  const [states, setStates] = useState([]); // Guardar los estados obtenidos de la API

  function onModifyjobOpportunity(jobOpportunity) {
    setSelectedJobOpportunityTitle(jobOpportunity.title);
    setIsEditing(true); // Abre la pantalla de editar convocatoria
  }

  const itemsPerPage = 3;
  const totalPages = Math.ceil(filteredjobOportunity.length / itemsPerPage); // Variable para guardar el total de páginas

  // Variable para guardar las convocatorias que se ven en la pantalla
  const currentjobOportunity = filteredjobOportunity.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    setSearchTerm(searchTerm);
  };

  const handleFilter = (filters) => {
    setCountryFilter(filters.country || "");
    setWorkModeFilter(filters.modality || "");
    setStateFilter(filters.state || "");

    setIsFiltering(false); // Cierra el modal de filtros
  };

  const showResults = () => {
    const filtered = jobOpportunities.filter((jobOpportunity) => {
      const jobCountryId = states.find(
        (state) => state.id === jobOpportunity.state_id
      )?.country_id;

      return (
        jobOpportunity.title
          .toLowerCase()
          .includes(searchTerm.toLocaleLowerCase()) &&
        (workModeFilter === "" ||
          jobOpportunity.work_mode.toLowerCase() ===
            workModeFilter.toLowerCase()) &&
        (countryFilter === "" || jobCountryId === parseInt(countryFilter)) &&
        (stateFilter === "" || jobOpportunity.status === stateFilter)
      );
    });

    setFilteredjobOportunity(filtered);
    setCurrentPage(0); // Reinicia la paginación al aplicar filtros o búsqueda
  };

  useEffect(() => {
    showResults();
  }, [searchTerm, workModeFilter, countryFilter, stateFilter]);

  useEffect(() => {
    setFilteredjobOportunity(jobOpportunities); // Sincroniza los estados
  }, [jobOpportunities]);

  const fetchJobOpportunities = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/opportunities`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status != 200)
        throw new Error("Error al traer las convocatorias");

      setJobOpportunities(res.data);
    } catch (e) {
      console.error(e);
      toastAlerts.showError(
        "Hubo un error al obtener las convocatorias, recargue la página e intente nuevamente"
      );
    }
  };

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/states`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status !== 200) throw new Error("Error al traer los estados");

      setStates(res.data);
    } catch (e) {
      console.error(e);
      toastAlerts.showError(
        "Hubo un error al obtener los estados, recargue la página e intente nuevamente"
      );
    }
  };

  useEffect(() => {
    fetchJobOpportunities();
    fetchStates();
  }, []);

  const handleCreateJobOpportunityForm = async (jobOpportunityNewData) => {
    try {
      const payload = {
        owner_employee_id: null,
        status: jobOpportunityNewData.status || "activo",
        work_mode: jobOpportunityNewData.work_mode.toLowerCase() || "remoto",
        title: jobOpportunityNewData.title || "", //
        description: jobOpportunityNewData.description || "",
        budget: jobOpportunityNewData.budget || 1,
        budget_currency_id: jobOpportunityNewData.budget_currency_id || "USD",
        state_id: jobOpportunityNewData.state_id || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        required_abilities: (
          jobOpportunityNewData.required_abilities || []
        ).map((ability) => ({
          name: ability.name || "",
          description: ability.description || "",
          id: ability.id || 0,
        })),
        desirable_abilities: (
          jobOpportunityNewData.desirable_abilities || []
        ).map((ability) => ({
          name: ability.name || "",
          description: ability.description || "",
          id: ability.id || 0,
        })),
        required_skill_percentage:
          jobOpportunityNewData.requiredPercentage || 0,
        desirable_skill_percentage:
          jobOpportunityNewData.desirablePercentage || 0,
      };

      const res = await axios.post(
        `${config.API_URL}/opportunities/create`,
        JSON.stringify(payload),
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status != 201) throw new Error("Error al crear la convocatoria");

      toastAlerts.showSuccess("Convocatoria creada exitosamente");
    } catch (e) {
      console.error(e);
      toastAlerts.showError(
        "Hubo un error al crear la convocatoria, recargue la página e intente nuevamente"
      );
    }

    setIsAdding(false);
    fetchJobOpportunities(); // Refresca la lista de convocatorias después de crear una nueva
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4 mt-6">
        <div className="flex gap-2 items-center">
          <h1 className="text-2xl text-gray-800 font-bold cursor-default">
            Convocatorias 💼
          </h1>
          <button
            className="px-4 py-2 bg-emerald-500 rounded-full font-semibold text-white mt-2 hover:bg-emerald-600"
            onClick={() => {
              setIsAdding(true);
            }}
          >
            + Agregar
          </button>
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-6 py-3 border border-gray-300 rounded-full w-80 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="🔍︎ Buscar por nombre..."
        />

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full text-emerald-500 border-2 border-emerald-500 font-semibold"
          onClick={() => setIsFiltering(true)}
        >
          <FaFilter />
          Filtros
        </button>
      </div>

      {/* Para mostrar todas las convocatorias en pantalla */}
      <div className="h-[70vh] overflow-y-auto grid grid-cols-1 gap-4">
        {currentjobOportunity.map((jobOpportunity, index) => (
          <JobOpportunityCard
            key={index}
            jobOpportunity={jobOpportunity}
            onModify={() => onModifyjobOpportunity(jobOpportunity)} // Envolver en una función anónima
          />
        ))}
      </div>

      {filteredjobOportunity.length === 0 && (
        <div className="flex justify-center items-center mt-8 text-gray-500 text-lg">
          No se encontraron convocatorias que coincidan con tu búsqueda.
        </div>
      )}

      {/* Botones para elegir la pagina actual */}
      <div className="flex justify-center items-center mt-4 gap-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-md ${
            currentPage === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
        >
          Anterior
        </button>
        <span className="text-sm text-gray-600">
          Página {totalPages != 0 ? currentPage + 1 : currentPage} de{" "}
          {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          className={`px-4 py-2 rounded-md ${
            currentPage === totalPages - 1 || totalPages === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-emerald-500 text-white hover:bg-emerald-600"
          }`}
        >
          Siguiente
        </button>

        {isAdding && (
          <JobOpportunityOptions
            isAdding={isAdding}
            onClose={() => setIsAdding(false)}
            onSave={handleCreateJobOpportunityForm}
          />
        )}

        {isFiltering && (
          <div className="mb-4">
            <JobOpportunitiesFilter
              onFilter={handleFilter}
              showStatusFilter={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
