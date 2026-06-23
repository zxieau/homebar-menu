# Jimmy’s Home Bar

一个手机优先的私人鸡尾酒菜单。朋友可以浏览酒单、选择甜度和备注、加入购物车，并复制订单到微信。

线上菜单：<https://zxieau.github.io/homebar-menu/>

打印二维码卡片：<https://zxieau.github.io/homebar-menu/share-card.html>

## 本地预览

在项目目录运行：

```bash
python3 -m http.server 8000
```

然后访问 `http://localhost:8000`。

## 修改菜单

酒品、分类和售罄状态都在 `data.js` 中维护。将某款酒的 `available` 改为 `false`，页面就会显示“今晚售罄”并禁止点单。

## 部署

网站为纯静态页面，可直接从仓库根目录部署到 GitHub Pages。
