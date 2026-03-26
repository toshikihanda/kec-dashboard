"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import type { MonthlyAggregation, WeeklyAggregation } from "@/lib/types";

interface Props {
  monthlyData: MonthlyAggregation[];
  weeklyData: WeeklyAggregation[];
}

// 月ラベル（YYYY-MM → YYYY年M月）
function formatMonth(month: string) {
  const [y, m] = month.split("-");
  return `${y}年${Number(m)}月`;
}

// CPAの平均を算出
function avgCpa(data: { cpa: number }[]): number {
  const valid = data.filter((d) => d.cpa > 0);
  if (valid.length === 0) return 0;
  return valid.reduce((sum, d) => sum + d.cpa, 0) / valid.length;
}

// 共通のTooltipスタイル
const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  fontSize: 13,
};

export default function PerformanceChart({ monthlyData, weeklyData }: Props) {
  const monthChart = monthlyData.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  const weekChart = weeklyData.map((d) => ({
    ...d,
    label: d.weekLabel,
  }));

  const monthAvgCpa = avgCpa(monthlyData);
  const weekAvgCpa = avgCpa(weeklyData);

  return (
    <div className="space-y-6">
      {/* 月別 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          月別パフォーマンス推移
        </h2>

        {/* メインチャート: 消化金額 + 結果数 */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  const v = Number(value);
                  if (name === "消化金額")
                    return [`¥${Math.round(v).toLocaleString()}`, String(name)];
                  return [v.toLocaleString(), String(name)];
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="amountSpent"
                name="消化金額"
                fill="#2563eb"
                radius={[6, 6, 0, 0]}
                opacity={0.85}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="results"
                name="結果数"
                stroke="#1e3a5f"
                strokeWidth={3}
                dot={{ r: 5, fill: "#1e3a5f", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* CPAサブチャート */}
        <div className="mt-2 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-sm font-medium text-gray-700">CPA推移</span>
            <span className="text-xs text-gray-400 ml-auto">
              平均CPA: ¥{Math.round(monthAvgCpa).toLocaleString()}
            </span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthChart}>
                <defs>
                  <linearGradient id="cpaGradientMonth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64748b" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#64748b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickFormatter={(v) => `¥${Math.round(v).toLocaleString()}`}
                  width={70}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    `¥${Math.round(Number(value)).toLocaleString()}`,
                    "CPA",
                  ]}
                />
                <ReferenceLine
                  y={monthAvgCpa}
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <Area
                  type="monotone"
                  dataKey="cpa"
                  stroke="#64748b"
                  strokeWidth={2.5}
                  fill="url(#cpaGradientMonth)"
                  dot={{ r: 5, fill: "#64748b", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 週別 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          週別パフォーマンス推移
        </h2>

        {/* メインチャート: 消化金額 + 結果数 */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={weekChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickFormatter={(v) => `¥${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#6b7280" }}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => {
                  const v = Number(value);
                  if (name === "消化金額")
                    return [`¥${Math.round(v).toLocaleString()}`, String(name)];
                  return [v.toLocaleString(), String(name)];
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="amountSpent"
                name="消化金額"
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
                opacity={0.85}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="results"
                name="結果数"
                stroke="#1e3a5f"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#1e3a5f", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* CPAサブチャート */}
        <div className="mt-2 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-slate-500" />
            <span className="text-sm font-medium text-gray-700">CPA推移</span>
            <span className="text-xs text-gray-400 ml-auto">
              平均CPA: ¥{Math.round(weekAvgCpa).toLocaleString()}
            </span>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekChart}>
                <defs>
                  <linearGradient id="cpaGradientWeek" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64748b" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#64748b" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "#6b7280" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  tickFormatter={(v) => `¥${Math.round(v).toLocaleString()}`}
                  width={70}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    `¥${Math.round(Number(value)).toLocaleString()}`,
                    "CPA",
                  ]}
                />
                <ReferenceLine
                  y={weekAvgCpa}
                  stroke="#9ca3af"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <Area
                  type="monotone"
                  dataKey="cpa"
                  stroke="#64748b"
                  strokeWidth={2}
                  fill="url(#cpaGradientWeek)"
                  dot={{ r: 3, fill: "#64748b", stroke: "#fff", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
