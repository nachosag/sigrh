import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import { useRouter } from "next/navigation";
import { toastAlerts } from "@/utils/toastAlerts";

export default function JobOpportunityCard({ jobOpportunity, onModify }) {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const token = Cookies.get("token");
  const router = useRouter(); // Inicializar el router

  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/countries/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status != 200) throw new Error("Error al traer los países");

      setCountries(res.data);
    } catch (e) {
      toastAlerts.showError(
        "Hubo un error al obtener los países, recargue la página e intente nuevamente"
      );
      console.error("Error al obtener países:", e);
    }
  };

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/states/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status != 200) throw new Error("Error al traer los estados");

      setStates(res.data);
    } catch (e) {
      toastAlerts.showError(
        "Hubo un error al obtener los estados, recargue la página e intente nuevamente"
      );
      console.error("Error al obtener estados:", e);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchStates();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-2 relative border border-gray-300">
      <h2 className="text-lg font-bold text-gray-800">
        {jobOpportunity.title}
      </h2>
      <p className="text-sm text-gray-600">
        📋 Descripción:{" "}
        <span className="font-semibold">
          {jobOpportunity.description.length > 100
            ? jobOpportunity.description.substring(0, 200) + "..."
            : jobOpportunity.description}
        </span>
      </p>
      <p className="text-sm text-gray-600">
        🌍 Zona:{" "}
        <span className="font-semibold">
          {(() => {
            const state = states.find(
              (state) => state.id === jobOpportunity.state_id
            );
            if (state) {
              const country = countries.find(
                (country) => country.id === state.country_id
              );
              return `${state?.name || "País desconocido"}, ${
                country?.name || "Estado desconocido"
              }`;
            }
            return "Zona desconocida";
          })()}
        </span>
      </p>
      <p className="text-sm text-gray-600">
        💻 Modalidad:{" "}
        <span className="font-semibold">{jobOpportunity.work_mode}</span>
      </p>
      <p className="text-sm text-gray-600">
        🔌 Estado:{" "}
        <span
          className={`text-sm font-semibold ${
            jobOpportunity.status === "no_activo"
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {jobOpportunity.status === "no_activo" ? "Inactiva" : "Activa"}
        </span>{" "}
      </p>

      {/* Habilidades requeridas */}
      <div className="mb-2 mt-2">
        <p className="text-sm font-semibold text-gray-600 mb-1">
          Habilidades excluyentes:
        </p>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 rounded-md">
          {jobOpportunity.required_abilities &&
          jobOpportunity.required_abilities.length > 0 ? (
            jobOpportunity.required_abilities.map((ability, index) => (
              <span
                key={index}
                className="bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full text-sm whitespace-nowrap"
              >
                {ability.name}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No especificadas</span>
          )}
        </div>
      </div>

      {/* Habilidades deseables */}
      <div className="mb-2 mt-2">
        <p className="text-sm font-semibold text-gray-600 mb-1">
          Habilidades deseables:
        </p>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-2 rounded-md">
          {jobOpportunity.desirable_abilities &&
          jobOpportunity.desirable_abilities.length > 0 ? (
            jobOpportunity.desirable_abilities.map((ability, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-3 py-1 font-semibold rounded-full text-sm whitespace-nowrap"
              >
                {ability.name}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No especificadas</span>
          )}
        </div>
      </div>

      <button
        onClick={() =>
          router.push(`/sigrh/job_opportunities/${jobOpportunity.id}`)
        } // Redirigir a la subruta
        className="mt-2 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
      >
        Ver detalles
      </button>
    </div>
  );
}
