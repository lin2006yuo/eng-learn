interface AnchorOffsetResult {
    startOffset: number;
    endOffset: number;
    sourceText: string;
}
export declare function computeAnchorOffset(dataPath: string, rootType: string, rootId: string, selectedText: string, prefixText: string, suffixText: string): Promise<AnchorOffsetResult>;
export {};
//# sourceMappingURL=anchorOffset.d.ts.map