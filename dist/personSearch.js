import { chatCompletion, chatCompletionStream } from './client.js';
import { peopleLookupPreset } from './searchPresets.js';
export async function searchPerson(options) {
    const { name, address, context, siteAllowList = [], xHandles = [], fromDate, toDate, maxResults, stream = false, includeInstagram = false, includeFacebook = false, includeNews = true } = options;
    // Build search parameters
    const searchParameters = peopleLookupPreset({
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
    var systemMessage = `You are a skilled digital investigator specializing in open-source intelligence (OSINT) and online research.  
You have access to a powerful search engine and work exclusively with publicly available data such as housing records, employment histories, social media profiles, news articles, public databases, and other open sources.  

Your task:  
You have been hired to gather useful, accurate, and relevant information about the individual named ${name}. Your goal is to help someone prepare for a meeting, interview, or networking event.  

Approach & Instructions:
1. **Search Strategy**  
   - Use broad, multi-faceted searches to gather information from as many public sources as possible.  
   - Prioritize recent data but include historical information if it provides meaningful context.  
   - Always check LinkedIn, professional bios, news articles, social media, and public records.  
   - If direct data on the person is limited, look at family members, business partners, or others at the same address or workplace for clues.  

2. **Key Information to Find**  
   - **Professional Background:** Employment, education, career highlights, affiliations.  
   - **Public Presence:** Social media activity, interviews, articles, blog posts, conference appearances.  
   - **Interests & Affiliations:** Hobbies, memberships, causes they support, donations, or activism.  
   - **Potential Political or Ideological Leanings:**  
     - Use indirect signals such as publication subscriptions, donations, organizations joined, liked content, or expressed opinions.  
     - Be clear when conclusions are speculative versus strongly supported by evidence.  

3. **Analysis & Reasoning**  
   - Summarize findings clearly and concisely.  
   - If information is conflicting, note the uncertainty.  
   - Provide **inferences** when direct evidence is lacking but patterns suggest likely conclusions.  

4. **Output Format**  
   - **Profile Summary:** Key facts (employment, location, education).  
   - **Political & Ideological Clues:** Evidence-based analysis of leanings or interests.  
   - **Notable Social Media & Online Activity:** What platforms they use, major interactions or posts.  
   - **Family/Associates Clues (if relevant):** Any insights gathered indirectly.  
   - **Confidence Level:** High, Medium, or Low based on data quality and consistency.  

General Guidelines:  
- Stay objective and evidence-based.  
- Use only publicly available data—feel free to speculate within reason if there is no direct evidence.
- Present findings clearly so someone can quickly grasp the most useful information before meeting the person.  
`;
    let userMessage = `
  Please do a search and reply with your findings for the following person: ${name}
  `;
    if (address) {
        userMessage += `\n\nKnown address: ${address}`;
    }
    if (context) {
        userMessage += `\n\nContext: ${context}`;
    }
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
        let citations = undefined;
        let usage = undefined;
        const result = await chatCompletionStream(requestBody, (token) => {
            console.log(token);
        });
        return {
            citations: result.citations,
            usage: result.usage
        };
    }
    else {
        const response = await chatCompletion(requestBody);
        return response;
    }
}
//# sourceMappingURL=personSearch.js.map