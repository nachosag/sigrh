import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const COLORS = [
  "#0ea5e9",
  "#f59e42",
  "#a21caf",
  "#fbbf24",
  "#f43f5e",
  "#10b981",
  "#818cf8",
  "#f472b6",
  "#22d3ee",
  "#a3e635",
  "#fca5a5",
  "#eab308",
  "#6366f1",
  "#fb7185",
  "#84cc16",
  "#fcd34d",
  "#34d399",
  "#f9a8d4",
  "#bef264",
  "#fef08a",
  "#7dd3fc",
  "#e879f9",
  "#f87171",
  "#a5b4fc",
  "#4ade80",
  "#a7f3d0",
  "#6ee7b7",
  "#fde68a",
  "#c084fc",
  "#38bdf8",
  "#facc15",
];

function sumMotivos(data, filteredOpportunity) {
  if (filteredOpportunity && filteredOpportunity[0]) {
    // Si hay una convocatoria filtrada, va a quedarse solo con los valores de esa convocatoria
    const selected = data.find(
      (item) => String(item.opportunity_id) === String(filteredOpportunity[0])
    );
    if (!selected) return [];
    return Object.entries(selected.motivos).map(([motivo, count], idx) => ({
      id: idx,
      motivo,
      count,
    }));
  }
  // Si no hay convocatoria filtrada, suma los motivos de todas las convocatorias
  const motivosSum = {};
  data.forEach((item) => {
    Object.entries(item.motivos).forEach(([motivo, cantidad]) => {
      motivosSum[motivo] = (motivosSum[motivo] || 0) + cantidad;
    });
  });
  return Object.entries(motivosSum).map(([motivo, count], idx) => ({
    id: idx,
    motivo,
    count,
  }));
}

export default function JobOpportunitiesPieChart({
  data,
  fromDate,
  toDate,
  filteredOpportunity,
}) {
  const motivosData = sumMotivos(data, filteredOpportunity).filter(
    (item) => item.count > 0
  );

  // Para la guía lateral
  const mid = Math.ceil(motivosData.length / 2);
  const firstCol = motivosData.slice(0, mid);
  const secondCol = motivosData.slice(mid);

  let isFullMonth = false;
  let monthText = "";
  if (fromDate && toDate) {
    const start = parseISO(fromDate);
    const end = parseISO(toDate);
    const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    isFullMonth =
      start.getTime() === firstDay.getTime() &&
      end.getTime() === lastDay.getTime();
    if (isFullMonth) {
      monthText = format(start, "MMMM yyyy", { locale: es });
    }
  }

  // Título de la guía lateral
  let guideTitle = "";
  if (filteredOpportunity && filteredOpportunity[0] && filteredOpportunity[1]) {
    if (isFullMonth) {
      guideTitle = `Motivos de rechazo de ${
        monthText.charAt(0).toUpperCase() + monthText.slice(1)
      } en la convocatoria de ${filteredOpportunity[1]} #${filteredOpportunity[0]}`;
    } else if (fromDate === toDate && fromDate && toDate) {
      guideTitle = `Motivos de rechazo del ${fromDate} en la convocatoria de ${filteredOpportunity[1]} #${filteredOpportunity[0]}`;
    } else if (fromDate && toDate) {
      guideTitle = `Motivos de rechazo desde el ${fromDate} hasta el ${toDate} en la convocatoria de ${filteredOpportunity[1]} #${filteredOpportunity[0]}`;
    } else {
      guideTitle = `Motivos de rechazo en la convocatoria de ${filteredOpportunity[1]} #${filteredOpportunity[0]}`;
    }
  } else if (isFullMonth) {
    guideTitle = `Motivos de rechazo de ${
      monthText.charAt(0).toUpperCase() + monthText.slice(1)
    }`;
  } else if (fromDate === toDate && fromDate && toDate) {
    guideTitle = `Motivos de rechazo del ${fromDate}`;
  } else if (fromDate && toDate) {
    guideTitle = `Motivos de rechazo desde el ${fromDate} hasta el ${toDate}`;
  } else {
    guideTitle = "Motivos de rechazo";
  }

  return (
    <div className="w-full h-[20rem] bg-white rounded shadow p-6 flex flex-col md:flex-row gap-8">
      <div className="flex-[0.7] flex items-center justify-center">
        {motivosData.length === 0 ? (
          <div className="text-gray-400 text-lg text-center">
            No hay datos que mostrar gráficamente
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={motivosData}
                dataKey="count"
                nameKey="motivo"
                cx="50%"
                cy="50%"
                outerRadius={70}
                isAnimationActive={true}
              >
                {motivosData.map((entry, idx) => (
                  <Cell
                    key={`cell-${entry.motivo}`}
                    fill={COLORS[idx % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} (${(
                    (value /
                      motivosData.reduce((acc, cur) => acc + cur.count, 0)) *
                    100
                  ).toFixed(1)}%)`,
                  "Cantidad",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Guía lateral de motivos */}
      <div className="flex-[1.3] flex flex-col justify-center">
        {motivosData.length === 0 ? (
          filteredOpportunity &&
          filteredOpportunity[0] &&
          filteredOpportunity[1] ? (
            <div className="text-gray-400 text-base text-center">
              No hay datos para la convocatoria en la fecha seleccionada
            </div>
          ) : null
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4 text-emerald-700">
              {guideTitle}
            </h3>
            <div className="grid grid-cols-2 gap-x-8 max-h-60 overflow-y-auto pr-2">
              <ul className="space-y-1 text-sm">
                {firstCol.map((item, idx) => (
                  <li key={item.motivo} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></span>
                    <span>
                      {item.motivo}:{" "}
                      <span className="font-semibold border border-gray-200 px-1 rounded">
                        {item.count}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-1 text-sm">
                {secondCol.map((item, idx) => (
                  <li key={item.motivo} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: COLORS[(idx + mid) % COLORS.length],
                      }}
                    ></span>
                    <span>
                      {item.motivo}:{" "}
                      <span className="font-semibold border border-gray-200 px-1 rounded">
                        {item.count}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
