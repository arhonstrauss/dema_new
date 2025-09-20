import { spawn } from "node:child_process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
async function launchStdio(cmdEnvKey, argsEnvKey) {
    const cmd = process.env[cmdEnvKey];
    const argsCsv = process.env[argsEnvKey] || "";
    if (!cmd)
        throw new Error(`Missing ${cmdEnvKey} in env`);
    const args = argsCsv
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    const child = spawn(cmd, args, { stdio: ["pipe", "pipe", "inherit"] });
    const transport = new StdioClientTransport({
        command: cmd,
        args: args
    });
    const client = new Client({ name: "people-search-agent", version: "1.0.0" });
    await client.connect(transport);
    return { client, child };
}
export async function getTwitterMCP() {
    const { client, child } = await launchStdio("TWITTER_MCP_CMD", "TWITTER_MCP_ARGS");
    return wrap(client, child);
}
export async function getInstagramMCP() {
    const { client, child } = await launchStdio("INSTAGRAM_MCP_CMD", "INSTAGRAM_MCP_ARGS");
    return wrap(client, child);
}
export async function getFacebookMCP() {
    const { client, child } = await launchStdio("FACEBOOK_MCP_CMD", "FACEBOOK_MCP_ARGS");
    return wrap(client, child);
}
function wrap(client, child) {
    return {
        async tools() {
            const res = await client.listTools();
            return (res?.tools || []).map((t) => ({ name: t.name, description: t.description }));
        },
        async call(tool, args) {
            const res = await client.callTool({ name: tool, arguments: args || {} });
            return res;
        },
        async close() {
            child.kill();
        }
    };
}
//# sourceMappingURL=mcpClient.js.map