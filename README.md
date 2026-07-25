# 叮当跨境ERP 官网

产品营销官网，部署在 `www.ddddnet.cn`。

## 说明

- **官网域名**：`www.ddddnet.cn`
- **应用域名**：`ddddnet.cn`（对应 `frontend/` 目录）
- 本目录为纯静态单页网站，无需构建工具

## 文件结构

```
website/
├── index.html      # 官网主页面（单文件，内联 CSS + JS）
├── robots.txt      # 搜索引擎爬虫配置
├── _redirects      # Cloudflare Pages 路由配置（SPA fallback）
└── README.md       # 本文档
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
