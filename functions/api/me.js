// functions/api/me.js
export async function onRequest(context) {
    // 从 Cookie 中提取 session_id
    const cookieHeader = context.request.headers.get('Cookie') || '';
    const match = cookieHeader.match(/session_id=([^;]+)/);
    const sessionId = match ? match[1] : null;

    if (!sessionId) {
        return new Response(
            JSON.stringify({ loggedIn: false }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // 查询 KV 获取用户名
    const username = await context.env.USER_DB.get(`session:${sessionId}`);

    if (!username) {
        return new Response(
            JSON.stringify({ loggedIn: false }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // 已登录，返回用户名
    return new Response(
        JSON.stringify({ loggedIn: true, username }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
}