import React from "react";

//Aca estan los indicadores que se van a mostrar en las cards para las stats
const indicators = [
  { key: "suitable_average", label: "Promedio Aptos Por Convocatoria" },
  { key: "not_suitable_average", label: "Promedio No Aptos Por Convocatoria" },
  {
    key: "accepted_postulation_average",
    label: "Promedio Aceptados Por Convocatoria",
  },
  {
    key: "rejected_postulation_average",
    label: "Promedio Rechazados Por Convocatoria",
  },
  {
    key: "hired_postulation_average",
    label: "Promedio Contratados Por Convocatoria",
  },
  {
    key: "pending_postulation_average",
    label: "Promedio Pendientes Por Convocatoria",
  },
  { key: "count_opportunities", label: "Cantidad de Convocatorias" },
  { key: "count_postulations", label: "Cantidad de Postulaciones" },
];

export default function PostulationIndicatorsCards({ data }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-6">
      {indicators.map((ind) => (
        <div
          key={ind.key}
          className="bg-white rounded shadow p-6 flex flex-col items-center"
        >
          <span className="text-xs text-gray-500 mb-2 text-center">
            {ind.label}
          </span>
          <span className="text-3xl font-bold text-emerald-700">
            {data?.[ind.key] ?? 0}
          </span>
        </div>
      ))}
    </div>
  );
}
