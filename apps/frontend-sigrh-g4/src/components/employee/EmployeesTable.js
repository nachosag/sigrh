"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import config from "@/config";
import axios from "axios";
import Cookies from "js-cookie";
import EmployeeFilters from "./EmployeeFilters";
import { toastAlerts } from "@/utils/toastAlerts";
import AppTourProvider from "@/utils/AppTourProvider";
import { useTour } from "@reactour/tour";

export default function EmployeesTable() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});
  const [tourOpen, setTourOpen] = useState(false);

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const token = Cookies.get("token");
  const router = useRouter();

  const tourSteps = [
    {
      selector: "body",
      content:
        "Bienvenido al módulo de empleados. Aquí puedes gestionar a los empleados de la empresa.",
    },
    {
      selector: ".employees-table",
      content:
        "En esta tabla verás a los empleados, si deseas ver los datalles de uno de ellos o gestionarlos, clickea sobre su fila correspondiente en la tabla.",
    },
    {
      selector: ".employees-add-btn",
      content:
        "Si lo que quieres es crear un nuevo perfil de empleado, puedes hacer clic en este botón.",
    },
    {
      selector: ".employees-search-input",
      content:
        "Para facilitar tu busqueda, puedes escribir el nombre y/o apellido del empleado que estás buscando aquí.",
    },
    {
      selector: ".employees-filters",
      content:
        "También puedas aplicar filtros de búsqueda clickeando en este botón.",
    },
    {
      selector: ".interrogation-button",
      content:
        "Si necesitas ayuda, puedes hacer clic en este botón de interrogación para ver esta guía nuevamente.",
    },
    {
      selector: "body",
      content: "¡Eso es todo! Ahora puedes gestionar a tus empleados.",
    },
  ];

  useEffect(() => {
    if (!localStorage.getItem("employeesTourShown")) {
      setTourOpen(true);
      localStorage.setItem("employeesTourShown", "true");
    }
  }, []);

  const { setCurrentStep } = useTour();
  useEffect(() => {
    if (tourOpen) setCurrentStep && setCurrentStep(0);
  }, [tourOpen, setCurrentStep]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status !== 200) throw new Error("Error al traer los empleados");
      setEmployees(res.data);
    } catch (e) {
      toastAlerts.showError(
        "Hubo un error al obtener los empleados, recargue la página e intente nuevamente"
      );
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleRowClick = (id) => {
    router.push(`/sigrh/employees/${id}`);
  };

  const filteredEmployees = employees
    .filter((employee) => {
      const fullName =
        `${employee.first_name} ${employee.last_name}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase());
    })
    .filter((employee) => {
      if (filters.activeFilter) {
        if (filters.activeFilter === "activo" && !employee.active) return false;
        if (filters.activeFilter === "inactivo" && employee.active)
          return false;
      }
      return true;
    })
    .filter((employee) => {
      if (filters.idFilter) {
        return employee.id.toString() === filters.idFilter;
      }
      return true;
    })
    .filter((employee) => {
      if (filters.startDate && filters.endDate) {
        const hireDate = new Date(employee.hire_date);
        return (
          hireDate >= new Date(filters.startDate) &&
          hireDate <= new Date(filters.endDate)
        );
      }
      return true;
    });

  return (
    <AppTourProvider steps={tourSteps}>
      <div className="p-6">
        <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
          <div className="flex gap-2 items-center">
            <h1 className="text-2xl font-semibold employees-title">
              👥 Empleados
            </h1>
            <button
              onClick={() => router.push("employees/new")}
              className="px-4 py-2 bg-emerald-500 rounded-full text-white text-sm font-semibold flex items-center gap-2 employees-add-btn cursor-pointer hover:bg-emerald-600 transition-colors"
            >
              + Agregar
            </button>
            {/* Botón de ayuda */}
            <TourHelpButton setTourOpen={setTourOpen} />
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-full w-80 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 employees-search-input"
            placeholder="🔍︎ Buscar por nombre o apellido..."
          />

          <div className="employees-filters">
            <EmployeeFilters
              employees={employees}
              onApplyFilters={handleApplyFilters}
            />
          </div>
        </div>

        {/* Contenedor de la tabla con scroll */}
        <div className="overflow-x-auto max-h-[70vh] overflow-y-auto rounded-lg employees-table">
          <table className="min-w-full bg-white text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold text-center">
                <th className="py-2 px-4 text-left font-medium">ID</th>
                <th className="py-2 px-4 text-left font-medium">Nombre/s</th>
                <th className="py-2 px-4 text-left font-medium">Apellido/s</th>
                <th className="py-2 px-4 text-left font-medium">
                  Fecha de Contratación
                </th>
                <th className="py-2 px-4 text-center font-medium">Activo</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(employee.id)}
                  >
                    <td className="py-2 px-4 text-gray-700">{employee.id}</td>
                    <td className="py-2 px-4 text-gray-700">
                      {employee.first_name}
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      {employee.last_name}
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      {new Date(employee.hire_date).toLocaleDateString(
                        "es-AR",
                        {
                          timeZone: "UTC",
                        }
                      )}
                    </td>
                    <td className="py-2 px-4 text-center text-gray-700">
                      {employee.active ? (
                        <div className="flex justify-center rounded-full px-3 py-1 font-semibold border bg-green-200 text-green-600">
                          Activo
                        </div>
                      ) : (
                        <div className="flex justify-center rounded-full px-3 py-1 font-semibold border bg-red-200 text-red-600">
                          Inactivo
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    No se encontraron empleados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TourOpener open={tourOpen} setOpen={setTourOpen} />
    </AppTourProvider>
  );
}

// Botón de ayuda, ahora sí dentro del contexto del provider
function TourHelpButton({ setTourOpen }) {
  const { setCurrentStep } = useTour();
  return (
    <button
      className="ml-2 interrogation-button flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors cursor-pointer"
      onClick={() => {
        setTourOpen(true);
        setCurrentStep && setCurrentStep(0);
      }}
      title="Ver guía"
      type="button"
    >
      <span className="text-white text-xl font-bold">?</span>
    </button>
  );
}

function TourOpener({ open, setOpen }) {
  const { setIsOpen } = useTour();
  useEffect(() => {
    setIsOpen && setIsOpen(open);
  }, [open, setIsOpen]);
  return null;
}
