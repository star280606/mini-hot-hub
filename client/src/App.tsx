import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { fetchAllTrend } from './api/fetchAllTrend'
import { HotSummary } from './components/HotSummary'
import { Layout } from './components/Layout'
import { TrendCard } from './components/TrendCard'
import type { HotPlatform } from './types/hot'

function App() {
  const [platforms, setPlatforms] = useState<HotPlatform[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pageError, setPageError] = useState<string | null>(null)

  const loadTrends = useCallback(async () => {
    setIsLoading(true)
    setPageError(null)

    try {
      const data = await fetchAllTrend()
      setPlatforms(data.platforms)
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误'
      setPageError(`页面加载失败：${message}`)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTrends()
  }, [loadTrends])

  const lastUpdatedText = useMemo(() => {
    const firstUpdatedAt = platforms[0]?.updatedAt

    if (!firstUpdatedAt) {
      return '等待数据加载'
    }

    const date = new Date(firstUpdatedAt)

    if (Number.isNaN(date.getTime())) {
      return '更新时间未知'
    }

    return `最后更新 ${new Intl.DateTimeFormat('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)}`
  }, [platforms])

  return (
    <Layout lastUpdatedText={lastUpdatedText} platformCount={platforms.length || 3}>
      <section className="toolbar">
        <p>桌面端三列卡片展示，移动端自动切换为单列阅读。</p>
        <button type="button" onClick={() => void loadTrends()} disabled={isLoading}>
          {isLoading ? '刷新中...' : '刷新全部'}
        </button>
      </section>

      {pageError ? (
        <section className="panel panel--error">
          <p>{pageError}</p>
          <button type="button" onClick={() => void loadTrends()}>
            重新加载
          </button>
        </section>
      ) : null}

      {isLoading ? (
        <section className="panel">
          <p>正在加载三端热搜数据，请稍候...</p>
        </section>
      ) : null}

      {!isLoading && platforms.length > 0 ? (
        <>
          <HotSummary platforms={platforms} />

          <section className="trend-grid">
            {platforms.map((platform) => (
              <TrendCard key={platform.source} platform={platform} onRetry={() => void loadTrends()} />
            ))}
          </section>
        </>
      ) : null}
    </Layout>
  )
}

export default App
