"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaFilter } from "react-icons/fa";

export default function EmployeeFilters({ employees, onApplyFilters }) {
  const [activeFilter, setActiveFilter] = useState("");
  const [idFilter, setIdFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);

  const handleApplyFilters = () => {
    onApplyFilters({ activeFilter, idFilter, startDate, endDate });
    setIsOpen(false); // Cierra dropdown después de aplicar
  };

  const handleClearFilters = () => {
    setActiveFilter("");
    setIdFilter("");
    setStartDate("");
    setEndDate("");
    onApplyFilters({
      activeFilter: "",
      idFilter: "",
      startDate: "",
      endDate: "",
    });
    setIsOpen(false);
  };

  // Contador de filtros activos
  const activeFiltersCount = [
    activeFilter,
    idFilter,
    startDate,
    endDate,
  ].filter((v) => v !== "").length;

  // Cierra el dropdown si haces clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative z-100 inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-emerald-500 rounded-full text-white text-sm font-semibold flex items-center gap-2"
      >
        <FaFilter />
        Filtros
        <span className="bg-white text-emerald-600 rounded-full px-2 text-xs font-bold">
          {activeFiltersCount}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10 space-y-4">
          {/* Filtro Activo/Inactivo */}
          <span className="text-gray-500 text-sm">Activo/Inactivo</span>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm"
          >
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>

          {/* Filtro por ID */}
          <span className="text-gray-500 text-sm">ID</span>
          <select
            value={idFilter}
            onChange={(e) => setIdFilter(e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm"
          >
            <option value="">Todos los IDs</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.id} - {employee.first_name} {employee.last_name}
              </option>
            ))}
          </select>

          {/* Filtro Fecha de Contratación (rango) */}
          <div className="items-center gap-2">
            <span className="text-gray-500 text-sm">Fecha de contratación</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
            <span className="text-gray-500 text-sm">Hasta</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>

          {/* Botones */}
          <div className="flex justify-between gap-2">
            <button
              onClick={handleClearFilters}
              className="w-1/2 px-4 py-2 bg-gray-200 rounded text-gray-700 text-sm font-semibold hover:bg-gray-300"
            >
              Limpiar
            </button>
            <button
              onClick={handleApplyFilters}
              className="w-1/2 px-4 py-2 bg-emerald-500 rounded text-white text-sm font-semibold hover:bg-emerald-600"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
