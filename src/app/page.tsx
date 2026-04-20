'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/shared/store/appStore';
import { TabBar, Toast } from '@/shared/components';
import { ProfilePage, SquarePage } from '@/views';
import type { TabType } from '@/shared/types';
import type { Transition } from 'framer-motion';

const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
  }),
};

const pageTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

function HomeContent() {
  const { currentTab } = useAppStore();

  const direction = 0;

  const renderPage = () => {
    switch (currentTab) {
      case 'square':
        return <SquarePage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <SquarePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentTab}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
      <TabBar />
      <Toast />
    </div>
  );
}

export default function Home() {
  return <HomeContent />;
}
