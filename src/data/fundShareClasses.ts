/**
 * 经原始定期报告身份表核实的同产品份额关系。
 *
 * 这里只维护公开且可追溯的产品事实，不按基金名称去掉 A/C 后缀猜配对。
 * 未收录表示尚未完成关系核验，不表示该基金没有其他份额。
 * 每组只算一个产品；该关系不授权混用各份额净值、费用或成立前收益。
 */
export interface VerifiedFundShareClass {
  fundCode: string
  shareClass: string
  fundName: string
}

export interface VerifiedFundProduct {
  productCode: string
  /** 原件中同时列明主代码、份额名称与交易代码的报告，供用户自行查看。 */
  sourceUrl: string
  sourceDate: string
  sourceSha256: string
  shares: readonly VerifiedFundShareClass[]
}

/** 2026年中报身份表逐份核对；追加关系时必须同步保留原件出处。 */
const verifiedProducts: readonly VerifiedFundProduct[] = [
  {
    productCode: '001412',
    sourceUrl: 'https://www.dbfund.com.cn/upload/pdf/1788138485694-德邦鑫星价值灵活配置混合型证券投资基金2026年中期报告.pdf',
    sourceDate: '2026-08-31',
    sourceSha256: '2d2e4d3c130582c027bd1addfed7339d4e1b62c9ffc07e35a3481238d4af20e2',
    shares: [
      { fundCode: '001412', shareClass: 'A', fundName: '德邦鑫星价值A' },
      { fundCode: '002112', shareClass: 'C', fundName: '德邦鑫星价值C' },
    ],
  },
  {
    productCode: '005273',
    sourceUrl: 'https://pdf.dfcfw.com/pdf/H2_AN202608311828786632_1.pdf?1788177216000.pdf',
    sourceDate: '2026-08-31',
    // 原始公告完整正文的哈希；附件链接由该正文的 attach_list 提供，未将转载冒称官网PDF。
    sourceSha256: '4258ea0242995fa656a378809b274ecef92d11a00356efd2b17fe174c23f7230',
    shares: [
      { fundCode: '005273', shareClass: 'A', fundName: '华商可转债债券A' },
      { fundCode: '005284', shareClass: 'C', fundName: '华商可转债债券C' },
    ],
  },
]

/** 仅按原件确认的精确代码关联；未知代码不推断关系。 */
export function findVerifiedFundProduct(fundCode: string): VerifiedFundProduct | undefined {
  return verifiedProducts.find(product => product.shares.some(share => share.fundCode === fundCode))
}
