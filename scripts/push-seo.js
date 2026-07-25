/**
 * 搜索引擎主动推送脚本
 * - IndexNow 协议（Bing / Yandex / Seznam 等）
 * - 百度普通收录推送
 * - Google：通过 sitemap.xml，需在 Search Console 手动提交一次 sitemap
 *
 * 运行: node scripts/push-seo.js
 * 环境变量:
 *   BAIDU_TOKEN  (可选) 百度站长平台普通收录 token
 *   SITE_HOST    (可选) 站点域名，默认 www.ddddnet.cn
 */
const fs = require('fs');
const path = require('path');

const INDEXNOW_KEY = 'a3f8c2d9e7b14f6a8c2d9e7b14f6a8c2';
const HOST = process.env.SITE_HOST || 'www.ddddnet.cn';
const SITE_URL = `https://${HOST}`;
const KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

// 读取已生成文章记录
function loadGenerated() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'generated.json'), 'utf-8');
    return JSON.parse(data);
  } catch {
    return { posts: [] };
  }
}

// 收集需要推送的 URL（博客首页 + 最近 5 篇文章 + sitemap）
function collectUrls(gen) {
  const urls = new Set();
  urls.add(`${SITE_URL}/blog/`);
  urls.add(`${SITE_URL}/sitemap.xml`);
  // 最近 5 篇文章
  const recent = (gen.posts || []).slice(-5);
  for (const p of recent) {
    urls.add(`${SITE_URL}/blog/posts/${p.slug}.html`);
  }
  return [...urls];
}

// ===== IndexNow 推送（Bing / Yandex / Seznam）=====
async function pushIndexNow(urls) {
  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
  ];

  const body = JSON.stringify({
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  });

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body,
      });
      // 200 = 已接受，202 = 待处理，422 = 密钥校验失败等
      if (res.status === 200 || res.status === 202) {
        console.log(`✓ IndexNow 推送成功 (${endpoint}) 状态=${res.status}，共 ${urls.length} 个 URL`);
        return true;
      } else {
        const text = await res.text().catch(() => '');
        console.warn(`⚠ IndexNow 返回 ${res.status} (${endpoint}): ${text.slice(0, 200)}`);
      }
    } catch (err) {
      console.warn(`⚠ IndexNow 推送异常 (${endpoint}): ${err.message}`);
    }
  }
  return false;
}

// ===== 百度普通收录推送 =====
async function pushBaidu(urls) {
  const token = process.env.BAIDU_TOKEN;
  if (!token) {
    console.log('ℹ 未配置 BAIDU_TOKEN，跳过百度推送（在百度搜索资源平台获取 token 后配置到 GitHub Secrets）');
    return false;
  }

  const apiUrl = `http://data.zz.baidu.com/urls?site=${HOST}&token=${token}`;
  // 百度要求 body 为每行一个 URL（纯文本）
  const body = urls.join('\n');

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    });
    const data = await res.json().catch(() => ({}));
    if (data.success !== undefined || data.success === 0) {
      console.log(`✓ 百度推送成功：成功 ${data.success} 条，剩余 ${data.remain} 条`);
      return true;
    }
    if (data.error) {
      console.warn(`⚠ 百度推送失败：${data.error} ${data.message || ''}`);
    } else {
      console.log(`✓ 百度推送响应：`, JSON.stringify(data));
    }
  } catch (err) {
    console.warn(`⚠ 百度推送异常: ${err.message}`);
  }
  return false;
}

async function main() {
  console.log('=== 搜索引擎推送开始 ===');
  const gen = loadGenerated();
  const urls = collectUrls(gen);
  console.log(`待推送 URL (${urls.length} 个):`);
  urls.forEach(u => console.log('  -', u));

  await pushIndexNow(urls);
  await pushBaidu(urls);

  console.log('=== 推送完成 ===');
}

main().catch(err => {
  console.error('推送失败:', err.message);
  process.exit(0); // 推送失败不阻断 workflow
});
