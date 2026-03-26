import Papa from "papaparse";
import type {
  DailyAdData,
  PlatformData,
  AgeData,
  KPISummary,
  KPIWithComparison,
  DailyAggregation,
  MonthlyAggregation,
  WeeklyAggregation,
  CreativeAggregation,
  PlatformAggregation,
  AgeGenderAggregation,
} from "./types";

// 数値パース（カンマ除去、空文字は0）
function parseNum(val: string | undefined | null): number {
  if (!val || val.trim() === "") return 0;
  return Number(val.replace(/,/g, "")) || 0;
}

// 全体データをパース
export function parseDailyData(csvText: string): DailyAdData[] {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return (result.data as Record<string, string>[]).map((row) => ({
    day: row["Day"] || "",
    adName: row["Ad Name"] || "",
    adSetName: row["Ad Set Name"] || "",
    campaignName: row["Campaign Name"] || "",
    impressions: parseNum(row["Impressions"]),
    linkClicks: parseNum(row["Link Clicks"]),
    amountSpent: parseNum(row["Amount Spent"]),
    results: parseNum(row["Results"]),
    creativeName: row["クリエイティブ名"] || "",
    adTextName: row["広告文名"] || "",
    linkName: row["リンク先名"] || "",
  }));
}

// プラットフォーム別データをパース
export function parsePlatformData(csvText: string): PlatformData[] {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return (result.data as Record<string, string>[]).map((row) => ({
    day: row["Day"] || "",
    campaignName: row["Campaign Name"] || "",
    platform: row["Platform"] || "",
    placement: row["Placement"] || "",
    impressions: parseNum(row["Impressions"]),
    linkClicks: parseNum(row["Link Clicks"]),
    amountSpent: parseNum(row["Amount Spent"]),
    results: parseNum(row["Results"]),
  }));
}

// 年齢別データをパース
export function parseAgeData(csvText: string): AgeData[] {
  const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return (result.data as Record<string, string>[]).map((row) => ({
    day: row["Day"] || "",
    campaignName: row["Campaign Name"] || "",
    age: row["Age"] || "",
    gender: row["Gender"] || "",
    impressions: parseNum(row["Impressions"]),
    linkClicks: parseNum(row["Link Clicks"]),
    amountSpent: parseNum(row["Amount Spent"]),
    results: parseNum(row["Results"]),
  }));
}

// KPIサマリーを算出
export function calculateKPI(data: DailyAdData[]): KPISummary {
  const totalSpent = data.reduce((sum, d) => sum + d.amountSpent, 0);
  const totalResults = data.reduce((sum, d) => sum + d.results, 0);
  const totalImpressions = data.reduce((sum, d) => sum + d.impressions, 0);
  const totalClicks = data.reduce((sum, d) => sum + d.linkClicks, 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const averageCPA = totalResults > 0 ? totalSpent / totalResults : 0;

  return { totalSpent, totalResults, totalImpressions, totalClicks, averageCTR, averageCPA };
}

// 前期比較付きKPIを算出
// 選択期間と同じ日数分だけ前の期間を自動算出して比較
export function calculateKPIWithComparison(
  allData: DailyAdData[],
  startDate: string,
  endDate: string
): KPIWithComparison {
  const filtered = allData.filter((d) => d.day >= startDate && d.day <= endDate);
  const current = calculateKPI(filtered);

  if (!startDate || !endDate) {
    return { current, previous: null };
  }

  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { current, previous: null };
  }

  const diffMs = end.getTime() - start.getTime();
  const dayMs = 86400000;
  const prevEnd = new Date(start.getTime() - dayMs);
  const prevStart = new Date(prevEnd.getTime() - diffMs);
  const prevStartStr = prevStart.toISOString().substring(0, 10);
  const prevEndStr = prevEnd.toISOString().substring(0, 10);

  const prevFiltered = allData.filter((d) => d.day >= prevStartStr && d.day <= prevEndStr);
  const previous = prevFiltered.length > 0 ? calculateKPI(prevFiltered) : null;

  return { current, previous };
}

// 日次集計
export function aggregateByDay(data: DailyAdData[]): DailyAggregation[] {
  const map = new Map<string, DailyAggregation>();
  for (const d of data) {
    const existing = map.get(d.day);
    if (existing) {
      existing.amountSpent += d.amountSpent;
      existing.results += d.results;
      existing.impressions += d.impressions;
      existing.clicks += d.linkClicks;
    } else {
      map.set(d.day, {
        day: d.day,
        amountSpent: d.amountSpent,
        results: d.results,
        impressions: d.impressions,
        clicks: d.linkClicks,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
}

// 月別集計
export function aggregateByMonth(data: DailyAdData[]): MonthlyAggregation[] {
  const map = new Map<string, MonthlyAggregation>();
  for (const d of data) {
    const month = d.day.substring(0, 7); // YYYY-MM
    const existing = map.get(month);
    if (existing) {
      existing.amountSpent += d.amountSpent;
      existing.results += d.results;
      existing.impressions += d.impressions;
      existing.clicks += d.linkClicks;
    } else {
      map.set(month, {
        month,
        amountSpent: d.amountSpent,
        results: d.results,
        impressions: d.impressions,
        clicks: d.linkClicks,
        cpa: 0,
      });
    }
  }
  const arr = Array.from(map.values());
  for (const m of arr) {
    m.cpa = m.results > 0 ? m.amountSpent / m.results : 0;
  }
  return arr.sort((a, b) => a.month.localeCompare(b.month));
}

// ISO週番号を取得
function getISOWeekStart(dateStr: string): string {
  const date = new Date(dateStr);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return monday.toISOString().substring(0, 10);
}

// 週別集計
export function aggregateByWeek(data: DailyAdData[]): WeeklyAggregation[] {
  const map = new Map<string, WeeklyAggregation>();
  for (const d of data) {
    if (!d.day) continue;
    const weekStart = getISOWeekStart(d.day);
    const existing = map.get(weekStart);
    if (existing) {
      existing.amountSpent += d.amountSpent;
      existing.results += d.results;
      existing.impressions += d.impressions;
      existing.clicks += d.linkClicks;
    } else {
      const ws = new Date(weekStart);
      const we = new Date(ws);
      we.setDate(we.getDate() + 6);
      const label = `${ws.getMonth() + 1}/${ws.getDate()}〜${we.getMonth() + 1}/${we.getDate()}`;
      map.set(weekStart, {
        week: weekStart,
        weekLabel: label,
        amountSpent: d.amountSpent,
        results: d.results,
        impressions: d.impressions,
        clicks: d.linkClicks,
        cpa: 0,
      });
    }
  }
  const arr = Array.from(map.values());
  for (const w of arr) {
    w.cpa = w.results > 0 ? w.amountSpent / w.results : 0;
  }
  return arr.sort((a, b) => a.week.localeCompare(b.week));
}

// クリエイティブ別集計
export function aggregateByCreative(data: DailyAdData[]): CreativeAggregation[] {
  const map = new Map<string, Omit<CreativeAggregation, "ctr" | "cpa">>();
  for (const d of data) {
    if (!d.creativeName) continue;
    const existing = map.get(d.creativeName);
    if (existing) {
      existing.amountSpent += d.amountSpent;
      existing.impressions += d.impressions;
      existing.clicks += d.linkClicks;
      existing.results += d.results;
    } else {
      map.set(d.creativeName, {
        creativeName: d.creativeName,
        amountSpent: d.amountSpent,
        impressions: d.impressions,
        clicks: d.linkClicks,
        results: d.results,
      });
    }
  }
  return Array.from(map.values())
    .map((c) => ({
      ...c,
      ctr: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
      cpa: c.results > 0 ? c.amountSpent / c.results : 0,
    }))
    .sort((a, b) => b.amountSpent - a.amountSpent);
}

// プラットフォーム別集計
export function aggregateByPlatform(data: PlatformData[]): PlatformAggregation[] {
  const map = new Map<string, PlatformAggregation>();
  for (const d of data) {
    if (!d.platform) continue;
    const existing = map.get(d.platform);
    if (existing) {
      existing.amountSpent += d.amountSpent;
      existing.impressions += d.impressions;
      existing.clicks += d.linkClicks;
      existing.results += d.results;
    } else {
      map.set(d.platform, {
        platform: d.platform,
        amountSpent: d.amountSpent,
        impressions: d.impressions,
        clicks: d.linkClicks,
        results: d.results,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.amountSpent - a.amountSpent);
}

// 年齢×性別集計（消化金額ベース）
export function aggregateByAgeGender(data: AgeData[]): AgeGenderAggregation[] {
  const map = new Map<string, AgeGenderAggregation>();
  const ageOrder = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];

  for (const d of data) {
    if (!d.age) continue;
    const existing = map.get(d.age);
    const val = d.amountSpent;
    if (existing) {
      if (d.gender === "Male") existing.male += val;
      else if (d.gender === "Female") existing.female += val;
      else existing.unknown += val;
      existing.total += val;
    } else {
      map.set(d.age, {
        age: d.age,
        male: d.gender === "Male" ? val : 0,
        female: d.gender === "Female" ? val : 0,
        unknown: d.gender !== "Male" && d.gender !== "Female" ? val : 0,
        total: val,
      });
    }
  }

  return ageOrder
    .filter((age) => map.has(age))
    .map((age) => map.get(age)!);
}
