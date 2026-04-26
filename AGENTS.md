# AGENTS.md - Learn English

## 项目简介

这是一个英语学习分享社区，用户可以在其中分享自己的学习经验、讨论问题、获取资源等。

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

