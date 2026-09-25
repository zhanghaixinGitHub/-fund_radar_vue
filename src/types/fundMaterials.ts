/** 公共基金资料契约。金额为元、比例为百分数；没有资料时保持 null。 */
export interface MaterialReportOption {
  id: string; title: string; endDate: string; publishedDate: string
  fullDisclosure: boolean; sourceUrl: string | null
}
export interface MaterialHolding {
  stockCode: string; stockName: string; weightPct: number; marketValue: number
}
export interface MaterialAllocation { name: string; weightPct: number; value?: number }
export interface MaterialReport extends MaterialReportOption {
  stockWeightPct: number; disclosedWeightPct: number
  holdings: MaterialHolding[]; assets: MaterialAllocation[]; industries: MaterialAllocation[]
}
export interface MaterialCompanyOption { stockCode: string; stockName: string; latestHeld: boolean }
export interface MaterialFinancial {
  endDate: string; publishedDate: string | null
  revenue: number | null; netProfit: number | null; operatingCashflow: number | null
  totalAssets: number | null; totalLiabilities: number | null
  revenueGrowthPct: number | null; netProfitGrowthPct: number | null
}
export interface MaterialCompany extends MaterialCompanyOption {
  history: MaterialFinancial[]
  business: { name: string; sales: number | null; currency: string | null; endDate: string }[]
  disclosures: { category: string; endDate: string | null; publishedDate: string | null; summary: string }[]
  quote: { date: string; close: number | null; changePct: number | null } | null
  sourceName: string; notice: string
}
export interface FundMaterials {
  available: boolean; fundCode: string; asOfDate: string | null; notice: string
  reports: MaterialReportOption[]; report: MaterialReport | null
  companies: MaterialCompanyOption[]; company: MaterialCompany | null
}
export interface MaterialDocument {
  id: string; kind: 'fund' | 'company' | 'news'; title: string
  stockCode: string | null; stockName: string | null; publishedDate: string | null
  dateNote: string; sourceName: string; sourceUrl: string | null
  textComplete: boolean; latestHeld: boolean
}
export interface FundDocuments {
  items: MaterialDocument[]; total: number; page: number; pageSize: number; asOfDate: string | null
}
