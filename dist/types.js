import { z } from 'zod';
// Request schemas
export const ChatMessageSchema = z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
});
export const ChatCompletionRequestSchema = z.object({
    model: z.string(),
    messages: z.array(ChatMessageSchema),
    search_parameters: z.object({
        sources: z.array(z.object({
            type: z.enum(['web', 'news', 'x', 'rss', 'instagram', 'facebook']),
            safe_search: z.boolean().optional(),
            country: z.string().optional(),
        })),
        mode: z.enum(['auto', 'on', 'off']),
        return_citations: z.boolean(),
        from_date: z.string().optional(),
        to_date: z.string().optional(),
        max_search_results: z.number().optional(),
        allowed_websites: z.array(z.string()).optional(),
        excluded_websites: z.array(z.string()).optional(),
        included_x_handles: z.array(z.string()).optional(),
        excluded_x_handles: z.array(z.string()).optional(),
    }),
    stream: z.boolean().optional(),
});
// Response schemas
export const CitationSchema = z.object({
    title: z.string().optional(),
    url: z.string().optional(),
    snippet: z.string().optional(),
    source: z.string().optional(),
    published_date: z.string().optional(),
});
export const UsageSchema = z.object({
    prompt_tokens: z.number().optional(),
    completion_tokens: z.number().optional(),
    total_tokens: z.number().optional(),
});
export const ChoiceSchema = z.object({
    index: z.number(),
    message: z.object({
        role: z.string(),
        content: z.string(),
    }),
    finish_reason: z.string().optional(),
});
export const ChatCompletionResponseSchema = z.object({
    id: z.string().optional(),
    object: z.string().optional(),
    created: z.number().optional(),
    model: z.string().optional(),
    choices: z.array(ChoiceSchema),
    citations: z.array(CitationSchema).optional(),
    usage: UsageSchema.optional(),
});
// Streaming response schemas
export const StreamingChoiceSchema = z.object({
    index: z.number(),
    delta: z.object({
        role: z.string().optional(),
        content: z.string().optional(),
    }),
    finish_reason: z.string().optional(),
});
export const StreamingResponseSchema = z.object({
    id: z.string().optional(),
    object: z.string().optional(),
    created: z.number().optional(),
    model: z.string().optional(),
    choices: z.array(StreamingChoiceSchema),
    citations: z.array(CitationSchema).optional(),
    usage: UsageSchema.optional(),
});
//# sourceMappingURL=types.js.map