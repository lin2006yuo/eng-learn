# 编码规范

## 1. 原子化原则

每个文件职责单一，禁止堆砌。

| 规则 | 说明 |
|------|------|
| 一个文件 = 一个导出主实体 | 一个文件只 export 一个组件/hook/函数 (barrel file index.ts 除外) |
| 文件行数上限 | 单文件不超过 150 行，超过必须拆分 |
| 函数行数上限 | 单函数不超过 40 行，超过必须拆分子函数 |
| 禁止上帝文件 | 不存在一个文件包含组件、类型、工具函数、样式等混合内容 |

**违反示例**:
```tsx
// ❌ 一个文件里写了组件+类型+工具函数+多个子组件
interface Data { ... }
function formatData() { ... }
function Item() { ... }
function List() { ... }
export default function Page() { ... }
```

**正确做法**:
```
data.ts          ← 类型定义
format.ts        ← 工具函数
Item.tsx         ← 子组件
List.tsx         ← 子组件
Page.tsx         ← 页面组件 (只负责组合)
```

## 2. 多分支逻辑 → 设计模式

禁止写超过 3 个分支的 `if-else` 或 `switch`。必须使用设计模式重构。

| 场景 | 模式 | 示例 |
|------|------|------|
| 根据类型执行不同行为 | **策略模式** (Strategy) | 用 Map 映射类型→处理函数 |
| 根据类型创建不同对象 | **工厂模式** (Factory) | 用 Map 映射类型→构造函数 |
| 状态机式多状态行为 | **状态模式** (State) | 每个状态是一个对象，挂载相同接口方法 |
| 事件触发多监听器 | **观察者模式** (Observer) | 事件总线 |
| 逐步构建复杂对象 | **建造者模式** (Builder) | Builder 类链式调用 |
| 不同适配器切换 | **适配器模式** (Adapter) | 统一接口 + 多实现 |

### 策略模式 (最常用)

```typescript
// ❌ 多分支 switch
function handleAction(type: string, data: any) {
  switch (type) {
    case 'save': return saveData(data);
    case 'delete': return deleteData(data);
    case 'update': return updateData(data);
    case 'export': return exportData(data);
    default: throw new Error('unknown');
  }
}

// ✅ 策略模式: 用 Map 注册表
type ActionHandler = (data: any) => void;

const handlers: Record<string, ActionHandler> = {
  save: saveData,
  delete: deleteData,
  update: updateData,
  export: exportData,
};

function handleAction(type: string, data: any) {
  const handler = handlers[type];
  if (!handler) throw new Error(`unknown action: ${type}`);
  return handler(data);
}
```

### 工厂模式

```typescript
// ❌ 多分支创建
function createWidget(type: string) {
  if (type === 'text') return new TextWidget();
  if (type === 'image') return new ImageWidget();
  if (type === 'video') return new VideoWidget();
  throw new Error('unknown');
}

// ✅ 工厂注册表
const widgetRegistry = new Map<string, new () => Widget>([
  ['text', TextWidget],
  ['image', ImageWidget],
  ['video', VideoWidget],
]);

function createWidget(type: string): Widget {
  const Ctor = widgetRegistry.get(type);
  if (!Ctor) throw new Error(`unknown widget: ${type}`);
  return new Ctor();
}
```

### 状态模式

```typescript
// ❌ 状态用 switch 判断
class Player {
  setState(state: string) {
    switch (state) {
      case 'playing': /* 播放逻辑 */ break;
      case 'paused': /* 暂停逻辑 */ break;
      case 'stopped': /* 停止逻辑 */ break;
    }
  }
}

// ✅ 状态模式: 每个状态独立对象
interface PlayerState {
  play(): void;
  pause(): void;
  stop(): void;
}

const playingState: PlayerState = {
  play: () => {},
  pause: () => { /* 切换UI */ },
  stop: () => { /* 重置 */ },
};

const pausedState: PlayerState = {
  play: () => { /* 恢复 */ },
  pause: () => {},
  stop: () => { /* 重置 */ },
};

class Player {
  private state: PlayerState = stoppedState;
  setState(next: PlayerState) { this.state = next; }
  play() { this.state.play(); }
  pause() { this.state.pause(); }
  stop() { this.state.stop(); }
}
```

## 3. 组件拆分规则

```
一个大组件 = 小组件组合
❌ PatternCard 内部直接写几十个行的 UI 树
✅ PatternCard 拆分为:
     PatternHeader.tsx   ← 标题区
     PatternBody.tsx     ← 内容区
     PatternFooter.tsx   ← 操作按钮区
     PatternCard.tsx     ← 只负责组合以上三个
```

## 4. 命名规则

| 实体 | 规则 | 示例 |
|------|------|------|
| 组件 | PascalCase | `PatternCard.tsx` |
| Hook | camelCase, use 前缀 | `useAuth.ts` |
| 工具函数 | camelCase | `copyToClipboard` |
| 类型/接口 | PascalCase | `CommentProps` |
| Store 文件 | camelCase + Store 后缀 | `appStore.ts` |
| 常量文件 | camelCase | `tabs.ts` |

## 5. 文件结构模板

```
feature/xxx/
├── components/
│   ├── XxxCard.tsx          ← 单一组件，只做展示
│   └── XxxModal.tsx
├── hooks/
│   └── useXxx.ts            ← 单一 hook
├── store/
│   └── xxxStore.ts          ← 单一 store
├── strategies/              ← 策略/工厂注册表 (如有多分支)
│   └── xxxStrategies.ts
├── types.ts                 ← 该 feature 专属类型
└── index.ts                 ← barrel file (只导出，不写逻辑)
```

## 7. className 命名规范

虽然使用 Tailwind CSS，但为了方便定位 DOM、调试和编写测试，对于容器或必要的元素必须赋予有意义的 className。

**定义**: className 是附加在 DOM 元素上的字符串标识符，用于在浏览器开发者工具、自动化测试、样式覆盖等场景中快速定位元素。

**规则**:
- 容器元素必须有 className
- 需要被测试选择的元素必须有 className
- 需要动态操作（如滚动定位、动画触发）的元素必须有 className
- 纯展示性内联元素（如 `<span>` 包裹的单个文字）可不加

**命名格式**: `${feature}-${component}-${role}`，使用 kebab-case

| 角色后缀 | 说明 | 示例 |
|----------|------|------|
| `-container` | 容器 | `pattern-card-container` |
| `-list` | 列表 | `comment-list` |
| `-item` | 列表项 | `example-item` |
| `-header` | 头部区域 | `pattern-header` |
| `-body` | 内容区域 | `pattern-body` |
| `-footer` | 底部区域 | `pattern-footer` |
| `-btn` | 按钮 | `favorite-btn` |
| `-input` | 输入框 | `search-input` |
| `-modal` | 弹窗 | `comment-modal` |
| `-overlay` | 遮罩层 | `modal-overlay` |

**违反示例**:
```tsx
// ❌ 容器没有 className，无法在开发者工具中快速定位
<div className="flex flex-col gap-4 p-4">
  <div className="flex items-center justify-between">
    <h3>标题</h3>
  </div>
</div>

// ❌ className 语义不清
<div className="pattern-card-wrapper">
  <div className="inner-box">
```

**正确示例**:
```tsx
// ✅ 容器和关键元素都有语义化 className
<div className="pattern-card-container flex flex-col gap-4 p-4" data-testid="pattern-card">
  <div className="pattern-header flex items-center justify-between">
    <h3 className="pattern-title">标题</h3>
    <button className="favorite-btn" data-testid="favorite-btn">收藏</button>
  </div>
  <div className="pattern-body">内容</div>
  <div className="pattern-footer flex gap-2">
    <button className="copy-btn">复制</button>
  </div>
</div>
```

## 8. API 请求规范

**定义**: 所有 HTTP 请求必须通过 `@/shared/utils/api.ts` 中导出的封装函数发起，禁止在业务代码中直接调用原生 `fetch`。

**规则**:
- 禁止在组件、hooks、store 中裸用 `fetch`
- 必须使用 `apiGet`、`apiPost`、`apiPut`、`apiDelete` 四个封装函数
- 封装函数已内置：JSON 序列化、错误 toast 提示、统一响应处理

**违反示例**:
```typescript
// ❌ 裸用 fetch
async function getPatterns() {
  const res = await fetch('/api/patterns');
  return res.json();
}

// ❌ 自己拼接 headers 和 body
async function createComment(text: string) {
  const res = await fetch('/api/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return res.json();
}
```

**正确示例**:
```typescript
// ✅ 使用封装函数
import { apiGet, apiPost } from '@/shared/utils/api';

async function getPatterns() {
  const { data } = await apiGet<Pattern[]>('/api/patterns');
  return data;
}

async function createComment(text: string) {
  const { data } = await apiPost<Comment>('/api/comments', { text });
  return data;
}

// ✅ 需要自定义错误处理时传参
async function getPatternsSilent() {
  const { data } = await apiGet<Pattern[]>('/api/patterns', undefined, {
    showErrorToast: 'none',
  });
  return data;
}
```

## 9. 其他规则

- 禁止 `console.log` 出现在生产代码中 (用结构化日志或移除)
- 禁止在组件中直接写业务逻辑，必须抽到 hooks 或 utils
- 禁止 barrel file (index.ts) 中包含任何逻辑，它只做 re-export
- 新增功能先找是否已有对应 feature 目录，没有才新建
