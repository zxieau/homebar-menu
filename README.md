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

## 部署

运行 `pnpm build` 生成 `dist/`。Vite 已配置 GitHub Pages 项目路径 `/homebar-menu/`。
