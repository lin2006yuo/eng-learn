export interface CliConfig {
    baseUrl: string;
    agentKey?: string;
    apiToken?: string;
    defaultFormat: 'json' | 'table';
}
export declare function useLocalConfig(): void;
export declare function loadConfig(): CliConfig;
export declare function saveConfig(config: Partial<CliConfig>): void;
export declare function clearSession(): void;
//# sourceMappingURL=config.d.ts.map