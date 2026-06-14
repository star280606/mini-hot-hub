import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  lastUpdatedText: string
  platformCount: number
}

export function Layout({ children, lastUpdatedText, platformCount }: LayoutProps) {
  return (
    <div className="page-shell">
      <header className="hero">
        <div className="hero__badge">学习项目 · React + TypeScript + Vite</div>
        <h1>今日种草热搜</h1>
        <p className="hero__description">
          聚合小红书、可颂、得物三端热搜，保持清爽卡片式浏览体验。单个平台异常时，其余平台仍可继续查看。
        </p>
        <div className="hero__meta">
          <span>{platformCount} 个平台</span>
          <span>{lastUpdatedText}</span>
        </div>
      </header>

      <main className="content">{children}</main>

      <footer className="footer">
        <p>本项目仅用于学习与演示，不构成任何官方榜单或商业用途。</p>
        <p>数据来源于 Uapis 公开接口，页面展示内容仅作聚合整理参考。</p>
        <p>数据更新频率约 10 分钟。</p>
      </footer>
    </div>
  )
}
