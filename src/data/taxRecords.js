// 兼容层：收入纳税明细数据已统一收敛到 src/data/schema.js 与 src/state/appStore.js。
export { allIncomeTypes, otherIncomeTypes, primaryIncomeTypes } from './schema'
export {
  getLatestTaxYear,
  getTaxRecordById,
  getTaxRecordsByYear,
  sumMoney,
  taxMonths,
} from '../state/appStore'
