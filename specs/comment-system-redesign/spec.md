# 评论系统重构方案

## 1. 需求定义

### 1.1 核心需求

- 评论必须依附于一个 target (句型/文章/帖子/笔记)
- 支持多级回复 (回复别人的评论)
- 用户能看到"最新回复" (别人回复我发布的评论)
- 已读/未读状态标记
- 评论数量统计准确

### 1.2 未来扩展

- targetType 可扩展: pattern / article / post / note
- 通知类型可扩展: comment_reply / like / follow

## 2. 数据模型

### 2.1 comments 表 (重构)

```sql
comments:
├── id              -- 评论唯一标识 (text, PK)
├── userId          -- 谁发的 (text, FK → users.id)
├── targetType      -- pattern | comment (text)
├── targetId        -- 直接评论对象的ID (text)
├── rootType        -- pattern | article | post | note (text)
├── rootId          -- 根目标ID (text)
├── content         -- 评论内容 (text)
├── createdAt       -- 创建时间 (timestamp)
└── updatedAt       -- 更新时间 (timestamp)
```

**字段说明**:
- `targetType` + `targetId`: 直接评论的对象。根评论指向句型，回复评论指向被回复的评论
- `rootType` + `rootId`: 评论所属的根目标，用于查询某句型/文章下的所有评论

### 2.2 三种场景数据示例

```
场景1: 直接评论句型
{
  targetType: "pattern",
  targetId: "pattern-123",
  rootType: "pattern",
  rootId: "pattern-123"
}

场景2: 回复句型下的评论A
{
  targetType: "comment",
  targetId: "comment-A-id",
  rootType: "pattern",
  rootId: "pattern-123"
}

场景3: 回复评论A的子评论B
{
  targetType: "comment",
  targetId: "comment-B-id",
  rootType: "pattern",
  rootId: "pattern-123"
}
```

### 2.3 notifications 表 (新增)

```sql
notifications:
├── id              -- 通知唯一标识 (text, PK)
├── userId          -- 接收通知的人 (text, FK → users.id)
├── actorId         -- 触发通知的人 (text, FK → users.id)
├── type            -- comment_reply | like | follow (text)
├── commentId       -- 关联评论ID (text, FK → comments.id, nullable)
├── isRead          -- 已读状态 (boolean, default false)
├── readAt          -- 已读时间 (timestamp, nullable)
└── createdAt       -- 通知生成时间 (timestamp)
```

### 2.4 comment_likes 表 (保持不变)

```sql
comment_likes:
├── id              -- PK
├── userId          -- FK → users.id
├── commentId       -- FK → comments.id
└── createdAt
```

## 3. 通知创建逻辑

### 3.1 创建评论时

```
POST /api/comments 成功后:

1. 如果 targetType = "comment" (回复别人的评论):
   - 查询被回复评论的 userId
   - 如果被回复者 ≠ 当前用户 → 创建通知:
     {
       userId: 被回复评论的作者,
       actorId: 当前用户,
       type: "comment_reply",
       commentId: 新评论ID
     }

2. 如果 targetType = "pattern" (直接评论句型):
   - 句型没有作者，不创建通知
```

### 3.2 自己回复自己不通知

## 4. API 设计

### 4.1 评论接口

```
GET    /api/comments?rootType=pattern&rootId=xxx&cursor=xxx&limit=20
       获取某目标下的所有评论 (含子评论)
       返回: { data: [...], totalCount, hasMore, nextCursor }

POST   /api/comments
       创建评论
       入参: { targetType, targetId, rootType, rootId, content }
       返回: { data: { comment, notification } }

DELETE /api/comments/:id
       删除评论
       副作用: 删除关联的通知
```

### 4.2 通知接口

```
GET    /api/notifications?cursor=xxx&limit=20
       获取当前用户的通知列表
       返回: { data: [...], totalCount, hasMore, nextCursor }

POST   /api/notifications/mark-read
       标记通知已读
       入参: { commentId: "xxx" } 或 { commentIds: ["xxx", "yyy"] }

GET    /api/notifications/unread-count
       获取当前用户未读通知数量
       返回: { count: 3 }
```

### 4.3 统计接口

```
GET    /api/comments/count?userId=xxx
       获取用户发布的评论总数
       返回: { count: 15 }

GET    /api/comments/count-by-target?userId=xxx
       获取用户在不同目标下的评论数量
       返回: [
         { targetType: "pattern", count: 10 },
         { targetType: "comment", count: 5 }
       ]
```

## 5. 查询场景

### 5.1 句型详情页

```sql
-- 获取 pattern-123 下所有评论
SELECT * FROM comments 
WHERE rootType = 'pattern' AND rootId = 'pattern-123'
ORDER BY createdAt DESC;

-- 获取评论A的直接回复
SELECT * FROM comments 
WHERE targetType = 'comment' AND targetId = 'comment-A-id';
```

### 5.2 最新回复 (通知列表)

```sql
-- 获取用户的最新回复通知
SELECT n.*, c.content, c.authorId as actorId
FROM notifications n
JOIN comments c ON n.commentId = c.id
WHERE n.userId = :userId AND n.type = 'comment_reply'
ORDER BY n.createdAt DESC;
```

### 5.3 我的评论数量

```sql
-- 用户发布的评论总数
SELECT COUNT(*) FROM comments WHERE userId = :userId;
```

### 5.4 未读通知数量

```sql
SELECT COUNT(*) FROM notifications 
WHERE userId = :userId AND isRead = false;
```

## 6. 前端架构

### 6.1 目录结构

```
src/features/
├── comment/
│   ├── components/
│   │   ├── CommentInput.tsx
│   │   ├── CommentItem.tsx
│   │   ├── CommentList.tsx
│   │   └── CommentThread.tsx
│   ├── hooks/
│   │   ├── useComments.ts
│   │   ├── usePostComment.ts
│   │   └── useCommentCount.ts
│   ├── queries.ts
│   ├── transformers.ts
│   ├── types.ts
│   └── index.ts
│
└── notification/
    ├── components/
    │   ├── NotificationItem.tsx
    │   ├── NotificationList.tsx
    │   └── NotificationBadge.tsx
    ├── hooks/
    │   ├── useNotifications.ts
    │   ├── useMarkRead.ts
    │   └── useUnreadCount.ts
    ├── queries.ts
    ├── types.ts
    └── index.ts
```

### 6.2 数据流

```
用户评论句型:
  → POST /api/comments
  → 不创建通知
  → invalidate useCommentCount

用户回复别人的评论:
  → POST /api/comments
  → 创建通知给被回复者
  → invalidate useCommentCount (评论者)
  → invalidate useNotifications (被回复者)
  → invalidate useUnreadCount (被回复者)

用户打开通知列表:
  → GET /api/notifications
  → 标记所有为已读: POST /api/notifications/mark-read
  → invalidate useUnreadCount
```

## 7. 删除策略

```
删除评论时:
1. 评论本身删除 (CASCADE)
2. 关联的点赞记录删除 (CASCADE)
3. 关联的通知删除 (手动处理)
4. 通知已读状态不保留
```

## 8. 废弃字段

```
comments.replyToUserId: 废弃，通过 targetType=targetId=comment 可查到被回复评论的 userId
comments.parentId: 废弃，targetId 已表达相同语义
```
