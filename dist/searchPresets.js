import { config } from 'dotenv';
config();
export function peopleLookupPreset(opts = {}) {
    const { allowedWebsites = [], excludedWebsites = [], includedXHandles = [], excludedXHandles = [], includeRSS = false, includeInstagram = false, includeFacebook = false, includeNews = true, forceSearch = false } = opts;
    const fromDate = process.env.SEARCH_FROM_DATE || '2023-01-01';
    const maxSearchResults = parseInt(process.env.SEARCH_MAX_RESULTS || '25');
    const searchParameters = {
        sources: [
            {
                type: 'web',
                safe_search: true
            }
        ],
        mode: forceSearch ? 'on' : 'auto',
        return_citations: true,
        max_search_results: Math.min(maxSearchResults, 10) // Cap at 10 for reliability
    };
    // Add news source if requested
    if (includeNews) {
        searchParameters.sources.push({
            type: 'news',
            country: 'US',
            safe_search: true
        });
    }
    // Note: Instagram and Facebook are not supported as direct source types by xAI API
    // They will be handled separately via MCP integration in the hybrid approach
    // Add website filters if specified
    if (allowedWebsites.length > 0) {
        searchParameters.allowed_websites = allowedWebsites;
    }
    if (excludedWebsites.length > 0) {
        searchParameters.excluded_websites = excludedWebsites;
    }
    // Add X (Twitter) handle filters if specified
    if (includedXHandles.length > 0) {
        searchParameters.included_x_handles = includedXHandles;
    }
    if (excludedXHandles.length > 0) {
        searchParameters.excluded_x_handles = excludedXHandles;
    }
    // Add RSS source if requested
    if (includeRSS) {
        searchParameters.sources.push({
            type: 'rss'
        });
    }
    return searchParameters;
}
//# sourceMappingURL=searchPresets.js.map