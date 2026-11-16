import assert from 'node:assert/strict'
import test from 'node:test'
import { fractionShares, simMoney, simShares } from '../src/utils/simulation.ts'

test('全部卖出保留八位份额精度，不因浮点舍入而超卖', () => {
  assert.equal(fractionShares('99999999999.99999999', 1), '99999999999.99999999')
  assert.equal(fractionShares('100.00000001', 2), '50')
  assert.equal(fractionShares('100.00000007', 4), '25.00000001')
})
test('兼容十进制序列化中的指数形式和极小尾差', () => {
  assert.equal(fractionShares('1E-8', 1), '0.00000001')
  assert.equal(fractionShares('1E-8', 2), '0')
  assert.equal(simShares('0E-8'), '0.00')
  assert.equal(simShares('1.25E+3'), '1,250.00')
})
test('未公布收益保持未知，不展示成零收益', () => {
  assert.equal(simMoney(null), '—')
  assert.equal(simMoney('0'), '0.00')
})

test('份额展示保留两位，但全部卖出仍使用完整份额', () => {
  assert.equal(simShares('871.72720058'), '871.73')
  assert.equal(simMoney('1.49350000'), '1.49')
  assert.equal(fractionShares('871.72720058', 1), '871.72720058')
})
