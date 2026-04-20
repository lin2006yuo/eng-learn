'use client';

import { useEffect, useState } from 'react';
import { patterns } from '@/data/patterns';
import { CommentsModal } from '@/features/comment';

export default function CommentsPage({ params }: { params: Promise<{ patternId: string }> }) {
  const [patternId, setPatternId] = useState<string>('');

  useEffect(() => {
    params.then(p => {
      const found = patterns.find(pat => pat.id === p.patternId);
      setPatternId(found?.id || p.patternId);
    });
  }, [params]);

  if (!patternId) return null;

  return <CommentsModal targetId={patternId} />;
}
