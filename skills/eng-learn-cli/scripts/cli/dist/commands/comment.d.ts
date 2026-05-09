export declare function commentListCmd(rootType: string, rootId: string, format: 'json' | 'table'): Promise<void>;
export declare function commentListMineCmd(format: 'json' | 'table'): Promise<void>;
export interface AnchorOptions {
    dataPath: string;
    selectedText: string;
    prefixText: string;
    suffixText: string;
}
export declare function commentCreateCmd(targetType: string, targetId: string, rootType: string, rootId: string, content: string, replyToUserId: string | undefined, anchor: AnchorOptions | undefined, format: 'json' | 'table'): Promise<void>;
export declare function commentDeleteCmd(commentId: string, format: 'json' | 'table'): Promise<void>;
export declare function commentLikeCmd(commentId: string, format: 'json' | 'table'): Promise<void>;
//# sourceMappingURL=comment.d.ts.map