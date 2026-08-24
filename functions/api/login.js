export async function onRequest(context) {
    try {
        // 1. 检查 KV 绑定是否存在
        if (!context.env.USER_DB) {
            return new Response(
                JSON.stringify({ error: '服务器配置错误：KV 未绑定' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 2. 解析请求体（仅支持 POST）
        if (context.request.method !== 'POST') {
            return new Response(
                JSON.stringify({ error: 'Method Not Allowed' }),
                { status: 405, headers: { 'Content-Type': 'application/json' } }
            );
        }

        let username, password;
        try {
            const body = await context.request.json();
            username = body.username?.trim();
            password = body.password?.trim();
        } catch {
            return new Response(
                JSON.stringify({ error: '请求格式错误，请提交 JSON 数据' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 3. 验证必填字段
        if (!username || !password) {
            return new Response(
                JSON.stringify({ error: '用户名和密码不能为空' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // 4. 查询 KV（Key 格式：user:用户名）
        const key = `user:${username}`;
        const storedPassword = await context.env.USER_DB.get(key);

        if (storedPassword === null) {
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

        // 5. 登录成功：生成 session ID
        let sessionId;
        try {
            sessionId = crypto.randomUUID();
        } catch {
            // 兼容旧版 Cloudflare 环境（如果 randomUUID 不可用）
            sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
        }

        // 6. 将 session 存入 KV，有效期 24 小时
        await context.env.USER_DB.put(`session:${sessionId}`, username, {
            expirationTtl: 86400
        });

        // 7. 设置 Cookie
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

    } catch (error) {
        // 8. 捕获所有未预料的异常并返回详细信息
        return new Response(
            JSON.stringify({
                error: '服务器内部错误',
                detail: error.message,
                stack: error.stack  // 开发环境可保留，生产环境建议移除
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}