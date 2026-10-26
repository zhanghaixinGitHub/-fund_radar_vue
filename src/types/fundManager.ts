/** 公共经理目录；数量未知保持null，收益和回撤均为小数比例。 */
export interface ManagerSummary {
  managerId: string
  managerName: string
  snapshotId: string
  companies: string[]
  education: string | null
  shareCount: number | null
  productCount: number | null
  historyCount: number | null
  anchorFundCode: string
  anchorFundName: string
  checkedAt: string | null
}
export interface ManagerPerformance {
  status: string
  returnRate: number | string | null
  maxDrawdownRate: number | string | null
  annualizedRate: number | string | null
  startDate: string | null
  endDate: string | null
  includesCoManagement: boolean
  calculationBasis: string
  reason: string | null
}
export interface ManagerFund {
  relatedFundId: string
  tenureVersionId: string
  fundCode: string
  fundName: string
  fundType: string
  companyName: string | null
  mappedFundCode: string | null
  state: 'CURRENT' | 'HISTORY' | 'FUTURE' | 'PENDING'
  beginDate: string | null
  endDate: string | null
  teamStatus: string
  performance: ManagerPerformance
  soloPerformance: ManagerPerformance | null
  sourceUrl: string | null
}
export interface ManagerSource { title: string; url: string; publishedDate: string | null }
export interface ManagerDetail extends ManagerSummary {
  coverage: {
    scopeLabel: string
    sourceScanComplete: boolean
    identityComplete: boolean
    productMappingComplete: boolean
    pendingShareCount: number
    lastSuccessfulCheckAt: string | null
    notice: string | null
  }
  professionalResume: string | null
  profilePublishedOn: string | null
  sources: ManagerSource[]
  disclosures: ManagerSource[]
  funds: ManagerFund[]
  stale: boolean
}
export interface ManagerPage {
  items: ManagerSummary[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  snapshotId: string | null
  notice: string
  stale?: boolean
}
export interface ManagerRelatedDetail {
  manager: ManagerDetail
  fund: ManagerFund
  tenures: ManagerFund[]
}
