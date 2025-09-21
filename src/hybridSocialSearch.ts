import { searchPerson } from './personSearch.js';
import { igProfile, igRecentPosts } from './networks/instagram.js';
import { fbPosts } from './networks/facebook.js';
import { askGrok } from './client.js';

export interface HybridSearchOptions {
  name: string;
  context?: string;
  includeInstagram?: boolean;
  includeFacebook?: boolean;
  includeNews?: boolean;
  maxResults?: number;
  stream?: boolean;
}

export async function hybridSocialSearch(options: HybridSearchOptions) {
  const {
    name,
    context,
    includeInstagram = false,
    includeFacebook = false,
    includeNews = true,
    maxResults = 30,
    stream = false
  } = options;

  console.log(`🔍 Starting hybrid social search for: ${name}`);
  
  const results: any = {
    xaiSearch: null,
    instagramData: null,
    facebookData: null,
    combinedAnalysis: null
  };

  try {
    // 1. Run xAI search with social media sources
    console.log('📡 Running xAI search with social media sources...');
    results.xaiSearch = await searchPerson({
      name,
      context,
      includeInstagram,
      includeFacebook,
      includeNews,
      maxResults,
      stream
    });

    // 2. If Instagram is requested, get direct Instagram data
    if (includeInstagram) {
      console.log('📸 Fetching Instagram data...');
      try {
        const igProfileData = await igProfile();
        const igPosts = await igRecentPosts(5);
        results.instagramData = {
          profile: igProfileData,
          recentPosts: igPosts
        };
      } catch (error) {
        console.warn('⚠️ Instagram data fetch failed:', error);
        results.instagramData = { error: error instanceof Error ? error.message : String(error) };
      }
    }

    // 3. If Facebook is requested, get direct Facebook data
    if (includeFacebook) {
      console.log('📘 Fetching Facebook data...');
      try {
        const fbPostsData = await fbPosts();
        results.facebookData = {
          posts: fbPostsData
        };
      } catch (error) {
        console.warn('⚠️ Facebook data fetch failed:', error);
        results.facebookData = { error: error instanceof Error ? error.message : String(error) };
      }
    }

    // 4. Generate combined analysis using Grok
    console.log('🤖 Generating combined analysis...');
    const analysisPrompt = `Based on the following data about ${name}, provide a comprehensive analysis:

XAI Search Results: ${JSON.stringify(results.xaiSearch, null, 2)}

${includeInstagram ? `Instagram Data: ${JSON.stringify(results.instagramData, null, 2)}` : ''}

${includeFacebook ? `Facebook Data: ${JSON.stringify(results.facebookData, null, 2)}` : ''}

Please provide:
1. A comprehensive summary of the person
2. Key insights from social media presence
3. Professional background and achievements
4. Recent activities and posts
5. Social media engagement patterns
6. Any notable trends or patterns

Format the response in a clear, structured way with sections and bullet points.`;

    results.combinedAnalysis = await askGrok([
      { role: 'user', content: analysisPrompt }
    ]);

    return results;

  } catch (error) {
    console.error('❌ Hybrid search failed:', error);
    throw error;
  }
}

export async function searchPersonWithSocialMedia(
  name: string, 
  options: {
    instagram?: boolean;
    facebook?: boolean;
    context?: string;
  } = {}
) {
  return await hybridSocialSearch({
    name,
    context: options.context,
    includeInstagram: options.instagram || false,
    includeFacebook: options.facebook || false,
    includeNews: true,
    maxResults: 30,
    stream: false
  });
}
