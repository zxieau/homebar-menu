window.HOMEBAR_DATA = {
  barName: "Jimmy’s Home Bar",
  categories: [
    {
      id: "sweet-sour",
      shortName: "酸甜",
      name: "酸甜平衡",
      en: "Sweet & Sour",
      icon: "✦",
      intro: "柑橘酸度、糖浆圆润感和基酒香气的平衡派。"
    },
    {
      id: "refreshing",
      shortName: "清爽",
      name: "轻松畅饮",
      en: "Refreshing",
      icon: "◇",
      intro: "气泡、青柠和草本香气，适合先把夜晚打开。"
    },
    {
      id: "strong",
      shortName: "烈性",
      name: "硬核经典",
      en: "Strong",
      icon: "◆",
      intro: "酒体更厚，后劲更明显，适合慢慢喝。"
    }
  ],
  drinks: [
    {
      id: "whiskey-sour",
      number: "01",
      category: "sweet-sour",
      nameZh: "威士忌酸",
      nameEn: "Whiskey Sour",
      baseSpirit: "波本",
      flavors: ["柠檬酸香", "绵密泡沫", "圆润"],
      strength: 3,
      strengthLabel: "中等",
      description: "美格波本威士忌的橡木香碰撞新鲜黄柠檬，顶层覆有细腻蛋清泡沫。入口丝滑，酸甜清楚，尾段有温柔的威士忌香。",
      image: "./assets/images/whiskey-sour.webp",
      available: true,
      sweetnessOptions: ["标准甜", "少甜"]
    },
    {
      id: "classic-daiquiri",
      number: "02",
      category: "sweet-sour",
      nameZh: "经典大吉利",
      nameEn: "Classic Daiquiri",
      baseSpirit: "白朗姆",
      flavors: ["青柠锐酸", "甘蔗清甜", "干净"],
      strength: 3,
      strengthLabel: "中等",
      description: "白朗姆与鲜榨青柠的纯粹组合，酸甜比例直接决定它的灵魂。冰凉、利落，带一点甘蔗的清甜。",
      image: "./assets/images/classic-daiquiri.webp",
      available: true,
      sweetnessOptions: ["标准甜", "少甜"]
    },
    {
      id: "classic-gimlet",
      number: "03",
      category: "sweet-sour",
      nameZh: "经典琴蕾",
      nameEn: "Classic Gimlet",
      baseSpirit: "金酒",
      flavors: ["杜松草本", "青柠酸甜", "冷冽"],
      strength: 3,
      strengthLabel: "中等",
      description: "金酒的杜松子与草本冷冽感，被青柠的酸甜完整包裹。结构紧凑，锋芒清楚。",
      image: "./assets/images/classic-gimlet.webp",
      available: true,
      sweetnessOptions: ["标准甜", "少甜"]
    },
    {
      id: "white-lady",
      number: "04",
      category: "sweet-sour",
      nameZh: "白佳人",
      nameEn: "White Lady",
      baseSpirit: "金酒",
      flavors: ["橙皮香", "轻柔", "酸甜"],
      strength: 3,
      strengthLabel: "中等",
      description: "金酒搭配君度橙酒，带出清晰的橙皮精油香。入口轻柔，柑橘感明亮，整体比名字更有性格。",
      image: "./assets/images/white-lady.webp",
      available: true,
      sweetnessOptions: ["标准甜", "少甜"]
    },
    {
      id: "classic-margarita",
      number: "05",
      category: "sweet-sour",
      nameZh: "经典玛格丽特",
      nameEn: "Classic Margarita",
      baseSpirit: "龙舌兰",
      flavors: ["青柠明快", "微咸", "橙香"],
      strength: 3,
      strengthLabel: "中等",
      description: "银龙舌兰、君度橙酒与青柠汁的经典组合。盐边带来一点微咸，让酸度更亮，尾段有淡淡龙舌兰气息。",
      image: "./assets/images/classic-margarita.webp",
      available: true,
      sweetnessOptions: ["标准甜", "少甜"]
    },
    {
      id: "gin-tonic",
      number: "06",
      category: "refreshing",
      nameZh: "金汤力",
      nameEn: "Gin & Tonic",
      baseSpirit: "金酒",
      flavors: ["气泡清爽", "青柠", "微苦"],
      strength: 2,
      strengthLabel: "低中",
      description: "金酒、冷藏汤力水与新鲜青柠的极简组合。气泡感清爽，杜松子香气清楚，适合第一杯。",
      image: "./assets/images/gin-tonic.webp",
      available: true,
      sweetnessOptions: []
    },
    {
      id: "long-island-iced-tea",
      number: "07",
      category: "strong",
      nameZh: "长岛冰茶",
      nameEn: "Long Island Iced Tea",
      baseSpirit: "多基酒",
      flavors: ["可乐柠檬", "顺滑", "后劲强"],
      strength: 5,
      strengthLabel: "很高",
      description: "多款基酒与橙酒汇在一起，伪装成温和的冰茶色泽。喝起来顺，但后劲明确，不适合太快。",
      image: "./assets/images/long-island-iced-tea.webp",
      available: true,
      sweetnessOptions: []
    },
    {
      id: "kamikaze",
      number: "08",
      category: "strong",
      nameZh: "神风特攻队",
      nameEn: "Kamikaze",
      baseSpirit: "伏特加",
      flavors: ["青柠炸裂", "橙香", "冰冷"],
      strength: 4,
      strengthLabel: "高",
      description: "伏特加作为干净基底，放大君度橙酒和青柠的酸香。入口利落、冰凉，适合想要直接一点的朋友。",
      image: "./assets/images/kamikaze.webp",
      available: true,
      sweetnessOptions: []
    },
    {
      id: "old-fashioned",
      number: "09",
      category: "strong",
      nameZh: "古典鸡尾酒",
      nameEn: "Old Fashioned",
      baseSpirit: "波本",
      flavors: ["橙皮", "苦甜", "木质香"],
      strength: 4,
      strengthLabel: "高",
      description: "波本、糖浆与苦精在冰块融化中慢慢交融。香气浓烈，橙皮精油迷人，是适合慢慢喝的一杯。",
      image: "./assets/images/old-fashioned.webp",
      available: true,
      sweetnessOptions: []
    }
  ],
  snacks: [
    {
      id: "fries",
      nameZh: "薯条",
      nameEn: "French Fries",
      icon: "🍟",
      description: "热的、脆的、适合等第一杯酒的时候吃。",
      flavors: ["咸香", "酥脆"],
      available: true
    },
    {
      id: "popcorn-chicken",
      nameZh: "鸡米花",
      nameEn: "Popcorn Chicken",
      icon: "🍗",
      description: "一口一个的小炸物，适合配清爽或酸甜型鸡尾酒。",
      flavors: ["酥脆", "咸鲜"],
      available: true
    }
  ],
  specialBuilder: {
    moods: {
      fresh: {
        label: "清爽",
        bases: ["金酒", "伏特加", "白朗姆"],
        mixers: ["汤力水", "苏打水", "青柠汁"],
        flavor: "清爽气泡、柑橘和一点草本香",
        strength: 2
      },
      sour: {
        label: "酸甜",
        bases: ["波本", "白朗姆", "龙舌兰"],
        mixers: ["黄柠檬汁", "青柠汁", "糖浆"],
        flavor: "明亮酸度、圆润甜感和干净尾韵",
        strength: 3
      },
      mellow: {
        label: "醇厚",
        bases: ["波本", "金酒", "龙舌兰"],
        mixers: ["橙酒", "糖浆", "苦精"],
        flavor: "更厚的酒体、橙皮香和微微苦甜",
        strength: 4
      },
      wild: {
        label: "来点狠的",
        bases: ["伏特加", "波本", "多基酒"],
        mixers: ["君度", "青柠汁", "可乐"],
        flavor: "入口顺，后劲明显，带一点危险的甜感",
        strength: 5
      }
    },
    atmospheres: {
      sunset: "日落",
      rain: "雨夜",
      birthday: "生日",
      surprise: "随便玩点新的"
    },
    names: ["暮色灯影", "午夜柑橘", "雨巷酸甜", "金色偶然", "第七码头", "紫雾手记", "Jimmy 的临场发挥"]
  }
};
