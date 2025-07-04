"use client";

import FiltersModal from "./FiltersModal";
import LicensesTable from "./LicensesTable";
import { useState } from "react";
import { FaFilter } from "react-icons/fa";

export default function LicensesContainer() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({});

  return (
    <div className="w-full p-6">
      <div className="flex items-center justify-between mb-4 mt-6">
        <h1 className="text-2xl font-bold text-gray-800 cursor-default">
          Licencias 📄
        </h1>
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-gray-100 text-emerald-500 font-semibold shadow transition-colors"
          title="Filtrar"
          type="button"
        >
          <FaFilter className="text-lg" />
          <span>Filtros</span>
        </button>
      </div>
      <hr className="border-gray-200 mb-6" />
      <div>
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
