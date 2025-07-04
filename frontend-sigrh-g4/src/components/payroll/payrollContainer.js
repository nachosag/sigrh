"use client";

import { useEffect, useState, useRef } from "react";
import PayrollTable from "./payrollTable";
import * as XLSX from "xlsx";
import { useEmployees } from "@/hooks/useEmployees";
import config from "@/config";
import axios from "axios";
import Cookies from "js-cookie";
import ProcessPayrollModal from "./payrollProcessModal";
import { FiAlertTriangle } from "react-icons/fi";
import { CONCEPTS_ALARM } from "@/constants/conceptsAlarms";
import { toastAlerts } from "@/utils/toastAlerts";

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

export default function PayrollContainer() {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { employees } = useEmployees();
  const [suggestions, setSuggestions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isEmployeeFinded, setIsEmployeeFinded] = useState(false);
  const [payroll, setPayroll] = useState([]);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const inputRef = useRef();
  const token = Cookies.get("token");
  const [hasAlarmRows, setHasAlarmRows] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const filteredPayroll = showArchived
    ? payroll
    : payroll.filter(
        (row) => row.employee_hours?.payroll_status !== "archived"
      );

  const hasAlarms = (payrollData) => {
    return payrollData.some((row) => {
      const concept = row?.concept?.description;
      const status = row?.employee_hours?.payroll_status;
      return (
        status === "pending validation" ||
        (CONCEPTS_ALARM.includes(concept) && status !== "archived")
      );
    });
  };

  const fetchPayroll = async () => {
    if (!selectedEmployee || !startDate || !endDate) return;

    try {
      const res = await axios.post(
        `${config.API_URL}/payroll/hours`,
        {
          employee_id: selectedEmployee.id,
          start_date: startDate,
          end_date: endDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200) {
        setPayroll(res.data);
        setHasAlarmRows(hasAlarms(res.data)); // 👈 actualizamos estado de alarma
      } else {
        toastAlerts.showError(
          "Error al obtener los datos de la planilla, recargue la página e intente nuevamente"
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
    if (!selectedEmployee) return;
    fetchPayroll();
  }, [selectedEmployee]);

  useEffect(() => {
    if (!search) {
      setSuggestions([]);
      setSelectedEmployee(null);
      return;
    }

    const scored = employees
      .map((emp) => ({
        ...emp,
        score: stringSimilarity(
          emp.first_name + " " + emp.last_name + " #" + emp.user_id || "",
          search
        ),
      }))
      .filter((emp) => emp.score > 0)
      .sort((a, b) => b.score - a.score);

    setSuggestions(scored);

    if (
      suggestions[0]?.first_name +
        " " +
        suggestions[0]?.last_name +
        " #" +
        suggestions[0]?.user_id ===
      search
    ) {
      setIsEmployeeFinded(true);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [search, employees]);

  const handleSincronizar = () => {
    const employeeFinded = employees.find(
      (emp) =>
        emp.first_name + " " + emp.last_name + " #" + emp.user_id === search
    );
    if (!employeeFinded) {
      toastAlerts.showWarning(
        "Empleado no encontrado. Por favor, verifique el nombre y el ID."
      );
      return;
    }

    if (!startDate || !endDate) {
      toastAlerts.showWarning(
        "Por favor, complete las fechas de inicio y fin."
      );
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toastAlerts.showWarning(
        "La fecha de inicio no puede ser posterior a la fecha de fin."
      );
      return;
    }

    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Argentina/Buenos_Aires",
    });

    if (endDate > today) {
      toastAlerts.showWarning(
        "La fecha de fin no puede ser posterior a la fecha actual."
      );
      return;
    }

    setSelectedEmployee(employeeFinded);
    fetchPayroll();
  };

  // Función auxiliar para convertir HH:MM a horas decimales
  function parseTimeToDecimal(timeStr) {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours + minutes / 60;
  }

  const handleExportarExcel = () => {
    if (payroll.length === 0) {
      toastAlerts.showWarning("No hay datos para exportar.");
      return;
    }

    if (hasAlarmRows) {
      toastAlerts.showWarning(
        "Hay registros con alarmas pendientes. Por favor, resuélvelos antes de exportar."
      );
      return;
    }

    // 1. Generar hoja de planilla normal
    const excelPayroll = payroll.map((row) => ({
      Día: new Date(row.employee_hours.work_date + "T00:00").toLocaleDateString(
        "es-AR",
        {
          weekday: "long",
        }
      ),
      Fecha: row.employee_hours.work_date,
      Novedad: row.employee_hours.register_type,
      Entrada: row.employee_hours.first_check_in,
      Salida: row.employee_hours.last_check_out,
      "Cant. fichadas": row.employee_hours.check_count,
      Turno: row.shift?.description || "",
      Concepto: row.concept?.description || "",
      Horas:
        row.employee_hours.sumary_time ||
        row.employee_hours.extra_hours ||
        "00:00:00",
      Notas: row.employee_hours.notes,
      Estado: row.employee_hours.payroll_status,
    }));

    const wb = XLSX.utils.book_new();
    const ws1 = XLSX.utils.json_to_sheet(excelPayroll);
    XLSX.utils.book_append_sheet(wb, ws1, "Planilla");

    // 2. Filtrar registros válidos
    const validRows = payroll.filter(
      (row) =>
        row.employee_hours?.payroll_status !== "archived" &&
        row.employee_hours?.payroll_status !== "not payable"
    );

    // 3. Recuento y horas por concepto
    const conceptSummary = {};
    validRows.forEach((row) => {
      const concept = row.concept?.description || "Sin concepto";
      const timeStr =
        row.employee_hours?.sumary_time ||
        row.employee_hours?.extra_hours ||
        "00:00";
      const time = parseTimeToDecimal(timeStr);

      if (!conceptSummary[concept]) {
        conceptSummary[concept] = { cantidad: 0, horas: 0 };
      }

      conceptSummary[concept].cantidad += 1;
      conceptSummary[concept].horas += time;
    });

    const resumenConceptos = Object.entries(conceptSummary).map(
      ([concepto, data]) => ({
        Concepto: concepto,
        Cantidad: data.cantidad,
        "Horas totales": parseFloat(data.horas.toFixed(2)), // redondeo a 2 decimales
      })
    );

    // 4. Datos del empleado
    const employeeData = selectedEmployee
      ? [
          { Campo: "Nombre", Valor: selectedEmployee.first_name },
          { Campo: "Apellido", Valor: selectedEmployee.last_name },
          { Campo: "User ID", Valor: selectedEmployee.user_id },
          { Campo: "Email", Valor: selectedEmployee.email || "" },
          { Campo: "DNI", Valor: selectedEmployee.dni || "" },
          { Campo: "Teléfono", Valor: selectedEmployee.phone || "" },
        ]
      : [];

    // 5. Crear hoja resumen
    const ws2 = XLSX.utils.book_new();

    const resumenSheet = XLSX.utils.json_to_sheet([
      { Concepto: "Resumen por concepto" },
      ...resumenConceptos,
      {},
      { Concepto: "Datos del empleado" },
      ...employeeData.map((item) => ({
        Concepto: item.Campo,
        Cantidad: item.Valor,
      })),
    ]);

    XLSX.utils.book_append_sheet(wb, resumenSheet, "Resumen");

    // 6. Exportar archivo
    XLSX.writeFile(
      wb,
      `exportacion_nomina_${selectedEmployee.first_name}_${selectedEmployee.last_name}.xlsx`
    );
  };

  const handleSelectSuggestion = (emp) => {
    setSearch(emp.first_name + " " + emp.last_name + " #" + emp.user_id);
    setIsEmployeeFinded(true);
    setShowSuggestions(false);
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearch(newValue);

    const matchedEmployee = employees.find(
      (emp) => `${emp.first_name} ${emp.last_name} #${emp.user_id}` === newValue
    );

    if (matchedEmployee) {
      setSelectedEmployee(matchedEmployee);
      setIsEmployeeFinded(true);
    } else {
      setSelectedEmployee(null);
      setIsEmployeeFinded(false);
    }

    setShowSuggestions(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100);
  };

  return (
    <div className="flex flex-col h-screen p-6">
      <div className="flex  items-center justify-between gap-4 bg-white py-4">
        <div className="flex  items-center gap-4 relative">
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
                      {emp.first_name} {emp.last_name} {"#" + emp.user_id}
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

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full border text-sm transition-colors
            ${
              showArchived
                ? "bg-yellow-100 text-yellow-800 border-yellow-400"
                : "bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200"
            }`}
            title="Mostrar/ocultar archivados"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"
              />
            </svg>
            {showArchived ? "Ocultar Archivados" : "Ver Archivados"}
          </button>

          {hasAlarmRows && (
            <div className="text-red-500 flex gap-2 items-center ">
              <FiAlertTriangle />
              <p
                className="max-w-[150px] truncate"
                title="Hay registros que requieren acciones"
              >
                Hay registros que requieren acciones
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setIsProcessModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold"
          >
            Procesar horas
          </button>
          <button
            onClick={handleExportarExcel}
            className="bg-emerald-400 hover:bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold"
          >
            Exportar a Excel
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-auto">
        <PayrollTable
          data={filteredPayroll}
          employee={selectedEmployee}
          onUpdateData={() => {
            fetchPayroll();
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
