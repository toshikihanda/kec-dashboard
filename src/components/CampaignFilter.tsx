"use client";

import { Filter } from "lucide-react";

interface Props {
  campaigns: string[];
  selected: string;
  onChange: (campaign: string) => void;
}

export default function CampaignFilter({ campaigns, selected, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <Filter size={16} className="text-gray-400" />
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 max-w-xs truncate"
      >
        <option value="">全キャンペーン</option>
        {campaigns.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
