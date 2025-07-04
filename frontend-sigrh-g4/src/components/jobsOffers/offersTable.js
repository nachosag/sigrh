"use client";

import Image from "next/image";
import OfferCard from "./offerCard";
import JobOpportunitiesFilter from "../jobOpportunity/jobOpportunitiesFilter";
import { useState, useEffect, use } from "react";
import PostulationModal from "./postulation";
import Link from "next/link";
import Cookies from "js-cookie";
import config from "@/config";
import axios from "axios";
import { useSystemConfig } from "@/contexts/sysConfigContext";
import { toastAlerts } from "@/utils/toastAlerts";

export default function OffersTable() {
  const [jobOpportunities, setJobOpportunities] = useState([]); // Estado para las ofertas de trabajo

  const [searchTerm, setSearchTerm] = useState(""); // Estado para el buscador
  const [currentPage, setCurrentPage] = useState(0); // Página actual
  const [itemsPerPage, setItemsPerPage] = useState(3); // Número de tarjetas por página dinámico
  const [selectedJobOpportunity, setSelectedJobOpportunity] = useState(""); // Título de la oferta seleccionada
  const [isFiltering, setIsFiltering] = useState(false); // Estado para mostrar el modal de filtros
  const [isPostulating, setIsPostulating] = useState(false); // Estado para mostrar el modal de postulación
  const [filteredOffers, setFilteredjobOportunity] = useState([]);

  const [workModeFilter, setWorkModeFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  const [states, setStates] = useState([]); // Estado para los estados

  const token = Cookies.get("token"); // Token de autenticación

  const configBrand = useSystemConfig(); // Usar configBranduración del sistema

  const getTitleElement = (isMobile = false) => {
    if (configBrand?.logo_url) {
      return (
        <Link href="/" className="bg-white px-4 py-2 rounded-full flex">
          <img
            src={configBrand.logo_url}
            alt="Logo"
            className={`h-10 cursor-pointer ${
              isMobile ? "lg:hidden" : "hidden lg:block"
            }`}
          />
        </Link>
      );
    }

    const title = configBrand?.company_name || "SIGRH+";
    return (
      <span
        className={`text-2xl font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full shadow-md ${
          isMobile ? "lg:hidden" : "hidden lg:inline-block"
        }`}
      >
        <Link href="/">{title}</Link>
      </span>
    );
  };

  const fetchJobOpportunities = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/opportunities/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status !== 200) throw new Error("Error al traer las ofertas");

      setJobOpportunities(res.data);
    } catch (e) {
      toastAlerts.showError(
        "Ocurrió un error al traer las ofertas de trabajo, recargue la página e intente nuevamente"
      );
      console.error("Error al obtener ofertas de trabajo:", e);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/states/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status !== 200) throw new Error("Error al traer los estados");

      setStates(res.data);
    } catch (e) {
      toastAlerts.showError(
        "Ocurrió un error al traer los estados, recargue la página e intente nuevamente"
      );
      console.error("Error al obtener estados:", e);
    }
  };

  useEffect(() => {
    fetchJobOpportunities();
    fetchStates();
  }, []);

  // Actualizar el número de elementos por página según el tamaño de la pantalla
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerPage(3);
      } else if (window.innerWidth >= 640) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(2);
      }
    };

    updateItemsPerPage(); // Ajustar al cargar la página
    window.addEventListener("resize", updateItemsPerPage); // Escuchar cambios de tamaño

    return () => {
      window.removeEventListener("resize", updateItemsPerPage); // Limpiar el evento
    };
  }, []);

  function showResults() {
    const filtered = jobOpportunities.filter((jobOpportunity) => {
      const jobCountryId = states.find(
        (state) => state.id === jobOpportunity.state_id
      )?.country_id;

      return (
        jobOpportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (workModeFilter === "" ||
          jobOpportunity.work_mode.toLowerCase() ===
            workModeFilter.toLowerCase()) &&
        (countryFilter === "" || jobCountryId === parseInt(countryFilter)) &&
        (jobOpportunity.status === "activo" || jobOpportunity.status === "")
      );
    });

    setFilteredjobOportunity(filtered);
    setCurrentPage(0);
  }

  useEffect(() => {
    showResults();
  }, [searchTerm, workModeFilter, countryFilter, states, jobOpportunities]);

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage); // Total de páginas

  // Ofertas visibles en la página actual
  const currentOffers = filteredOffers.slice(
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
    setSearchTerm(e.target.value);
    setCurrentPage(0); // Reinicia a la primera página al buscar
  };

  const handleFilter = (filters) => {
    setWorkModeFilter(filters.modality || "");
    setCountryFilter(filters.country || "");
    setIsFiltering(false); // Cierra el modal de filtros
  };

  const handleApply = (job) => {
    setSelectedJobOpportunity(job);
    setIsPostulating(true); // Abre el modal de postulación
  };

  return (
    <div className="relative w-full min-h-screen">
      {/* Fondo de la página */}
      <Image
        src="/fondo-postulaciones.png"
        alt="Fondo postulaciones"
        fill
        className="object-cover object-center z-0"
        priority
      />
      <div className="absolute inset-0 bg-black/20 z-10" />

      {/* Contenedor principal */}
      <div className="relative z-20 p-8">
        <div className="lg:hidden text-2xl text-center font-bold text-emerald-600 mb-4 bg-emerald-50 px-4 py-2 rounded-full shadow-md">
          {getTitleElement(true)}
        </div>
        {/* Barra de búsqueda y título */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6">
          {/* Título "SIGRH" para pantallas grandes */}
          <div>{getTitleElement(false)}</div>

          {/* Buscador y botón de filtros para pantallas pequeñas */}
          <div className="flex justify-between items-center w-full lg:hidden">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-6 py-4 border bg-white border-gray-500 rounded-full w-3/4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="🔍︎ Buscar por título..."
            />
            <button
              className="ml-4 cursor-pointer border border-emerald-700 flex items-center gap-2 px-4 py-3 rounded-full text-emerald-50 border-2 border-emerald-500 font-semibold bg-emerald-500 hover:bg-emerald-600"
              onClick={() => setIsFiltering(true)}
            >
              Filtros
            </button>
          </div>

          {/* Buscador centrado para pantallas grandes */}
          <div className="hidden lg:flex justify-center w-full lg:w-auto bg-e">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-6 py-4 border bg-white border-gray-500 rounded-full w-full lg:w-80 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:scale-102 hover:scale-102 transition-transform"
              placeholder="🔍︎ Buscar por título..."
            />
          </div>

          {/* Botón de filtros para pantallas grandes */}
          <button
            className="hidden cursor-pointer lg:flex items-center border border-emerald-700 gap-2 px-4 py-3 rounded-full text-emerald-50 border-2 font-semibold bg-emerald-500 hover:bg-emerald-600 hover:scale-102 transition-transform"
            onClick={() => setIsFiltering(true)}
          >
            Filtros
          </button>
        </div>

        {/* Contenedor de las tarjetas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 2xl:mt-30">
          {currentOffers.map((job, index) => (
            <OfferCard key={index} jobOpportunity={job} onApply={handleApply} />
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="flex justify-center items-center mt-8 text-white text-2xl">
            No se encontraron ofertas que coincidan con tu búsqueda.
          </div>
        )}

        {/* Controles de paginación */}
        <div className="flex justify-center items-center mt-8 gap-4 2xl:mt-30">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded-md hover:scale-105 transition-transform ${
              currentPage === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            Anterior
          </button>
          <span className="text-sm text-white">
            Página {totalPages !== 0 ? currentPage + 1 : currentPage} de{" "}
            {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className={`px-4 py-2 rounded-md hover:scale-105 transition-transform ${
              currentPage === totalPages - 1 || totalPages === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-emerald-500 text-white hover:bg-emerald-600"
            }`}
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* Modal de filtros */}
      {isFiltering && (
        <JobOpportunitiesFilter
          onFilter={handleFilter}
          showStatusFilter={false}
        />
      )}

      {isPostulating && (
        <PostulationModal
          onClose={() => setIsPostulating(false)}
          jobTitle={selectedJobOpportunity.title}
          jobId={selectedJobOpportunity.id}
        ></PostulationModal>
      )}
    </div>
  );
}
