// 数据层：双模式适配器
// - 云端模式（USE_CLOUD=true）：wx.cloud.callFunction -> 云函数 items -> PostgreSQL
//   数据按用户 openid 隔离，换设备登录同一微信账号即可看到同一份数据
// - 本地模式（USE_CLOUD=false）：数据存本机缓存，用于云端数据库恢复前的开发验证
// 两种模式暴露完全相同的 Promise API。

const { USE_CLOUD, FUNCTION_NAME, ENV_ID } = require("../config")

const LOCAL_KEY = "wuji_items"
const LOCAL_IMG_DIR = "wuji-images"

/* ===== 云端模式 ===== */

function callItems(action, payload) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: FUNCTION_NAME,
      data: Object.assign({ action: action }, payload || {}),
      success(res) {
        const r = res.result
        if (r && r.ok) {
          resolve(r.data)
        } else {
          reject(new Error((r && r.error) || "云函数返回异常"))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || "云函数调用失败"))
      }
    })
  })
}

/* ===== 图片上传 ===== */

// 上传图片，返回可在 <image> 中直接使用的地址：
// - 云端模式：上传云存储，返回 fileID
// - 本地模式：拷贝到用户目录，返回本地持久路径
function uploadImage(tempFilePath) {
  if (USE_CLOUD) {
    return new Promise((resolve, reject) => {
      const ext = (/\.\w+$/.exec(tempFilePath) || [".jpg"])[0]
      wx.cloud.uploadFile({
        cloudPath: "items/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ext,
        filePath: tempFilePath,
        success: (res) => resolve(res.fileID),
        fail: (err) => reject(new Error(err.errMsg || "图片上传失败"))
      })
    })
  }
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager()
    const dir = wx.env.USER_DATA_PATH + "/" + LOCAL_IMG_DIR
    const dest = dir + "/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + ".jpg"
    fs.mkdir({
      dirPath: dir,
      recursive: true,
      complete: () => {
        fs.copyFile({
          srcPath: tempFilePath,
          destPath: dest,
          success: () => resolve(dest),
          fail: (err) => reject(new Error(err.errMsg || "图片保存失败"))
        })
      }
    })
  })
}

/* ===== 本地模式 ===== */

function localRead() {
  try {
    return wx.getStorageSync(LOCAL_KEY) || []
  } catch (e) {
    return []
  }
}

function localWrite(list) {
  wx.setStorageSync(LOCAL_KEY, list)
}

function localId() {
  return "l" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

function localFindBy(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (String(list[i].id) === String(id)) return i
  }
  return -1
}

function localClear() {
  try {
    wx.removeStorageSync(LOCAL_KEY)
  } catch (e) {
    // 忽略清理失败
  }
}

/* ===== 通用 ===== */

function validateFields(fields) {
  const name = String((fields && fields.name) || "").trim()
  if (!name) {
    return Promise.reject(new Error("请填写物品名称"))
  }
  const qty = Math.floor(Number(fields.quantity))
  if (!qty || qty < 1 || qty > 9999) {
    return Promise.reject(new Error("数量需为 1-9999 的整数"))
  }
  return Promise.resolve({
    name: name,
    category: String(fields.category || "其他").trim() || "其他",
    quantity: qty,
    location: String(fields.location || "").trim(),
    note: String(fields.note || "").trim(),
    image: String(fields.image || "").trim(),
    preset: String(fields.preset || "").trim(),
    recordedAt: fields.recordedAt || new Date().toISOString()
  })
}

function sortDesc(list) {
  return list.slice().sort((a, b) => {
    const ta = new Date(a.recordedAt).getTime() || 0
    const tb = new Date(b.recordedAt).getTime() || 0
    return tb - ta
  })
}

/* ===== 对外 API ===== */

function listItems() {
  if (USE_CLOUD) {
    return callItems("list")
  }
  return Promise.resolve(sortDesc(localRead()))
}

function createItem(fields) {
  return validateFields(fields).then((clean) => {
    if (USE_CLOUD) {
      return callItems("create", { item: clean })
    }
    const list = localRead()
    const now = new Date().toISOString()
    const item = Object.assign({ id: localId(), createdAt: now, updatedAt: now }, clean)
    list.push(item)
    localWrite(list)
    return item
  })
}

function updateItem(id, fields) {
  return validateFields(fields).then((clean) => {
    if (USE_CLOUD) {
      return callItems("update", { id: String(id), item: clean })
    }
    const list = localRead()
    const idx = localFindBy(list, id)
    if (idx < 0) return Promise.reject(new Error("物品不存在或已删除"))
    const updated = Object.assign({}, list[idx], clean, { updatedAt: new Date().toISOString() })
    list[idx] = updated
    localWrite(list)
    return updated
  })
}

function deleteItem(id) {
  if (USE_CLOUD) {
    return callItems("delete", { id: String(id) }).then(() => undefined)
  }
  const list = localRead()
  const idx = localFindBy(list, id)
  if (idx < 0) return Promise.reject(new Error("物品不存在或已删除"))
  list.splice(idx, 1)
  localWrite(list)
  return Promise.resolve()
}

function isCloudMode() {
  return !!USE_CLOUD
}

function envId() {
  return ENV_ID
}

module.exports = {
  listItems,
  createItem,
  updateItem,
  deleteItem,
  uploadImage,
  localClear,
  isCloudMode,
  envId
}
