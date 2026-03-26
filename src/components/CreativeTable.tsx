"use client";

import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { CreativeAggregation } from "@/lib/types";

interface Props {
  data: CreativeAggregation[];
}

type SortKey = keyof CreativeAggregation;

// 値を0〜1に正規化（min-max）
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

// CTR用: 高いほど緑（良い）
function ctrBgColor(ratio: number): string {
  if (ratio >= 0.75) return "bg-emerald-100 text-emerald-800";
  if (ratio >= 0.5) return "bg-emerald-50 text-emerald-700";
  if (ratio >= 0.25) return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
}

// CPA用: 低いほど緑（良い）→ ratioを反転
function cpaBgColor(ratio: number): string {
  const inv = 1 - ratio;
  if (inv >= 0.75) return "bg-emerald-100 text-emerald-800";
  if (inv >= 0.5) return "bg-emerald-50 text-emerald-700";
  if (inv >= 0.25) return "bg-orange-50 text-orange-700";
  return "bg-red-50 text-red-700";
}

export default function CreativeTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("amountSpent");
  const [sortAsc, setSortAsc] = useState(false);

  // CTR/CPAの範囲を算出（ヒートマップ用）
  const { ctrMin, ctrMax, cpaMin, cpaMax } = useMemo(() => {
    const ctrs = data.map((d) => d.ctr);
    const cpas = data.filter((d) => d.cpa > 0).map((d) => d.cpa);
    return {
      ctrMin: Math.min(...ctrs, 0),
      ctrMax: Math.max(...ctrs, 0),
      cpaMin: cpas.length > 0 ? Math.min(...cpas) : 0,
      cpaMax: cpas.length > 0 ? Math.max(...cpas) : 0,
    };
  }, [data]);

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return String(aVal).localeCompare(String(bVal)) * (sortAsc ? 1 : -1);
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const columns: { key: SortKey; label: string; format: (v: number | string) => string }[] = [
    { key: "creativeName", label: "クリエイティブ名", format: (v) => String(v) },
    { key: "amountSpent", label: "消化金額", format: (v) => `¥${Math.round(Number(v)).toLocaleString()}` },
    { key: "impressions", label: "IMP", format: (v) => Number(v).toLocaleString() },
    { key: "clicks", label: "クリック", format: (v) => Number(v).toLocaleString() },
    { key: "ctr", label: "CTR", format: (v) => `${Number(v).toFixed(2)}%` },
    { key: "results", label: "結果", format: (v) => Number(v).toLocaleString() },
    { key: "cpa", label: "CPA", format: (v) => Number(v) > 0 ? `¥${Math.round(Number(v)).toLocaleString()}` : "-" },
  ];

  // ヒートマップ対象のセルにクラスを付与
  function getCellClass(key: SortKey, row: CreativeAggregation): string {
    if (key === "ctr") {
      const ratio = normalize(row.ctr, ctrMin, ctrMax);
      return `${ctrBgColor(ratio)} rounded-md px-2 py-1 font-semibold`;
    }
    if (key === "cpa" && row.cpa > 0) {
      const ratio = normalize(row.cpa, cpaMin, cpaMax);
      return `${cpaBgColor(ratio)} rounded-md px-2 py-1 font-semibold`;
    }
    return "";
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          クリエイティブ別パフォーマンス
        </h2>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-emerald-100" /> 良好
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-orange-50" /> 注意
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded bg-red-50" /> 要改善
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left py-3 px-3 text-gray-500 font-medium cursor-pointer hover:text-gray-900 select-none whitespace-nowrap"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key &&
                      (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr
                key={row.creativeName}
                className={`border-b border-gray-50 ${i % 2 === 0 ? "bg-gray-50/50" : ""} hover:bg-blue-50/30 transition-colors`}
              >
                {columns.map((col) => {
                  const heatClass = getCellClass(col.key, row);
                  return (
                    <td key={col.key} className="py-3 px-3 text-gray-700 whitespace-nowrap">
                      {heatClass ? (
                        <span className={`inline-block ${heatClass}`}>
                          {col.format(row[col.key])}
                        </span>
                      ) : (
                        col.format(row[col.key])
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
