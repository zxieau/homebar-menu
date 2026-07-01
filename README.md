# Jimmy’s Bar Menu

一个手机优先的私人 Home Bar 互动酒单原型。当前设计分支使用 Vite + React 重做视觉：复古纸张、深蓝黄昏、暖黄色路灯和手绘鸡尾酒卡片。

线上菜单：<https://zxieau.github.io/homebar-menu/>

打印二维码卡片：<https://zxieau.github.io/homebar-menu/share-card.html>

## 本地预览

在项目目录运行：

```bash
pnpm install
pnpm dev
```

然后访问 `http://127.0.0.1:5173/homebar-menu/`。

## 修改菜单

酒品、分类、口味标签和详情页文案都在 `src/data/menu.js` 中维护。

配方提示在 `src/data/recipes.js` 中维护，后台 `/admin` 会显示这些 recipe cue。

## Supabase 后端

第一版后端使用 Supabase 免费额度，适合私人 home bar 使用。

1. 在 Supabase 新建 project。
2. 打开 SQL Editor，执行 `supabase/schema.sql`。
3. 复制 Project URL 和 anon public key。
4. 在本地新建 `.env`，参考 `.env.example` 填入：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_ADMIN_PIN=your-private-pin
```

`.env` 已被 `.gitignore` 忽略，不要提交真实值。

后台入口为 `/homebar-menu/admin`。第一版使用简单 PIN 解锁；它适合私人使用，不是严格安全后台。

## 部署

Vite 已配置 GitHub Pages 项目路径 `/homebar-menu/`。

当前发布方式使用 GitHub Pages 的 `gh-pages` 分支：本地构建后，将 `dist/` 内容推送到 `gh-pages` 分支，再在 Pages 设置中选择 `gh-pages / root`。

本地 `.env` 需要包含：

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_PIN`

如果后续 GitHub CLI 授权加入 `workflow` scope，可以再切换为 GitHub Actions 自动部署。
