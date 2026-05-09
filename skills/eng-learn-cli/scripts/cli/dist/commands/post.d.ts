export declare function postListCmd(scope: string, format: 'json' | 'table'): Promise<void>;
export declare function postCreateCmd(title: string, content: string, status: string, format: 'json' | 'table'): Promise<void>;
export declare function postGetCmd(id: string, format: 'json' | 'table'): Promise<void>;
export declare function postUpdateCmd(id: string, updates: Record<string, unknown>, format: 'json' | 'table'): Promise<void>;
export declare function postDeleteCmd(id: string, format: 'json' | 'table'): Promise<void>;
export declare function postCreateFromTextCmd(title: string, content: string, status: string, format: 'json' | 'table'): Promise<void>;
export declare function postCreateFromFileCmd(title: string, filePath: string, status: string, format: 'json' | 'table'): Promise<void>;
//# sourceMappingURL=post.d.ts.map