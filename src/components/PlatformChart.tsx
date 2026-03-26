"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import type { PlatformAggregation } from "@/lib/types";

interface Props {
  data: PlatformAggregation[];
}

const COLORS = ["#2563eb", "#0891b2", "#475569", "#60a5fa", "#94a3b8"];

export default function PlatformChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: d.platform,
    value: d.amountSpent,
  }));

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        プラットフォーム別消化金額
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(1)}%`
              }
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [
                `¥${Math.round(Number(value)).toLocaleString()}`,
                "消化金額",
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
