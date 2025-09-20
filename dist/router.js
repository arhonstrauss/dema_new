import * as x from "./networks/twitter.js";
import * as ig from "./networks/instagram.js";
import * as fb from "./networks/facebook.js";
export const routes = {
    // Twitter/X
    "x.post": (p) => x.postTweet(assertStr(p.text, "text")),
    "x.search": (p) => x.searchTweets(assertStr(p.q, "q"), toInt(p.limit, 20)),
    // Instagram
    "ig.profile": () => ig.igProfile(),
    "ig.posts": (p) => ig.igRecentPosts(toInt(p.limit, 5)),
    "ig.publish": (p) => ig.igPublish(assertStr(p.media_url, "media_url"), p.caption ?? ""),
    // Facebook
    "fb.post": (p) => fb.fbPost(assertStr(p.text, "text")),
    "fb.posts": () => fb.fbPosts(),
    "fb.comments": (p) => fb.fbComments(assertStr(p.post_id, "post_id")),
    "fb.reply": (p) => fb.fbReply(assertStr(p.post_id, "post_id"), assertStr(p.comment_id, "comment_id"), assertStr(p.message, "message")),
};
export async function runIntent(intent, params) {
    const fn = routes[intent];
    if (!fn)
        throw new Error(`Unknown intent: ${intent}`);
    return fn(params || {});
}
function assertStr(v, name) {
    if (typeof v !== "string" || !v.trim())
        throw new Error(`Missing or invalid ${name}`);
    return v;
}
function toInt(v, dflt) {
    const n = Number(v);
    return Number.isFinite(n) ? n : dflt;
}
//# sourceMappingURL=router.js.map