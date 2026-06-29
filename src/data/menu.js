export const categories = [
  {
    id: "sweet-sour",
    name: "酸甜平衡",
    en: "Sweet & Sour Balance",
    note: "柠檬、青柠、糖浆和烈酒刚好握手。",
    doodle: "✦"
  },
  {
    id: "refreshing",
    name: "气泡解渴",
    en: "Refreshing & Fizzy",
    note: "冰块碰杯，气泡把下班后的肩膀托起来。",
    doodle: "◌"
  },
  {
    id: "strong",
    name: "硬核经典",
    en: "Strong & High-Proof",
    note: "慢慢喝，故事会比杯子更有后劲。",
    doodle: "◆"
  }
];

export const options = ["少冰", "多冰", "偏酸", "偏甜", "低糖", "酒精加强"];

export const statusSteps = ["备杯中", "摇和中", "出杯"];

export const drinks = [
  {
    id: "whiskey-sour",
    number: "01",
    category: "sweet-sour",
    nameZh: "威士忌酸",
    nameEn: "Whiskey Sour",
    base: "波本威士忌",
    flavor: "柠檬酸香 / 绵密泡沫",
    alcohol: "中等",
    audience: "适合想要第一杯就进入状态的人。",
    tags: ["经典之选", "圆润顺口", "酸甜柔和"],
    note: "黄柠檬把波本的木质香擦亮，蛋清泡沫像街灯下的一层小云。",
    glass: "rocks",
    color: "#d69b42",
    accent: "#f5d57c"
  },
  {
    id: "classic-daiquiri",
    number: "02",
    category: "sweet-sour",
    nameZh: "经典大吉利",
    nameEn: "Classic Daiquiri",
    base: "白朗姆",
    flavor: "青柠清爽 / 甘蔗清甜",
    alcohol: "中等",
    audience: "适合喜欢干净、利落、酸甜平衡的人。",
    tags: ["清新利落", "酸甜平衡", "纯粹"],
    note: "白朗姆和青柠的直接对话，像刚下班走进晚风里。",
    glass: "coupe",
    color: "#d9d875",
    accent: "#8bc46b"
  },
  {
    id: "classic-gimlet",
    number: "03",
    category: "sweet-sour",
    nameZh: "经典琴蕾",
    nameEn: "Classic Gimlet",
    base: "金酒",
    flavor: "杜松草本 / 青柠酸甜",
    alcohol: "中高",
    audience: "适合喜欢清冷草本感的人。",
    tags: ["锋芒毕露", "草本", "青柠"],
    note: "金酒的杜松子像蓝色暮色，青柠负责把它点亮。",
    glass: "coupe",
    color: "#dce58a",
    accent: "#a6cf5f"
  },
  {
    id: "white-lady",
    number: "04",
    category: "sweet-sour",
    nameZh: "白佳人",
    nameEn: "White Lady",
    base: "金酒",
    flavor: "橙香优雅 / 酒体轻盈",
    alcohol: "中等",
    audience: "适合想喝得漂亮一点、轻盈一点的人。",
    tags: ["优雅柔美", "橙皮香", "丝滑"],
    note: "橙皮精油和金酒轻轻贴近，像复古菜单边上的一笔花体字。",
    glass: "coupe",
    color: "#f3c584",
    accent: "#ea8f42"
  },
  {
    id: "classic-margarita",
    number: "05",
    category: "sweet-sour",
    nameZh: "经典玛格丽特",
    nameEn: "Classic Margarita",
    base: "龙舌兰",
    flavor: "青柠明快 / 盐边提味",
    alcohol: "中高",
    audience: "适合喜欢微咸、微酸和一点烟熏感的人。",
    tags: ["盐边好样", "明快", "微咸"],
    note: "龙舌兰、橙酒和青柠在盐边旁边碰面，像周末正式开始的暗号。",
    glass: "margarita",
    color: "#e7d36b",
    accent: "#94c96b"
  },
  {
    id: "gin-tonic",
    number: "06",
    category: "refreshing",
    nameZh: "金汤力",
    nameEn: "Gin & Tonic",
    base: "金酒",
    flavor: "汤力清香 / 气泡爽口",
    alcohol: "低中",
    audience: "适合边聊天边慢慢喝的人。",
    tags: ["气泡满满", "清爽", "不费劲"],
    note: "冰块叮当，青柠片贴着杯壁，气泡把夜晚调到轻松模式。",
    glass: "highball",
    color: "#dcebd4",
    accent: "#89c768"
  },
  {
    id: "long-island-iced-tea",
    number: "07",
    category: "strong",
    nameZh: "长岛冰茶",
    nameEn: "Long Island Iced Tea",
    base: "伏特加 / 金酒 / 朗姆 / 龙舌兰",
    flavor: "可乐柠檬 / 后劲十足",
    alcohol: "高",
    audience: "适合今晚不想太清醒的人。",
    tags: ["超人气", "后劲足", "层次丰富"],
    note: "它看起来像冰茶，实际上在桌底偷偷藏了一整支乐队。",
    glass: "highball",
    color: "#9d5d32",
    accent: "#f0a84a"
  },
  {
    id: "kamikaze",
    number: "08",
    category: "strong",
    nameZh: "神风特攻队",
    nameEn: "Kamikaze",
    base: "伏特加",
    flavor: "柠檬利落 / 冰冷刺激",
    alcohol: "中高",
    audience: "适合想要干净、直接、醒神的一杯。",
    tags: ["干净利落", "冰力足", "酸味清亮"],
    note: "伏特加的干净底色，让青柠和橙香像小箭头一样飞出去。",
    glass: "martini",
    color: "#cfe27a",
    accent: "#92c957"
  },
  {
    id: "old-fashioned",
    number: "09",
    category: "strong",
    nameZh: "古典鸡尾酒",
    nameEn: "Old Fashioned",
    base: "波本威士忌",
    flavor: "焦糖木香 / 苦甜绵长",
    alcohol: "高",
    audience: "适合想慢慢喝、慢慢讲故事的人。",
    tags: ["硬核经典", "橙皮香", "慢饮"],
    note: "糖、苦精、橙皮和波本在冰块里慢慢交换秘密。",
    glass: "rocks",
    color: "#b5692f",
    accent: "#f1a33b"
  }
];
