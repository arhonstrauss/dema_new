#!/usr/bin/env node
import "dotenv/config";
import { askGrok } from "./client.js"; // reuse your existing xAI client if it supports streaming & search_params
import { runIntent } from "./router.js";
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error(`Usage: social-agent "task or question..." [--from YYYY-MM-DD] [--max N] [--dry]`);
    process.exit(1);
}
const DRY = args.includes("--dry");
function readFlag(name) {
    const i = args.indexOf(name);
    if (i === -1)
        return undefined;
    return args[i + 1];
}
const FROM = readFlag("--from") || process.env.AGENT_FROM_DATE || "2023-01-01";
const MAX = readFlag("--max") ? Number(readFlag("--max")) : Number(process.env.AGENT_MAX_RESULTS || 25);
const userPrompt = args.filter(a => !a.startsWith("--")).join(" ");
const system = {
    role: "system",
    content: [
        "You can request tools by returning ONLY a JSON object in your entire message:",
        `{ "intent": "<x.post|x.search|ig.profile|ig.posts|ig.publish|fb.post|fb.posts|fb.comments|fb.reply>", "params": { ... }, "rationale": "why" }`,
        "If no action is needed, reply normally. Keep results concise and include citations if Live Search is used."
    ].join(" ")
};
const search_parameters = {
    mode: "auto",
    return_citations: true,
    from_date: FROM,
    max_search_results: MAX,
    sources: [
        { type: "web", safe_search: true },
        { type: "news", country: "US", safe_search: true },
        { type: "x" }
    ]
};
(async () => {
    let messages = [system, { role: "user", content: userPrompt }];
    // 1st ask
    let res = await askGrok(messages, { stream: true, searchParams: search_parameters });
    let text = res.text?.trim() || "";
    // Try to parse single-JSON action
    let action = null;
    try {
        const m = text.match(/\{[\s\S]*\}$/); // naive: last JSON object in message
        if (m)
            action = JSON.parse(m[0]);
    }
    catch { /* ignore */ }
    if (action?.intent && !DRY) {
        // Run tool
        let toolResult;
        try {
            toolResult = await runIntent(action.intent, action.params || {});
        }
        catch (e) {
            toolResult = { error: String(e?.message || e) };
        }
        // Ask Grok again with the tool result
        messages.push({ role: "assistant", content: text });
        messages.push({ role: "user", content: `Action result (JSON): ${JSON.stringify(toolResult)}` });
        const res2 = await askGrok(messages, { stream: true, searchParams: search_parameters });
        if (res2.text)
            console.log("\n"); // readability
    }
})();
//# sourceMappingURL=socialAgent.js.map