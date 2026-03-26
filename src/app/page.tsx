"use client";

import { useEffect, useState, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import {
  parseDailyData,
  parsePlatformData,
  parseAgeData,
  calculateKPIWithComparison,
  aggregateByMonth,
  aggregateByWeek,
  aggregateByCreative,
  aggregateByPlatform,
  aggregateByAgeGender,
} from "@/lib/csvParser";
import type { DailyAdData, PlatformData, AgeData } from "@/lib/types";
import KPICards from "@/components/KPICards";
import PerformanceChart from "@/components/PerformanceChart";
import PlatformChart from "@/components/PlatformChart";
import AgeGenderChart from "@/components/AgeGenderChart";
import CreativeTable from "@/components/CreativeTable";
import DateFilter from "@/components/DateFilter";
import CampaignFilter from "@/components/CampaignFilter";

export default function Home() {
  const [dailyData, setDailyData] = useState<DailyAdData[]>([]);
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);
  const [ageData, setAgeData] = useState<AgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCampaign, setSelectedCampaign] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [dailyCsv, platformCsv, ageCsv] = await Promise.all([
          fetch("/data/data.csv").then((r) => r.text()),
          fetch("/data/data_platform.csv").then((r) => r.text()),
          fetch("/data/data_age.csv").then((r) => r.text()),
        ]);
        const daily = parseDailyData(dailyCsv);
        const platform = parsePlatformData(platformCsv);
        const age = parseAgeData(ageCsv);

        setDailyData(daily);
        setPlatformData(platform);
        setAgeData(age);

        const days = daily.map((d) => d.day).filter(Boolean).sort();
        if (days.length > 0) {
          setStartDate(days[0]);
          setEndDate(days[days.length - 1]);
        }
      } catch (err) {
        console.error("データの読み込みに失敗しました:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // キャンペーン一覧を抽出
  const campaigns = useMemo(() => {
    const set = new Set<string>();
    for (const d of dailyData) {
      if (d.campaignName) set.add(d.campaignName);
    }
    return Array.from(set).sort();
  }, [dailyData]);

  // キャンペーン + 期間フィルタリング
  const filteredDaily = useMemo(
    () =>
      dailyData.filter(
        (d) =>
          d.day >= startDate &&
          d.day <= endDate &&
          (!selectedCampaign || d.campaignName === selectedCampaign)
      ),
    [dailyData, startDate, endDate, selectedCampaign]
  );
  const filteredPlatform = useMemo(
    () =>
      platformData.filter(
        (d) =>
          d.day >= startDate &&
          d.day <= endDate &&
          (!selectedCampaign || d.campaignName === selectedCampaign)
      ),
    [platformData, startDate, endDate, selectedCampaign]
  );
  const filteredAge = useMemo(
    () =>
      ageData.filter(
        (d) =>
          d.day >= startDate &&
          d.day <= endDate &&
          (!selectedCampaign || d.campaignName === selectedCampaign)
      ),
    [ageData, startDate, endDate, selectedCampaign]
  );

  // 前月比付きKPI（キャンペーンフィルタ適用済みの全データを渡す）
  const campaignFilteredAll = useMemo(
    () =>
      selectedCampaign
        ? dailyData.filter((d) => d.campaignName === selectedCampaign)
        : dailyData,
    [dailyData, selectedCampaign]
  );
  const kpiComparison = useMemo(
    () => calculateKPIWithComparison(campaignFilteredAll, startDate, endDate),
    [campaignFilteredAll, startDate, endDate]
  );

  // 集計データ
  const monthlyAgg = useMemo(() => aggregateByMonth(filteredDaily), [filteredDaily]);
  const weeklyAgg = useMemo(() => aggregateByWeek(filteredDaily), [filteredDaily]);
  const creativeAgg = useMemo(() => aggregateByCreative(filteredDaily), [filteredDaily]);
  const platformAgg = useMemo(() => aggregateByPlatform(filteredPlatform), [filteredPlatform]);
  const ageGenderAgg = useMemo(() => aggregateByAgeGender(filteredAge), [filteredAge]);

  // 日付範囲
  const allDays = useMemo(() => dailyData.map((d) => d.day).filter(Boolean).sort(), [dailyData]);
  const minDate = allDays[0] || "";
  const maxDate = allDays[allDays.length - 1] || "";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <BarChart3 size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  KEC様 レポート
                </h1>
                <p className="text-xs text-gray-500">
                  広告運用パフォーマンスダッシュボード
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <CampaignFilter
                campaigns={campaigns}
                selected={selectedCampaign}
                onChange={setSelectedCampaign}
              />
              <DateFilter
                startDate={startDate}
                endDate={endDate}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
                minDate={minDate}
                maxDate={maxDate}
              />
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPIカード（前期比付き） */}
        <KPICards kpiComparison={kpiComparison} />

        {/* パフォーマンス推移（月別・週別） */}
        <PerformanceChart monthlyData={monthlyAgg} weeklyData={weeklyAgg} />

        {/* プラットフォーム別・年齢別（2カラム） */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PlatformChart data={platformAgg} />
          <AgeGenderChart data={ageGenderAgg} />
        </div>

        {/* クリエイティブ分析テーブル（ヒートマップ付き） */}
        <CreativeTable data={creativeAgg} />
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-100 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-gray-400 text-center">
            KEC様 広告運用レポート — {startDate} 〜 {endDate}
            {selectedCampaign && ` | ${selectedCampaign}`}
          </p>
        </div>
      </footer>
    </div>
  );
}
