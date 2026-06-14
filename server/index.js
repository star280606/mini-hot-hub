const express = require('express')
const cors = require('cors')
const NodeCache = require('node-cache')

const app = express()
const PORT = process.env.PORT || 3001
const HOST = '0.0.0.0'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const UAPIS_KEY = process.env.UAPIS_KEY
const CACHE_TTL = parseInt(process.env.CACHE_TTL || '600', 10)

const cache = new NodeCache({ stdTTL: CACHE_TTL })

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  }),
)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

const PLATFORMS = [
  { source: 'xhs', sourceName: '小红书', listName: '种草趋势榜', code: 'xhs' },
  { source: 'kesong', sourceName: '可颂', listName: '种草趋势榜', code: 'kesong' },
  { source: 'dewu', sourceName: '得物', listName: '种草趋势榜', code: 'dewu' },
]

function parseHeatValue(heatStr) {
  if (!heatStr) return 0
  const matched = heatStr.match(/(\d+(?:\.\d+)?)/)
  if (!matched) return 0
  const value = parseFloat(matched[1])
  return heatStr.includes('w') ? value * 10000 : value
}

async function fetchFromUapis(platformCode) {
  const endpoints = {
    xhs: 'https://apis.tianxin520.cn/api/xiaohongshu',
    kesong: 'https://apis.tianxin520.cn/api/kesong',
    dewu: 'https://apis.tianxin520.cn/api/dewu',
  }

  const url = endpoints[platformCode]
  if (!url) throw new Error(`Unknown platform: ${platformCode}`)

  console.log(`[Uapis] Fetching ${platformCode} from ${url}`)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`${url}?key=${UAPIS_KEY}`, {
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`[Uapis] ${platformCode} response:`, JSON.stringify(data).slice(0, 200))

    if (data.code !== 200 && data.code !== 0) {
      throw new Error(`API error code: ${data.code}`)
    }

    const list = data.data || data.result || []
    if (!list || list.length === 0) {
      throw new Error('Empty data')
    }

    return list.map((item, index) => ({
      rank: index + 1,
      title: item.title || item.word || item.name || '',
      heat: item.heat || item.hot || item.value || '',
      url: item.url || item.link || `https://www.${platformCode}.com/search?q=${encodeURIComponent(item.title || '')}`,
    }))
  } catch (error) {
    clearTimeout(timeout)
    console.error(`[Uapis] ${platformCode} failed:`, error.message)
    throw error
  }
}

function getMockData(platformCode) {
  const now = new Date().toISOString()
  const mockData = {
    xhs: [
      { rank: 1, title: '早秋美拉德穿搭', heat: '45w', url: 'https://www.xiaohongshu.com/search_result?keyword=早秋美拉德穿搭' },
      { rank: 2, title: '氛围感胶片拍照', heat: '38w', url: 'https://www.xiaohongshu.com/search_result?keyword=氛围感胶片拍照' },
      { rank: 3, title: '低卡减脂便当', heat: '32w', url: 'https://www.xiaohongshu.com/search_result?keyword=低卡减脂便当' },
      { rank: 4, title: '通勤极简妆容', heat: '28w', url: 'https://www.xiaohongshu.com/search_result?keyword=通勤极简妆容' },
      { rank: 5, title: '小户型收纳改造', heat: '25w', url: 'https://www.xiaohongshu.com/search_result?keyword=小户型收纳改造' },
      { rank: 6, title: '夏日清爽发型', heat: '22w', url: 'https://www.xiaohongshu.com/search_result?keyword=夏日清爽发型' },
      { rank: 7, title: '周末露营装备清单', heat: '19w', url: 'https://www.xiaohongshu.com/search_result?keyword=周末露营装备清单' },
      { rank: 8, title: '平价护肤好物', heat: '17w', url: 'https://www.xiaohongshu.com/search_result?keyword=平价护肤好物' },
      { rank: 9, title: '城市骑行路线', heat: '15w', url: 'https://www.xiaohongshu.com/search_result?keyword=城市骑行路线' },
      { rank: 10, title: '手作咖啡拉花', heat: '12w', url: 'https://www.xiaohongshu.com/search_result?keyword=手作咖啡拉花' },
    ],
    kesong: [
      { rank: 1, title: '法式慵懒风穿搭', heat: '41w', url: 'https://www.kesong.cn/search?q=法式慵懒风穿搭' },
      { rank: 2, title: '夏日冰饮自制', heat: '35w', url: 'https://www.kesong.cn/search?q=夏日冰饮自制' },
      { rank: 3, title: '复古CCD拍照技巧', heat: '30w', url: 'https://www.kesong.cn/search?q=复古CCD拍照技巧' },
      { rank: 4, title: '轻食沙拉配方', heat: '27w', url: 'https://www.kesong.cn/search?q=轻食沙拉配方' },
      { rank: 5, title: '居家健身跟练', heat: '24w', url: 'https://www.kesong.cn/search?q=居家健身跟练' },
      { rank: 6, title: '小众香氛推荐', heat: '21w', url: 'https://www.kesong.cn/search?q=小众香氛推荐' },
      { rank: 7, title: '阳台花园布置', heat: '18w', url: 'https://www.kesong.cn/search?q=阳台花园布置' },
      { rank: 8, title: '极简桌面好物', heat: '16w', url: 'https://www.kesong.cn/search?q=极简桌面好物' },
      { rank: 9, title: '周末短途旅行', heat: '14w', url: 'https://www.kesong.cn/search?q=周末短途旅行' },
      { rank: 10, title: '新手烘焙入门', heat: '11w', url: 'https://www.kesong.cn/search?q=新手烘焙入门' },
    ],
    dewu: [
      { rank: 1, title: '复古跑鞋穿搭', heat: '52w', url: 'https://www.dewu.com/search?keyword=复古跑鞋穿搭' },
      { rank: 2, title: '夏日防晒好物', heat: '44w', url: 'https://www.dewu.com/search?keyword=夏日防晒好物' },
      { rank: 3, title: '潮牌联名新品', heat: '39w', url: 'https://www.dewu.com/search?keyword=潮牌联名新品' },
      { rank: 4, title: '街头风卫衣搭配', heat: '33w', url: 'https://www.dewu.com/search?keyword=街头风卫衣搭配' },
      { rank: 5, title: '运动耳机测评', heat: '29w', url: 'https://www.dewu.com/search?keyword=运动耳机测评' },
      { rank: 6, title: '篮球鞋实战推荐', heat: '26w', url: 'https://www.dewu.com/search?keyword=篮球鞋实战推荐' },
      { rank: 7, title: '工装裤穿搭指南', heat: '23w', url: 'https://www.dewu.com/search?keyword=工装裤穿搭指南' },
      { rank: 8, title: '限量球鞋发售', heat: '20w', url: 'https://www.dewu.com/search?keyword=限量球鞋发售' },
      { rank: 9, title: '户外冲锋衣选购', heat: '17w', url: 'https://www.dewu.com/search?keyword=户外冲锋衣选购' },
      { rank: 10, title: '滑板入门装备', heat: '13w', url: 'https://www.dewu.com/search?keyword=滑板入门装备' },
    ],
  }

  return {
    items: mockData[platformCode] || [],
    updatedAt: now,
  }
}

function findCrossPlatformTrends(platforms) {
  const titleCounts = {}

  platforms.forEach((platform) => {
    if (platform.error) return
    const normalizedTitles = platform.items.map((item) => item.title.trim().toLowerCase())
    normalizedTitles.forEach((title) => {
      titleCounts[title] = (titleCounts[title] || 0) + 1
    })
  })

  const crossPlatformTitles = Object.entries(titleCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([title]) => title)

  const crossTrends = []
  crossPlatformTitles.forEach((normalizedTitle) => {
    const platform = platforms.find((p) =>
      !p.error && p.items.some((item) => item.title.trim().toLowerCase() === normalizedTitle)
    )
    if (platform) {
      const item = platform.items.find((i) => i.title.trim().toLowerCase() === normalizedTitle)
      if (item) {
        const totalHeat = platforms
          .filter((p) => !p.error && p.items.some((i) => i.title.trim().toLowerCase() === normalizedTitle))
          .reduce((sum, p) => {
            const i = p.items.find((it) => it.title.trim().toLowerCase() === normalizedTitle)
            return sum + (i ? parseHeatValue(i.heat) : 0)
          }, 0)

        crossTrends.push({
          title: item.title,
          url: item.url,
          heat: totalHeat >= 10000 ? `${(totalHeat / 10000).toFixed(1)}w` : `${totalHeat}`,
          platforms: platforms
            .filter((p) => !p.error && p.items.some((i) => i.title.trim().toLowerCase() === normalizedTitle))
            .map((p) => p.sourceName),
        })
      }
    }
  })

  return crossTrends.sort((a, b) => parseHeatValue(b.heat) - parseHeatValue(a.heat)).slice(0, 3)
}

async function fetchPlatformData(platform) {
  const cacheKey = `platform_${platform.source}`

  const cached = cache.get(cacheKey)
  if (cached) {
    console.log(`[cache hit] ${platform.source}`)
    return { ...platform, ...cached, error: false }
  }

  console.log(`[cache miss] ${platform.source}, fetching from Uapis...`)

  try {
    if (!UAPIS_KEY) {
      throw new Error('UAPIS_KEY not configured')
    }

    const items = await fetchFromUapis(platform.code)
    const now = new Date().toISOString()
    const result = { items, updatedAt: now }

    cache.set(cacheKey, result)
    console.log(`[success] ${platform.source}, cached for ${CACHE_TTL}s`)

    return { ...platform, ...result, error: false }
  } catch (error) {
    console.warn(`[fallback] ${platform.source} using mock data:`, error.message)

    const mock = getMockData(platform.code)
    cache.set(cacheKey, mock)
    return { ...platform, ...mock, error: true }
  }
}

app.get('/api/trend/all', async (_req, res) => {
  console.log('\n=== [/api/trend/all] New request ===')

  try {
    const results = await Promise.allSettled(PLATFORMS.map(fetchPlatformData))

    const platforms = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      }
      console.error(`[error] ${PLATFORMS[index].source} rejected:`, result.reason)
      const mock = getMockData(PLATFORMS[index].code)
      return { ...PLATFORMS[index], ...mock, error: true }
    })

    const crossPlatform = findCrossPlatformTrends(platforms)

    console.log(`[success] Returning ${platforms.length} platforms, ${crossPlatform.length} cross-platform trends`)

    res.json({
      platforms,
      crossPlatform,
      cacheTTL: CACHE_TTL,
    })
  } catch (error) {
    console.error('[fatal]', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`)
  console.log(`UAPIS_KEY: ${UAPIS_KEY ? 'configured' : 'NOT SET (will use mock data)'}`)
  console.log(`CACHE_TTL: ${CACHE_TTL}s`)
})
