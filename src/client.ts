import { fetch } from 'undici';
import { config } from 'dotenv';

config();

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_BASE_URL = 'https://api.x.ai/v1/chat/completions';

export async function chatCompletion(body: any): Promise<any> {
  if (!XAI_API_KEY) {
    throw new Error('XAI_API_KEY is not set in environment variables');
  }

  // Validate request body
  if (!body || !body.model || !body.messages) {
    throw new Error('Invalid request body: missing required fields (model, messages)');
  }

  console.log('Making API request with body:', JSON.stringify(body, null, 2));

  const response = await fetch(XAI_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${XAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Request Body:', JSON.stringify(body, null, 2));
    console.error('API Response:', errorText);
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

export async function chatCompletionStream(
  body: any, 
  onToken: (token: string) => void
): Promise<{ citations?: any; usage?: any }> {
  if (!XAI_API_KEY) {
    throw new Error('XAI_API_KEY is not set in environment variables');
  }

  // Validate request body
  if (!body || !body.model || !body.messages) {
    throw new Error('Invalid request body: missing required fields (model, messages)');
  }

  console.log('Making streaming API request with body:', JSON.stringify(body, null, 2));

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(XAI_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          retryCount++;
          if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
        }
        const errorText = await response.text();
        console.error('API Request Body:', JSON.stringify(body, null, 2));
        console.error('API Response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming request');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let citations: any = undefined;
      let usage: any = undefined;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                return { citations, usage };
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.choices?.[0]?.delta?.content) {
                  onToken(parsed.choices[0].delta.content);
                }
                if (parsed.citations) {
                  citations = parsed.citations;
                }
                if (parsed.usage) {
                  usage = parsed.usage;
                }
              } catch (e) {
                // Ignore parsing errors for individual chunks
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      return { citations, usage };
    } catch (error) {
      retryCount++;
      if (retryCount >= maxRetries) {
        throw error;
      }
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

export async function askGrok(messages: any[], opts?: { stream?: boolean; searchParams?: any }) {
  if (!process.env.XAI_API_KEY) {
    throw new Error('XAI_API_KEY is not set in environment variables');
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('Invalid messages: must be a non-empty array');
  }

  const body: any = {
    model: process.env.XAI_MODEL || "grok-4",
    messages,
    temperature: 0.2
  };
  if (opts?.searchParams) body.search_parameters = opts.searchParams;
  if (opts?.stream) body.stream = true;

  console.log('Making askGrok API request with body:', JSON.stringify(body, null, 2));

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.XAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('API Request Body:', JSON.stringify(body, null, 2));
    console.error('API Response:', errorText);
    throw new Error(`API request failed: ${res.status} ${res.statusText} - ${errorText}`);
  }

  if (!opts?.stream) {
    const j: any = await res.json();
    return {
      text: j?.choices?.[0]?.message?.content ?? "",
      citations: j?.citations,
      usage: j?.usage
    };
  } else {
    // Minimal SSE: print tokens; collect final usage/citations if provided
    const reader = res.body!.getReader();
    let decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split("\n")) {
        const m = line.match(/^data:\s*(.*)$/);
        if (m) {
          const data = m[1];
          if (data === "[DONE]") break;
          try {
            const evt = JSON.parse(data);
            const delta = evt?.choices?.[0]?.delta?.content;
            if (delta) { text += delta; process.stdout.write(delta); }
          } catch {}
        }
      }
    }
    return { text };
  }
}