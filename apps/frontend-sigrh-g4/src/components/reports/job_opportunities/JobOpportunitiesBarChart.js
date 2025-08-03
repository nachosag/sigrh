import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const COLORS = [
  "#10b981", // activas - verde esmeralda
  "#f43f5e", // inactivas - rojo
];

export default function JobOpportunitiesBarChart({ data, fromDate, toDate }) {
  const chartData = [
    { name: "Convocatorias activas", value: data.active_count || 0 },
    { name: "Convocatorias inactivas", value: data.inactive_count || 0 },
  ];

  const total = chartData.reduce((acc, cur) => acc + cur.value, 0);

  // --- Lógica de fecha igual a LicensesPieChart ---
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

  // --- Render ---
  return (
    <div className="w-full h-[20rem] bg-white rounded shadow p-6 flex flex-col md:flex-row gap-8">
      <div className="flex-1 flex items-center justify-center">
        {total === 0 ? (
          <div className="text-gray-400 text-lg text-center">
            No hay datos que mostrar gráficamente
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={chartData}
              margin={{ left: 10, right: 10, bottom: 10 }}
            >
              <XAxis dataKey="name" tick={false} />
              <YAxis allowDecimals={false} />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} (${((value / total) * 100).toFixed(1)}%)`,
                  "Cantidad",
                ]}
              />
              <Bar dataKey="value" isAnimationActive>
                {chartData.map((entry, idx) => (
                  <Cell key={entry.name} fill={COLORS[idx]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Guía lateral */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-lg font-semibold mb-4 text-emerald-700">
          {isFullMonth
            ? `Convocatorias de ${monthText.charAt(0).toUpperCase() + monthText.slice(1)}`
            : fromDate === toDate && fromDate && toDate
              ? `Convocatorias del ${fromDate}`
              : fromDate && toDate
                ? `Convocatorias desde el ${fromDate} hasta el ${toDate}`
                : "Convocatorias"}
        </h3>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ backgroundColor: COLORS[0] }}
            ></span>
            <span className="font-medium text-sm">
              Convocatorias activas:{" "}
              <span
                className="font-semibold border border-gray-200 px-1 rounded"
                style={{ color: COLORS[0] }}
              >
                {chartData[0].value}
              </span>
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{ backgroundColor: COLORS[1] }}
            ></span>
            <span className="font-medium text-sm">
              Convocatorias inactivas:{" "}
              <span
                className="font-semibold border border-gray-200 px-1 rounded"
                style={{ color: COLORS[1] }}
              >
                {chartData[1].value}
              </span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
