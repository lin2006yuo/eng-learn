# AGENTS.md - Pattern English (eng-learn)

## 项目简介

Pattern English 是一个面向中文用户的英语学习 Web 应用，核心功能是围绕英文句型进行学习。

- **广场模式**: 提供 50 个常用英文句型，每个句型包含多个中英对照例句，支持点击复制
- **记录模式**: 用户可添加学习笔记
- **收藏模式**: 用户可收藏句型并按标签分类管理
- **用户系统**: 注册/登录，学习统计（复制次数、连续学习天数）

## 技术栈

| 类别    | 技术                                    |
| ----- | ------------------------------------- |
| 框架    | Next.js 16 (App Router)               |
| UI    | React 19 + TypeScript                 |
| 样式    | Tailwind CSS v4                       |
| 动画    | Framer Motion                         |
| 状态管理  | Zustand (持久化到 localStorage)           |
| 数据获取  | SWR (useSWR)                          |
| 列表虚拟化 | @tanstack/react-virtual               |
| 数据库   | SQLite (better-sqlite3) + Drizzle ORM |
| 认证    | Better-Auth (内置密码哈希)                  |
| 表单验证  | Zod (登录页内置验证)                         |

## 开发命令

```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run db:push      # 推送数据库 schema 变更
npm run db:studio    # 打开 Drizzle Studio
```

## 当前目录结构

```
src/
├── app/                              ← Next.js App Router 路由层
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/route.ts     ← Better-Auth 统一路由
│   │   ├── comments/
│   │   │   ├── [commentId]/
│   │   │   │   ├── like/route.ts     ← 评论点赞 API
│   │   │   │   └── route.ts          ← 单个评论操作 API
│   │   │   └── route.ts              ← 评论列表/创建 API
│   │   ├── patterns/route.ts         ← 句型数据 API
│   │   └── study-days/route.ts       ← 学习记录 API
│   ├── login/page.tsx                ← 登录/注册页
│   ├── my-comments/page.tsx          ← 我的评论页
│   ├── pattern/[patternId]/comments/page.tsx  ← 句型评论页 (SSG)
│   ├── pattern-learn/page.tsx        ← 句型学习页
│   ├── globals.css
│   ├── layout.tsx                    ← RootLayout
│   ├── page.tsx                      ← 首页 (Tab 切换容器)
│   └── providers.tsx                 ← Providers 组件
│
├── features/                         ← 业务功能模块 (按功能分组)
│   ├── auth/                         ← 认证功能
│   │   ├── components/LogoutButton.tsx
│   │   ├── hooks/useAuth.ts          ← 获取当前用户会话
│   │   └── index.ts
│   │
│   ├── comment/                      ← 评论功能
│   │   ├── components/
│   │   │   ├── CommentInput.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   ├── CommentPreview.tsx
│   │   │   ├── CommentTabs.tsx
│   │   │   ├── CommentsModal.tsx
│   │   │   ├── MyCommentCard.tsx
│   │   │   ├── MyCommentsPage.tsx
│   │   │   └── ReplyToMeCard.tsx
│   │   ├── hooks/
│   │   │   ├── useMyCommentCount.ts
│   │   │   └── useMyComments.ts
│   │   ├── store/commentStore.ts     ← 评论 Zustand store (mock 数据)
│   │   ├── queries.ts
│   │   ├── transformers.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── index.ts
│   │
│   ├── favorite/                     ← 收藏功能
│   │   ├── components/
│   │   │   ├── CreateTagModal.tsx
│   │   │   ├── FavoriteButton.tsx
│   │   │   └── TagSelectModal.tsx
│   │   ├── store/favoriteStore.ts    ← 收藏 Zustand store (localStorage)
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── note/                         ← 笔记功能
│   │   ├── components/
│   │   │   ├── NoteCard.tsx
│   │   │   └── NoteFormModal.tsx
│   │   ├── store/noteStore.ts        ← 笔记 Zustand store (localStorage)
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── pattern/                      ← 句型功能
│   │   ├── components/
│   │   │   ├── ExampleItem.tsx       ← 单个例句 (可复制)
│   │   │   ├── PatternCard.tsx       ← 句型卡片
│   │   │   ├── PatternList.tsx
│   │   │   └── VirtualPatternList.tsx ← 虚拟化长列表
│   │   └── index.ts
│   │
│   ├── profile/                      ← 个人主页功能
│   │   └── components/EditNicknameModal.tsx
│   │
│   └── search/                       ← 搜索功能
│       ├── components/
│       │   ├── HotTags.tsx
│       │   ├── SearchBox.tsx
│       │   └── SearchResult.tsx
│       ├── hooks/
│       │   ├── useSearch.ts
│       │   └── useSearchHistory.ts   ← 搜索历史 (localStorage)
│       └── index.ts
│
├── views/                            ← 页面级组件 (组合多个 feature)
│   ├── DiscoverPage.tsx              ← 发现页 (搜索 + 热门标签)
│   ├── FavoritesPage.tsx             ← 收藏管理页
│   ├── NotesPage.tsx                 ← 笔记页
│   ├── PatternLearnPage.tsx          ← 句型学习页
│   ├── ProfilePage.tsx               ← 个人主页
│   ├── SquarePage.tsx                ← 广场页
│   └── index.ts
│
├── shared/                           ← 共享资源 (与业务无关)
│   ├── components/                   ← 通用 UI 组件
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── ProgressRing.tsx
│   │   ├── QuickNav.tsx
│   │   ├── SearchInput.tsx
│   │   ├── StatCard.tsx
│   │   ├── StudyDayNav.tsx
│   │   ├── TabBar.tsx
│   │   ├── Toast.tsx
│   │   └── index.ts
│   ├── config/
│   │   └── tabs.ts                   ← Tab 顺序常量
│   ├── hooks/                        ← 通用 hooks
│   │   ├── ModalRouteContext.tsx     ← 评论弹窗路由上下文
│   │   ├── useCopy.ts                ← 复制 hook (关联 toast + 统计)
│   │   ├── useModalRoute.ts
│   │   ├── useScrollSpy.ts           ← 滚动监听
│   │   └── index.ts
│   ├── store/                        ← 全局状态
│   │   ├── appStore.ts               ← 当前 tab、toast、搜索查询
│   │   ├── statsStore.ts             ← 复制次数、连续天数 (localStorage)
│   │   └── index.ts
│   ├── types/                        ← 全局类型定义
│   │   ├── http-code.ts              ← HTTP 状态码类型
│   │   └── index.ts                  ← Pattern, Example, TabType, ToastState, StatsState
│   ├── utils/                        ← 工具函数
│   │   ├── api.ts                    ← API 请求工具
│   │   ├── cn.ts                     ← tailwind-merge + clsx
│   │   ├── copy.ts                   ← 复制工具函数
│   │   ├── eventBus.ts               ← 事件总线
│   │   └── index.ts
│   └── index.ts                      ← barrel file
│
├── lib/                              ← 基础设施
│   ├── auth.ts                       ← Better-Auth 初始化
│   ├── auth-client.ts                ← Better-Auth 客户端
│   └── db/
│       ├── index.ts                  ← SQLite 单例 + Drizzle
│       ├── patterns-schema.ts        ← 句型表结构
│       └── schema.ts                 ← Drizzle 表结构 (user, session, account, verification)
│
├── data/                             ← 静态数据
│   ├── patterns.json                 ← 50 个句型原始数据
│   └── patterns.ts                   ← patterns 导出 + searchPatterns 函数
│
├── tests/                            ← 测试代码
│   ├── components/Button.test.tsx    ← 组件测试
│   ├── e2e/auth.spec.ts              ← 端到端测试
│   ├── integration/                  ← 集成测试
│   │   ├── api/                      ← API 集成测试
│   │   └── db/                       ← 数据库集成测试
│   ├── test-helpers/                 ← 测试辅助工具
│   ├── unit/                         ← 单元测试
│   ├── setup.ts                      ← 测试配置
│   └── vitest-env.d.ts               ← Vitest 类型声明
│
└── proxy.ts                          ← 路由代理 (登录保护)
```

## 分层依赖规则

```
app/      ──>  features/, shared/, views/
views/    ──>  features/, shared/
features/ ──>  shared/, lib/
shared/   ──>  lib/, data/
lib/      ──>  (无依赖)
data/     ──>  (无依赖)

禁止反向依赖
```

## 编码规范 (强制)

详细规范见 [AGENTS-CODING-STANDARDS.md](./AGENTS-CODING-STANDARDS.md)

### 核心要点

1. **原子化原则**: 一个文件 = 一个导出主实体，单文件不超过 150 行，单函数不超过 40 行
2. **多分支逻辑**: 禁止超过 3 个分支的 if-else/switch，必须使用设计模式（策略/工厂/状态等）
3. **组件拆分**: 大组件必须拆分为小组件组合
4. **命名规则**: 组件 PascalCase，Hook camelCase+use 前缀，工具函数 camelCase
5. **className 规范**: 容器和必要元素必须有语义化 className，格式 `${feature}-${component}-${role}，名称必须在tailwind类名前面`
6. **API 请求规范**: 禁止裸用 fetch，必须使用 `@/shared/utils/api.ts` 封装函数
7. **其他**: 禁止 console.log，禁止上帝文件，barrel file 只做 re-export

## 设计系统 (强制)

详见 [design-system.md](./design-system.md)

### 色彩系统

- **品牌色**: `#58CC71` (primary), `#FF9600` (secondary)
- **背景色**: `#FFF7E8` (暖黄), `#FFFFFF` (卡片)
- **文字色**: `#1F2937` (主), `#6B7280` (次)

