import { motion } from 'framer-motion';
import { Copy, Bell, ClipboardList } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { ProgressRing, StatCard } from '@/components/stats';
import { useStatsStore } from '@/stores/statsStore';
import { useAppStore } from '@/stores/appStore';
import { patterns, getAllExamples } from '@/data/patterns';
import { copyToClipboard } from '@/utils/copy';

export function ProfilePage() {
  const { copyCount, streakDays } = useStatsStore();
  const showToast = useAppStore((state) => state.showToast);
  
  const totalPatterns = patterns.length;
  const totalExamples = getAllExamples().length;

  const handleCopyAll = async () => {
    let text = '';
    patterns.forEach((pattern, index) => {
      text += `${pattern.title} - ${pattern.translation}\n`;
      pattern.examples.forEach((ex) => {
        text += `${ex.en}\n${ex.zh}\n\n`;
      });
      if (index < patterns.length - 1) {
        text += '---\n\n';
      }
    });
    
    const success = await copyToClipboard(text);
    if (success) {
      showToast('全部例句已复制 📋');
    } else {
      showToast('复制失败，请重试');
    }
  };

  return (
    <div className="min-h-full pb-24 px-5 pt-4">
      {/* 标题 */}
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-bold text-text-primary mb-6"
      >
        我的
      </motion.h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProgressRing
            current={totalPatterns}
            total={totalPatterns}
            label="学过的句型"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col justify-center gap-4"
        >
          <div className="text-center">
            <p className="text-3xl font-bold text-text-primary">{totalExamples}</p>
            <p className="text-sm text-text-secondary">掌握例句</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">{copyCount}</p>
            <p className="text-sm text-text-secondary">累计复制</p>
          </div>
        </motion.div>
      </div>

      {/* 功能入口 */}
      <div className="space-y-3 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleCopyAll}
            variant="ghost"
            className="w-full justify-start bg-white hover:bg-gray-50 rounded-2xl py-4 px-5 shadow-card"
            icon={<ClipboardList size={20} className="text-primary" />}
          >
            <span className="flex-1 text-left">复制全部例句</span>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="ghost"
            className="w-full justify-start bg-white hover:bg-gray-50 rounded-2xl py-4 px-5 shadow-card opacity-60"
            icon={<Bell size={20} className="text-secondary" />}
          >
            <span className="flex-1 text-left">每日提醒</span>
            <span className="text-xs text-text-secondary">即将推出</span>
          </Button>
        </motion.div>
      </div>

      {/* 底部彩蛋 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col items-center py-8"
      >
        <motion.div
          animate={{ 
            y: [0, -5, 0],
            rotate: [0, -5, 5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3
          }}
          className="text-5xl mb-3"
        >
          🦉
        </motion.div>
        <p className="text-text-secondary font-medium">你今天也很棒！</p>
      </motion.div>
    </div>
  );
}
