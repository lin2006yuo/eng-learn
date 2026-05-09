export var ArticleField;
(function (ArticleField) {
    ArticleField["Title"] = "title";
    ArticleField["Summary"] = "summary";
    ArticleField["Content"] = "content";
})(ArticleField || (ArticleField = {}));
export var PatternExampleLang;
(function (PatternExampleLang) {
    PatternExampleLang["En"] = "en";
    PatternExampleLang["Zh"] = "zh";
})(PatternExampleLang || (PatternExampleLang = {}));
export function parseArticlePath(field) {
    return `article:${field}`;
}
export function parsePostFieldPath(field) {
    return `post:${field}`;
}
export function parsePatternExamplePath(patternExampleIndex, lang) {
    return `pattern:examples.${patternExampleIndex}.${lang}`;
}
//# sourceMappingURL=blockId.js.map