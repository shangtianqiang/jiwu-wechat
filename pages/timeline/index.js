const store = require("../../services/store")
const format = require("../../utils/format")
const image = require("../../utils/image")

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

Page({
  data: {
    days: [],
    loading: true,
    loadError: ""
  },

  onShow() {
    this.reload()
  },

  onPullDownRefresh() {
    this.reload().then(() => wx.stopPullDownRefresh())
  },

  reload() {
    this.setData({ loading: true, loadError: "" })
    return store
      .listItems()
      .then((items) => {
        this.applyView(items || [])
      })
      .catch((e) => {
        this.setData({ days: [], loadError: e.message || "加载失败" })
      })
      .then(() => this.setData({ loading: false }))
  },

  // 按录入时间的自然日分组，倒序展示
  applyView(items) {
    const byDay = {}
    items.forEach((it) => {
      const d = new Date(it.recordedAt)
      if (isNaN(d.getTime())) return
      const key = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate()
      if (!byDay[key]) {
        byDay[key] = {
          key: key,
          label: (d.getMonth() + 1) + "月" + d.getDate() + "日 " + WEEKDAYS[d.getDay()],
          items: []
        }
      }
      byDay[key].items.push({
        id: String(it.id),
        name: it.name,
        quantity: Number(it.quantity) || 1,
        location: it.location || "",
        note: it.note || "",
        img: image.resolveItemImage(it),
        timeLabel: format.formatDateTime(it.recordedAt).slice(11, 16)
      })
    })

    const days = Object.keys(byDay)
      .sort((a, b) => {
        const pa = a.split("-").map(Number)
        const pb = b.split("-").map(Number)
        for (let i = 0; i < 3; i++) {
          if (pb[i] !== pa[i]) return pb[i] - pa[i]
        }
        return 0
      })
      .map((k) => byDay[k])

    this.setData({ days: days })
  },

  onItemTap(e) {
    wx.navigateTo({ url: "/pages/edit/index?id=" + e.currentTarget.dataset.id })
  }
})
