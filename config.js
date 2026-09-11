// 全局配置
module.exports = {
  // 云开发环境 ID（CloudBase 控制台创建）
  ENV_ID: "test-d5granv4h812f9a86",

  // 云端数据层开关：
  // true  = 数据走云函数 items + PostgreSQL（跨设备同步）
  // false = 数据暂存本机缓存（云端数据库恢复后再切换）
  USE_CLOUD: false,

  // 云函数名
  FUNCTION_NAME: "items",

  // 预设分类（编辑页可选项 + 列表页分组排序依据）
  PRESET_CATEGORIES: [
    "数码电子",
    "服饰鞋包",
    "图书文具",
    "厨房用品",
    "家居日用",
    "美妆个护",
    "运动户外",
    "医药保健",
    "工具五金",
    "其他"
  ],

  // 分类默认图（未上传且未选图库时，按分类显示）
  CATEGORY_DEFAULT_IMAGE: {
    "数码电子": "smartphone",
    "服饰鞋包": "tshirt",
    "图书文具": "books",
    "厨房用品": "pan",
    "家居日用": "sofa",
    "美妆个护": "lipstick",
    "运动户外": "soccer",
    "医药保健": "pills",
    "工具五金": "screwdriver",
    "乐器": "guitar",
    "其他": "package"
  },

  // 预设图库（编辑页可直接选用，白底实拍产品图）
  PRESET_IMAGES: [
    { key: "laptop", label: "电脑", src: "/assets/presets/laptop.jpg" },
    { key: "smartphone", label: "手机", src: "/assets/presets/smartphone.jpg" },
    { key: "headphones", label: "耳机", src: "/assets/presets/headphones.jpg" },
    { key: "tv", label: "电视", src: "/assets/presets/tv.jpg" },
    { key: "camera", label: "相机", src: "/assets/presets/camera.jpg" },
    { key: "watch", label: "手表", src: "/assets/presets/watch.jpg" },
    { key: "gamepad", label: "游戏机", src: "/assets/presets/gamepad.jpg" },
    { key: "tshirt", label: "衣服", src: "/assets/presets/tshirt.jpg" },
    { key: "sneakers", label: "鞋履", src: "/assets/presets/sneakers.jpg" },
    { key: "handbag", label: "挎包", src: "/assets/presets/handbag.jpg" },
    { key: "backpack", label: "背包", src: "/assets/presets/backpack.jpg" },
    { key: "books", label: "书籍", src: "/assets/presets/books.jpg" },
    { key: "guitar", label: "吉他", src: "/assets/presets/guitar.jpg" },
    { key: "pan", label: "厨具", src: "/assets/presets/pan.jpg" },
    { key: "sofa", label: "沙发", src: "/assets/presets/sofa.jpg" },
    { key: "lamp", label: "台灯", src: "/assets/presets/lamp.jpg" },
    { key: "lipstick", label: "美妆", src: "/assets/presets/lipstick.jpg" },
    { key: "soccer", label: "运动", src: "/assets/presets/soccer.jpg" },
    { key: "pills", label: "药品", src: "/assets/presets/pills.jpg" },
    { key: "screwdriver", label: "工具", src: "/assets/presets/screwdriver.jpg" },
    { key: "bag", label: "购物袋", src: "/assets/presets/bag.jpg" },
    { key: "package", label: "包裹", src: "/assets/presets/package.jpg" }
  ]
}
