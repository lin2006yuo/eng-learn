export declare enum ArticleField {
    Title = "title",
    Summary = "summary",
    Content = "content"
}
export declare enum PatternExampleLang {
    En = "en",
    Zh = "zh"
}
export declare function parseArticlePath(field: ArticleField): string;
export declare function parsePostFieldPath(field: ArticleField): string;
export declare function parsePatternExamplePath(patternExampleIndex: number, lang: PatternExampleLang): string;
//# sourceMappingURL=blockId.d.ts.map