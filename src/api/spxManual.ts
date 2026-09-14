import { get, post } from '@/api/http'
import type { SpxManualStatus } from '@/types/spxManual'

const base = '/api/v1/sync-jobs/spx-manual'
/** 只读最近回执；打开和刷新页面不会产生外部采集。 */
export const getSpxManualStatus = () => get<SpxManualStatus>(`${base}/status`)
/** 只由用户单击发起一次请求；服务端使用实际时钟，不接受回填日期。 */
export const synchronizeSpxManually = () => post<SpxManualStatus>(`${base}/sync`)
