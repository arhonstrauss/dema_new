import { fetch } from 'undici';
import { config } from 'dotenv';

config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1/responses';

declare const process: {
  env: { [key: string]: string | undefined };
};

export async function openaiCompletion(body: any): Promise<any> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  // Validate request body
  if (!body || !body.model || !body.input) {
    throw new Error('Invalid request body: missing required fields (model, input)');
  }

  console.log('Making OpenAI Response API request with body:', JSON.stringify(body, null, 2));

  const response = await fetch(OPENAI_BASE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
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

export async function openaiCompletionStream(
  body: any, 
  onToken: (token: string) => void
): Promise<{ usage?: any }> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  // Validate request body
  if (!body || !body.model || !body.input) {
    throw new Error('Invalid request body: missing required fields (model, input)');
  }

  console.log('Making streaming OpenAI Response API request with body:', JSON.stringify(body, null, 2));

  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(OPENAI_BASE_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
                return { usage };
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.output?.[0]?.content?.[0]?.text) {
                  onToken(parsed.output[0].content[0].text);
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

      return { usage };
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
