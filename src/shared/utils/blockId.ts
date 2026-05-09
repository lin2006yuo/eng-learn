export enum ArticleField {
  Title = 'title',
  Summary = 'summary',
  Content = 'content',
}

export enum PostField {
  Content = 'content',
}

export enum PatternExampleLang {
  En = 'en',
  Zh = 'zh',
}

export function parseArticlePath(field: ArticleField): string {
  return `article:${field}`;
}

export function parsePostPath(field: PostField): string {
  return `post:${field}`;
}

export function parsePatternExamplePath(
  patternExampleIndex: number,
  lang: PatternExampleLang,
): string {
  return `pattern:examples.${patternExampleIndex}.${lang}`;
}
