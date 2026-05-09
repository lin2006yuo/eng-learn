export declare function articleListCmd(scope: string, format: 'json' | 'table'): Promise<void>;
export declare function articleCreateCmd(title: string, summary: string, content: string, status: string, format: 'json' | 'table'): Promise<void>;
export declare function articleGetCmd(id: string, format: 'json' | 'table'): Promise<void>;
export declare function articleUpdateCmd(id: string, updates: Record<string, unknown>, format: 'json' | 'table'): Promise<void>;
export declare function articleDeleteCmd(id: string, format: 'json' | 'table'): Promise<void>;
//# sourceMappingURL=article.d.ts.map