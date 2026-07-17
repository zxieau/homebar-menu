export const categories = [
  {
    id: "sweet-sour",
    code: "A",
    name: "酸甜平衡",
    en: "Sweet & Sour",
    shortLabel: "Sour 酸甜",
    note: "柠檬、青柠、糖浆和烈酒的清楚平衡。"
  },
  {
    id: "refreshing",
    code: "B",
    name: "气泡解渴",
    en: "Refreshing",
    shortLabel: "Fizz 清爽",
    note: "冰块、气泡和青柠，适合边聊边喝。"
  },
  {
    id: "strong",
    code: "C",
    name: "硬核经典",
    en: "Strong Classics",
    shortLabel: "Strong 烈酒",
    note: "酒感更直接，适合慢慢喝。"
  },
  {
    id: "snacks",
    code: "D",
    name: "小食",
    en: "Snacks",
    shortLabel: "Snacks 小食",
    note: "给今晚垫一点胃，也给聊天留一点手感。"
  },
  {
    id: "mystery",
    code: "E",
    name: "特调",
    en: "Mystery",
    shortLabel: "Mystery 特调",
    note: "不想选的时候，把今晚交给吧台。"
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
    fallbackImage: "assets/images/whiskey-sour.jpg",
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
    fallbackImage: "assets/images/classic-daiquiri.jpg",
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
    fallbackImage: "assets/images/classic-gimlet.jpg",
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
    fallbackImage: "assets/images/white-lady.jpg",
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
    fallbackImage: "assets/images/classic-margarita.jpg",
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
    fallbackImage: "assets/images/gin-tonic.jpg",
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
    fallbackImage: "assets/images/long-island-iced-tea.jpg",
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
    fallbackImage: "assets/images/kamikaze.jpg",
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
    fallbackImage: "assets/images/old-fashioned.jpg",
    sweetness: false,
    available: true
  },
  {
    id: "fries",
    type: "snack",
    number: "10",
    category: "snacks",
    nameZh: "薯条",
    nameEn: "House Fries",
    base: "小食",
    flavor: "热乎 / 咸香 / 适合垫胃",
    alcohol: "",
    audience: "适合先来一口，等第一杯酒慢慢出场。",
    tags: ["热乎", "咸香", "下酒"],
    note: "炸得脆一点，配一点酱，适合所有人边聊边拿。",
    image: "assets/images/vintage/fries.webp",
    fallbackImage: "assets/images/fries.jpg",
    sweetness: false,
    available: true,
    prepCue: {
      ingredients: ["薯条", "盐", "番茄酱 / 蛋黄酱"],
      method: "现炸或空气炸锅复热到外脆内软，出锅轻撒盐。",
      glass: "小食篮 / 盘",
      garnish: "可加一点黑胡椒或欧芹碎。",
      prepNotes: "先上桌最稳，适合和第一轮清爽酒一起出。"
    }
  },
  {
    id: "popcorn-chicken",
    type: "snack",
    number: "11",
    category: "snacks",
    nameZh: "鸡米花",
    nameEn: "Popcorn Chicken",
    base: "小食",
    flavor: "酥脆 / 咸香 / 一口一个",
    alcohol: "",
    audience: "适合有人喊饿，但还想继续喝的人。",
    tags: ["酥脆", "一口", "热食"],
    note: "小块鸡米花，热的时候最好吃，旁边放一小碟蘸酱。",
    image: "assets/images/vintage/popcorn-chicken.webp",
    fallbackImage: "assets/images/popcorn-chicken.jpg",
    sweetness: false,
    available: true,
    prepCue: {
      ingredients: ["鸡米花", "蘸酱", "黑胡椒"],
      method: "炸至金黄或空气炸锅复热，保持外层脆感。",
      glass: "小篮 / 深盘",
      garnish: "配牙签和一小碟酱。",
      prepNotes: "热食优先出，避免放久回软。"
    }
  },
  {
    id: "bar-snacks",
    type: "snack",
    number: "12",
    category: "snacks",
    nameZh: "小零食",
    nameEn: "Bar Snacks",
    base: "小食",
    flavor: "薯片 / 膨化 / 轻松",
    alcohol: "",
    audience: "适合不想吃太正式，只想桌上有点东西的人。",
    tags: ["薯片", "膨化", "分享"],
    note: "薯片、虾片、膨化圈这类轻松小零食，随手拼一小盘就很适合聊天。",
    image: "assets/images/vintage/bar-snacks.webp",
    fallbackImage: "assets/images/bar-snacks.jpg",
    sweetness: false,
    available: true,
    prepCue: {
      ingredients: ["薯片", "虾片 / 膨化食品", "咸味小零食"],
      method: "按家里现有薯片和膨化小食拼盘，咸口为主，避免太甜抢酒香。",
      glass: "小碟 / 木盘",
      garnish: "可以不用装饰，保持轻松好拿。",
      prepNotes: "适合作为桌面常驻小食，不需要按杯次等待。"
    }
  },
  {
    id: "dealer-choice",
    type: "custom",
    number: "13",
    category: "mystery",
    nameZh: "随便来点什么",
    nameEn: "Dealer’s Choice",
    base: "由你选择",
    flavor: "基酒 + 风味偏好",
    alcohol: "可调",
    audience: "适合今晚不想做选择，但想喝一杯专属的人。",
    tags: ["神秘", "专属", "特调"],
    note: "选一个基酒和一个风味方向，吧台会给你变出一杯今晚限定。",
    image: "assets/images/vintage/dealer-choice.webp",
    fallbackImage: "assets/images/dealer-choice.jpg",
    sweetness: false,
    available: true
  }
];

export const dealerBaseOptions = [
  { id: "gin", labelEn: "Gin", labelZh: "金酒", character: "草本清冷", core: "金酒 45ml" },
  { id: "bourbon", labelEn: "Bourbon", labelZh: "波本", character: "木质圆润", core: "波本 45ml" },
  { id: "rum", labelEn: "Rum", labelZh: "朗姆", character: "甘蔗暖甜", core: "白朗姆 45ml" },
  { id: "tequila", labelEn: "Tequila", labelZh: "龙舌兰", character: "明快微咸", core: "龙舌兰 45ml" },
  { id: "vodka", labelEn: "Vodka", labelZh: "伏特加", character: "干净利落", core: "伏特加 45ml" }
];

export const dealerFlavorOptions = [
  {
    id: "citrus",
    labelEn: "Citrus",
    labelZh: "偏酸清爽",
    tone: "青柠和柠檬把酒香擦亮",
    ingredients: ["新鲜柠檬汁 20ml", "糖浆 12ml"],
    method: "加冰摇和 10 秒，滤入冰镇杯。",
    garnish: "柠檬皮 / 青柠片"
  },
  {
    id: "sweet",
    labelEn: "Soft Sweet",
    labelZh: "柔和偏甜",
    tone: "甜感更柔和，入口更圆",
    ingredients: ["柑橘汁 15ml", "糖浆 15ml", "橙酒 10ml"],
    method: "加冰摇和，保持酸甜平衡。",
    garnish: "橙皮 / 樱桃"
  },
  {
    id: "strong",
    labelEn: "Spirit Forward",
    labelZh: "酒感明显",
    tone: "酒体站在前面，后味更长",
    ingredients: ["安戈斯图拉苦精 2 dash", "糖浆 5ml"],
    method: "搅拌至冰镇，滤入装大冰块的古典杯。",
    garnish: "橙皮"
  },
  {
    id: "fizzy",
    labelEn: "Fizzy",
    labelZh: "气泡轻松",
    tone: "气泡把酒感推轻一点",
    ingredients: ["柠檬汁 15ml", "糖浆 10ml", "苏打水补满"],
    method: "摇和基酒、酸和糖，入杯后补苏打轻搅。",
    garnish: "青柠角 / 薄荷"
  }
];
