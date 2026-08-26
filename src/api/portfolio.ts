import { get } from '@/api/http'
import type { PortfolioSnapshot } from '@/types/portfolio'

/** 读取 Java 服务保存的当前本机用户持仓快照；前端不访问截图文件或 FastAPI。 */
export function getCurrentPortfolio(): Promise<PortfolioSnapshot> {
  return get<PortfolioSnapshot>('/api/v1/portfolio/current')
}
