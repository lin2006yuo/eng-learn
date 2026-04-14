# Pattern English - MVP 前端架构设计

## 1. 技术选型

| 层级 | 技术 | 选型理由 |
|------|------|----------|
| 框架 | React 18 + TypeScript | 类型安全，生态成熟 |
| 构建工具 | Vite | 启动快，HMR 好，配置简单 |
| 样式方案 | Tailwind CSS + CSS Variables | 原子化 CSS，Design Token 易维护 |
| 路由 | React Router v6 | 声明式路由，支持嵌套路由 |
| 状态管理 | Zustand | 轻量，无样板代码，适合 MVP |
| 动画 | Framer Motion | 声明式动画，符合多邻国风格 |
| 图标 | Lucide React | 圆润风格，与多邻国接近 |
| 存储 | localStorage | MVP 无后端，本地持久化 |

---

## 2. 项目目录结构

```
eng-learn/
├── public/                      # 静态资源
│   └── favicon.svg
├── src/
│   ├── main.tsx                 # 应用入口
│   ├── App.tsx                  # 根组件
│   ├── index.css                # 全局样式 + CSS Variables
│   │
│   ├── components/              # 组件层
│   │   ├── ui/                  # 基础 UI 组件
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── TabBar.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── SearchInput.tsx
│   │   ├── pattern/             # 业务组件 - 句型相关
│   │   │   ├── PatternCard.tsx      # 句型卡片
│   │   │   ├── ExampleItem.tsx      # 例句条目
│   │   │   └── PatternList.tsx      # 句型列表
│   │   ├── search/              # 业务组件 - 搜索相关
│   │   │   ├── SearchBox.tsx
│   │   │   ├── SearchResult.tsx
│   │   │   └── HotTags.tsx
│   │   └── stats/               # 业务组件 - 统计相关
│   │       ├── StatCard.tsx
│   │       └── ProgressRing.tsx
│   │
│   ├── pages/                   # 页面层
│   │   ├── LearnPage.tsx        # 学习页
│   │   ├── DiscoverPage.tsx     # 发现页
│   │   └── ProfilePage.tsx      # 我的页
│   │
│   ├── hooks/                   # 自定义 Hooks
│   │   ├── useCopy.ts           # 复制功能
│   │   ├── useLocalStorage.ts   # 本地存储
│   │   └── useSearch.ts         # 搜索逻辑
│   │
│   ├── stores/                  # 状态管理 (Zustand)
│   │   ├── appStore.ts          # 全局状态
│   │   └── statsStore.ts        # 统计状态
│   │
│   ├── data/                    # 数据层
│   │   └── patterns.ts          # 句型数据（10条例句）
│   │
│   ├── types/                   # 类型定义
│   │   └── index.ts
│   │
│   ├── utils/                   # 工具函数
│   │   ├── copy.ts              # 复制到剪贴板
│   │   └── search.ts            # 搜索匹配算法
│   │
│   └── styles/                  # 样式工具
│       └── animations.ts        # 动画配置
│
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 3. 组件架构

### 3.1 组件分层

```
┌─────────────────────────────────────────────────────────┐
│                      页面层 (Pages)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │ LearnPage   │  │DiscoverPage │  │ ProfilePage │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│                    业务组件层 (Features)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │PatternCard  │  │  SearchBox  │  │  StatCard   │     │
│  │PatternList  │  │SearchResult │  │ProgressRing │     │
│  │ExampleItem  │  │   HotTags   │  │             │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
├─────────────────────────────────────────────────────────┤
│                    基础 UI 层 (UI)                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Button  │ │  Card   │ │ TabBar  │ │  Toast  │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────────────────┘
```

### 3.2 关键组件说明

| 组件 | 职责 | 输入 | 输出 |
|------|------|------|------|
| TabBar | 底部导航 | activeTab, onChange | - |
| PatternCard | 句型展示卡片 | pattern, onCopy | - |
| ExampleItem | 单条例句 | example, onCopy | - |
| SearchBox | 搜索输入框 | value, onChange | - |
| Toast | 轻提示 | message, visible | - |
| ProgressRing | 进度圆环 | current, total | - |

---

## 4. 状态管理设计

### 4.1 Store 划分

```
┌─────────────────────────────────────────────────────────┐
│                      全局状态 (appStore)                  │
│  ├── currentTab: 'learn' | 'discover' | 'profile'      │
│  ├── toast: { message, visible }                        │
│  └── searchQuery: string                                │
├─────────────────────────────────────────────────────────┤
│                      统计状态 (statsStore)                │
│  ├── copyCount: number          (localStorage 持久化)    │
│  ├── streakDays: number         (MVP 写死 3)            │
│  └── lastVisitDate: string                              │
└─────────────────────────────────────────────────────────┘
```

### 4.2 数据流

```
用户操作 → 组件事件 → Store 更新 → 组件重新渲染 → localStorage 同步
```

---

## 5. 路由设计

```
/                    → 重定向到 /learn
/learn               → 学习页（默认 Tab）
/discover            → 发现页
/profile             → 我的页
```

### 路由与 TabBar 映射

| Tab | 路由路径 | 图标 | 名称 |
|-----|----------|------|------|
| 学习 | /learn | Flame | 学习 |
| 发现 | /discover | Search | 发现 |
| 我的 | /profile | Trophy | 我的 |

---

## 6. 样式系统 (Design Tokens)

### 6.1 CSS Variables

```css
:root {
  /* 品牌色 */
  --color-primary: #58CC71;
  --color-primary-dark: #4AB563;
  --color-secondary: #FF9600;
  
  /* 背景色 */
  --color-bg: #FFF7E8;
  --color-card: #FFFFFF;
  --color-search-bg: #F3F4F6;
  
  /* 文字色 */
  --color-text-primary: #1F2937;
  --color-text-secondary: #6B7280;
  
  /* 圆角 */
  --radius-sm: 12px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 9999px;
  
  /* 阴影 */
  --shadow-card: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-float: 0 8px 24px rgba(0, 0, 0, 0.12);
  
  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* 字体 */
  --font-sans: 'Inter', 'PingFang SC', 'Noto Sans SC', sans-serif;
}
```

### 6.2 Tailwind 配置扩展

```javascript
// tailwind.config.js
{
  theme: {
    extend: {
      colors: {
        primary: '#58CC71',
        secondary: '#FF9600',
        background: '#FFF7E8',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
      }
    }
  }
}
```

---

## 7. 数据结构

### 7.1 句型数据结构

```typescript
// types/index.ts

interface Example {
  id: string;
  en: string;      // 英文例句
  zh: string;      // 中文翻译
}

interface Pattern {
  id: string;
  emoji: string;   // 图标 emoji
  title: string;   // 句型标题（如 "I'm a ___"）
  translation: string;  // 中文说明
  examples: Example[];  // 例句数组
}
```

### 7.2 数据内容

MVP 包含 2 个句型，共 10 条例句：

1. **I'm a ___** - 我是一名...
   - I'm a basketball player. / 我是一名篮球运动员
   - I'm a teacher. / 我是一名老师
   - I'm an athlete. / 我是一名运动员
   - I'm a doctor. / 我是一名医生
   - I'm a chef. / 我是一名厨师

2. **I'm good at ___** - 我擅长...
   - I'm good at cooking. / 我擅长烹饪
   - I'm good at playing basketball. / 我擅长打篮球
   - I'm good at swimming. / 我擅长游泳
   - I'm good at teaching. / 我擅长教学
   - I'm good at running. / 我擅长跑步

---

## 8. 动画设计

### 8.1 动画配置

```typescript
// styles/animations.ts

export const transitions = {
  // Tab 切换
  tabSwitch: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  
  // 卡片出现
  cardAppear: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { type: 'spring', stiffness: 400, damping: 25 }
  },
  
  // 复制成功反馈
  copySuccess: {
    scale: [1, 1.05, 1],
    transition: { duration: 0.3 }
  },
  
  // Toast 显示/隐藏
  toast: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  }
};
```

### 8.2 交互动效清单

| 交互 | 动效 | 实现方式 |
|------|------|----------|
| Tab 切换 | 页面滑动 + 淡入 | Framer Motion AnimatePresence |
| 卡片出现 | 从下方弹入 | Framer Motion initial/animate |
| 点击例句 | 短暂变绿 + 缩放 | CSS transition + scale |
| Toast 提示 | 从底部滑入 | Framer Motion |
| 搜索结果 | 淡入动画 | Framer Motion stagger |
| 无结果 | 插画轻微晃动 | CSS keyframes |

---

## 9. 功能模块设计

### 9.1 复制功能

```typescript
// hooks/useCopy.ts

function useCopy() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const incrementCopyCount = useStatsStore(s => s.incrementCopyCount);
  const showToast = useAppStore(s => s.showToast);
  
  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    incrementCopyCount();
    showToast('已复制 ✨');
    setTimeout(() => setCopiedId(null), 1000);
  };
  
  return { copy, copiedId };
}
```

### 9.2 搜索功能

```typescript
// hooks/useSearch.ts

function useSearch(patterns: Pattern[]) {
  const [query, setQuery] = useState('');
  
  const results = useMemo(() => {
    if (!query.trim()) return [];
    
    return patterns.filter(pattern => {
      // 搜索句型标题
      if (pattern.title.toLowerCase().includes(query.toLowerCase())) return true;
      if (pattern.translation.includes(query)) return true;
      
      // 搜索例句
      return pattern.examples.some(ex => 
        ex.en.toLowerCase().includes(query.toLowerCase()) ||
        ex.zh.includes(query)
      );
    });
  }, [query, patterns]);
  
  return { query, setQuery, results };
}
```

---

## 10. 页面结构详情

### 10.1 学习页 (LearnPage)

```
┌─────────────────────────────────────────┐
│  [Logo] 句型英语              🔥 3天    │  ← Header
├─────────────────────────────────────────┤
│                                         │
│  Hi, 学习者 👋                          │  ← 问候语
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 👤 I'm a ___                    │   │
│  │    我是一名...                   │   │  ← PatternCard
│  │  ─────────────────────────────  │   │
│  │  • I'm a basketball player.     │   │
│  │    我是一名篮球运动员            │   │  ← ExampleItem
│  │  • I'm a teacher.               │   │
│  │    我是一名老师                  │   │
│  │  ...                            │   │
│  │  [📋 复制本句型]                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ⚡ I'm good at ___              │   │
│  │    我擅长...                     │   │  ← PatternCard
│  │  ...                            │   │
│  └─────────────────────────────────┘   │
│                                         │
│           🦉 每天进步一点点              │  ← 底部插画
│                                         │
└─────────────────────────────────────────┘
```

### 10.2 发现页 (DiscoverPage)

```
┌─────────────────────────────────────────┐
│  发现                                   │  ← 标题
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔍  搜索英文或中文...            │   │  ← SearchBox
│  └─────────────────────────────────┘   │
│                                         │
│  [cooking] [soccer] [teacher]           │  ← HotTags
│                                         │
│  搜索结果：                              │
│  ┌─────────────────────────────────┐   │
│  │ ⚡ I'm good at ___              │   │
│  │  • I'm good at <mark>cooking</mark> │   │  ← SearchResult
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### 10.3 我的页 (ProfilePage)

```
┌─────────────────────────────────────────┐
│  我的                                   │  ← 标题
├─────────────────────────────────────────┤
│                                         │
│     ┌─────────┐                         │
│     │   2/2   │  学过的句型              │  ← ProgressRing
│     │  句型   │                         │
│     └─────────┘                         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 📋 复制全部例句                  │   │  ← 功能按钮
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ 🔔 每日提醒                      │   │  ← 占位功能
│  └─────────────────────────────────┘   │
│                                         │
│           🦉 你今天也很棒！              │  ← 底部彩蛋
│                                         │
└─────────────────────────────────────────┘
```

---

## 11. 性能优化策略

| 策略 | 实现方式 |
|------|----------|
| 组件懒加载 | React.lazy + Suspense |
| 动画性能 | 使用 transform/opacity，避免 layout thrashing |
| 搜索防抖 | useDebounce hook，300ms 延迟 |
| 状态持久化 | localStorage 异步写入 |
| 图片优化 | 使用 SVG 或 emoji 替代图片资源 |

---

## 12. 开发顺序建议

```
Phase 1: 基础搭建
  ├── 1.1 初始化 Vite + React + TS 项目
  ├── 1.2 配置 Tailwind CSS
  ├── 1.3 设置 CSS Variables (Design Tokens)
  └── 1.4 安装依赖 (router, zustand, framer-motion, lucide)

Phase 2: 核心组件
  ├── 2.1 基础 UI 组件 (Button, Card, TabBar)
  ├── 2.2 数据层 (patterns.ts)
  ├── 2.3 业务组件 (PatternCard, ExampleItem)
  └── 2.4 Toast 组件

Phase 3: 页面实现
  ├── 3.1 学习页 (LearnPage)
  ├── 3.2 发现页 (DiscoverPage)
  └── 3.3 我的页 (ProfilePage)

Phase 4: 功能完善
  ├── 4.1 复制功能
  ├── 4.2 搜索功能
  ├── 4.3 统计功能 (localStorage)
  └── 4.4 动画效果

Phase 5: 优化交付
  ├── 5.1 响应式适配
  ├── 5.2 性能优化
  └── 5.3 构建部署
```

---

## 13. 技术约束

- **浏览器支持**: 现代浏览器 (Chrome 90+, Safari 14+, Firefox 88+)
- **设备适配**: 移动端优先 (375px - 428px 宽度)
- **无外部依赖**: 不使用 CDN 资源，所有资源打包
- **纯前端**: 无后端 API，数据静态，状态 localStorage

---

## 14. 扩展预留

| 扩展点 | 预留设计 |
|--------|----------|
| 更多句型 | patterns.ts 模块化，支持动态导入 |
| 用户系统 | statsStore 预留 userId 字段 |
| 后端 API | hooks 层抽象，便于替换数据源 |
| PWA | vite-plugin-pwa 配置预留 |
| 暗黑模式 | CSS Variables 支持主题切换 |
