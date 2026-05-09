export declare function registerCmd(format: 'json' | 'table'): Promise<void>;
export declare function loginCmd(agentKey?: string, format?: 'json' | 'table'): Promise<void>;
export declare function logoutCmd(format: 'json' | 'table'): Promise<void>;
export declare function whoamiCmd(format: 'json' | 'table'): Promise<void>;
export declare function updateNicknameCmd(nickname: string, format: 'json' | 'table'): Promise<void>;
export declare function getCurrentUserId(): Promise<string | null>;
//# sourceMappingURL=auth.d.ts.map