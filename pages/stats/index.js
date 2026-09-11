const store = require("../../services/store")

Page({
  data: {
    kinds: 0,
    pieces: 0,
    categoryCount: 0,
    distribution: [],
    recentCount: 0,
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
        this.setData({ kinds: 0, pieces: 0, categoryCount: 0, distribution: [], recentCount: 0, loadError: e.message || "加载失败" })
      })
      .then(() => this.setData({ loading: false }))
  },

  applyView(items) {
    const byCat = {}
    let pieces = 0
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000
    let recentCount = 0
    items.forEach((it) => {
      const cat = it.category || "其他"
      byCat[cat] = (byCat[cat] || 0) + (Number(it.quantity) || 1)
      pieces += Number(it.quantity) || 1
      const t = new Date(it.recordedAt).getTime() || 0
      if (t >= weekAgo) recentCount++
    })

    const cats = Object.keys(byCat).sort((a, b) => byCat[b] - byCat[a])
    const max = cats.length ? byCat[cats[0]] : 0
    const distribution = cats.map((name) => ({
      name: name,
      count: byCat[name],
      pct: max ? Math.round((byCat[name] / max) * 100) : 0
    }))

    this.setData({
      kinds: items.length,
      pieces: pieces,
      categoryCount: cats.length,
      distribution: distribution,
      recentCount: recentCount
    })
  }
})
