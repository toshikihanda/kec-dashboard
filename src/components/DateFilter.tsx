"use client";

import { Calendar } from "lucide-react";

interface Props {
  startDate: string;
  endDate: string;
  onStartChange: (date: string) => void;
  onEndChange: (date: string) => void;
  minDate: string;
  maxDate: string;
}

export default function DateFilter({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  minDate,
  maxDate,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Calendar size={16} />
        <span>期間:</span>
      </div>
      <input
        type="date"
        value={startDate}
        min={minDate}
        max={endDate}
        onChange={(e) => onStartChange(e.target.value)}
        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
      />
      <span className="text-gray-400">〜</span>
      <input
        type="date"
        value={endDate}
        min={startDate}
        max={maxDate}
        onChange={(e) => onEndChange(e.target.value)}
        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
      />
    </div>
  );
}
