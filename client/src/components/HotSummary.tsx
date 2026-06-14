import type { HotPlatform } from '../types/hot'

interface SummaryTopic {
  id: string
  title: string
  description: string
  platformCount: number
  score: number
  examples: string[]
}

interface HotSummaryProps {
  platforms: HotPlatform[]
}

interface TopicRule {
  id: string
  title: string
  keywords: string[]
}

const TOPIC_RULES: TopicRule[] = [
  {
    id: 'style',
    title: '穿搭风格热度最高',
    keywords: ['穿搭', '搭配', '跑鞋', '工装裤', '卫衣'],
  },
  {
    id: 'summer',
    title: '夏日清爽主题持续升温',
    keywords: ['夏日', '防晒', '冰饮', '清爽'],
  },
  {
    id: 'photo',
    title: '拍照氛围内容继续走强',
    keywords: ['拍照', '胶片', 'CCD', '氛围感'],
  },
  {
    id: 'lifestyle',
    title: '轻生活与居家灵感受关注',
    keywords: ['收纳', '花园', '香氛', '护肤', '桌面', '露营'],
  },
]

function parseHeatValue(heat?: string) {
  if (!heat) {
    return 0
  }

  const matched = heat.match(/(\d+(?:\.\d+)?)/)

  if (!matched) {
    return 0
  }

  const value = Number(matched[1])

  return heat.includes('w') ? value * 10000 : value
}

function buildSummaryTopics(platforms: HotPlatform[]): SummaryTopic[] {
  const topics = TOPIC_RULES.map((rule) => {
    const matchedPlatforms = new Set<string>()
    const examples: string[] = []
    let score = 0

    platforms.forEach((platform) => {
      platform.items.forEach((item) => {
        const isMatched = rule.keywords.some((keyword) => item.title.includes(keyword))

        if (!isMatched) {
          return
        }

        matchedPlatforms.add(platform.sourceName)
        score += parseHeatValue(item.heat) + (11 - item.rank) * 1800

        if (examples.length < 3) {
          examples.push(item.title)
        }
      })
    })

    return {
      id: rule.id,
      title: rule.title,
      description: `${matchedPlatforms.size} 个平台同时出现相关内容`,
      platformCount: matchedPlatforms.size,
      score,
      examples,
    }
  })

  const primaryTopics = topics
    .filter((topic) => topic.platformCount >= 2 && topic.examples.length > 0)
    .sort((first, second) => {
      if (second.platformCount !== first.platformCount) {
        return second.platformCount - first.platformCount
      }

      return second.score - first.score
    })

  if (primaryTopics.length >= 3) {
    return primaryTopics.slice(0, 3)
  }

  const fallbackTopics = platforms
    .flatMap((platform) =>
      platform.items.slice(0, 3).map((item) => ({
        id: `${platform.source}-${item.rank}`,
        title: item.title,
        description: `${platform.sourceName} 当前高位热点`,
        platformCount: 1,
        score: parseHeatValue(item.heat),
        examples: [item.title],
      })),
    )
    .sort((first, second) => second.score - first.score)

  return [...primaryTopics, ...fallbackTopics].slice(0, 3)
}

export function HotSummary({ platforms }: HotSummaryProps) {
  const topics = buildSummaryTopics(platforms)

  return (
    <section className="summary-card">
      <div className="summary-card__header">
        <div>
          <p className="summary-card__eyebrow">全网共同热点</p>
          <h2>关注度最高的 3 个内容方向</h2>
        </div>
        <span className="summary-card__tip">基于三平台标题主题与热度综合整理</span>
      </div>

      <div className="summary-grid">
        {topics.map((topic, index) => (
          <article key={topic.id} className="summary-topic">
            <span className="summary-topic__index">TOP {index + 1}</span>
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
            <div className="summary-topic__examples">
              {topic.examples.map((example) => (
                <span key={example}>{example}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
