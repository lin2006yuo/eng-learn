import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCommentStore } from '@/stores/commentStore';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { patterns } from '@/data/patterns';

/**
 * 评论页面（全屏 Modal）
 *
 * 布局结构：
 * - 顶部导航栏（固定）
 * - 句型信息卡片
 * - 评论列表（可滚动）
 * - 空状态提示
 * - 底部输入框（固定）
 */
export function CommentsModal() {
  const navigate = useNavigate();
  const { patternId } = useParams<{ patternId: string }>();
  const { comments, loading, fetchComments } = useCommentStore();

  // 获取当前句型的评论
  const patternComments = patternId ? comments[patternId] || [] : [];

  // 获取当前句型信息
  const pattern = patterns.find((p) => p.id === patternId);

  // 加载评论数据
  useEffect(() => {
    if (patternId) {
      fetchComments(patternId);
    }
  }, [patternId, fetchComments]);

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      {/* 顶部导航栏 */}
      <div className="flex items-center gap-3 px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-gray-100 flex-shrink-0">
        <button
          onClick={handleClose}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={24} className="text-text-primary" />
        </button>
        <h1 className="text-lg font-bold text-text-primary">
          评论 {patternComments.length > 0 && `(${patternComments.length})`}
        </h1>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 pb-24">
          {/* 句型信息卡片 */}
          {pattern && (
            <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{pattern.emoji}</span>
                <span className="text-sm text-text-secondary">当前句型</span>
              </div>
              <h3 className="font-bold text-text-primary mb-1">{pattern.title}</h3>
              <p className="text-sm text-text-secondary">{pattern.translation}</p>
            </div>
          )}

          {/* 加载状态 */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* 评论列表 */}
          {!loading && patternComments.length > 0 && (
            <div className="bg-white rounded-xl px-4 shadow-sm">
              {patternComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  patternId={patternId!}
                />
              ))}
            </div>
          )}

          {/* 空状态 */}
          {!loading && patternComments.length === 0 && (
            <div className="text-center text-text-secondary py-16">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-lg font-medium mb-2">暂无评论</p>
              <p className="text-sm">成为第一个评论的人吧</p>
            </div>
          )}
        </div>
      </div>

      {/* 底部评论输入框 */}
      {patternId && <CommentInput patternId={patternId} />}
    </div>
  );
}
