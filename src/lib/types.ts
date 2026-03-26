// 全体データ（データ.csv）
export interface DailyAdData {
  day: string;
  adName: string;
  adSetName: string;
  campaignName: string;
  impressions: number;
  linkClicks: number;
  amountSpent: number;
  results: number;
  creativeName: string;
  adTextName: string;
  linkName: string;
}

// プラットフォーム別データ（データ(プラットフォーム).csv）
export interface PlatformData {
  day: string;
  campaignName: string;
  platform: string;
  placement: string;
  impressions: number;
  linkClicks: number;
  amountSpent: number;
  results: number;
}

// 年齢別データ（データ(年齢).csv）
export interface AgeData {
  day: string;
  campaignName: string;
  age: string;
  gender: string;
  impressions: number;
  linkClicks: number;
  amountSpent: number;
  results: number;
}

// KPIサマリー
export interface KPISummary {
  totalSpent: number;
  totalResults: number;
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  averageCPA: number;
}

// 前月比付きKPIサマリー
export interface KPIWithComparison {
  current: KPISummary;
  previous: KPISummary | null;
}

// 日次集計
export interface DailyAggregation {
  day: string;
  amountSpent: number;
  results: number;
  impressions: number;
  clicks: number;
}

// 月別集計
export interface MonthlyAggregation {
  month: string;
  amountSpent: number;
  results: number;
  impressions: number;
  clicks: number;
  cpa: number;
}

// 週別集計
export interface WeeklyAggregation {
  week: string;
  weekLabel: string;
  amountSpent: number;
  results: number;
  impressions: number;
  clicks: number;
  cpa: number;
}

// クリエイティブ別集計
export interface CreativeAggregation {
  creativeName: string;
  amountSpent: number;
  impressions: number;
  clicks: number;
  results: number;
  ctr: number;
  cpa: number;
}

// プラットフォーム別集計
export interface PlatformAggregation {
  platform: string;
  amountSpent: number;
  impressions: number;
  clicks: number;
  results: number;
}

// 年齢×性別集計
export interface AgeGenderAggregation {
  age: string;
  male: number;
  female: number;
  unknown: number;
  total: number;
}
