// 云函数 items：物记物品表 CRUD（PostgreSQL）
// 身份：微信小程序调用时通过 getWXContext().OPENID 获取（小程序关联环境后自动透传），
//       _debugOpenid 仅用于管理端（MCP）冒烟测试，真实小程序调用不会走到该分支。
const cloud = require("wx-server-sdk")
const cloudbase = require("@cloudbase/node-sdk")

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const app = cloudbase.init({ env: cloudbase.SYMBOL_CURRENT_ENV })
const db = app.rdb()

const TABLE = "items"

function getOpenid(event) {
  const wxContext = cloud.getWXContext()
  if (wxContext && wxContext.OPENID) return wxContext.OPENID
  if (event.userInfo && event.userInfo.openId) return event.userInfo.openId
  if (event._debugOpenid) return event._debugOpenid
  return ""
}

// PG 行 -> 前端对象（snake_case -> camelCase）
function rowToItem(row) {
  return {
    id: String(row.id),
    name: row.name,
    category: row.category,
    quantity: Number(row.quantity) || 1,
    location: row.location || "",
    note: row.note || "",
    image: row.image || "",
    preset: row.preset || "",
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function shortStr(v, max) {
  return String(v || "").trim().slice(0, max)
}

// 前端字段 -> PG 列（白名单，防注入无关字段）
function itemToRowFields(item) {
  const src = item || {}
  const name = shortStr(src.name, 30)
  if (!name) throw new Error("请填写物品名称")
  const qty = Math.floor(Number(src.quantity))
  if (!qty || qty < 1 || qty > 9999) throw new Error("数量需为 1-9999 的整数")
  return {
    name: name,
    category: shortStr(src.category, 10) || "其他",
    quantity: qty,
    location: shortStr(src.location, 30),
    note: shortStr(src.note, 200),
    image: shortStr(src.image, 512),
    preset: shortStr(src.preset, 32),
    recorded_at: src.recordedAt ? new Date(src.recordedAt).toISOString() : new Date().toISOString()
  }
}

function toId(rawId) {
  const id = Number(rawId)
  if (!id || isNaN(id)) throw new Error("无效的物品 id")
  return id
}

exports.main = async (event) => {
  const openid = getOpenid(event)
  if (!openid) {
    return { ok: false, error: "无法获取用户身份（OPENID），请检查小程序是否已关联该云环境" }
  }
  const action = event.action

  try {
    if (action === "list") {
      const { data, error } = await db
        .from(TABLE)
        .select("*")
        .eq("user_id", openid)
        .order("recorded_at", { ascending: false })
      if (error) throw new Error(error.message || "查询失败")
      return { ok: true, data: (data || []).map(rowToItem) }
    }

    if (action === "create") {
      const fields = itemToRowFields(event.item)
      const now = new Date().toISOString()
      const { data, error } = await db
        .from(TABLE)
        .insert(Object.assign({ user_id: openid }, fields, { created_at: now, updated_at: now }))
        .select("*")
      if (error) throw new Error(error.message || "写入失败")
      return { ok: true, data: rowToItem((data && data[0]) || {}) }
    }

    if (action === "update") {
      const id = toId(event.id)
      const fields = itemToRowFields(event.item)
      fields.updated_at = new Date().toISOString()
      const { data, error } = await db
        .from(TABLE)
        .update(fields)
        .eq("id", id)
        .eq("user_id", openid)
        .select("*")
      if (error) throw new Error(error.message || "更新失败")
      if (!data || data.length === 0) throw new Error("物品不存在或已删除")
      return { ok: true, data: rowToItem(data[0]) }
    }

    if (action === "delete") {
      const id = toId(event.id)
      const { data, error } = await db
        .from(TABLE)
        .delete()
        .eq("id", id)
        .eq("user_id", openid)
        .select("id")
      if (error) throw new Error(error.message || "删除失败")
      if (!data || data.length === 0) throw new Error("物品不存在或已删除")
      return { ok: true, data: null }
    }

    return { ok: false, error: "未知操作：" + action }
  } catch (e) {
    return { ok: false, error: e.message || String(e) }
  }
}
