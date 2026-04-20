import type { Pattern } from '@/shared/types';
import patternsData from './patterns.json';

export const patterns: Pattern[] = patternsData.patterns;

export const hotSearchTags: string[] = patternsData.hotSearchTags;

export const getAllExamples = (): { pattern: Pattern; example: Pattern['examples'][0] }[] => {
  const result: { pattern: Pattern; example: Pattern['examples'][0] }[] = [];
  patterns.forEach((pattern) => {
    pattern.examples.forEach((example) => {
      result.push({ pattern, example });
    });
  });
  return result;
};

export const getPatternById = (id: string): Pattern | undefined => {
  return patterns.find((p) => p.id === id);
};

export const searchPatterns = (query: string): Pattern[] => {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();

  return patterns.filter((pattern) => {
    // 搜索句型标题
    if (pattern.title.toLowerCase().includes(lowerQuery)) return true;
    if (pattern.translation.includes(query)) return true;

    // 搜索例句
    return pattern.examples.some(
      (ex) =>
        ex.en.toLowerCase().includes(lowerQuery) ||
        ex.zh.includes(query)
    );
  });
};
