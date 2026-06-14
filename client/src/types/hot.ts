export type HotSource = 'xhs' | 'kesong' | 'dewu'

export interface HotItem {
  rank: number
  title: string
  heat?: string
  url: string
}

export interface HotPlatform {
  source: HotSource
  sourceName: string
  listName: string
  updatedAt: string
  items: HotItem[]
  error?: boolean
}

export interface CrossPlatformItem {
  title: string
  url: string
  heat: string
  platforms: string[]
}

export interface HotAllResponse {
  platforms: HotPlatform[]
  crossPlatform: CrossPlatformItem[]
  cacheTTL: number
}
