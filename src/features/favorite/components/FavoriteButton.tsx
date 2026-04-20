import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useFavoriteStore } from '@/features/favorite/store/favoriteStore';
import { TagSelectModal } from './TagSelectModal';

interface FavoriteButtonProps {
  patternId: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
}

export function FavoriteButton({ patternId }: FavoriteButtonProps) {
  const [showTagModal, setShowTagModal] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const isFavorited = useFavoriteStore((state) => state.isPatternFavorited(patternId));
  const getPatternTagIds = useFavoriteStore((state) => state.getPatternTagIds);

  const handleClick = () => {
    if (isFavorited) {
      setShowTagModal(true);
    } else {
      createParticles();
      setShowTagModal(true);
    }
  };

  const createParticles = () => {
    const newParticles: Particle[] = [];
    const colors = ['#FF4B4B', '#FF6B6B', '#FFD700', '#FF8C00'];
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      newParticles.push({
        id: Date.now() + i,
        x: Math.cos(angle) * 40,
        y: Math.sin(angle) * 40,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 600);
  };

  return (
    <>
      <motion.button
        onClick={handleClick}
        whileTap={{ scale: 0.9 }}
        className={`
          relative flex items-center gap-1.5 px-3 py-2 rounded-xl
          font-medium text-sm transition-all duration-200
          ${isFavorited 
            ? 'bg-red-50 text-red-500' 
            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          }
        `}
      >
        <motion.div
          animate={isFavorited ? {
            scale: [1, 1.2, 1],
          } : {}}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <Heart
            size={18}
            className={isFavorited ? 'fill-current' : ''}
          />
          
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{
                  x: particle.x,
                  y: particle.y,
                  opacity: 0,
                  scale: particle.scale,
                  rotate: particle.rotation,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={{ marginLeft: '-6px', marginTop: '-6px' }}
              >
                <Heart
                  size={12}
                  className="fill-current"
                  style={{ color: particle.color }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        <span>{isFavorited ? '已收藏' : '收藏'}</span>
      </motion.button>

      <TagSelectModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        patternId={patternId}
        initialSelectedTags={getPatternTagIds(patternId)}
      />
    </>
  );
}
