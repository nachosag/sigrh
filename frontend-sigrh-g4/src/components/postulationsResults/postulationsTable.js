"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import SelectStatusChip from "./SelectStatusChip";
import { useCountries } from "@/hooks/useCountries";
import { useStatesCountry } from "@/hooks/useStatesCountry";
import * as XLSX from "xlsx";
import TagsModal from "./TagsModal";
import { toastAlerts } from "@/utils/toastAlerts";

export default function PostulationsTable({
  jobOpportunityId,
  filter,
  searchInput,
}) {
  const [postulations, setPostulations] = useState([]);
  const [filteredPostulations, setFilteredPostulations] = useState([]);
  const token = Cookies.get("token");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedPostulation, setSelectedPostulation] = useState(null); // Estado para almacenar el ID de la postulación seleccionada

  // Obtener países y estados desde los hooks
  const { countries } = useCountries();
  const { states } = useStatesCountry();

  // Función para obtener el nombre del país a partir del ID
  const getCountryName = (countryId) => {
    const country = countries.find((c) => c.id === countryId);
    return country ? country.name : "País desconocido";
  };

  // Función para obtener el nombre del estado a partir del ID
  const getStateName = (stateId) => {
    const state = states.find((s) => s.id === stateId);
    return state ? state.name : "Estado desconocido";
  };

  const exportToExcel = () => {
    // Crear una hoja de cálculo a partir de los datos de las postulaciones
    const worksheet = XLSX.utils.json_to_sheet(
      filteredPostulations.map((postulation) => ({
        ID: postulation.id,
        Nombre: postulation.name,
        Apellido: postulation.surname,
        Email: postulation.email,
        Teléfono: postulation.phone_number,
        Ubicación: `${getStateName(
          postulation.address_state_id
        )}, ${getCountryName(postulation.address_country_id)}`,
        Evaluación: postulation.suitable ? "Apta" : "No apta",
        Estado: postulation.status,
        "Habilidades Requeridas":
          postulation.ability_match?.required_words_found?.join(", ") ||
          "Ninguna",
        "Habilidades Deseables":
          postulation.ability_match?.desired_words_found?.join(", ") ||
          "Ninguna",
      }))
    );

    // Crear un libro de trabajo y agregar la hoja de cálculo
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Postulaciones");

    // Generar el archivo Excel y descargarlo
    XLSX.writeFile(workbook, "postulaciones.xlsx");
  };

  const fetchPostulations = async () => {
    try {
      const res = await axios.get(
        `${config.API_URL}/postulations?job_opportunity_id=${jobOpportunityId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.status !== 200)
        throw new Error("Error al traer las postulaciones");
      setPostulations(res.data);
    } catch (e) {
      console.error(e);
      toastAlerts.showError(
        "Hubo un error al obtener las postulaciones, recargue la página e intente nuevamente"
      );
    }
  };

  useEffect(() => {
    fetchPostulations();
  }, [jobOpportunityId]);

  const applyFilters = () => {
    let filtered = postulations;

    if (filter === "aptas") {
      filtered = filtered.filter((p) => p.suitable);
    } else if (filter === "no_aptas") {
      filtered = filtered.filter((p) => !p.suitable);
    }

    if (searchInput) {
      filtered = filtered.filter((p) =>
        `${p.name} ${p.surname}`
          .toLowerCase()
          .includes(searchInput.toLowerCase())
      );
    }

    setFilteredPostulations(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [filter, searchInput, postulations]);

  const handleDownloadCV = (cvBase64, fileName) => {
    try {
      const binaryString = atob(cvBase64);
      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([byteArray]);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || "cv.pdf";
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el CV:", error);
      toastAlerts.showError(
        "Hubo un error al descargar el CV, intente nuevamente"
      );
    }
  };

  return (
    <div className="p-6">
      {/* Botón para exportar a Excel */}
      {postulations.length > 0 && (
        <div className="mb-4">
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
          >
            Exportar a Excel
          </button>
        </div>
      )}

      {/* Contenedor de la tabla con scroll */}
      <div className="max-h-[70vh] max-w-[90%] rounded-lg">
        <table className="w-full bg-white">
          <thead className="bg-emerald-50 top-0 z-10">
            <tr>
              <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm font-medium text-emerald-700">
                ID
              </th>
              <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm font-medium text-emerald-700">
                Nombre
              </th>
              <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm font-medium text-emerald-700">
                Email
              </th>
              <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm font-medium text-emerald-700">
                Teléfono
              </th>
              <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm font-medium text-emerald-700">
                Ubicación
              </th>
              <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm font-medium text-emerald-700">
                Evaluación
              </th>
              <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm font-medium text-emerald-700">
                Habilidades Requeridas
              </th>
              <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm font-medium text-emerald-700">
                Habilidades Deseables
              </th>
              <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm font-medium text-emerald-700">
                Estado
              </th>
              <th className="py-2 px-2 md:px-4 text-center text-xs md:text-sm font-medium text-emerald-700">
                CVs
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPostulations.length > 0 ? (
              filteredPostulations.map((postulation) => (
                <tr
                  key={postulation.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2 px-2 md:px-4 text-xs md:text-sm text-gray-700 whitespace-normal break-words text-center">
                    {postulation.id}
                  </td>
                  <td className="py-2 px-2 md:px-4 text-xs md:text-sm text-gray-700 whitespace-normal break-words text-center">
                    {postulation.name} {postulation.surname}
                  </td>
                  <td className="py-2 px-2 md:px-4 text-xs md:text-sm text-gray-700 whitespace-normal break-words text-center">
                    {postulation.email}
                  </td>
                  <td className="py-2 px-2 md:px-4 text-xs md:text-sm text-gray-700 whitespace-normal break-words text-center">
                    {postulation.phone_number}
                  </td>
                  <td className="py-2 px-2 md:px-4 text-xs md:text-sm text-gray-700 whitespace-normal break-words text-center">
                    {getStateName(postulation.address_state_id)},{" "}
                    {getCountryName(postulation.address_country_id)}
                  </td>
                  <td className="py-2 px-2 md:px-4 text-xs md:text-sm text-gray-700 whitespace-normal break-words text-center">
                    <span
                      className={`font-semibold ${
                        postulation.evaluated_at
                          ? postulation.suitable
                            ? "text-green-600"
                            : "text-red-600"
                          : "text-yellow-500"
                      }`}
                    >
                      {postulation.evaluated_at
                        ? postulation.suitable
                          ? "Apta"
                          : "No apta"
                        : "Pendiente"}
                    </span>
                  </td>
                  <td className="py-2 px-2 md:px-4 text-xs md:text-sm text-gray-700 whitespace-normal break-words text-center">
                    {/* Habilidades requeridas */}
                    {postulation.ability_match?.required_words_found?.length >
                    0 ? (
                      <>
                        <button
                          className="flex justify-center items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full text-sm hover:bg-emerald-600 cursor-pointer mx-auto"
                          onClick={() => {
                            setModalTitle("Habilidades requeridas");
                            setSelectedPostulation(postulation);
                            setModalOpen(true);
                          }}
                        >
                          Revisar
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">Ninguna</span>
                    )}
                  </td>
                  <td className="py-2 px-2 md:px-4 text-xs md:text-sm text-gray-700 whitespace-normal break-words text-center">
                    {/* Habilidades deseables */}
                    {postulation.ability_match?.desired_words_found?.length >
                    0 ? (
                      <>
                        <button
                          className="flex justify-center items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full text-sm hover:bg-emerald-600 cursor-pointer mx-auto"
                          onClick={() => {
                            setModalTitle("Habilidades deseables");
                            setSelectedPostulation(postulation);
                            setModalOpen(true);
                          }}
                        >
                          Revisar
                        </button>
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">Ninguna</span>
                    )}
                  </td>
                  <td className="py-2 px-2 md:px-4 text-xs md:text-sm text-gray-700 whitespace-normal break-words text-center">
                    <SelectStatusChip
                      value={postulation.status}
                      postulation={postulation}
                      onChange={() => {
                        fetchPostulations();
                      }}
                    />
                  </td>
                  <td className="py-2 px-2 md:px-4 text-xs md:text-sm text-gray-700 whitespace-normal break-words text-center">
                    <button
                      onClick={() =>
                        handleDownloadCV(
                          postulation.cv_file,
                          `cv_${postulation.id}.pdf`
                        )
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-full text-sm hover:bg-emerald-600 cursor-pointer"
                    >
                      Descargar CV
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="py-4 text-center text-gray-500">
                  No se encontraron postulaciones
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para mostrar habilidades */}
      <TagsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        postulation={selectedPostulation}
      />
    </div>
  );
}
