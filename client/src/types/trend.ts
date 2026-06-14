export interface TrendItem {
  rank: number
  title: string
  heat?: string
  url: string
}

export interface TrendPlatform {
  source: string
  sourceName: string
  listName: string
  updatedAt: string
  items: TrendItem[]
  error?: boolean
}

export interface TrendAllResponse {
  platforms: TrendPlatform[]
}
