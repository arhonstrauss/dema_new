export type MCPHandle = {
    tools(): Promise<{
        name: string;
        description?: string;
    }[]>;
    call(tool: string, args: any): Promise<any>;
    close(): Promise<void>;
};
export declare function getTwitterMCP(): Promise<MCPHandle>;
export declare function getInstagramMCP(): Promise<MCPHandle>;
export declare function getFacebookMCP(): Promise<MCPHandle>;
//# sourceMappingURL=mcpClient.d.ts.map