markdown
# 种草热搜 · 技术设计（精简版）

## 技术栈
- 前端：React + TypeScript + Vite + CSS
- 后端：Node.js + Express
- 数据：Uapis 聚合 API + Mock 降级
- 缓存：内存 Map，TTL 600 秒
- 部署：前端 Vercel，后端 Railway

## 项目结构
mini-trend-hub/
├── client/
│ ├── src/
│ │ ├── components/ # TrendCard, Layout
│ │ ├── api/ # fetchAllTrend()
│ │ └── types/ # TrendPlatform, TrendItem
├── server/
│ ├── routes/trend.js # GET /api/trend/all
│ ├── services/
│ │ ├── aggregator.js # 调用 Uapis
│ │ └── mockData.js # 降级数据
│ └── utils/cache.js # 内存缓存

text

## 数据模型（前后端统一）
```typescript
interface TrendItem {
  rank: number;
  title: string;
  heat?: string;   // 如 "12w热度"
  url: string;
}

interface TrendPlatform {
  source: string;      // 'xhs' | 'kesong' | 'dewu'
  sourceName: string;  // '小红书' | '可颂' | '得物'
  listName: string;    // '种草趋势榜'
  updatedAt: string;   // ISO 时间
  items: TrendItem[];
  error?: boolean;     // true 表示该平台降级
}
接口设计
GET /api/trend/all 返回 { platforms: TrendPlatform[] }

响应示例：

json
{
  "platforms": [
    {
      "source": "xhs",
      "sourceName": "小红书",
      "listName": "种草趋势榜",
      "updatedAt": "2026-06-09T12:00:00.000Z",
      "items": [
        { "rank": 1, "title": "早秋美拉德穿搭", "heat": "45w", "url": "https://..." }
      ]
    }
  ]
}
核心流程
前端请求 /api/trend/all

后端对三个平台并发请求（Promise.allSettled）：

查缓存（key trend:xhs 等）→ 命中直接返回

未命中 → 调 Uapis → 成功转格式并缓存，失败用 Mock

聚合结果返回前端

前端渲染三张卡片，单卡失败不影响其他

Uapis 数据映射规则
请求：https://uapis.cn/api/hot?type={code}&key=${UAPIS_KEY}

响应 data.list 数组，每个元素含 title, hot, url

转换：rank = 索引+1，heat = hot，url 缺失时拼接搜索链接（如小红书搜索链接）

缓存策略
存储完整的 TrendPlatform 对象，TTL 默认 600 秒

缓存命中时不调用 Uapis

注意 Uapis 免费版每日限额（50~100次），合理利用缓存

环境变量
后端：UAPIS_KEY（必填）、CACHE_TTL（可选，默认600）

前端（Vercel）：VITE_API_BASE = 后端 Railway 域名

开发代理（vite.config.ts）
js
server: { proxy: { '/api': 'http://localhost:3001' } }
关键约束
禁止前端直接请求 Uapis

必须实现降级：Uapis 失败 → 返回 Mock + error: true

缓存 key 按平台区分：trend:xhs、trend:kesong、trend:dewu

页脚注明学习项目、数据来源（Uapis）