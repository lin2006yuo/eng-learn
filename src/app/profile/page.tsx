'use client';

import { motion, type Transition, type Variants } from 'framer-motion';
import { TabBar, Toast } from '@/shared/components';
import { ProfilePage } from '@/views';

const pageVariants: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export default function ProfileRoute() {
  return (
    <div className="min-h-screen bg-background">
      <motion.main
        className="relative"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={pageTransition}
      >
        <ProfilePage />
      </motion.main>
      <TabBar />
      <Toast />
    </div>
  );
}
