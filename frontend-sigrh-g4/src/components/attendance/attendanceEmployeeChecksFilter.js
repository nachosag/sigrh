"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaFilter } from "react-icons/fa";

export default function AttendanceEmployeeChecksFilter({
  employees,
  onApplyFilters,
}) {
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [employeeIdFilter, setEmployeeIdFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef(null);

  const handleApplyFilters = () => {
    onApplyFilters({
      eventType: eventTypeFilter,
      employeeId: employeeIdFilter,
      startDate,
      endDate,
    });
    setIsOpen(false);
  };

  const handleClearFilters = () => {
    setEventTypeFilter("");
    setEmployeeIdFilter("");
    setStartDate("");
    setEndDate("");
    onApplyFilters({
      eventType: "",
      employeeId: "",
      startDate: "",
      endDate: "",
    });
    setIsOpen(false);
  };

  const activeFiltersCount = [
    eventTypeFilter,
    employeeIdFilter,
    startDate,
    endDate,
  ].filter((v) => v !== "").length;

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
    <div className="relative z-50 inline-block text-left" ref={dropdownRef}>
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
          {/* Filtro por empleado */}
          <div>
            <span className="text-gray-500 text-sm">Empleado</span>
            <select
              value={employeeIdFilter}
              onChange={(e) => setEmployeeIdFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded text-sm"
            >
              <option value="">Todos</option>
              {employees.map((event) => (
                <option key={event.employee_id} value={event.employee_id}>
                  {event.employee_id} - {event.first_name} {event.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* Rango de fechas */}
          <div>
            <span className="text-gray-500 text-sm">Fecha</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
