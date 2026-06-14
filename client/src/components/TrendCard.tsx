import type { HotPlatform } from '../types/hot'

interface TrendCardProps {
  platform: HotPlatform
  onRetry: () => void
}

function formatUpdatedAt(updatedAt: string) {
  const date = new Date(updatedAt)

  if (Number.isNaN(date.getTime())) {
    return '时间未知'
  }

  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

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

function formatCount(count: number) {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(count >= 100000 ? 0 : 1)}w`
  }

  return `${Math.round(count)}`
}

function buildStats(heat?: string) {
  const baseValue = parseHeatValue(heat)

  if (!baseValue) {
    return {
      likes: '待更新',
      interactions: '待更新',
    }
  }

  return {
    likes: formatCount(baseValue * 0.68),
    interactions: formatCount(baseValue * 0.21),
  }
}

export function TrendCard({ platform, onRetry }: TrendCardProps) {
  return (
    <article className={`trend-card ${platform.error ? 'trend-card--error' : ''}`}>
      <div className="trend-card__header">
        <div>
          <p className="trend-card__source">{platform.sourceName}</p>
          <h2>{platform.listName}</h2>
        </div>
        <span className="trend-card__time">更新于 {formatUpdatedAt(platform.updatedAt)}</span>
      </div>

      {platform.error ? (
        <div className="trend-card__fallback">
          <p>暂时无法获取实时数据，当前显示的是降级内容。</p>
          <button type="button" onClick={onRetry}>
            重试
          </button>
        </div>
      ) : null}

      <ol className="trend-list">
        {platform.items.slice(0, 10).map((item) => {
          const stats = buildStats(item.heat)

          return (
            <li
              key={`${platform.source}-${item.rank}-${item.title}`}
              className={`trend-list__item trend-list__item--rank-${Math.min(item.rank, 10)}`}
            >
              <span className={`trend-rank trend-rank--${Math.min(item.rank, 4)}`}>{item.rank}</span>

              <div className="trend-list__content">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`trend-title trend-title--${Math.min(item.rank, 10)}`}
                >
                  {item.title}
                </a>
                <div className="trend-list__meta">
                  <span>点赞量 {stats.likes}</span>
                  <span>互动量 {stats.interactions}</span>
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </article>
  )
}
