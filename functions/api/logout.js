// functions/api/logout.js
export async function onRequest(context) {
    const cookieHeader = context.request.headers.get('Cookie') || '';
    const match = cookieHeader.match(/session_id=([^;]+)/);
    const sessionId = match ? match[1] : null;

    if (sessionId) {
        // 从 KV 中删除 session
        await context.env.USER_DB.delete(`session:${sessionId}`);
    }

    // 返回并清除浏览器 Cookie
    return new Response('已登出', {
        status: 200,
        headers: {
            'Content-Type': 'text/plain',
            'Set-Cookie': 'session_id=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
    });
}