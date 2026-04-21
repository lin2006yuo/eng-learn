const WORDS_PER_MINUTE = 180;

export function countEnglishWords(content: string) {
  return content.match(/[A-Za-z]+(?:'[A-Za-z]+)*/g)?.length ?? 0;
}

export function getReadingMinutes(content: string) {
  const wordCount = countEnglishWords(content);
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function createArticleSummary(content: string, maxLength = 120) {
  const normalizedContent = content.replace(/\s+/g, ' ').trim();
  if (normalizedContent.length <= maxLength) {
    return normalizedContent;
  }
  return `${normalizedContent.slice(0, maxLength).trimEnd()}...`;
}
