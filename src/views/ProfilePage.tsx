import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAppStore } from '@/shared/store/appStore';
import { MenuCard } from '@/shared/components/MenuCard';
import { useUnreadCount } from '@/features/notification';
import LogoutButton from '@/features/auth/components/LogoutButton';
import { EditNicknameModal } from '@/features/profile/components/EditNicknameModal';
import { motion } from 'framer-motion';
import {
  Star,
  MessageSquare,
  Bell,
  LogIn,
  Clock,
  Sparkles,
  FileText,
  LayoutDashboard,
  MessageCircle,
} from 'lucide-react';
import { Card } from '@/shared/components/Card';

export function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refetch: refetchAuth } = useAuth();
  const { currentTab } = useAppStore();
  const [showEditNickname, setShowEditNickname] = useState(false);
  const { total: unreadCount } = useUnreadCount();

  if (currentTab !== 'profile') return null;

  const handleGoLogin = () => {
    router.push('/login');
  };

  const handleNicknameUpdated = () => {
    void refetchAuth?.();
  };

  const handleGoComments = () => {
    router.push('/my-comments');
  };

  const handleGoNotifications = () => {
    router.push('/my-notifications');
  };

  const handleGoNotes = () => {
    router.push('/my-notes');
  };

  const handleGoFavorites = () => {
    router.push('/favorites');
  };

  const handleGoManageArticles = () => {
    router.push('/articles/manage');
  };

  const handleGoManagePosts = () => {
    router.push('/posts/manage');
  };

  return (
    <div className="min-h-full bg-background pb-20">
      <div className="max-w-[430px] mx-auto">
        {authLoading ? <LoadingSkeleton /> : user ? <LoggedInView user={user} onEditNickname={() => setShowEditNickname(true)} onGoComments={handleGoComments} onGoFavorites={handleGoFavorites} onGoNotifications={handleGoNotifications} onGoNotes={handleGoNotes} onGoManageArticles={handleGoManageArticles} onGoManagePosts={handleGoManagePosts} unreadCount={unreadCount} /> : <LoggedOutView onLogin={handleGoLogin} />}
      </div>

      <EditNicknameModal
        open={showEditNickname}
        onClose={() => setShowEditNickname(false)}
        initialNickname={user?.nickname || ''}
        onSuccess={handleNicknameUpdated}
      />
    </div>
  );
}

// ===== 加载骨架 =====
function LoadingSkeleton() {
  return (
    <>
      <div className="px-5 pt-8 pb-4">
        <div className="h-40 bg-gray-100 rounded-card animate-pulse" />
      </div>
      <div className="px-5 py-6 space-y-4">
        <div className="h-40 bg-gray-100 rounded-card animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-100 rounded-card animate-pulse" />
          <div className="h-20 bg-gray-100 rounded-card animate-pulse" />
        </div>
      </div>
    </>
  );
}

// ===== 已登录视图 =====
function LoggedInView({ user, onEditNickname, onGoComments, onGoFavorites, onGoNotifications, onGoNotes, onGoManageArticles, onGoManagePosts, unreadCount }: { user: { nickname?: string; username: string; role?: string }; onEditNickname: () => void; onGoComments: () => void; onGoFavorites: () => void; onGoNotifications: () => void; onGoNotes: () => void; onGoManageArticles: () => void; onGoManagePosts: () => void; unreadCount: number }) {
  const isAdmin = user.role === 'admin';

  return (
    <>
      {/* 渐变头部卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="px-5 pt-6 mb-6"
      >
        <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/10 p-6 pb-8">
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-primary/10" />
          <div className="absolute -left-4 -bottom-8 w-20 h-20 rounded-full bg-secondary/10" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center"
              >
                <span className="text-2xl font-bold text-primary">
                  {(user.nickname || user.username).charAt(0).toUpperCase()}
                </span>
              </motion.div>

              <div>
                <motion.h1
                  whileTap={{ scale: 0.97 }}
                  onClick={onEditNickname}
                  className="text-xl font-bold text-text-primary cursor-pointer hover:opacity-70 transition-opacity"
                >
                  {user.nickname || user.username}
                </motion.h1>
                <p className="text-sm text-text-secondary mt-0.5">@{user.username}</p>
              </div>
            </div>

            <LogoutButton />
          </div>
        </div>
      </motion.div>

      {/* 菜单网格 */}
      <div className="px-5 mb-6 space-y-3">
        <MenuCard title="我的收藏" icon={<Star size={20} />} delay={0.1} onClick={onGoFavorites} />
        <MenuCard title="我的笔记" icon={<FileText size={20} />} delay={0.15} onClick={onGoNotes} />
        <MenuCard title="我的评论" icon={<MessageSquare size={20} />} delay={0.2} onClick={onGoComments} />
        <MenuCard title="我的消息" icon={<Bell size={20} />} delay={0.3} badgeCount={unreadCount} onClick={onGoNotifications} />
        <MenuCard title="我的文章" icon={<LayoutDashboard size={20} />} delay={0.35} onClick={onGoManageArticles} />
        <MenuCard title="我的帖子" icon={<MessageCircle size={20} />} delay={0.4} onClick={onGoManagePosts} />
      </div>
    </>
  );
}

// ===== 未登录视图 =====
function LoggedOutView({ onLogin }: { onLogin: () => void }) {
  return (
    <>
      {/* 欢迎区 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="px-5 pt-8 mb-8"
      >
        <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-primary via-primary-dark to-emerald-600 p-8 pb-10 text-center text-white">
          {/* 装饰圆形 */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute -left-6 -bottom-6 w-24 h-24 rounded-full bg-white/10"
          />

          <div className="relative">
            {/* 主图标 */}
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 20 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
            >
              <Sparkles size={36} className="text-white" />
            </motion.div>

            <h1 className="text-2xl font-bold mb-2">欢迎使用</h1>
            <p className="text-white/80 text-sm mb-6">登录后可解锁完整学习体验</p>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onLogin}
              className="w-full bg-white text-primary rounded-badge py-3.5 px-6 font-bold text-base shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              立即登录
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 功能亮点 */}
      <div className="px-5 mb-6">
        <SectionTitle title="登录后你可以" />
        <div className="space-y-3 mt-3">
          <FeatureItem icon={<Star size={18} />} title="我的收藏" desc="收藏喜欢的句型并分类管理" delay={0.2} />
          <FeatureItem icon={<Clock size={18} />} title="学习记录" desc="记录学习心得，随时回顾" delay={0.3} />
        </div>
      </div>
    </>
  );
}

// ===== 分区标题 =====
function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-sm font-semibold text-text-secondary px-1">{title}</h2>;
}

// ===== 功能项 =====
function FeatureItem({ icon, title, desc, delay }: { icon: React.ReactNode; title: string; desc: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card className="flex items-center gap-4 py-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">{icon}</div>
        <div>
          <h3 className="font-semibold text-text-primary text-sm">{title}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
        </div>
      </Card>
    </motion.div>
  );
}
