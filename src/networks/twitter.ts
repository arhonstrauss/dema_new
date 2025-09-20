import { getTwitterMCP } from "../mcpClient.js";

export async function postTweet(text: string) {
  const m = await getTwitterMCP();
  try { return await m.call("post_tweet", { text }); } finally { await m.close(); }
}

export async function searchTweets(query: string, limit = 20) {
  const m = await getTwitterMCP();
  try { return await m.call("search_tweets", { query, limit }); } finally { await m.close(); }
}
