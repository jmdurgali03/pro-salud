"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

export function Torta({
  titulo,
  icon,
  data,
  colors,
  dataKey,
  nameKey,
}: any) {
  const total = data.reduce((acc: number, item: any) => acc + item.value, 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        {icon} {titulo}
      </h2>
      {data.length > 0 && total > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              labelLine={false}
              label={(entry: any) =>
                `${entry.name}: ${((entry.value / total) * 100).toFixed(1)}%`
              }
            >
              {data.map((_: any, i: number) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl font-semibold fill-gray-700"
            >
              {total}
            </text>
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 text-center text-sm">
          No hay datos disponibles.
        </p>
      )}
    </div>
  );
}
