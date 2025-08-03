"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import config from "@/config";
import { toastAlerts } from "@/utils/toastAlerts";

const toCamelCase = (text) => {
  let result = "";
  result += text.charAt(0).toUpperCase();
  for (let i = 1; i < text.length; i++) {
    result += text.charAt(i).toLowerCase();
  }

  return result;
};

export default function OfferCard({ jobOpportunity, onApply }) {
  const [showFullDescription, setShowFullDescription] = useState(false); // Estado para alternar descripción

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  const token = Cookies.get("token");

  const toggleDescription = () => {
    setShowFullDescription((prev) => !prev);
  };

  const fetchCountries = async () => {
    try {
      const res = await axios.get(`${config.API_URL}/countries/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status != 200) throw new Error("Error al traer los países");

      setCountries(res.data);
    } catch (e) {
      toastAlerts.showError(
        "Ocurrió un error al traer los países, recargue la página e intente nuevamente"
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
        "Ocurrió un error al traer los estados, recargue la página e intente nuevamente"
      );
      console.error("Error al obtener estados:", e);
    }
  };

  useEffect(() => {
    fetchCountries();
    fetchStates();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-xl hover:scale-102 transition-transform transition-shadow">
      <h3 className="text-lg font-semibold text-emerald-600 mb-2 cursor-default">
        {jobOpportunity.title}
      </h3>
      <p className="text-sm text-gray-600 mb-4 cursor-default">
        {showFullDescription
          ? jobOpportunity.description
          : jobOpportunity.description.length > 250
            ? jobOpportunity.description.substring(0, 250) + "..."
            : jobOpportunity.description}
        {jobOpportunity.description.length > 250 && (
          <button
            onClick={toggleDescription}
            className="text-emerald-500 font-semibold ml-2 hover:underline"
          >
            {showFullDescription ? "Ver menos" : "Ver más"}
          </button>
        )}
      </p>
      <p className="text-sm text-gray-600 mb-2 mt-2 cursor-default">
        🌍{" "}
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
      <p className="text-sm text-gray-600 font-semibold mb-2 mt-2 cursor-default">
        💻 {toCamelCase(jobOpportunity.work_mode)}
      </p>

      {/* Habilidades requeridas */}
      <div className="mb-2 mt-2">
        <p className="text-sm font-semibold text-gray-600 mb-1">
          Habilidades excluyentes:
        </p>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 p-2 rounded-md">
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
        onClick={() => onApply(jobOpportunity)}
        className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors mt-2 cursor-pointer"
      >
        Postularme
      </button>
    </div>
  );
}
