import { getInstagramMCP } from "../mcpClient.js";

export async function igProfile() {
  const m = await getInstagramMCP();
  try { return await m.call("get_profile_info", {}); } finally { await m.close(); }
}
export async function igRecentPosts(limit = 5) {
  const m = await getInstagramMCP();
  try { return await m.call("get_media_posts", { limit }); } finally { await m.close(); }
}
export async function igInsights(media_id: string) {
  const m = await getInstagramMCP();
  try { return await m.call("get_media_insights", { media_id }); } finally { await m.close(); }
}
export async function igPublish(media_url: string, caption = "") {
  const m = await getInstagramMCP();
  try { return await m.call("publish_media", { media_url, caption }); } finally { await m.close(); }
}
