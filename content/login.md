---
title: "登录"
layout: "default"
draft: false
---

<div style="max-width: 400px; margin: 100px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
  <h2>用户登录</h2>
  <form id="login-form">
    <div style="margin-bottom: 15px;">
      <label for="username">用户名</label>
      <input type="text" id="username" placeholder="输入用户名" required style="width:100%; padding:8px; margin-top:5px;">
    </div>
    <div style="margin-bottom: 15px;">
      <label for="password">密码</label>
      <input type="password" id="password" placeholder="输入密码" required style="width:100%; padding:8px; margin-top:5px;">
    </div>
    <button type="submit" style="width:100%; padding:10px; background:#007bff; color:white; border:none; border-radius:4px;">登录</button>
  </form>
  <div id="message" style="margin-top:15px; color:red;"></div>
</div>

<script>
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageEl = document.getElementById('message');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const result = await response.json();

      if (response.ok) {
        messageEl.style.color = 'green';
        messageEl.textContent = '登录成功！正在跳转...';
        // 登录成功后跳转到首页或受保护页面
        window.location.href = '/';
      } else {
        messageEl.style.color = 'red';
        messageEl.textContent = result.error || '登录失败，请检查用户名和密码';
      }
    } catch (error) {
      messageEl.textContent = '网络错误，请稍后重试';
    }
  });
</script>