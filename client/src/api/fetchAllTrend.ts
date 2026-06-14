import mockHotData from '../mock/hot.json'
import type { HotAllResponse } from '../types/hot'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export async function fetchAllTrend(): Promise<HotAllResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/trend/all`)

    if (!res.ok) {
      throw new Error(`请求失败: ${res.status}`)
    }

    return (await res.json()) as HotAllResponse
  } catch (error) {
    console.warn('后端接口不可用，已降级为本地 Mock 数据', error)
    return mockHotData as HotAllResponse
  }
}
