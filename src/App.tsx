import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/stores/appStore';
import { TabBar, Toast } from '@/components/ui';
import { LearnPage, DiscoverPage, NotesPage, ProfilePage, FavoritesPage } from '@/pages';
import type { TabType } from '@/types';

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

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

const tabOrder: TabType[] = ['learn', 'discover', 'notes', 'profile'];

function App() {
  const { currentTab } = useAppStore();

  // 计算切换方向
  const currentIndex = tabOrder.indexOf(currentTab);
  const direction = 0; // 简化处理，不计算方向

  const renderPage = () => {
    switch (currentTab) {
      case 'learn':
        return <LearnPage />;
      case 'discover':
        return <DiscoverPage />;
      case 'notes':
        return <NotesPage />;
      case 'profile':
        return <ProfilePage />;
      case 'favorites':
        return <FavoritesPage />;
      default:
        return <LearnPage />;
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

export default App;
