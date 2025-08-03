import React, { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import config from "@/config";
import Cookies from "js-cookie";

// Colores para el primer gráfico
const COLORS = [
  "#10b981", // verde
  "#f43f5e", // rojo
];

//Colores para el segundo gráfico
const COLORS2 = [
  "#f97316", // naranja
  "#fbbf24", // amarillo
  "#10b981", // verde
];

function Guide({ data, labels, colors = COLORS }) {
  return (
    <div className="flex flex-col gap-2 ml-6">
      {data.map((item, idx) => (
        <div key={labels[idx]} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block w-4 h-4 rounded-full"
            style={{ backgroundColor: colors[idx % colors.length] }}
          ></span>
          <span>
            {labels[idx]}:{" "}
            <span className="font-semibold border border-gray-200 px-1 rounded">
              {item.value}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PostulationSuitabilityCharts({
  suitabilityData,
  statusData,
  context,
}) {
  return (
    <div className="w-full flex flex-col md:flex-row gap-8 mt-8">
      {/* Gráfico 1 */}
      <div className="flex-1 bg-white rounded shadow p-6 flex flex-col md:flex-row items-center">
        <div className="flex-1 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-emerald-700 text-center">
            Aptos IA / No Aptos IA{" "}
            {context && (
              <div className="mb-2 text-xs text-emerald-700 font-semibold text-center">
                {context}
              </div>
            )}
          </h3>
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie
                data={suitabilityData || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                isAnimationActive={true}
              >
                {(suitabilityData || []).map((entry, idx) => (
                  <Cell key={entry.name} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const total = (suitabilityData || []).reduce(
                    (acc, cur) => acc + (cur.value || 0),
                    0
                  );
                  const percent = total
                    ? ((value / total) * 100).toFixed(1)
                    : "0.0";
                  return [`${value} (${percent}%)`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {suitabilityData && (
          <Guide data={suitabilityData} labels={["Aptos IA", "No Aptos IA"]} />
        )}
      </div>
      {/* Gráfico 2 */}
      <div className="flex-1 bg-white rounded shadow p-6 flex flex-col md:flex-row items-center">
        <div className="flex-1 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-emerald-700 text-center">
            Ánalisis de Aceptación y Contratación{" "}
            {context && (
              <div className="mb-2 text-xs text-emerald-700 font-semibold text-center">
                {context}
              </div>
            )}
          </h3>
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie
                data={statusData || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                isAnimationActive={true}
              >
                {(statusData || []).map((entry, idx) => (
                  <Cell key={entry.name} fill={COLORS2[idx % COLORS2.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => {
                  const total = (statusData || []).reduce(
                    (acc, cur) => acc + (cur.value || 0),
                    0
                  );
                  const percent = total
                    ? ((value / total) * 100).toFixed(1)
                    : "0.0";
                  return [`${value} (${percent}%)`, name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {statusData && (
          <Guide
            data={statusData}
            labels={[
              "Aptos IA no aceptados/contratados",
              "Aptos IA Aceptados",
              "Aptos IA Contratados",
            ]}
            colors={COLORS2}
          />
        )}
      </div>
    </div>
  );
}
