'use client';

import { Suspense } from 'react';
import { PatternLearnPage } from '@/views';

export default function PatternLearn() {
  return (
    <Suspense>
      <PatternLearnPage />
    </Suspense>
  );
}
