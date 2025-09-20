import { getFacebookMCP } from "../mcpClient.js";
export async function fbPost(message) {
    const m = await getFacebookMCP();
    try {
        return await m.call("post_to_facebook", { message });
    }
    finally {
        await m.close();
    }
}
export async function fbPosts() {
    const m = await getFacebookMCP();
    try {
        return await m.call("get_page_posts", {});
    }
    finally {
        await m.close();
    }
}
export async function fbComments(post_id) {
    const m = await getFacebookMCP();
    try {
        return await m.call("get_post_comments", { post_id });
    }
    finally {
        await m.close();
    }
}
export async function fbReply(post_id, comment_id, message) {
    const m = await getFacebookMCP();
    try {
        return await m.call("reply_to_comment", { post_id, comment_id, message });
    }
    finally {
        await m.close();
    }
}
//# sourceMappingURL=facebook.js.map