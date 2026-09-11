const store = require("../../services/store")
const format = require("../../utils/format")
const image = require("../../utils/image")
const { PRESET_CATEGORIES } = require("../../config")

Page({
  data: {
    header: { date: "", weekday: "" },
    cloudReady: false,
    keyword: "",
    groups: [],
    kinds: 0,
    pieces: 0,
    categoryCount: 0,
    loading: true,
    loadError: ""
  },

  allItems: [],

  onLoad() {
    this.setData({ header: format.headerInfo() })
  },

  onShow() {
    this.reload()
  },

  onPullDownRefresh() {
    this.reload().then(() => wx.stopPullDownRefresh())
  },

  reload() {
    const app = getApp()
    this.setData({
      cloudReady: app.globalData.cloudReady,
      loading: true,
      loadError: ""
    })
    return store
      .listItems()
      .then((items) => {
        this.allItems = items || []
        this.applyView()
      })
      .catch((e) => {
        this.allItems = []
        this.setData({ groups: [], kinds: 0, pieces: 0, categoryCount: 0, loadError: e.message || "加载失败" })
      })
      .then(() => this.setData({ loading: false }))
  },

  // 搜索过滤 + 按分类分组（预设分类在前，自定义分类按名称排后）
  applyView() {
    const kw = this.data.keyword.trim().toLowerCase()
    const filtered = this.allItems.filter((it) => {
      if (!kw) return true
      const hay = [it.name, it.location, it.note, it.category]
        .map((f) => String(f || "").toLowerCase())
        .join("\n")
      return hay.indexOf(kw) >= 0
    })

    const orderIndex = {}
    PRESET_CATEGORIES.forEach((c, i) => { orderIndex[c] = i })
    const catNames = []
    const byCat = {}
    let pieces = 0
    filtered.forEach((it) => {
      const cat = it.category || "其他"
      if (!byCat[cat]) {
        byCat[cat] = []
        catNames.push(cat)
      }
      const qty = Number(it.quantity) || 1
      pieces += qty
      byCat[cat].push({
        id: String(it.id),
        name: it.name,
        quantity: qty,
        location: it.location || "",
        note: it.note || "",
        img: image.resolveItemImage(it),
        dateLabel: format.formatShortDate(it.recordedAt)
      })
    })

    catNames.sort((a, b) => {
      const ia = orderIndex.hasOwnProperty(a) ? orderIndex[a] : PRESET_CATEGORIES.length
      const ib = orderIndex.hasOwnProperty(b) ? orderIndex[b] : PRESET_CATEGORIES.length
      if (ia !== ib) return ia - ib
      return a.localeCompare(b, "zh")
    })

    const groups = catNames.map((name) => ({
      name: name,
      count: byCat[name].length,
      items: byCat[name]
    }))

    this.setData({
      groups: groups,
      kinds: filtered.length,
      pieces: pieces,
      categoryCount: groups.length
    })
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value }, () => this.applyView())
  },

  onClearSearch() {
    this.setData({ keyword: "" }, () => this.applyView())
  },

  onAdd() {
    wx.navigateTo({ url: "/pages/edit/index" })
  },

  onItemTap(e) {
    wx.navigateTo({ url: "/pages/edit/index?id=" + e.currentTarget.dataset.id })
  },

  // 长按快捷删除：先选操作，再弹确认框（二次确认）
  onItemLongPress(e) {
    const id = String(e.currentTarget.dataset.id)
    wx.showActionSheet({
      itemList: ["删除该物品"],
      itemColor: "#D94040",
      success: () => this.confirmDelete(id),
      fail: () => {}
    })
  },

  confirmDelete(id) {
    const item = this.allItems.find((it) => String(it.id) === String(id))
    wx.showModal({
      title: "删除物品",
      content: "确定删除「" + ((item && item.name) || "") + "」吗？删除后不可恢复。",
      confirmText: "删除",
      confirmColor: "#D94040",
      success: (res) => {
        if (!res.confirm) return
        store
          .deleteItem(id)
          .then(() => {
            wx.showToast({ title: "已删除", icon: "success" })
            this.reload()
          })
          .catch((err) => {
            wx.showToast({ title: err.message || "删除失败", icon: "none" })
          })
      }
    })
  }
})
