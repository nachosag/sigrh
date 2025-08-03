"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toastAlerts } from "@/utils/toastAlerts";
import LicensesPieChart from "./LicensesPieChart";
import { FaFileExcel } from "react-icons/fa";
import config from "@/config";
import Cookies from "js-cookie";
import Select from "react-select";

export default function LicensesDashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [licensesPerType, setLicensesPerType] = useState();
  const [licensesTypes, setLicensesTypes] = useState([]);
  const [filteredStartDate, setFilteredStartDate] = useState("");
  const [filteredEndDate, setFilteredEndDate] = useState("");
  const [filteredType, setFilteredType] = useState("");

  const isValidPeriod = !!startDate && !!endDate && startDate <= endDate;
  const token = Cookies.get("token");

  const handleFilter = async () => {
    if (!isValidPeriod && !type) return;
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.from_start_date = startDate;

      if (endDate) params.until_start_date = endDate;

      if (type) params.leave_type_ids = type;

      params.request_statuses = "aprobado";

      const res = await axios.get(`${config.API_URL}/leaves/report`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setLicensesPerType(changeLicenseFormat(res.data));
      setFilteredStartDate(startDate);
      setFilteredEndDate(endDate);
      setFilteredType(type);
    } catch (e) {
      toastAlerts.showError(
        "Error al filtrar licencias, recargue la página e intente nuevamente"
      );
      console.error("Error al filtrar licencias:", e);
    }
    setLoading(false);
  };

  const fetchLicenses = async () => {
    //Este método es para la primera vez que se carga el componente
    setLoading(true);
    try {
      // Si no hay fechas, va a buscar el mes actual
      const now = new Date();
      const firstDay = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-01`;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const lastDayStr = `${lastDay.getFullYear()}-${String(
        lastDay.getMonth() + 1
      ).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;

      const fromDate = firstDay;
      const untilDate = lastDayStr;

      console.log("Fetching licenses from:", fromDate, "to:", untilDate);

      const res = await axios.get(`${config.API_URL}/leaves/report`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          from_start_date: fromDate,
          until_start_date: untilDate,
          request_statuses: "aprobado",
        },
      });
      setLicensesPerType(changeLicenseFormat(res.data));
      console.log("Licenses fetched:", res.data);
      setFilteredStartDate(fromDate);
      setFilteredEndDate(untilDate);
      setFilteredType("");
    } catch (e) {
      toastAlerts.showError(
        "Error al traer licencias, recargue la página e intente nuevamente"
      );
      console.error("Error al filtrar licencias:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchLicensesTypes = async () => {
      try {
        const res = await axios.get(`${config.API_URL}/leaves/types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status !== 200) throw new Error("Error al obtener licencias");
        setLicensesTypes(res.data);
      } catch (error) {
        console.error("Error al traer licenses:", error);
        toastAlerts.showError(
          "Hubo un error al obtener los tipos de licencia, recargue la página e intente nuevamente"
        );
      }
    };
    fetchLicensesTypes();
  }, []);

  useEffect(() => {
    if (token && licensesTypes.length > 0) {
      const now = new Date();
      const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const lastDayStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
      setStartDate(firstDay);
      setEndDate(lastDayStr);
      fetchLicenses();
    }
  }, [licensesTypes]); //Esto lo tuve que agregar porque licensesTypes tarda en cargar, entonces hay que esperar que esté listo

  function changeLicenseFormat(response) {
    // Crea un mapa con id, type y count
    const reportMap = Object.entries(response.report).reduce(
      (acc, [id, [type, count]]) => {
        acc[type] = { id: Number(id), count };
        return acc;
      },
      {}
    );

    return licensesTypes.map((t) => ({
      id: t.id,
      type: t.type,
      count: reportMap[t.type]?.count || 0,
    }));
  }

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filteredStartDate) params.from_start_date = filteredStartDate;
      if (filteredEndDate) params.until_start_date = filteredEndDate;
      if (filteredType) params.leave_type_ids = filteredType;
      params.request_statuses = "aprobado";

      const res = await axios.get(`${config.API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const leavesDetails = (res.data || []).map((item) => ({
        "ID Licencia": item.id,
        "ID Empleado": item.employee_id,
        "Fecha de solicitud": item.request_date,
        "Fecha desde": item.start_date,
        "Fecha hasta": item.end_date,
        "Tipo de licencia ID": item.leave_type_id,
        Motivo: item.reason,
        "Estado documento": item.document_status,
        "Estado solicitud": item.request_status,
        Creado: item.created_at,
        Actualizado: item.updated_at,
      }));

      const filteredDate = [
        {
          "Período consultado": `Desde: ${
            filteredStartDate || startDate
          } Hasta: ${filteredEndDate || endDate}`,
        },
      ];

      const excelData = licensesPerType.map((item) => ({
        "Tipo de licencia": item.type,
        "Cantidad solicitada": item.count,
      }));

      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.json_to_sheet(
        [...filteredDate, {}, ...excelData],
        {
          skipHeader: false,
        }
      );
      XLSX.utils.book_append_sheet(wb, ws1, "Resumen");

      if (leavesDetails.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(leavesDetails, {
          skipHeader: false,
        });
        XLSX.utils.book_append_sheet(wb, ws2, "Detalle de licencias");
      }

      XLSX.writeFile(wb, "reporte_licencias.xlsx");
    } catch (e) {
      toastAlerts.showError("Error al exportar a Excel", e.message);
    }
    setLoading(false);
  };

  const licenseTypeOptions = licensesTypes.map((t) => ({
    value: t.id,
    label: t.type,
  }));

  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor:
        state.isFocused || state.hasValue ? "#10b981" : base.borderColor, // emerald-500
      boxShadow: state.isFocused ? "0 0 0 1px #10b981" : base.boxShadow,
      "&:hover": {
        borderColor: "#10b981",
      },
    }),
  };

  return (
    <div className="p-6 background-white">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Reporte de Licencias</h1>
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 items-end mb-6">
          <div>
            <label className="block text-xs font-semibold mb-1">
              Fecha desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 text-gray-500 rounded px-2 py-2 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Fecha hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 text-gray-500 rounded px-2 py-2 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
          <div className="w-64">
            <label className="block text-xs font-semibold mb-1">
              Tipo de licencia
            </label>
            <Select
              styles={customSelectStyles}
              options={licenseTypeOptions}
              isClearable
              placeholder="Filtrar por tipo"
              value={licenseTypeOptions.find((o) => o.value === type) || null}
              onChange={(option) => setType(option ? option.value : "")}
            />
          </div>
          {(isValidPeriod || type) && (
            <>
              <button
                onClick={handleFilter}
                className="bg-emerald-600 text-white rounded-full px-4 py-2 hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                disabled={(!isValidPeriod && !type) || loading}
              >
                Filtrar
              </button>
              <button
                className="ml-auto text-gray-400 border border-gray-400 px-3 py-1 rounded hover:bg-gray-100"
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setType("");
                  fetchLicenses();
                }}
              >
                Limpiar filtros
              </button>
            </>
          )}

          <button
            className={`${
              !isValidPeriod && !type ? "ml-auto" : ""
            } flex gap-2 items-center border border-green-600 text-green-700 px-3 py-1 rounded hover:bg-green-100`}
            onClick={handleExportExcel}
            disabled={loading}
          >
            <FaFileExcel />
            Exportar a Excel
          </button>
        </div>
        {/* Gráfico */}
        {licensesPerType?.length > 0 ? (
          <LicensesPieChart
            data={licensesPerType}
            startDate={filteredStartDate}
            endDate={filteredEndDate}
            type={filteredType}
          />
        ) : (
          <div className="w-full h-80 bg-white rounded shadow p-10 flex items-center justify-center">
            <div className="text-center text-gray-500">
              {loading
                ? "Cargando datos..."
                : "No se encontraron licencias para el período seleccionado."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
