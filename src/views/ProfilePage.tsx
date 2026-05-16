import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUnreadCount } from '@/features/notification';
import LogoutButton from '@/features/auth/components/LogoutButton';
import { EditNicknameModal } from '@/features/profile/components/EditNicknameModal';
import { AvatarEditorModal } from '@/features/profile/components/AvatarEditorModal';
import { motion, type Variants } from 'framer-motion';
import {
  Star,
  FileText,
  MessageSquare,
  Bell,
  LayoutDashboard,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';

interface MenuItem {
  title: string;
  icon: typeof Star;
  iconBg: string;
  iconColor: string;
  href: string;
  badgeCount?: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return '深夜';
  if (hour < 9) return '早安';
  if (hour < 12) return '上午好';
  if (hour < 14) return '午后好';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '深夜';
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 32 },
  },
};

export function ProfilePage() {
  const { user, loading: authLoading, refetch: refetchAuth } = useAuth();
  const [showEditNickname, setShowEditNickname] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const { total: unreadCount } = useUnreadCount();

  const handleProfileUpdated = () => {
    void refetchAuth?.();
  };

  return (
    <motion.div
      className="min-h-full bg-[#FAFAFA]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="pb-24">
        {authLoading ? (
          <LoadingSkeleton />
        ) : user ? (
          <LoggedInView
            user={user}
            onEditAvatar={() => setShowAvatarEditor(true)}
            onEditNickname={() => setShowEditNickname(true)}
            unreadCount={unreadCount}
          />
        ) : (
          <LoggedOutView />
        )}
      </div>

      <EditNicknameModal
        open={showEditNickname}
        onClose={() => setShowEditNickname(false)}
        initialNickname={user?.nickname || ''}
        onSuccess={handleProfileUpdated}
      />

      <AvatarEditorModal
        open={showAvatarEditor}
        onClose={() => setShowAvatarEditor(false)}
        currentImage={user?.image ?? null}
        username={user?.username || ''}
        onSuccess={handleProfileUpdated}
      />
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="px-5 pt-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="space-y-2">
          <div className="w-24 h-5 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-xl bg-gray-200 animate-pulse" />
          <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function LoggedInView({
  user,
  onEditAvatar,
  onEditNickname,
  unreadCount,
}: {
  user: { nickname?: string; username: string; image?: string | null; role?: string };
  onEditAvatar: () => void;
  onEditNickname: () => void;
  unreadCount: number;
}) {
  const menuItems: MenuItem[] = [
    {
      title: '我的收藏',
      icon: Star,
      iconBg: '#E8F0FE',
      iconColor: '#1A73E8',
      href: '/favorites',
    },
    {
      title: '我的笔记',
      icon: FileText,
      iconBg: '#E6F9F0',
      iconColor: '#059669',
      href: '/my-notes',
    },
    {
      title: '我的评论',
      icon: MessageSquare,
      iconBg: '#F3E8FF',
      iconColor: '#7C3AED',
      href: '/my-comments',
    },
    {
      title: '我的消息',
      icon: Bell,
      iconBg: '#FFF4E5',
      iconColor: '#F59E0B',
      href: '/my-notifications',
      badgeCount: unreadCount,
    },
    {
      title: '我的文章',
      icon: LayoutDashboard,
      iconBg: '#E8F0FE',
      iconColor: '#1A73E8',
      href: '/articles/manage',
    },
    {
      title: '我的帖子',
      icon: MessageCircle,
      iconBg: '#F3E8FF',
      iconColor: '#7C3AED',
      href: '/posts/manage',
    },
  ];

  const initial = (user.nickname || user.username).charAt(0).toUpperCase();

  return (
    <>
      {/* ===== Header ===== */}
      <div className="px-5 pt-12 pb-6">
        <motion.p
          className="text-xs font-medium text-[#8E8E93] mb-5"
          variants={itemVariants}
        >
          {getGreeting()}
        </motion.p>

        <motion.div
          className="flex items-center justify-between"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={onEditAvatar}
              className="profile-page-avatar w-12 h-12 rounded-full overflow-hidden flex items-center justify-center active:opacity-70 transition-opacity"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.nickname || user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#1D1D1F] flex items-center justify-center">
                  <span className="text-[15px] font-semibold text-white">
                    {initial}
                  </span>
                </div>
              )}
            </button>
            <div>
              <h1
                onClick={onEditNickname}
                className="text-[22px] font-bold text-[#1D1D1F] tracking-tight cursor-pointer active:opacity-60 transition-opacity"
              >
                {user.nickname || user.username}
              </h1>
              <p className="text-[13px] text-[#6E6E73] mt-0.5">
                @{user.username}
              </p>
            </div>
          </div>

          <LogoutButton />
        </motion.div>
      </div>

      {/* ===== Menu List ===== */}
      <div className="px-5">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === menuItems.length - 1;
          return (
            <motion.div key={item.title} variants={itemVariants}>
              <Link
                href={item.href}
                className="w-full flex items-center gap-4 py-4 active:opacity-60 transition-opacity text-left relative"
              >
                <div
                  className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: item.iconBg }}
                >
                  <Icon size={20} style={{ color: item.iconColor }} />
                </div>
                <span className="flex-1 text-[16px] font-semibold text-[#1D1D1F] tracking-tight">
                  {item.title}
                </span>
                {item.badgeCount ? (
                  <span className="text-[12px] font-semibold text-white bg-[#FF3B30] px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {item.badgeCount > 99 ? '99+' : item.badgeCount}
                  </span>
                ) : null}
                <ArrowRight size={16} className="text-[#C7C7CC] flex-shrink-0" />
              </Link>
              {!isLast && (
                <div className="h-px bg-[#F0F0F0] ml-[60px]" />
              )}
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

function LoggedOutView() {
  return (
    <div className="px-5 pt-12">
      <motion.p
        className="text-xs font-medium text-[#8E8E93] mb-5"
        variants={itemVariants}
      >
        {getGreeting()}
      </motion.p>

      <motion.div variants={itemVariants} className="mb-10">
        <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight leading-[1.15] mb-2">
          登录
        </h1>
        <p className="text-[15px] text-[#6E6E73]">
          登录后解锁完整学习体验
        </p>
      </motion.div>

      <motion.div
        variants={itemVariants}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          href="/login"
          className="block w-full py-3.5 text-[17px] font-semibold text-[#007AFF] bg-[#007AFF]/10 rounded-[12px] active:bg-[#007AFF]/15 transition-colors text-center"
        >
          登录
        </Link>
      </motion.div>
    </div>
  );
}
