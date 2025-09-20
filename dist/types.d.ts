import { z } from 'zod';
export declare const ChatMessageSchema: z.ZodObject<{
    role: z.ZodEnum<{
        system: "system";
        user: "user";
        assistant: "assistant";
    }>;
    content: z.ZodString;
}, z.core.$strip>;
export declare const ChatCompletionRequestSchema: z.ZodObject<{
    model: z.ZodString;
    messages: z.ZodArray<z.ZodObject<{
        role: z.ZodEnum<{
            system: "system";
            user: "user";
            assistant: "assistant";
        }>;
        content: z.ZodString;
    }, z.core.$strip>>;
    search_parameters: z.ZodObject<{
        sources: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<{
                web: "web";
                news: "news";
                rss: "rss";
                x: "x";
                instagram: "instagram";
                facebook: "facebook";
            }>;
            safe_search: z.ZodOptional<z.ZodBoolean>;
            country: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        mode: z.ZodEnum<{
            on: "on";
            auto: "auto";
            off: "off";
        }>;
        return_citations: z.ZodBoolean;
        from_date: z.ZodOptional<z.ZodString>;
        to_date: z.ZodOptional<z.ZodString>;
        max_search_results: z.ZodOptional<z.ZodNumber>;
        allowed_websites: z.ZodOptional<z.ZodArray<z.ZodString>>;
        excluded_websites: z.ZodOptional<z.ZodArray<z.ZodString>>;
        included_x_handles: z.ZodOptional<z.ZodArray<z.ZodString>>;
        excluded_x_handles: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>;
    stream: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const CitationSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    snippet: z.ZodOptional<z.ZodString>;
    source: z.ZodOptional<z.ZodString>;
    published_date: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const UsageSchema: z.ZodObject<{
    prompt_tokens: z.ZodOptional<z.ZodNumber>;
    completion_tokens: z.ZodOptional<z.ZodNumber>;
    total_tokens: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const ChoiceSchema: z.ZodObject<{
    index: z.ZodNumber;
    message: z.ZodObject<{
        role: z.ZodString;
        content: z.ZodString;
    }, z.core.$strip>;
    finish_reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const ChatCompletionResponseSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    object: z.ZodOptional<z.ZodString>;
    created: z.ZodOptional<z.ZodNumber>;
    model: z.ZodOptional<z.ZodString>;
    choices: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        message: z.ZodObject<{
            role: z.ZodString;
            content: z.ZodString;
        }, z.core.$strip>;
        finish_reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    citations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        snippet: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
        published_date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    usage: z.ZodOptional<z.ZodObject<{
        prompt_tokens: z.ZodOptional<z.ZodNumber>;
        completion_tokens: z.ZodOptional<z.ZodNumber>;
        total_tokens: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const StreamingChoiceSchema: z.ZodObject<{
    index: z.ZodNumber;
    delta: z.ZodObject<{
        role: z.ZodOptional<z.ZodString>;
        content: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    finish_reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const StreamingResponseSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    object: z.ZodOptional<z.ZodString>;
    created: z.ZodOptional<z.ZodNumber>;
    model: z.ZodOptional<z.ZodString>;
    choices: z.ZodArray<z.ZodObject<{
        index: z.ZodNumber;
        delta: z.ZodObject<{
            role: z.ZodOptional<z.ZodString>;
            content: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        finish_reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    citations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        snippet: z.ZodOptional<z.ZodString>;
        source: z.ZodOptional<z.ZodString>;
        published_date: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
    usage: z.ZodOptional<z.ZodObject<{
        prompt_tokens: z.ZodOptional<z.ZodNumber>;
        completion_tokens: z.ZodOptional<z.ZodNumber>;
        total_tokens: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatCompletionRequest = z.infer<typeof ChatCompletionRequestSchema>;
export type Citation = z.infer<typeof CitationSchema>;
export type Usage = z.infer<typeof UsageSchema>;
export type Choice = z.infer<typeof ChoiceSchema>;
export type ChatCompletionResponse = z.infer<typeof ChatCompletionResponseSchema>;
export type StreamingChoice = z.infer<typeof StreamingChoiceSchema>;
export type StreamingResponse = z.infer<typeof StreamingResponseSchema>;
//# sourceMappingURL=types.d.ts.map