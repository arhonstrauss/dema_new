import { chatCompletion, chatCompletionStream } from './client.js';
import { peopleLookupPreset } from './searchPresets.js';

export interface PersonSearchOptions {
  name: string;
  context?: string;
  siteAllowList?: string[];
  xHandles?: string[];
  fromDate?: string;
  toDate?: string;
  maxResults?: number;
  stream?: boolean;
  includeInstagram?: boolean;
  includeFacebook?: boolean;
  includeNews?: boolean;
}

export async function searchPerson(options: PersonSearchOptions) {
  const {
    name,
    context,
    siteAllowList = [],
    xHandles = [],
    fromDate,
    toDate,
    maxResults,
    stream = false,
    includeInstagram = false,
    includeFacebook = false,
    includeNews = true
  } = options;

  // Build search parameters
  const searchParameters = peopleLookupPreset({
    allowedWebsites: siteAllowList,
    includedXHandles: xHandles,
    includeInstagram,
    includeFacebook,
    includeNews,
    forceSearch: false
  });

  // Override date and max results if provided
  if (fromDate) {
    searchParameters.from_date = fromDate;
  }
  if (toDate) {
    searchParameters.to_date = toDate;
  }
  if (maxResults) {
    searchParameters.max_search_results = maxResults;
  }

  // Build system and user messages
  const systemMessage = `You are a helpful assistant that provides comprehensive information about people. 
When searching for information about a person, provide accurate, up-to-date details including:
- Professional background and current role
- Notable achievements and accomplishments
- Recent news and activities
- Social media presence and public statements
- Any relevant controversies or public discussions

Always cite your sources and be transparent about the limitations of the information available.`;

  const userMessage = context 
    ? `Please search for comprehensive information about ${name}, particularly focusing on their role at ${context}.`
    : `Please search for comprehensive information about ${name}.`;

  const requestBody = {
    model: process.env.XAI_MODEL || 'grok-4',
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: userMessage }
    ],
    search_parameters: searchParameters,
    stream: stream
  };

  if (stream) {
    let citations: any = undefined;
    let usage: any = undefined;

    const result = await chatCompletionStream(requestBody, (token: string) => {
      process.stdout.write(token);
    });

    return {
      citations: result.citations,
      usage: result.usage
    };
  } else {
    const response = await chatCompletion(requestBody);
    return response;
  }
}
