import type { CrossPlatformItem } from '../types/hot'

interface HotSummaryProps {
  crossPlatform: CrossPlatformItem[]
}

export function HotSummary({ crossPlatform }: HotSummaryProps) {
  if (!crossPlatform || crossPlatform.length === 0) {
    return null
  }

  return (
    <section className="summary-card">
      <div className="summary-card__header">
        <div>
          <p className="summary-card__eyebrow">全网共同热点</p>
          <h2>跨平台热议 TOP 3</h2>
        </div>
        <span className="summary-card__tip">同时出现在多个平台的热议话题</span>
      </div>

      <div className="summary-grid">
        {crossPlatform.map((item, index) => (
          <article key={`cross-${index}`} className="summary-topic">
            <span className="summary-topic__index">TOP {index + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.platforms.join('、')} 同步推荐</p>
            <div className="summary-topic__examples">
              <span className="heat-badge">{item.heat} 热度</span>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="view-link"
              >
                查看详情
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
