import { useRouter } from 'next/navigation';
import { motion, type Variants } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  MessageCircle,
  FileText,
  Moon,
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Lightbulb,
} from 'lucide-react';

interface ModuleItem {
  route?: string;
  title: string;
  description: string;
  icon: typeof BookOpen;
  iconBg: string;
  iconColor: string;
}

const modules: ModuleItem[] = [
  {
    route: '/pattern-learn',
    title: '句型学习',
    description: '50 个核心句型',
    icon: BookOpen,
    iconBg: '#E8F0FE',
    iconColor: '#1A73E8',
  },
  {
    route: '/posts',
    title: '学习交流',
    description: '讨论与互动',
    icon: MessageCircle,
    iconBg: '#F3E8FF',
    iconColor: '#7C3AED',
  },
  {
    route: '/articles',
    title: '文章分享',
    description: '心得与资源',
    icon: FileText,
    iconBg: '#E6F9F0',
    iconColor: '#059669',
  },
];

const dailyTips = [
  {
    en: 'The only way to do great work is to love what you do.',
    zh: '做出伟大工作的唯一方法就是热爱你所做的事。',
    author: 'Steve Jobs',
  },
  {
    en: 'It does not matter how slowly you go as long as you do not stop.',
    zh: '不怕慢，就怕站。',
    author: 'Confucius',
  },
  {
    en: 'Learning is a treasure that will follow its owner everywhere.',
    zh: '学习是随身携带的宝藏。',
    author: 'Chinese Proverb',
  },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return { icon: Moon, label: '深夜' };
  if (hour < 9) return { icon: Sunrise, label: '早安' };
  if (hour < 12) return { icon: Sun, label: '上午好' };
  if (hour < 14) return { icon: Sun, label: '午后好' };
  if (hour < 18) return { icon: CloudSun, label: '下午好' };
  if (hour < 22) return { icon: Sunset, label: '晚上好' };
  return { icon: Moon, label: '深夜' };
}

function getDailyTip() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dailyTips[dayOfYear % dailyTips.length];
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

export function SquarePage() {
  const router = useRouter();

  const handleNavigate = (route?: string) => {
    if (route) router.push(route);
  };

  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;
  const tip = getDailyTip();

  return (
    <motion.div
      className="min-h-full bg-[#FAFAFA]"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ===== Header ===== */}
      <div className="px-5 pt-12 pb-4">
        <motion.div
          className="flex items-center gap-2 text-[#8E8E93] text-xs font-medium mb-5"
          variants={itemVariants}
        >
          <GreetingIcon size={14} />
          <span>{greeting.label}</span>
        </motion.div>

        <motion.h1
          className="text-[30px] font-bold tracking-tight text-[#1D1D1F] leading-[1.1] mb-1"
          variants={itemVariants}
        >
          句型英语
        </motion.h1>
        <motion.p
          className="text-[15px] text-[#6E6E73]"
          variants={itemVariants}
        >
          你的每日英语角
        </motion.p>
      </div>

      {/* ===== Modules ===== */}
      <div className="px-5 pb-24">
        {modules.map((mod, index) => {
          const ModIcon = mod.icon;
          const isLast = index === modules.length - 1;
          return (
            <motion.div
              key={mod.title}
              variants={itemVariants}
            >
              <button
                onClick={() => handleNavigate(mod.route)}
                className="w-full flex items-center gap-4 py-4 active:opacity-60 transition-opacity text-left"
              >
                <div
                  className="w-[44px] h-[44px] rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: mod.iconBg }}
                >
                  <ModIcon size={20} style={{ color: mod.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[16px] font-semibold text-[#1D1D1F] tracking-tight">
                    {mod.title}
                  </h3>
                  <p className="text-[13px] text-[#6E6E73] mt-0.5">
                    {mod.description}
                  </p>
                </div>
                <ArrowRight size={16} className="text-[#C7C7CC] flex-shrink-0" />
              </button>
              {!isLast && (
                <div className="h-px bg-[#F0F0F0] ml-[60px]" />
              )}
            </motion.div>
          );
        })}

        {/* ===== Daily Tip ===== */}
        <div className="mt-6 pt-5 border-t border-[#E5E5EA]">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Lightbulb size={12} className="text-[#FF9F0A]" />
              <span className="text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                Daily
              </span>
            </div>
            <p className="text-[15px] text-[#1D1D1F] leading-relaxed mb-1.5 font-medium">
              "{tip.en}"
            </p>
            <p className="text-[13px] text-[#6E6E73] leading-relaxed">
              {tip.zh}
            </p>
            <p className="text-[11px] text-[#8E8E93] mt-2.5">
              — {tip.author}
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
