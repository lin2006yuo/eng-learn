export interface ApiResult<T = unknown> {
    ok: boolean;
    data?: T;
    error?: string;
}
export declare class ApiClient {
    private getHeaders;
    private request;
    private refreshSession;
    get<T>(path: string): Promise<ApiResult<T>>;
    post<T>(path: string, body: unknown, options?: {
        skipAuth?: boolean;
    }): Promise<ApiResult<T>>;
    put<T>(path: string, body: unknown): Promise<ApiResult<T>>;
    delete<T>(path: string): Promise<ApiResult<T>>;
}
export declare const client: ApiClient;
//# sourceMappingURL=client.d.ts.map