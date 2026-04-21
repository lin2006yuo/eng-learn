import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Bell } from 'lucide-react';
import { useAppStore } from '@/shared/store/appStore';

interface SquareFeature {
  route?: string;
  title: string;
  description: string;
  emoji: string;
  comingSoon?: boolean;
}

const mainFeature: SquareFeature = {
  route: '/pattern-learn',
  title: '句型学习',
  description: '掌握核心英语句型',
  emoji: '📚',
};

const secondaryFeatures: SquareFeature[] = [
  {
    title: '学习交流',
    description: '与学友讨论互动',
    emoji: '💬',
    comingSoon: true,
  },
  {
    route: '/articles',
    title: '文章分享',
    description: '分享学习心得与资源',
    emoji: '📝',
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return { emoji: '🌙', text: '夜深了,注意休息' };
  if (hour < 9) return { emoji: '🌅', text: '早上好,开始今天的学习吧' };
  if (hour < 12) return { emoji: '☀️', text: '上午好,继续保持学习' };
  if (hour < 14) return { emoji: '🌞', text: '中午好,学习一会吧' };
  if (hour < 18) return { emoji: '🌤️', text: '下午好,开始今天的学习吧' };
  if (hour < 22) return { emoji: '🌆', text: '晚上好,充实一下自己吧' };
  return { emoji: '🌙', text: '夜深了,注意休息' };
}

export function SquarePage() {
  const router = useRouter();
  const { currentTab } = useAppStore();

  if (currentTab !== 'square') return null;

  const handleFeatureClick = (feature: SquareFeature) => {
    if (feature.route) {
      router.push(feature.route);
    } else if (feature.comingSoon) {
      useAppStore.getState().showToast('即将上线,敬请期待 🎉');
    }
  };

  const greeting = getGreeting();

  return (
    <div className="min-h-full pb-24 px-5 pt-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="mb-6"
      >
        <p className="text-sm text-text-secondary mb-1">
          {greeting.emoji} {greeting.text}
        </p>
        <h1 className="text-3xl font-bold text-text-primary mb-1">
          🎓 学习广场
        </h1>
        <p className="text-sm text-text-secondary">
          探索更多学习可能
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleFeatureClick(mainFeature)}
        className="relative overflow-hidden rounded-card bg-gradient-to-br from-primary to-primary-dark p-6 mb-6 cursor-pointer shadow-card"
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-white/10" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-16 h-16 rounded-subtle-card bg-white/20 flex items-center justify-center">
              <span className="text-4xl">{mainFeature.emoji}</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowRight size={20} className="text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {mainFeature.title}
          </h2>
          <p className="text-sm text-white/80 mb-6">
            {mainFeature.description}
          </p>

          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-badge bg-white text-primary font-semibold shadow-md">
            <span>开始学习</span>
            <ArrowRight size={16} />
          </div>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.2 }}
        className="text-sm font-semibold text-text-secondary mb-3"
      >
        更多功能
      </motion.p>

      <div className="grid grid-cols-2 gap-4">
        {secondaryFeatures.map((feature, index) => {
          const isComingSoon = Boolean(feature.comingSoon);

          return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 25,
              delay: 0.3 + index * 0.1,
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFeatureClick(feature)}
            className="bg-white rounded-subtle-card p-5 shadow-card cursor-pointer relative overflow-hidden"
          >
            {isComingSoon ? (
              <div className="absolute top-2 right-2">
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                  敬请期待
                </span>
              </div>
            ) : null}

            <div className="w-12 h-12 rounded-subtle-card bg-primary/10 flex items-center justify-center mb-3">
              <span className="text-2xl">{feature.emoji}</span>
            </div>

            <h3 className="text-base font-bold text-text-primary mb-1 pr-16">
              {feature.title}
            </h3>
            <p className="text-xs text-text-secondary mb-3">
              {feature.description}
            </p>

            <div className="flex items-center gap-1 text-primary text-xs font-semibold">
              {isComingSoon ? <Bell size={12} /> : <ArrowRight size={12} />}
              <span>{isComingSoon ? '上线提醒' : '立即体验'}</span>
            </div>
          </motion.div>
          );
        })}
      </div>
    </div>
  );
}
