"use client";

import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { toastAlerts } from "@/utils/toastAlerts";
import JobOpporrtunitiesBarChart from "./JobOpportunitiesBarChart";
import JobOpportunitiesPieChart from "./JobOpportunitiesPieChart";
import { FaFileExcel } from "react-icons/fa";
import config from "@/config";
import Cookies from "js-cookie";
import PostulationIndicatorsCards from "./PostulationIndicatorsCards";
import PostulationSuitabilityCharts from "./PostulationSuitabilityCharts";
import FormAlert from "@/components/customsAlerts/formAlert";

function getCurrentMonthRange() {
  const now = new Date();
  const firstDay = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-01`;
  const lastDayDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const lastDay = `${lastDayDate.getFullYear()}-${String(
    lastDayDate.getMonth() + 1
  ).padStart(2, "0")}-${String(lastDayDate.getDate()).padStart(2, "0")}`;
  return { firstDay, lastDay };
}

function getMonthName(dateStr) {
  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];
  const date = new Date(dateStr);
  return meses[date.getMonth()];
}

function isFullMonthRange(from, to) {
  if (!from || !to) return false;
  const start = new Date(from + "T00:00:00");
  const end = new Date(to + "T00:00:00");
  // Mismo año y mes
  if (
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth()
  ) {
    // Es el primer día del mes
    const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
    // Es el último día del mes
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    return (
      start.getTime() === firstDay.getTime() &&
      end.getTime() === lastDay.getTime()
    );
  }
  return false;
}

export default function JobOpportunitiesDashboard() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobOpportunitiesData, setJobOpportunitiesData] = useState();
  const [filteredStartDate, setFilteredStartDate] = useState("");
  const [filteredEndDate, setFilteredEndDate] = useState("");
  const [rejectedData, setRejectedData] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOpportunity, setFilteredOpportunity] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [formAlertOpen, setFormAlertOpen] = useState(false);
  const [formAlertMsg, setFormAlertMsg] = useState("");
  const inputRef = useRef(null);

  // Indicadores y gráficos IA
  const [indicators, setIndicators] = useState(null);
  const [suitabilityData, setSuitabilityData] = useState(null);
  const [statusData, setStatusData] = useState(null);

  const isValidPeriod = !!startDate && !!endDate && startDate <= endDate;
  const token = Cookies.get("token");

  // Generar opciones para el autocompletado
  const opportunityOptions = opportunities.map((o) => `${o.title} #${o.id}`);

  // Filtrar opciones según lo que escribe el usuario
  const filteredOptions = searchTerm
    ? opportunityOptions.filter((opt) =>
        opt.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : opportunityOptions;

  // Solo se puede filtrar por fechas o por convocatoria, no ambos
  const isOnlyDates =
    !!startDate && !!endDate && startDate <= endDate && !searchTerm;
  const isOnlyOpportunity =
    !startDate && !endDate && opportunityOptions.includes(searchTerm);
  const canFilter = (startDate && endDate && isValidPeriod) || searchTerm;

  // --- Indicadores y gráficos IA ---
  const fetchIndicators = async (from, to, jobOpportunityId) => {
    try {
      const params = {};
      if (from) params.from_date = from;
      if (to) params.to_date = to;
      if (jobOpportunityId) params.job_opportunity_id = jobOpportunityId;
      const res = await axios.get(
        `${config.API_URL}/opportunitiesopportunities/indicators-by-date-range`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      setIndicators(res.data);
    } catch (e) {
      toastAlerts.showError("Error al obtener indicadores de postulaciones");
    }
  };

  const fetchSuitabilityData = async (from, to, jobOpportunityId) => {
    try {
      const params = {};
      if (from) params.from_date = from;
      if (to) params.to_date = to;
      if (jobOpportunityId) params.job_opportunity_id = jobOpportunityId;
      const res = await axios.get(
        `${config.API_URL}/postulations/stats/suitability`,
        { headers: { Authorization: `Bearer ${token}` }, params }
      );
      let totalAptosIA = 0,
        totalNoAptosIA = 0;
      if (Array.isArray(res.data)) {
        res.data.forEach((item) => {
          totalAptosIA += item.aptos_ia || 0;
          totalNoAptosIA += item.no_aptos_ia || 0;
        });
      }
      setSuitabilityData([
        { name: "Aptos IA", value: totalAptosIA },
        { name: "No Aptos IA", value: totalNoAptosIA },
      ]);
    } catch (e) {
      toastAlerts.showError("Error al obtener datos de aptitud IA");
    }
  };

  const fetchStatusData = async (from, to, jobOpportunityId) => {
    try {
      const params = {};
      if (from) params.from_date = from;
      if (to) params.to_date = to;
      if (jobOpportunityId) params.job_opportunity_id = jobOpportunityId;
      const res = await axios.get(
        `${config.API_URL}/postulations/stats/status`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      let totalAptosIA2 = 0,
        totalAceptada = 0,
        totalContratado = 0;
      if (Array.isArray(res.data)) {
        res.data.forEach((item) => {
          totalAptosIA2 += item.aptos_ia || 0;
          totalAceptada += item.aptos_aceptada || 0;
          totalContratado += item.aptos_contratado || 0;
        });
      }
      const aptosIANoAceptadosNiContratados = Math.max(
        totalAptosIA2 - totalAceptada - totalContratado,
        0
      );
      setStatusData([
        {
          name: "Aptos IA no aceptados/contratados",
          value: aptosIANoAceptadosNiContratados,
        },
        { name: "Aceptados", value: totalAceptada },
        { name: "Contratados", value: totalContratado },
      ]);
    } catch (e) {
      toastAlerts.showError("Error al obtener datos de estado IA");
    }
  };

  // --- Filtros y fetch ---
  const handleFilter = async () => {
    // Si ambos filtros están llenos, mostrar FormAlert y no ejecutar nada
    if (
      !!startDate &&
      !!endDate &&
      searchTerm &&
      opportunityOptions.includes(searchTerm)
    ) {
      setFormAlertMsg(
        "Solo puedes filtrar por fechas o por convocatoria, no ambos a la vez."
      );
      setFormAlertOpen(true);
      return;
    }
    // Si no hay fechas ni convocatoria, usar mes actual por default
    let from = startDate;
    let to = endDate;
    let jobOpportunityId = null;
    let params = {};

    // Si no hay fechas, usar mes actual
    if (!from || !to) {
      const { firstDay, lastDay } = getCurrentMonthRange();
      from = firstDay;
      to = lastDay;
    }

    // Si hay convocatoria seleccionada
    if (searchTerm && opportunityOptions.includes(searchTerm)) {
      const match = searchTerm.match(/^(.*) #(\d+)$/);
      if (match) {
        jobOpportunityId = match[2];
      }
    }

    setLoading(true);
    try {
      // --- Activos/Inactivos: solo fechas ---
      const activosParams = { from_date: from, to_date: to };
      const res = await axios.post(
        `${config.API_URL}/opportunities/count-active-inactive`,
        activosParams,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // --- Motivos de rechazo: fechas y/o convocatoria ---
      let motivosUrl = `${config.API_URL}/opportunities/opportunities/rejected-postulations-count-by-dates?from_date=${from}&to_date=${to}`;
      if (jobOpportunityId) motivosUrl += `&opportunity_id=${jobOpportunityId}`;
      const resRejected = await axios.get(motivosUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setJobOpportunitiesData(res.data);
      setFilteredStartDate(from);
      setFilteredEndDate(to);
      setRejectedData(resRejected.data);

      // --- Indicadores IA, Aptos/No Aptos, Status ---
      // Si hay convocatoria, solo se pasa la convocatoria (no fechas)
      if (jobOpportunityId) {
        await fetchIndicators(undefined, undefined, jobOpportunityId);
        await fetchSuitabilityData(undefined, undefined, jobOpportunityId);
        await fetchStatusData(undefined, undefined, jobOpportunityId);
      } else {
        await fetchIndicators(from, to, undefined);
        await fetchSuitabilityData(from, to, undefined);
        await fetchStatusData(from, to, undefined);
      }

      // Set filteredOpportunity para excel
      if (jobOpportunityId) {
        const match = searchTerm.match(/^(.*) #(\d+)$/);
        setFilteredOpportunity([parseInt(jobOpportunityId), match[1]]);
      } else {
        setFilteredOpportunity(null);
      }
    } catch (e) {
      toastAlerts.showError(
        "Error al filtrar convocatorias, recargue la página e intente nuevamente"
      );
      console.error("Error al filtrar convocatorias:", e);
    }
    setLoading(false);
  };

  // Fetch inicial
  const fetchJobOpportunitiesData = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const firstDay = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-01`;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const lastDayStr = `${lastDay.getFullYear()}-${String(
        lastDay.getMonth() + 1
      ).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;

      const params = {
        from_date: firstDay,
        to_date: lastDayStr,
      };

      const res = await axios.post(
        `${config.API_URL}/opportunities/count-active-inactive`,
        params,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const resRejected = await axios.get(
        `${config.API_URL}/opportunities/opportunities/rejected-postulations-count-by-dates?from_date=${params.from_date}&to_date=${params.to_date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setJobOpportunitiesData(res.data);
      setFilteredStartDate(firstDay);
      setFilteredEndDate(lastDayStr);
      setRejectedData(resRejected.data);

      // Indicadores IA iniciales
      await fetchIndicators(firstDay, lastDayStr, null);
      await fetchSuitabilityData(firstDay, lastDayStr, null);
      await fetchStatusData(firstDay, lastDayStr, null);
    } catch (e) {
      toastAlerts.showError(
        "Error al traer los datos de las convocatorias, recargue la página e intente nuevamente"
      );
      console.error("Error al filtrar convocatorias:", e);
    }
    setLoading(false);
  };

  const fetchOpportunities = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/opportunities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOpportunities(res.data);
    } catch (e) {
      toastAlerts.showError(
        "Error al traer las convocatorias, recargue la página e intente nuevamente"
      );
      console.error("Error al traer las convocatorias:", e);
    }
  };

  useEffect(() => {
    const now = new Date();
    const firstDay = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}-01`;
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const lastDayStr = `${lastDay.getFullYear()}-${String(
      lastDay.getMonth() + 1
    ).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
    setStartDate(firstDay);
    setEndDate(lastDayStr);
    fetchJobOpportunitiesData();
    fetchOpportunities();
    // eslint-disable-next-line
  }, [token]);

  // --- Exportar Excel con hojas IA ---
  const handleExportExcel = async () => {
    setLoading(true);
    try {
      const periodInfo = [
        {
          Periodo: `Desde: ${
            filteredStartDate || startDate
          } Hasta: ${filteredEndDate || endDate}`,
        },
      ];

      const statusDataSheet = [
        {
          Estado: "Convocatorias activas",
          Cantidad: jobOpportunitiesData?.active_count || 0,
        },
        {
          Estado: "Convocatorias inactivas",
          Cantidad: jobOpportunitiesData?.inactive_count || 0,
        },
      ];

      const statusSheet = [...periodInfo, {}, ...statusDataSheet];

      let motives = {};
      let motivesHeader = [
        {
          Periodo: `Desde: ${
            filteredStartDate || startDate
          } Hasta: ${filteredEndDate || endDate}`,
        },
      ];
      if (
        filteredOpportunity &&
        filteredOpportunity[0] &&
        Array.isArray(rejectedData)
      ) {
        motivesHeader.push({
          Convocatoria: `${filteredOpportunity[1]} #${filteredOpportunity[0]}`,
        });
        const selected = rejectedData.find(
          (item) =>
            String(item.opportunity_id) === String(filteredOpportunity[0])
        );
        if (selected) motives = selected.motivos;
      } else if (Array.isArray(rejectedData)) {
        rejectedData.forEach((item) => {
          Object.entries(item.motivos).forEach(([motive, count]) => {
            motives[motive] = (motives[motive] || 0) + count;
          });
        });
      }

      const motivesRows = Object.entries(motives).map(([motive, count]) => ({
        Motivo: motive,
        Cantidad: count,
      }));

      const params = {
        from_date: filteredStartDate || startDate,
        to_date: filteredEndDate || endDate,
      };
      const resRaw = await axios.get(
        `${config.API_URL}/opportunities/opportunities-postulations`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }
      );
      let datosPostulacionesRows = [];
      if (Array.isArray(resRaw.data)) {
        resRaw.data.forEach((op) => {
          if (
            filteredOpportunity &&
            filteredOpportunity[0] &&
            String(op.id) !== String(filteredOpportunity[0])
          ) {
            return;
          }
          if (Array.isArray(op.postulations)) {
            op.postulations.forEach((post) => {
              datosPostulacionesRows.push({
                "ID Postulación": post.id,
                "ID Convocatoria": post.job_opportunity_id,
                Convocatoria: `${op.title} #${op.id}`,
                Nombre: post.name,
                Apellido: post.surname,
                Email: post.email,
                Teléfono: post.phone_number,
                País: post.address_country_id,
                Provincia: post.address_state_id,
                Evaluado: post.evaluated_at,
                "Apto IA": post.suitable ? "Sí" : "No",
                "Estado postulación": post.status,
                Motivo: post.motive,
                Creado: post.created_at,
                Actualizado: post.updated_at,
              });
            });
          }
        });
      }

      let convocatoriasRows = [];
      if (Array.isArray(resRaw.data)) {
        convocatoriasRows = resRaw.data.map((op) => {
          const {
            id,
            owner_employee_id,
            status,
            work_mode,
            title,
            description,
            state_id,
            required_abilities,
            desirable_abilities,
            required_skill_percentage,
            desirable_skill_percentage,
            created_at,
            updated_at,
          } = op;
          return {
            "ID Convocatoria": id,
            "ID Empleado dueño": owner_employee_id,
            Estado: status,
            Modalidad: work_mode,
            Título: title,
            Descripción: description,
            "ID Provincia": state_id,
            "Habilidades excluyentes": required_abilities
              ?.map((a) => a.name)
              .join(", "),
            "Habilidades deseables": desirable_abilities
              ?.map((a) => a.name)
              .join(", "),
            "% Habilidades excluyentes": required_skill_percentage,
            "% Habilidades deseables": desirable_skill_percentage,
            Creado: created_at,
            Actualizado: updated_at,
          };
        });
      }

      const indicatorsRows = [
        {
          Indicador: "Promedio Aptos",
          Valor: indicators?.suitable_average ?? 0,
        },
        {
          Indicador: "Promedio No Aptos",
          Valor: indicators?.not_suitable_average ?? 0,
        },
        {
          Indicador: "Promedio Aceptados",
          Valor: indicators?.accepted_postulation_average ?? 0,
        },
        {
          Indicador: "Promedio Rechazados",
          Valor: indicators?.rejected_postulation_average ?? 0,
        },
        {
          Indicador: "Promedio Contratados",
          Valor: indicators?.hired_postulation_average ?? 0,
        },
        {
          Indicador: "Promedio Pendientes",
          Valor: indicators?.pending_postulation_average ?? 0,
        },
        {
          Indicador: "Cantidad de Convocatorias",
          Valor: indicators?.count_opportunities ?? 0,
        },
        {
          Indicador: "Cantidad de Postulaciones",
          Valor: indicators?.count_postulations ?? 0,
        },
      ];
      const indicatorsSheet = [...periodInfo, {}, ...indicatorsRows];

      // Aptos/No Aptos IA
      const aptosNoAptosSheet = [
        ...periodInfo,
        {},
        ...(suitabilityData || []).map((item) => ({
          Tipo: item.name,
          Cantidad: item.value,
        })),
      ];

      // Evaluación aptos IA
      const evalAptosIASheet = [
        ...periodInfo,
        {},
        ...(statusData || []).map((item) => ({
          Tipo: item.name,
          Cantidad: item.value,
        })),
      ];

      // --- Generar Excel ---
      const wb = XLSX.utils.book_new();
      const ws1 = XLSX.utils.json_to_sheet(statusSheet, { skipHeader: false });
      XLSX.utils.book_append_sheet(wb, ws1, "Activos e Inactivos");

      if (motivesRows.length > 0) {
        const motivesSheet = [...motivesHeader, {}, ...motivesRows];
        const ws2 = XLSX.utils.json_to_sheet(motivesSheet, {
          skipHeader: false,
        });
        XLSX.utils.book_append_sheet(wb, ws2, "Motivos rechazo");
      }

      if (datosPostulacionesRows.length > 0) {
        const ws3 = XLSX.utils.json_to_sheet(datosPostulacionesRows, {
          skipHeader: false,
        });
        XLSX.utils.book_append_sheet(wb, ws3, "Datos postulaciones");
      }

      if (convocatoriasRows.length > 0) {
        const ws4 = XLSX.utils.json_to_sheet(convocatoriasRows, {
          skipHeader: false,
        });
        XLSX.utils.book_append_sheet(wb, ws4, "Convocatorias");
      }

      // Hojas IA
      if (indicatorsRows.length > 0) {
        const ws5 = XLSX.utils.json_to_sheet(indicatorsSheet, {
          skipHeader: false,
        });
        XLSX.utils.book_append_sheet(wb, ws5, "Indicadores postulaciones");
      }
      if (aptosNoAptosSheet.length > 3) {
        const ws6 = XLSX.utils.json_to_sheet(aptosNoAptosSheet, {
          skipHeader: false,
        });
        XLSX.utils.book_append_sheet(wb, ws6, "Aptos y No Aptos");
      }
      if (evalAptosIASheet.length > 3) {
        const ws7 = XLSX.utils.json_to_sheet(evalAptosIASheet, {
          skipHeader: false,
        });
        XLSX.utils.book_append_sheet(wb, ws7, "Evaluación aptos IA");
      }

      XLSX.writeFile(wb, "reporte_convocatorias.xlsx");
    } catch (e) {
      toastAlerts.showError("Error exporting to Excel", e.message);
    }
    setLoading(false);
  };

  const handleSelectOption = (option) => {
    setSearchTerm(option);
    setShowOptions(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determinar el label de fechas para los indicadores (igual que BarChart)
  let indicadoresLabel = "";
  if (filteredStartDate && filteredEndDate) {
    if (isFullMonthRange(filteredStartDate, filteredEndDate)) {
      // Mes completo
      const date = new Date(filteredStartDate + "T00:00:00");
      const meses = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ];
      const monthText =
        meses[date.getMonth()].charAt(0).toUpperCase() +
        meses[date.getMonth()].slice(1) +
        " " +
        date.getFullYear();
      indicadoresLabel = `Indicadores de ${monthText}`;
    } else if (filteredStartDate === filteredEndDate) {
      // Un solo día
      indicadoresLabel = `Indicadores del ${filteredStartDate}`;
    } else {
      // Rango de fechas
      indicadoresLabel = `Indicadores desde el ${filteredStartDate} hasta el ${filteredEndDate}`;
    }
  }

  let contextLabel = "";
  if (filteredOpportunity && filteredOpportunity[0] && filteredOpportunity[1]) {
    contextLabel = `Convocatoria: ${filteredOpportunity[1]} #${filteredOpportunity[0]}`;
  } else if (filteredStartDate && filteredEndDate) {
    if (isFullMonthRange(filteredStartDate, filteredEndDate)) {
      const date = new Date(filteredStartDate + "T00:00:00");
      const meses = [
        "enero",
        "febrero",
        "marzo",
        "abril",
        "mayo",
        "junio",
        "julio",
        "agosto",
        "septiembre",
        "octubre",
        "noviembre",
        "diciembre",
      ];
      const monthText =
        meses[date.getMonth()].charAt(0).toUpperCase() +
        meses[date.getMonth()].slice(1) +
        " " +
        date.getFullYear();
      contextLabel = `Mes: ${monthText}`;
    } else if (filteredStartDate === filteredEndDate) {
      contextLabel = `Día: ${filteredStartDate}`;
    } else {
      contextLabel = `Desde ${filteredStartDate} hasta ${filteredEndDate}`;
    }
  }

  return (
    <div className="p-6 background-white">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">
          Reporte de Convocatorias
        </h1>
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
          {/* Barra de búsqueda de convocatoria y botón filtrar juntos */}
          <div className="flex items-end gap-2">
            <div className="relative" ref={inputRef}>
              <label className="block text-xs font-semibold mb-1">
                Convocatoria (para IA y rechazos)
              </label>
              <input
                type="text"
                placeholder="Buscar convocatoria"
                className="border border-gray-300 text-gray-500 rounded-full px-2 py-2 w-56 hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowOptions(true);
                }}
                onFocus={() => setShowOptions(true)}
                autoComplete="off"
              />
              {/* Menú personalizado */}
              {showOptions && filteredOptions.length > 0 && (
                <ul
                  className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow max-h-48 overflow-auto"
                  style={{ minWidth: "14rem" }}
                >
                  {filteredOptions.map((opt) => (
                    <li
                      key={opt}
                      className={`px-3 py-2 cursor-pointer hover:bg-emerald-100 ${
                        opt === searchTerm ? "bg-emerald-50" : ""
                      }`}
                      onMouseDown={() => {
                        handleSelectOption(opt);
                      }}
                    >
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {canFilter && (
              <button
                onClick={handleFilter}
                className="bg-emerald-600 text-white rounded-full px-4 py-2 hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
                disabled={loading}
              >
                Filtrar
              </button>
            )}
          </div>
          <div className="w-64"></div>
          {(isValidPeriod || searchTerm) && (
            <button
              className="ml-auto text-gray-400 border border-gray-400 px-3 py-1 rounded hover:bg-gray-100"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSearchTerm("");
                setFilteredEndDate("");
                setFilteredStartDate("");
                setFilteredOpportunity("");
                fetchJobOpportunitiesData();
              }}
            >
              Limpiar filtros
            </button>
          )}
          <button
            className={`${
              !isValidPeriod && !searchTerm ? "ml-auto" : ""
            } flex gap-2 items-center border border-green-600 text-green-700 px-3 py-1 rounded hover:bg-green-100`}
            onClick={handleExportExcel}
            disabled={loading}
          >
            <FaFileExcel />
            Exportar a Excel
          </button>
        </div>
        {indicadoresLabel && (
          <div className="mb-2">
            <span className="text-xl text-emerald-600 font-semibold">
              {indicadoresLabel}
            </span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="col-span-1 flex">
            {jobOpportunitiesData ? (
              <JobOpporrtunitiesBarChart
                data={jobOpportunitiesData}
                fromDate={filteredStartDate}
                toDate={filteredEndDate}
              />
            ) : (
              <div className="w-full h-80 bg-white rounded shadow p-10 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  {loading
                    ? "Cargando datos..."
                    : "No se encontraron convocatorias para el período seleccionado."}
                </div>
              </div>
            )}
          </div>
          <div className="col-span-2 flex">
            {rejectedData &&
            Array.isArray(rejectedData) &&
            rejectedData.length > 0 ? (
              <JobOpportunitiesPieChart
                data={rejectedData}
                fromDate={filteredStartDate}
                toDate={filteredEndDate}
                filteredOpportunity={filteredOpportunity}
              />
            ) : (
              <div className="w-full h-80 bg-white rounded shadow p-10 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  {loading
                    ? "Cargando datos..."
                    : "No se encontraron motivos de rechazo para el período seleccionado."}
                </div>
              </div>
            )}
          </div>
        </div>

        <PostulationIndicatorsCards data={indicators} context={contextLabel} />
        <h2 className="text-xl font-semibold mt-10 text-emerald-600">
          Análisis de IA
        </h2>
        <div className="mt-8">
          <PostulationSuitabilityCharts
            suitabilityData={suitabilityData}
            statusData={statusData}
            context={contextLabel}
          />
        </div>
        <FormAlert
          open={formAlertOpen}
          message={formAlertMsg}
          onClose={() => setFormAlertOpen(false)}
        />
      </div>
    </div>
  );
}
