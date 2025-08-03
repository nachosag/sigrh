"use client";

import { useEffect, useState, useRef } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { useUser } from "@/contexts/userContext";
import config from "@/config";
import axios from "axios";
import Cookies from "js-cookie";
import ProcessPayrollModal from "./payrollProcessModal";
import PayrollEvaluationTable from "./payrollEvaluationTable";
import { toastAlerts } from "@/utils/toastAlerts";

function getCurrentMonthRange() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return {
    start: firstDay.toISOString().split("T")[0],
    end: lastDay.toISOString().split("T")[0],
  };
}

function stringSimilarity(a, b) {
  if (a.toLowerCase() === b.toLowerCase()) return 1;
  if (b && a.toLowerCase().includes(b.toLowerCase())) return 0.8;
  let matches = 0;
  for (let char of b.toLowerCase()) {
    if (a.toLowerCase().includes(char)) {
      matches++;
    } else {
      return 0;
    }
  }
  return (matches / Math.max(a.length, 1)) * 0.5;
}

export default function PayrollEvaluationContainer() {
  const { employees } = useEmployees();
  const { user, role } = useUser();
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [payroll, setPayroll] = useState([]);
  const [isEmployeeFinded, setIsEmployeeFinded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
  const inputRef = useRef();
  const token = Cookies.get("token");

  const { start: defaultStart, end: defaultEnd } = getCurrentMonthRange();
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);

  const visibleEmployees =
    role?.id === 5
      ? employees.filter((emp) => emp?.job?.sector_id === user?.job?.sector_id)
      : employees;

  const fetchPayroll = async (empIds = []) => {
    try {
      const res = await axios.post(
        `${config.API_URL}/payroll/pending_validation_hours`,
        {
          employee_id: empIds.length > 0 ? empIds : undefined,
          start_date: startDate,
          end_date: endDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200) {
        setPayroll(res.data);
      } else {
        toastAlerts.showError(
          "Hubo un error al obtener los datos de la planilla, recargue la página e intente nuevamente"
        );
      }
    } catch (err) {
      console.error(err);
      toastAlerts.showError(
        "Hubo un error al obtener los datos de la planilla, recargue la página e intente nuevamente"
      );
    }
  };

  useEffect(() => {
    if (!hasFetchedInitial && visibleEmployees.length > 0) {
      const ids = visibleEmployees.map((e) => e.id);
      fetchPayroll(ids);
      setHasFetchedInitial(true);
    }
  }, [visibleEmployees, hasFetchedInitial]);

  useEffect(() => {
    if (hasFetchedInitial) {
      const ids = selectedEmployee
        ? [selectedEmployee.id]
        : visibleEmployees.map((e) => e.id);
      fetchPayroll(ids);
    }
  }, [startDate, endDate]);

  const handleSincronizar = () => {
    if (!search) {
      setSelectedEmployee(null);
      const ids = visibleEmployees.map((e) => e.id);
      fetchPayroll(ids);
      return;
    }

    const matched = visibleEmployees.find(
      (emp) => `${emp.first_name} ${emp.last_name} #${emp.user_id}` === search
    );

    if (!matched) {
      toastAlerts.showWarning(
        "No se encontró un empleado con ese nombre o ID."
      );
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toastAlerts.showWarning(
        "La fecha de inicio no puede ser mayor que la de fin."
      );
      return;
    }

    setSelectedEmployee(matched);
    fetchPayroll([matched.id]);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value) {
      setSelectedEmployee(null);
      setSuggestions([]);
      setIsEmployeeFinded(false);
      const ids = visibleEmployees.map((e) => e.id);
      fetchPayroll(ids);
      return;
    }

    const scored = visibleEmployees
      .map((emp) => ({
        ...emp,
        fullLabel: `${emp.first_name} ${emp.last_name} #${emp.user_id}`,
        score: stringSimilarity(
          `${emp.first_name} ${emp.last_name} #${emp.user_id}`,
          value
        ),
      }))
      .filter((emp) => emp.score > 0)
      .sort((a, b) => b.score - a.score);

    setSuggestions(scored);
    setShowSuggestions(true);

    const exactMatch = scored.find((emp) => emp.fullLabel === value);
    if (exactMatch) {
      setSelectedEmployee(exactMatch);
      setIsEmployeeFinded(true);
      setShowSuggestions(false);
    } else {
      setSelectedEmployee(null);
      setIsEmployeeFinded(false);
    }
  };

  const handleSelectSuggestion = (emp) => {
    setSearch(`${emp.first_name} ${emp.last_name} #${emp.user_id}`);
    setSelectedEmployee(emp);
    setIsEmployeeFinded(true);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100);
  };

  return (
    <div className="flex flex-col h-screen p-6">
      <div className="flex items-center justify-between gap-4 bg-white py-4">
        <div className="flex items-center gap-4 relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="🔍︎ Buscar empleado..."
              value={search}
              onChange={handleInputChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={handleBlur}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              autoComplete="off"
            />
            {showSuggestions && search && (
              <div className="absolute z-10 bg-white border border-gray-300 rounded w-full mt-1 max-h-48 overflow-auto shadow">
                {suggestions.length === 0 && !isEmployeeFinded ? (
                  <div className="px-3 py-2 text-gray-400 select-none">
                    No se encontraron empleados.
                  </div>
                ) : (
                  suggestions.map((emp, idx) => (
                    <div
                      key={emp.id || idx}
                      className="px-3 py-2 hover:bg-emerald-100 cursor-pointer"
                      onMouseDown={() => handleSelectSuggestion(emp)}
                    >
                      {emp.first_name} {emp.last_name} #{emp.user_id}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none"
          />

          <button
            onClick={handleSincronizar}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-semibold"
          >
            Buscar
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-auto">
        <PayrollEvaluationTable
          data={payroll}
          employee={selectedEmployee}
          onUpdateData={() => {
            const ids = selectedEmployee
              ? [selectedEmployee.id]
              : visibleEmployees.map((e) => e.id);
            fetchPayroll(ids);
          }}
        />
      </div>

      <ProcessPayrollModal
        open={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        defaultEmployeeId={selectedEmployee?.id}
        defaultStartDate={startDate}
        defaultEndDate={endDate}
      />
    </div>
  );
}
