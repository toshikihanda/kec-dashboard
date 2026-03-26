"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import type { AgeGenderAggregation } from "@/lib/types";

interface Props {
  data: AgeGenderAggregation[];
}

export default function AgeGenderChart({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        年齢×性別 消化金額
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="age" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e5e7eb",
              }}
              formatter={(value, name) => [
                `¥${Math.round(Number(value)).toLocaleString()}`,
                String(name),
              ]}
            />
            <Legend />
            <Bar
              dataKey="male"
              name="男性"
              stackId="a"
              fill="#2563eb"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="female"
              name="女性"
              stackId="a"
              fill="#93c5fd"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="unknown"
              name="不明"
              stackId="a"
              fill="#9ca3af"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
