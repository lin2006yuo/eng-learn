'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArticleCard } from './ArticleCard';
import type { ArticleListItem } from '../types';

interface ArticleListProps {
  articles: ArticleListItem[];
}

export function ArticleList({ articles }: ArticleListProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="article-list space-y-4"
    >
      {articles.map((article, index) => (
        <ArticleCard key={article.id} article={article} index={index} />
      ))}
    </motion.div>
  );
}
