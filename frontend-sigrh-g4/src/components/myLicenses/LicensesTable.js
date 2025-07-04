import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import { useUser } from "@/contexts/userContext";
import LicenseRevision from "./LicenseRevision";
import { toastAlerts } from "@/utils/toastAlerts";

function splitEveryNChars(str, n) {
  //Esto para que el texto quede mejor en la tabla, hago que las palabras largas se dividan en líneas de n caracteres
  if (!str) return "";
  const regex = new RegExp(`.{1,${n}}`, "g");
  return str.match(regex)?.join("\n") ?? str;
}

export default function LicensesTable({
  disabled,
  filters = {},
  updatedLicense,
  setUpdatedLicense,
}) {
  const token = Cookies.get("token");
  const [allLicenses, setAllLicenses] = useState([]);
  const { user } = useUser();
  const [expandedRows, setExpandedRows] = useState({});
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [licensesTypes, setLicensesTypes] = useState([]);

  const fetchUserLicenses = async () => {
    try {
      const res = await axios.get(
        `${config.API_URL}/leaves/?employee_id=${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status !== 200) throw new Error("Error al obtener licencias");
      setAllLicenses(res.data);
    } catch (error) {
      console.error("Error al traer licenses:", error);
      toastAlerts.showError(
        "Hubo un error al obtener las licencias, recargue la página e intente nuevamente."
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
        "Hubo un error al obtener los tipos de licencia, recargue la página e intente nuevamente."
      );
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchUserLicenses();
      fetchLicensesTypes();
      setUpdatedLicense(false);
    }
    // eslint-disable-next-line
  }, [user, token, updatedLicense]);

  // Filtrado en frontend
  const filteredLicenses = allLicenses.filter((lic) => {
    let match = true;
    if (filters.type && String(lic.leave_type_id) !== String(filters.type))
      match = false;
    if (
      filters.status &&
      lic.request_status.toLowerCase() !== filters.status.toLowerCase()
    )
      match = false;
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

  const adaptText = (text) => {
    if (!text) return "";
    text = text.replace(/_/g, " ");
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const handleToggleReason = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleRevision = (license) => {
    setSelectedLicense(license);
    setRevisionOpen(true);
  };

  const handleSaveRevision = async (updatedLicense) => {
    const payload = {
      file: updatedLicense.file || null,
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
      toastAlerts.showSuccess("Licencia modificada correctamente.");
    } catch (error) {
      console.error("Error al modificar licencias:", error);
      toastAlerts.showError(
        "Error al modificar la licencia, intentelo nuevamente más tarde."
      );
    }

    fetchLicensesTypes();
    fetchUserLicenses();
    setRevisionOpen(false);
    setSelectedLicense(null);
  };

  return (
    <div className="overflow-auto h-[70vh]">
      <table className="min-w-full table-fixed bg-white rounded-lg shadow text-xs">
        <thead className="sticky top-0">
          <tr className="px-3 py-2 bg-emerald-50 text-emerald-700 text-xs font-semibold text-center">
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
          {filteredLicenses.length > 0 ? (
            filteredLicenses.map((lic) => (
              <tr key={lic.id}>
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
                  {lic.reason && lic.reason.length > 40 ? (
                    <>
                      {!expandedRows[lic.id] ? (
                        <>
                          <div className="whitespace-pre-line break-words">
                            {adaptText(
                              splitEveryNChars(lic.reason.slice(0, 40), 40)
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
                            {adaptText(splitEveryNChars(lic.reason, 40))}
                          </div>
                          <button
                            className="ml-0 mt-1 text-emerald-600 underline text-xs block"
                            onClick={() => handleToggleReason(lic.id)}
                            type="button"
                            disabled={disabled}
                          >
                            Ver menos
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="whitespace-pre-line break-words">
                      {adaptText(splitEveryNChars(lic.reason, 40))}
                    </div>
                  )}
                </td>
                <td className="py-2 px-4 border-b border-gray-300">
                  {/** Días hábiles */}
                  {(() => {
                    if (!lic.start_date || !lic.end_date) return "-";
                    const start = new Date(lic.start_date);
                    const end = new Date(lic.end_date);
                    let count = 0;
                    let current = new Date(start);
                    while (current <= end) {
                      const day = current.getDay();
                      if (day !== 0 && day !== 6) count++;
                      current.setDate(current.getDate() + 1);
                    }
                    return count;
                  })()}
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
                <td className="py-2 px-4 border-b border-gray-300 text-center">
                  <button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1 rounded-full"
                    onClick={() => handleRevision(lic)}
                    disabled={disabled}
                  >
                    Revisar
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="py-4 px-4 text-center text-gray-500">
                No realizaste ninguna solicitud de licencia aún.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <LicenseRevision
        open={revisionOpen}
        onClose={() => setRevisionOpen(false)}
        license={selectedLicense}
        onSave={handleSaveRevision}
      />
    </div>
  );
}
