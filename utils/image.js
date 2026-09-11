// 物品图片解析：上传图 > 图库预设 > 分类默认图 > 包裹兜底
const { PRESET_IMAGES, CATEGORY_DEFAULT_IMAGE } = require("../config")

const PRESET_MAP = {}
PRESET_IMAGES.forEach((p) => { PRESET_MAP[p.key] = p.src })

function resolveItemImage(item) {
  if (!item) return PRESET_MAP.package
  if (item.image) return item.image
  if (item.preset && PRESET_MAP[item.preset]) return PRESET_MAP[item.preset]
  const catKey = CATEGORY_DEFAULT_IMAGE[item.category || "其他"]
  return (catKey && PRESET_MAP[catKey]) || PRESET_MAP.package
}

module.exports = {
  resolveItemImage
}
