export const categories = [
  {
    id: "sweet-sour",
    code: "A",
    name: "酸甜平衡",
    en: "Sweet & Sour",
    note: "柠檬、青柠、糖浆和烈酒的清楚平衡。"
  },
  {
    id: "refreshing",
    code: "B",
    name: "气泡解渴",
    en: "Refreshing",
    note: "冰块、气泡和青柠，适合边聊边喝。"
  },
  {
    id: "strong",
    code: "C",
    name: "硬核经典",
    en: "Strong Classics",
    note: "酒感更直接，适合慢慢喝。"
  }
];

export const sweetnessOptions = [
  { id: "less-sweet", labelEn: "Less Sweet", labelZh: "少甜" },
  { id: "house-sweet", labelEn: "House Sweet", labelZh: "标准甜" }
];

export const optionGroups = [
  {
    id: "ice",
    title: "Ice",
    type: "single",
    options: [
      { id: "less-ice", labelEn: "Less Ice", labelZh: "少冰" },
      { id: "extra-ice", labelEn: "Extra Ice", labelZh: "多冰" }
    ]
  },
  {
    id: "house-adjustments",
    title: "House Adjustments",
    type: "multi",
    options: [
      { id: "more-sour", labelEn: "More Sour", labelZh: "偏酸" },
      { id: "stronger", labelEn: "Stronger", labelZh: "酒精加强" }
    ]
  }
];

export const statusSteps = [
  { id: "queued", labelEn: "Queued", labelZh: "排队中" },
  { id: "mixing", labelEn: "Mixing", labelZh: "调制中" },
  { id: "served", labelEn: "Served", labelZh: "已完成" }
];

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
    tags: ["酸甜柔和", "圆润", "泡沫"],
    note: "黄柠檬把波本的木质香擦亮，入口圆润，酸甜收得干净。",
    image: "assets/images/vintage/whiskey-sour.webp",
    fallbackImage: "assets/images/whiskey-sour.webp",
    sweetness: true,
    available: true
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
    tags: ["清新", "利落", "青柠"],
    note: "白朗姆和青柠的直接组合，清爽、干净，不绕弯。",
    image: "assets/images/vintage/classic-daiquiri.webp",
    fallbackImage: "assets/images/classic-daiquiri.webp",
    sweetness: true,
    available: true
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
    tags: ["草本", "青柠", "清冽"],
    note: "金酒的杜松草本感更明显，青柠让整体变得锋利清楚。",
    image: "assets/images/vintage/classic-gimlet.webp",
    fallbackImage: "assets/images/classic-gimlet.webp",
    sweetness: true,
    available: true
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
    audience: "适合想喝得轻盈、漂亮一点的人。",
    tags: ["橙香", "轻盈", "柔和"],
    note: "金酒、橙酒和柠檬的组合，香气优雅，酒体轻盈。",
    image: "assets/images/vintage/white-lady.webp",
    fallbackImage: "assets/images/white-lady.webp",
    sweetness: true,
    available: true
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
    audience: "适合喜欢微咸、微酸和龙舌兰香气的人。",
    tags: ["盐边", "明快", "微咸"],
    note: "龙舌兰、橙酒和青柠，盐边把酸味和酒香提得更清楚。",
    image: "assets/images/vintage/classic-margarita.webp",
    fallbackImage: "assets/images/classic-margarita.webp",
    sweetness: true,
    available: true
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
    tags: ["气泡", "清爽", "轻松"],
    note: "金酒、汤力水和青柠，冰块足，气泡感清楚。",
    image: "assets/images/vintage/gin-tonic.webp",
    fallbackImage: "assets/images/gin-tonic.webp",
    sweetness: false,
    available: true
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
    tags: ["后劲", "酸甜", "长饮"],
    note: "看起来轻松，酒感其实很足。适合慢一点喝。",
    image: "assets/images/vintage/long-island-iced-tea.webp",
    fallbackImage: "assets/images/long-island-iced-tea.webp",
    sweetness: false,
    available: true
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
    tags: ["冰冷", "直接", "酸感"],
    note: "伏特加打底，青柠和橙香负责把酸感拉出来。",
    image: "assets/images/vintage/kamikaze.webp",
    fallbackImage: "assets/images/kamikaze.webp",
    sweetness: false,
    available: true
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
    audience: "适合想慢慢喝、酒感明显的人。",
    tags: ["经典", "苦甜", "慢饮"],
    note: "糖、苦精、橙皮和波本，酒感厚，余味更长。",
    image: "assets/images/vintage/old-fashioned.webp",
    fallbackImage: "assets/images/old-fashioned.webp",
    sweetness: false,
    available: true
  }
];
