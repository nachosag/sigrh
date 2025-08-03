import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const COLORS = [
  "#0ea5e9", // azul
  "#f59e42", // naranja
  "#a21caf", // violeta
  "#fbbf24", // amarillo
  "#f43f5e", // rojo
  "#10b981", // verde esmeralda
  "#818cf8", // azul-violeta
  "#f472b6", // rosa
  "#22d3ee", // celeste
  "#a3e635", // lima
  "#fca5a5", // rosado claro
  "#eab308", // mostaza
  "#6366f1", // azul fuerte
  "#fb7185", // rosa fuerte
  "#84cc16", // verde lima
  "#fcd34d", // amarillo claro
  "#34d399", // verde agua
  "#f9a8d4", // rosa pastel
  "#bef264", // verde pastel
  "#fef08a", // amarillo pastel
  "#7dd3fc", // celeste pastel
  "#e879f9", // violeta pastel
  "#f87171", // rojo pastel
  "#a5b4fc", // azul pastel
  "#4ade80", // verde
  "#a7f3d0", // verde agua muy claro
  "#6ee7b7", // verde agua claro
  "#fde68a", // amarillo muy claro
  "#c084fc", // violeta claro
  "#38bdf8", // azul claro
  "#facc15", // amarillo intenso
  "#fcd34d", // amarillo claro
  "#fbbf24", // amarillo
  "#a3e635", // lima
  "#f43f5e", // rojo
  "#818cf8", // azul-violeta
  "#f472b6", // rosa
  "#60a5fa", // azul
  "#fca5a5", // rosado claro
  "#a5b4fc", // azul pastel
];

export default function LicensesPieChart({ data, startDate, endDate, type }) {
  const dataForChart = data.filter((item) => item.count > 0);

  // Divide los datos en dos columnas para la guía
  const mid = Math.ceil(data.length / 2);
  const firstCol = data.slice(0, mid);
  const secondCol = data.slice(mid);

  // Esto es meramente visual, si el mes es completo, muestra el mes y año para ser más claro
  let isFullMonth = false;
  let mounthText = "";
  if (startDate && endDate) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const firstDay = new Date(start.getFullYear(), start.getMonth(), 1);
    const lastDay = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    isFullMonth =
      start.getTime() === firstDay.getTime() &&
      end.getTime() === lastDay.getTime();
    if (isFullMonth) {
      mounthText = format(start, "MMMM yyyy", { locale: es });
    }
  }

  return (
    <div className="w-full h-[32rem] bg-white rounded shadow p-10 flex flex-col md:flex-row gap-8">
      <div className="flex-1 flex items-center justify-center">
        {dataForChart.length === 0 ? (
          <div className="text-gray-400 text-lg text-center">
            No hay datos que mostrar gráficamente
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={dataForChart}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={120}
              >
                {dataForChart.map((entry) => (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={COLORS[entry.id % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} (${((value / dataForChart.reduce((acc, cur) => acc + cur.count, 0)) * 100).toFixed(1)}%)`,
                  "Cantidad",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Guía de tipos de licencia y cantidad en dos columnas */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-lg font-semibold mb-4 text-emerald-700">
          {isFullMonth
            ? `Cantidad de licencias de ${mounthText.charAt(0).toUpperCase() + mounthText.slice(1)}`
            : startDate === endDate && startDate && endDate
              ? `Cantidad de licencias del ${startDate}`
              : startDate && endDate
                ? `Cantidad de licencias desde el ${startDate} hasta el ${endDate}`
                : "Cantidad de licencias"}
          {type ? ` del tipo ${type}` : ""}
        </h3>
        <div className="grid grid-cols-2 gap-x-8">
          <ul className="space-y-2">
            {firstCol.map((item) => (
              <li key={item.type} className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[item.id % COLORS.length] }}
                ></span>
                <span className="font-medium">{item.id}) </span>
                <span>
                  {item.type}:{" "}
                  <span className="font-semibold border border-gray-200 px-1 rounded">
                    {item.count}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {secondCol.map((item) => (
              <li key={item.type} className="flex items-center gap-2">
                <span
                  className="inline-block w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS[item.id % COLORS.length] }}
                ></span>
                <span className="font-medium">{item.id}) </span>
                <span className="text-sm">
                  {item.type}:{" "}
                  <span className="font-semibold border border-gray-200 px-1 rounded">
                    {item.count}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
