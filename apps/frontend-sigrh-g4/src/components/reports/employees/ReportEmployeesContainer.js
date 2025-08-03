"use client";

import { useEffect, useState } from "react";
import { FaPerson } from "react-icons/fa6";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import config from "@/config";
import Select from "react-select";
import { useJob } from "@/hooks/useJob";
import { useSectors } from "@/hooks/useSectors";
import * as XLSX from "xlsx";
import { useEmployees } from "@/hooks/useEmployees";
import { FaFileExcel } from "react-icons/fa";

export default function ReportEmployeesContainer() {
  const [dataBySector, setDataBySector] = useState([]);
  const [dataByJob, setDataByJob] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const { jobs = [], loading: loadingJobs } = useJob();
  const { sectors = [], loading: loadingSectors } = useSectors();
  const { employees = [], loading: loadingEmployees } = useEmployees();

  const sectorOptions = sectors.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const jobOptions = jobs.map((j) => ({
    value: j.id,
    label: j.name,
  }));

  const handleExportExcel = async () => {
    try {
      const exportData = employees.map((emp) => ({
        ID: emp.id,
        Usuario: emp.user_id,
        Nombre: emp.first_name,
        Apellido: emp.last_name,
        DNI: emp.dni,
        Email: emp.personal_email,
        Activo: emp.active ? "Sí" : "No",
        Teléfono: emp.phone,
        Salario: emp.salary,
        Cargo: emp.job?.name || "",
        Sector: emp.job?.sector?.name || "",
        Turno: emp.shift?.description || "",
        Fecha_Nacimiento: emp.birth_date,
        Fecha_Contratación: emp.hire_date,
        Ciudad: emp.address_city,
        Provincia: emp.state?.name || "",
        País: emp.country?.name || "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Empleados");

      XLSX.writeFile(workbook, "empleados.xlsx");
    } catch (error) {
      console.error("Error exportando empleados:", error);
      alert("Error al exportar empleados.");
    }
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [sectorRes, jobRes] = await Promise.all([
          axios.get(`${config.API_URL}/employees/sector-count`),
          axios.get(`${config.API_URL}/employees/job-count`),
        ]);

        const sectorData = sectorRes.data.amount_by_sectors;
        const jobData = jobRes.data.amount_by_jobs;

        const formattedSectors = Object.entries(sectorData).map(
          ([name, values]) => ({
            name,
            Sector_id: values.Sector_id,
            Activos: values.Activos,
            Inactivos: values.Inactivos,
          })
        );

        const formattedJobs = Object.entries(jobData).map(([name, values]) => ({
          name,
          Job_id: values.Job_id,
          Activos: values.Activos,
          Inactivos: values.Inactivos,
        }));

        setDataBySector(formattedSectors);
        setDataByJob(formattedJobs);
      } catch (err) {
        console.error("Error fetching employee report data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const filteredSectorData = selectedSector
    ? dataBySector.filter((d) => d.Sector_id === selectedSector)
    : dataBySector;

  const filteredJobData = selectedJob
    ? dataByJob.filter((d) => d.Job_id === selectedJob)
    : dataByJob;

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
    <div className="p-6 bg-white">
      <div className="p-6">
        <div className="flex gap-2 items-center mb-4">
          <h1 className="text-2xl font-semibold">Reporte de Empleados</h1>
          <FaPerson />
        </div>

        {/* Filtros */}
        <div className="flex gap-4 mb-6 items-center">
          <div className="w-64">
            <Select
              styles={customSelectStyles}
              options={sectorOptions}
              isClearable
              placeholder="Filtrar por sector"
              value={
                sectorOptions.find((o) => o.value === selectedSector) || null
              }
              onChange={(option) =>
                setSelectedSector(option ? option.value : null)
              }
            />
          </div>
          <div className="w-64">
            <Select
              styles={customSelectStyles}
              options={jobOptions}
              isClearable
              placeholder="Filtrar por puesto"
              value={jobOptions.find((o) => o.value === selectedJob) || null}
              onChange={(option) =>
                setSelectedJob(option ? option.value : null)
              }
            />
          </div>
          <button
            className="ml-auto text-gray-400 border border-gray-400 px-3 py-1 rounded hover:bg-gray-100"
            onClick={() => {
              setSelectedSector(null);
              setSelectedJob(null);
            }}
          >
            Limpiar filtros
          </button>

          <button
            onClick={handleExportExcel}
            className="flex gap-2 items-center border border-green-600 text-green-700 px-3 py-1 rounded hover:bg-green-100"
          >
            <FaFileExcel />
            Exportar Excel
          </button>
        </div>

        {/* Gráficos */}
        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[500px] border border-gray-300 rounded-md p-4 overflow-hidden">
              <h2 className="font-semibold text-lg mb-2">Sectores</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredSectorData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      Number.isInteger(value) ? value : ""
                    }
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" align="center" />
                  <Bar dataKey="Activos" stackId="a" fill="#4ade80" />
                  <Bar dataKey="Inactivos" stackId="a" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[500px] border border-gray-300 rounded-md p-4 overflow-hidden">
              <h2 className="font-semibold text-lg mb-2">Puestos de trabajo</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredJobData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <XAxis
                    dataKey="name"
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      Number.isInteger(value) ? value : ""
                    }
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" align="center" />
                  <Bar dataKey="Activos" stackId="a" fill="#4ade80" />
                  <Bar dataKey="Inactivos" stackId="a" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
