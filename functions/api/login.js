export async function onRequest(context) {
    // 1. 获取请求中的用户名和密码
    const { username, password } = await context.request.json();

    // 2. 从 KV 中查询用户
    const key = `user:${username}`;
    const storedPassword = await context.env.USER_DB.get(key);

    // 3. 验证用户名和密码
    if (!storedPassword) {
        return new Response(
            JSON.stringify({ error: '用户不存在' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    if (password !== storedPassword) {
        return new Response(
            JSON.stringify({ error: '密码错误' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    // 4. 登录成功：生成一个 Session ID 并存入 KV（用于后续验证）
    const sessionId = crypto.randomUUID();
    await context.env.USER_DB.put(`session:${sessionId}`, username, {
        expirationTtl: 86400  // 24小时后自动过期
    });

    // 5. 设置 Cookie（登录凭证）
    const cookie = `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`;

    return new Response(
        JSON.stringify({ success: true, message: '登录成功' }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': cookie
            }
        }
    );
}