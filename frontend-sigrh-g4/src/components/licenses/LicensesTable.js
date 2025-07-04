"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import { useEmployees } from "@/hooks/useEmployees";
import LicenseModal from "./LicenseModal";
import { useUser } from "@/contexts/userContext";
import { FiInfo } from "react-icons/fi";
import { toastAlerts } from "@/utils/toastAlerts";

export default function LicensesTable({ filters = {} }) {
  const token = Cookies.get("token");
  const [licenses, setLicenses] = useState([]);
  const { employees } = useEmployees();
  const { user, role } = useUser();
  const [expandedRows, setExpandedRows] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [licensesTypes, setLicensesTypes] = useState([]);

  function splitEveryNChars(str, n) {
    //Esto para que el texto quede mejor en la tabla, hago que las palabras largas se dividan en líneas de n caracteres
    if (!str) return "";
    const regex = new RegExp(`.{1,${n}}`, "g");
    return str.match(regex)?.join("\n") ?? str;
  }

  function handleManageLicense(license) {
    setSelectedLicense(license);
    setModalOpen(true);
  }

  const fetchLicenses = async () => {
    try {
      const params = {};

      // Si el usuario es supervisor, filtrar por su sector_id
      if (role?.id == 5 && user?.job?.sector_id) {
        params.sector_id = user.job.sector_id;
      }

      const res = await axios.get(`${config.API_URL}/leaves`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      if (res.status !== 200) throw new Error("Error al obtener licencias");
      setLicenses(res.data);
    } catch (error) {
      console.error("Error al traer licenses:", error);
      toastAlerts.showError(
        "Hubo un error al obtener las licencias, recargue la página e intente nuevamente"
      );
    }
  };

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

  useEffect(() => {
    fetchLicenses();
    fetchLicensesTypes();
  }, []);

  const adaptText = (text) => {
    if (!text) return "";
    text = text.replace(/_/g, " ");
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  function countBusinessDays(startDate, endDate) {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    let count = 0;
    let current = new Date(start);

    while (current <= end) {
      const day = current.getDay();
      const sunday = 0;
      const saturday = 6;

      if (day !== sunday && day !== saturday) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return count;
  }

  const handleToggleReason = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSave = async (updatedLicense) => {
    const payload = {
      document_status: updatedLicense.document_status,
      request_status: updatedLicense.request_status,
    };

    try {
      const res = await axios.patch(
        `${config.API_URL}/leaves/${updatedLicense.id}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status !== 200) throw new Error("Error al modificar licencias");
    } catch (error) {
      console.error("Error al modificar licencias:", error);
      toastAlerts.showError(
        "Hubo un error al modificar la licencia, recargue la página e intente nuevamente"
      );
    }

    fetchLicenses();
    fetchLicensesTypes();
    setModalOpen(false);
    setSelectedLicense(null);
  };

  const filteredLicenses = licenses.filter((lic) => {
    let match = true;

    if (filters.employeeName) {
      const emp = employees.find((emp) => emp.id === lic.employee_id);
      const fullName = emp
        ? `${emp.first_name} ${emp.last_name}`.toLowerCase()
        : "";
      if (!fullName.includes(filters.employeeName.toLowerCase())) match = false;
    }

    if (filters.type && String(lic.leave_type_id) !== String(filters.type)) {
      match = false;
    }

    if (
      filters.status &&
      lic.request_status.toLowerCase() !== filters.status.toLowerCase()
    ) {
      match = false;
    }

    if (filters.month) {
      const month = new Date(lic.request_date).getMonth() + 1;
      if (Number(filters.month) !== month) match = false;
    }

    if (filters.year) {
      const year = new Date(lic.request_date).getFullYear();
      if (Number(filters.year) !== year) match = false;
    }

    return match;
  });

  return (
    <div className="overflow-auto h-[70vh]">
      <table className="min-w-full table-fixed bg-white rounded-lg shadow text-xs">
        <thead className="sticky top-0">
          <tr className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold text-center">
            <th className="py-2 px-4 text-left border-b border-gray-300 font-semibold">
              Empleado
            </th>
            <th className="py-2 px-4 text-left border-b border-gray-300 font-semibold">
              DNI
            </th>
            <th className="py-2 px-4 text-left border-b border-gray-300 font-semibold">
              Fecha Solicitud
            </th>
            <th className="py-2 px-4 text-left border-b border-gray-300 font-semibold">
              Tipo de licencia
            </th>
            <th className="py-2 px-4 text-left border-b border-gray-300 font-semibold">
              Motivo
            </th>
            <th className="py-2 px-4 text-left border-b border-gray-300 font-semibold">
              Días hábiles
            </th>
            <th className="py-2 px-4 text-left border-b border-gray-300 font-semibold">
              Desde
            </th>
            <th className="py-2 px-4 text-left border-b border-gray-300 font-semibold">
              Hasta
            </th>
            <th className="py-2 px-4 text-left border-b border-gray-300 font-semibold">
              Estado doc.
            </th>
            <th className="py-2 px-4 text-left border-b border-gray-300 font-semibold">
              Estado Aceptación
            </th>
            <th className="py-2 px-4 text-center border-b border-gray-300 font-semibold">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredLicenses.map((lic) => (
            <tr key={lic.id}>
              <td className="py-2 px-4 border-b border-gray-300">
                {(() => {
                  const emp = employees.find(
                    (emp) => emp.id === lic.employee_id
                  );
                  return emp
                    ? `${emp.first_name} ${emp.last_name}`
                    : "Desconocido";
                })()}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {employees.find((emp) => emp.id === lic.employee_id)?.dni ||
                  "Desconocido"}
              </td>
              <td className="py-2 px-4 border-b border-gray-300 whitespace-nowrap">
                {lic.request_date}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {adaptText(
                  lic.leave_type_id
                    ? licensesTypes?.find(
                        (lic2) => lic.leave_type_id === lic2.id
                      )?.type
                    : "Tipo no encontrado"
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-300 align-top">
                {lic.reason && lic.reason.length > 30 ? (
                  <>
                    {!expandedRows[lic.id] ? (
                      <>
                        <div className="whitespace-pre-line break-words">
                          {adaptText(
                            splitEveryNChars(lic.reason.slice(0, 30), 30)
                          )}
                          ...
                        </div>
                        <button
                          className="ml-0 mt-1 text-emerald-600 underline text-xs block"
                          onClick={() => handleToggleReason(lic.id)}
                          type="button"
                        >
                          Ver más
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="whitespace-pre-line break-words">
                          {adaptText(splitEveryNChars(lic.reason, 30))}
                        </div>
                        <button
                          className="ml-0 mt-1 text-emerald-600 underline text-xs block"
                          onClick={() => handleToggleReason(lic.id)}
                          type="button"
                        >
                          Ver menos
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="whitespace-pre-line break-words">
                    {adaptText(splitEveryNChars(lic.reason, 30))}
                  </div>
                )}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {countBusinessDays(lic.start_date, lic.end_date)}
              </td>
              <td className="py-2 px-4 border-b border-gray-300 whitespace-nowrap">
                {lic.start_date}
              </td>
              <td className="py-2 px-4 border-b border-gray-300 whitespace-nowrap">
                {lic.end_date}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {adaptText(lic.document_status)}
              </td>
              <td className="py-2 px-4 border-b border-gray-300">
                {adaptText(lic.request_status)}
              </td>
              <td
                className="py-2 px-4 border-b border-gray-300 text-center"
                style={{ position: "relative" }}
              >
                {user &&
                lic.employee_id !== user.id &&
                !["aprobado", "rechazado"].includes(
                  String(lic.request_status).toLowerCase()
                ) ? (
                  <button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1 rounded-full"
                    onClick={() => handleManageLicense(lic)}
                  >
                    Gestionar
                  </button>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <InfoPopup
                      reason={
                        user && lic.employee_id === user.id
                          ? "No puedes gestionar tus propias licencias, solicita a un supervisor/gerente que lo haga por ti"
                          : "La solicitud ya está finalizada, no puedes modificarla"
                      }
                    />
                    {lic.file ? (
                      <button
                        className="flex items-center gap-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-semibold px-3 py-1 rounded-full"
                        onClick={() => {
                          const byteCharacters = atob(lic.file);
                          const byteNumbers = new Array(byteCharacters.length);
                          for (let i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                          }
                          const byteArray = new Uint8Array(byteNumbers);
                          const blob = new Blob([byteArray], {
                            type: "application/pdf",
                          });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `licencia_${lic.id}.pdf`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          URL.revokeObjectURL(url);
                        }}
                        title="Descargar documentación"
                        type="button"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                          />
                        </svg>
                        Documentación
                      </button>
                    ) : (
                      <div
                        className="flex items-center gap-1 bg-gray-200 text-gray-500 font-semibold px-3 py-1 rounded-full cursor-not-allowed select-none"
                        title="No hay documentación disponible"
                      >
                        Sin doc.
                      </div>
                    )}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <LicenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        license={selectedLicense}
        onSave={handleSave}
      />
    </div>
  );
}

function InfoPopup({ reason }) {
  const [show, setShow] = useState(false);

  return (
    <span className="relative">
      <button
        className="flex items-center justify-center hover:bg-gray-100 text-emerald-600 font-semibold px-3 py-1 rounded-full"
        onClick={() => setShow((v) => !v)}
        type="button"
        title="Información"
      >
        <FiInfo className="text-xl" />
      </button>
      {show && (
        <div
          className="absolute z-[50] right-0 top-8 mb-2 w-56 bg-white border border-gray-300 rounded shadow-lg p-3 text-sm text-gray-700"
          style={{ minWidth: "180px" }}
        >
          <p className="text-emerald-800">{reason}</p>
          <button
            className="block ml-auto mt-2 text-emerald-600 hover:underline text-xs"
            onClick={() => setShow(false)}
            type="button"
          >
            Cerrar
          </button>
        </div>
      )}
    </span>
  );
}
