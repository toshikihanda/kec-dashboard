"use client";

import { DollarSign, Target, Eye, MousePointerClick, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KPIWithComparison, KPISummary } from "@/lib/types";

interface Props {
  kpiComparison: KPIWithComparison;
}

type KPIKey = keyof KPISummary;

// CPAは下がる方が良い（逆指標）
const inverseKeys: KPIKey[] = ["averageCPA"];

const cards: {
  key: KPIKey;
  label: string;
  icon: typeof DollarSign;
  color: string;
  bg: string;
  format: (v: number) => string;
}[] = [
  {
    key: "totalSpent",
    label: "総消化金額",
    icon: DollarSign,
    color: "text-blue-600",
    bg: "bg-blue-50",
    format: (v) => `¥${Math.round(v).toLocaleString()}`,
  },
  {
    key: "totalResults",
    label: "総結果数（リード）",
    icon: Target,
    color: "text-teal-600",
    bg: "bg-teal-50",
    format: (v) => v.toLocaleString(),
  },
  {
    key: "averageCTR",
    label: "平均CTR",
    icon: MousePointerClick,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    format: (v) => `${v.toFixed(2)}%`,
  },
  {
    key: "averageCPA",
    label: "平均CPA",
    icon: Eye,
    color: "text-amber-600",
    bg: "bg-amber-50",
    format: (v) => `¥${Math.round(v).toLocaleString()}`,
  },
];

function getChangeRate(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export default function KPICards({ kpiComparison }: Props) {
  const { current, previous } = kpiComparison;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const currentVal = current[card.key];
        const prevVal = previous?.[card.key] ?? null;
        const changeRate = prevVal !== null ? getChangeRate(currentVal, prevVal) : null;

        // CPAは下がるほうが良い
        const isInverse = inverseKeys.includes(card.key);
        let isPositive: boolean | null = null;
        if (changeRate !== null) {
          isPositive = isInverse ? changeRate < 0 : changeRate > 0;
        }

        return (
          <div
            key={card.key}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500 font-medium">{card.label}</span>
              <div className={`${card.bg} ${card.color} p-2 rounded-xl`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {card.format(currentVal)}
            </p>
            {/* 前期比 */}
            {changeRate !== null ? (
              <div className="flex items-center gap-1.5 mt-2">
                {isPositive === true && (
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp size={13} />
                    <span className="text-xs font-semibold">
                      {changeRate > 0 ? "+" : ""}{changeRate.toFixed(1)}%
                    </span>
                  </div>
                )}
                {isPositive === false && (
                  <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    <TrendingDown size={13} />
                    <span className="text-xs font-semibold">
                      {changeRate > 0 ? "+" : ""}{changeRate.toFixed(1)}%
                    </span>
                  </div>
                )}
                {isPositive === null && changeRate === 0 && (
                  <div className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    <Minus size={13} />
                    <span className="text-xs font-semibold">0.0%</span>
                  </div>
                )}
                <span className="text-xs text-gray-400">前期比</span>
              </div>
            ) : (
              <div className="mt-2">
                <span className="text-xs text-gray-300">前期データなし</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
