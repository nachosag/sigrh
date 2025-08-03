"use client";

import AppTourProvider from "@/utils/AppTourProvider";
import { useTour } from "@reactour/tour";
import { useState, useEffect } from "react";
import FiltersModal from "./FiltersModal";
import LicensesTable from "./LicensesTable";
import { FaFilter } from "react-icons/fa";

const steps = [
  {
    selector: "body",
    content:
      "Bienvenido a la sección de licencias. Aquí puedes consultar y gestionar las licencias de los empleados.",
  },
  {
    selector: ".licenses-table",
    content:
      "Aquí se muestra la tabla con todas las licencias filtradas según tus criterios.",
  },
  {
    selector: "th:last-child",
    content:
      "Luego, en esta columna, puedes gestionar cada licencia (Si está disponible para tu gestión), descargar documentación o ver logs.",
  },
  {
    selector: ".filters-btn",
    content:
      "Si deseas, puedes clickear aquí para abrir los filtros y refinar tu búsqueda de licencias.",
  },
  {
    selector: ".help-tour-btn",
    content:
      "Recuerda que si necesitas ayuda, puedes hacer click en este botón de interrogación para ver esta guía nuevamente.",
  },
  {
    selector: "body",
    content:
      "¡Eso es todo! Ya puedes gestionar y consultar licencias fácilmente.",
    position: "center",
  },
];

// Componente hijo para usar useTour correctamente
function LicensesContainerContent({
  filters,
  setFilters,
  filtersOpen,
  setFiltersOpen,
}) {
  const { setIsOpen, setCurrentStep, isOpen } = useTour();

  // Mostrar el tour automáticamente la primera vez
  useEffect(() => {
    const alreadySeen = localStorage.getItem("seenLicensesTour");
    if (!alreadySeen) {
      setCurrentStep(0);
      setIsOpen(true);
      localStorage.setItem("seenLicensesTour", "true");
    }
  }, [setIsOpen, setCurrentStep]);

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-4 mt-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800 cursor-default">
            Licencias 📄
          </h1>
          {/* Botón de ayuda justo al lado derecho del título */}
          <button
            className="help-tour-btn flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors"
            onClick={() => {
              setCurrentStep(0);
              setIsOpen(true);
            }}
            title="Ver guía"
            type="button"
            disabled={isOpen}
          >
            <span className="text-white text-xl font-bold">?</span>
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="filters-btn flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-gray-100 text-emerald-500 font-semibold shadow transition-colors"
            title="Filtrar"
            type="button"
          >
            <FaFilter className="text-lg" />
            <span>Filtros</span>
          </button>
        </div>
      </div>
      <hr className="border-gray-200 mb-6" />
      <div className="licenses-table">
        <LicensesTable filters={filters} />
      </div>
      {filtersOpen && (
        <FiltersModal
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          onApply={(f) => {
            setFilters(f);
            setFiltersOpen(false);
          }}
          initialFilters={filters}
        />
      )}
    </div>
  );
}

export default function LicensesContainer() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({});

  return (
    <AppTourProvider steps={steps}>
      <LicensesContainerContent
        filters={filters}
        setFilters={setFilters}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
      />
    </AppTourProvider>
  );
}
