# 今日种草热搜 · 开发指令

## 项目概述
使用 React + TypeScript + Vite + CSS 开发前端；
使用 Node.js + Express 开发后端，通过 Uapis 聚合 API 获取小红书、可颂、得物的热门趋势数据。
若 Uapis 调用失败，自动降级为本地 Mock 数据，保证页面永不空白。

## 开发规范
- 使用 TypeScript，前后端类型统一（TrendItem, TrendPlatform）
- 使用函数式组件 + Hooks
- 样式使用普通 CSS（不用 Tailwind），保持简洁
- 组件可复用：TrendCard、Layout
- 后端必须实现单一接口 GET /api/trend/all，返回三个平台数据

## 代码风格
- 组件名 PascalCase，函数 camelCase
- 接口路径：GET /api/trend/all（统一返回三个平台）
- 禁止前端直接请求 Uapis 或任何第三方 API，所有外部请求必须经过后端
- 后端服务函数命名：fetchFromUapis(platformCode)

## 设计要求
- 参考小红书的双列瀑布流风格，但保持卡片网格清爽易读
- 桌面 3 列卡片，移动端 1 列（响应式）
- 排名 1～3 名使用特殊颜色（金色/银色/铜色）或渐变背景
- 单卡失败显示「暂时无法获取数据」+ 重试按钮，不拖垮整页
- 页脚必须包含：学习项目声明、数据来源（Uapis）、非商用说明

## 注意事项
- Uapis 请求需要携带 API Key（环境变量 UAPIS_KEY），不要硬编码
- 缓存 TTL 默认 600 秒，可用环境变量 CACHE_TTL（单位秒）
- 必须实现降级逻辑：Uapis 失败 → 返回 Mock 数据，并标记 error: true
- 不要把 .env 文件提交到 GitHub，提供 .env.example 作为模板
- 后端使用 Promise.allSettled 并发请求三个平台，避免一崩全崩
- 若某平台 Uapis 返回空数据或非 200 状态，同样触发降级
- 页脚注明：学习项目，数据来源于 Uapis 公开接口，非官方

## 测试要求
- 每完成一个平台，手动验证 ≥10 条数据，且标题可点击跳转正确链接
- 测试：模拟 Uapis 返回 403 或超时，检查后端是否自动返回 Mock 数据
- 测试：单平台失败时，其他两个平台仍正常显示
- 测试：10 分钟内重复刷新，后端日志应出现 [cache hit]（缓存生效）
- 测试：前端执行 npm run build 无报错
- 测试：手机浏览器（或开发者工具手机模式）下卡片变为 1 列