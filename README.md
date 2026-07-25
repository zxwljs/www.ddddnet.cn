# 叮当跨境ERP 官网

产品营销官网，部署在 `www.ddddnet.cn`。

## 说明

- **官网域名**：`www.ddddnet.cn`
- **应用域名**：`ddddnet.cn`（对应 `frontend/` 目录）
- 本目录为纯静态单页网站，无需构建工具

## 文件结构

```
website/
├── index.html                              # 官网主页面（单文件，内联 CSS + JS）
├── robots.txt                              # 搜索引擎爬虫配置
├── sitemap.xml                             # 站点地图（自动更新）
├── _redirects                              # Cloudflare Pages 路由配置（SPA fallback）
├── a3f8c2d9e7b14f6a8c2d9e7b14f6a8c2.txt    # IndexNow 密钥文件（Bing 推送校验用）
├── README.md                               # 本文档
├── blog/                                   # SEO 博客（自动生成）
│   ├── index.html                          # 博客列表首页（第 1 页，带分页）
│   ├── page/                               # 分页（第 2 页起）
│   │   └── 2.html
│   └── posts/                              # 文章详情页
│       └── xxx.html
├── scripts/                                # 自动化脚本
│   ├── generate-seo.js                     # 调用 GLM-4V-Flash 生成文章
│   ├── push-seo.js                         # 推送到 Bing / 百度（百度每 24h 一次，避免超配额）
│   ├── topics.js                            # 静态选题库（97 个）
│   ├── topics-hot.json                     # 动态热点选题（每 7 天更新，GitHub Actions 运行时生成）
│   ├── generated.json                      # 已生成文章记录（运行时，本地不入库）
│   └── push-log.json                       # 推送日志（运行时，本地不入库）
└── .github/
    └── workflows/
        └── seo-blog.yml                    # GitHub Actions 每小时自动生成并推送
```

## 本地预览

直接双击 `index.html` 在浏览器中打开即可。

或启动本地静态服务器（推荐，体验更完整）：

```bash
# 方式一：Python
python -m http.server 8080

# 方式二：Node.js（需要先装 serve）
npx serve .
```

然后访问 `http://localhost:8080`。

## 部署到 Cloudflare Pages

### 方式一：手动上传（最简单）

1. 登录 Cloudflare Dashboard → Workers & Pages → Create → Pages → **Upload assets**
2. 项目名填 `dingdang-website`（或自定义）
3. 把 `website/` 目录下所有文件拖进去（不包括 `website/` 文件夹本身）
4. 点击 Deploy，几秒后即可获得 `xxx.pages.dev` 预览域名

### 方式二：连接 Git 仓库（自动部署）

1. 新建一个 GitHub 仓库（如 `pod-system-website`）
2. 把 `website/` 目录下的文件推到仓库根目录
3. Cloudflare Pages → Create → Connect to Git → 选择该仓库
4. **Build settings**：
   - Framework preset：`None`
   - Build command：留空
   - Build output directory：`/`（根目录）
5. Save and Deploy，后续 push 到 main 分支自动部署

### 绑定自定义域名

1. Pages 项目 → Custom domains → Set up a custom domain
2. 输入 `www.ddddnet.cn`
3. 按提示在 DNS 中添加 CNAME 记录
4. 等待 SSL 证书签发（通常几分钟）

## 部署到 GitHub Pages

如果只需要 GitHub Pages 预览：

1. 新建 GitHub 仓库，把 `website/` 下的文件推到 main 分支根目录
2. 仓库 Settings → Pages → Build and deployment
3. Source 选 `Deploy from a branch`，Branch 选 `main` / `/(root)`
4. Save，等一两分钟后访问 `https://<username>.github.io/<repo>/`

## SEO 博客与搜索引擎推送配置

本目录内置一套全自动 SEO 系统：**GitHub Actions 每小时调用 AI 生成 1 篇原创文章 → 自动提交推送到仓库 → Cloudflare Pages 自动部署 → 自动推送到 Bing / 百度**。

整体流程图：

```
GitHub Actions (每小时)
   │
   ├─ 1. generate-seo.js  调用 GLM-4V-Flash 生成文章 HTML
   │     ├─ 生成 /blog/posts/xxx.html
   │     ├─ 更新 /blog/index.html (博客列表，带分页)
   │     ├─ 更新 /blog/page/N.html (分页)
   │     └─ 更新 /sitemap.xml
   │
   ├─ 2. git commit & push  (推送到仓库)
   │     └─ Cloudflare Pages 自动部署到 www.ddddnet.cn
   │
   └─ 3. push-seo.js  推送到搜索引擎
         ├─ IndexNow → Bing / Yandex (开箱即用)
         └─ 百度普通收录 API (需配置 BAIDU_TOKEN)
```

### 前置条件：配置 AI API Key

每小时生成文章依赖智谱 GLM-4V-Flash 免费模型，需要在 GitHub 仓库配置 API Key：

1. 打开仓库 `zxwljs/www.ddddnet.cn` → **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**，Name 填 `BIGMODEL_API_KEY`，Secret 填你的智谱 API Key
   - 获取地址：https://bigmodel.cn/ → 控制台 → API Keys
3. 保存即可，GitHub Actions 运行时会自动读取

> 💡 GLM-4V-Flash 是免费的，无需付费。配置完成后无需再做任何操作，每小时自动生成 1 篇文章。

### 搜索引擎推送配置

#### 1. Bing（已配置，开箱即用） ✅

通过 [IndexNow 协议](https://www.indexnow.org/) 主动推送，密钥文件 `a3f8c2d9e7b14f6a8c2d9e7b14f6a8c2.txt` 已放在网站根目录，**无需任何额外配置**。每次生成文章后自动推送博客首页 + 最近 5 篇文章 URL 到 Bing。

如需验证密钥，访问 `https://www.ddddnet.cn/a3f8c2d9e7b14f6a8c2d9e7b14f6a8c2.txt` 应返回该密钥字符串。

#### 2. 百度（需配置 BAIDU_TOKEN）⚠️

百度普通收录需要主动推送 API Token，配置步骤：

1. 访问 [百度搜索资源平台](https://ziyuan.baidu.com/) → 登录
2. **用户中心** → **站点管理** → 添加网站 `https://www.ddddnet.cn`
3. 按提示完成域名验证（推荐 CNAME 验证）
4. 进入该站点 → **普通收录** → **API 推送**
5. 页面会显示推送调用地址，格式类似：
   ```
   http://data.zz.baidu.com/urls?site=www.ddddnet.cn&token=你的TOKEN
   ```
6. 复制其中的 `token` 值（即 `&token=` 后面那段）
7. 回到 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**
8. **New repository secret**，Name 填 `BAIDU_TOKEN`，Secret 粘贴刚才复制的 token
9. 保存。下次 GitHub Actions 运行时自动生效

> 💡 未配置 `BAIDU_TOKEN` 时脚本会自动跳过百度推送，不影响 Bing 推送和文章生成。

#### 3. Google（一次性手动配置）⚠️

Google 不支持主动 URL 推送，通过 sitemap 自动发现，**只需配置一次**：

1. 访问 [Google Search Console](https://search.google.com/search-console) → 登录
2. 添加资源 → 输入 `https://www.ddddnet.cn`（前缀类型，推荐）
3. 按提示完成域名验证（推荐 HTML 标签或 DNS 验证）
4. 进入该资源 → 左侧菜单 **Sitemaps**
5. 在「添加新的站点地图」输入框填入：
   ```
   sitemap.xml
   ```
   （只需填相对路径，完整 URL 为 `https://www.ddddnet.cn/sitemap.xml`）
6. 点击提交。状态变为「成功」即完成

> 💡 配置一次后，GitHub Actions 每小时自动更新 `sitemap.xml`，Google 会定期重新抓取，无需重复操作。

### 配置速查表

| 配置项 | 在哪里配置 | 名称 | 值 | 是否必需 |
|--------|-----------|------|-----|---------|
| AI 文章生成 | GitHub Secrets | `BIGMODEL_API_KEY` | 智谱 API Key | ✅ 必需 |
| Bing 推送 | — | — | — | ✅ 已内置 |
| 百度推送 | GitHub Secrets | `BAIDU_TOKEN` | 百度资源平台 token | ⬜ 可选 |
| Google 收录 | Search Console | — | 提交 sitemap.xml | ⬜ 一次性 |

### 手动触发一次生成测试

配置完 `BIGMODEL_API_KEY` 后，可手动触发一次验证流程：

1. 仓库 → **Actions** → 左侧选 **SEO Blog Auto Generator**
2. 点击 **Run workflow** → **Run workflow**
3. 几分钟后刷新 `www.ddddnet.cn/blog/` 查看新文章

### 运行频率

- **文章生成**：每小时 1 篇（`cron: '0 * * * *'`）
- **热点选题更新**：每 7 天自动刷新一次动态热点（聚焦 Temu 半托管）
- **博客列表**：每次生成后自动重建，带分页（每页 10 篇）
- **sitemap**：每次生成后自动更新

### 查看推送状态

每次推送完成后，系统会自动生成一份详细的推送日志，你可以随时通过以下 URL 查看：

```
https://www.ddddnet.cn/scripts/push-log.json
```

日志内容示例：
```json
{
  "updatedAt": "2026-07-25T03:00:00.000Z",
  "urlCount": 5,
  "results": {
    "indexnow": {
      "success": true,
      "status": 202,
      "endpoint": "https://api.indexnow.org/indexnow",
      "urlCount": 5
    },
    "baidu": {
      "success": true,
      "pushed": 5,
      "remaining": 999995
    }
  }
}
```

**字段说明**：
- `indexnow.success`: Bing/IndexNow 推送是否成功
- `baidu.success`: 百度推送是否成功
- `baidu.pushed`: 本次成功推送到百度的 URL 数量
- `baidu.remaining`: 百度 API 剩余配额

> 💡 每次新文章生成后，该日志文件会自动更新为最新状态。

## 自定义修改

| 要改什么 | 在哪里改 |
|----------|----------|
| 下载链接 | 搜索 `href="#"` 的下载按钮，替换为真实下载地址 |
| Logo / 图标 | 顶部 favicon 和导航栏 logo 图标用的是 SVG data URI，可替换为图片 |
| 文案内容 | 直接在 `index.html` 中找到对应文字修改 |
| 主色调 | 修改 `:root` 中的 CSS 变量（`--c-primary`、`--c-accent` 等） |
| 统计代码 | 在 `</body>` 前加 Google Analytics / 百度统计 等脚本 |

## 技术栈

- 纯 HTML + CSS + JavaScript（单文件）
- 无构建工具、无依赖
- 响应式布局（桌面 / 平板 / 手机）
- 字体：Noto Sans SC + Plus Jakarta Sans（Google Fonts）
- 图标：Feather Icons（内联 SVG）
