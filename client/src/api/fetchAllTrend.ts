import type { TrendAllResponse } from '../types/trend'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export async function fetchAllTrend(): Promise<TrendAllResponse> {
  const res = await fetch(`${API_BASE}/api/trend/all`)
  if (!res.ok) {
    throw new Error(`请求失败: ${res.status}`)
  }
  return res.json() as Promise<TrendAllResponse>
}
