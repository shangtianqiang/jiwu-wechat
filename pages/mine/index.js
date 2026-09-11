const store = require("../../services/store")

Page({
  data: {
    cloudReady: false,
    envId: "",
    kinds: 0,
    pieces: 0,
    categoryCount: 0,
    imgCount: 0
  },

  onShow() {
    this.reload()
  },

  reload() {
    const app = getApp()
    return store
      .listItems()
      .then((items) => {
        const byCat = {}
        let pieces = 0
        let imgCount = 0
        ;(items || []).forEach((it) => {
          byCat[it.category || "其他"] = true
          pieces += Number(it.quantity) || 1
          if (it.image || it.preset) imgCount++
        })
        this.setData({
          cloudReady: app.globalData.cloudReady,
          envId: store.envId(),
          kinds: (items || []).length,
          pieces: pieces,
          categoryCount: Object.keys(byCat).length,
          imgCount: imgCount
        })
      })
      .catch(() => {
        this.setData({
          cloudReady: app.globalData.cloudReady,
          envId: store.envId()
        })
      })
  },

  onClearLocal() {
    if (store.isCloudMode()) {
      wx.showToast({ title: "云端模式下数据在服务端管理", icon: "none" })
      return
    }
    wx.showModal({
      title: "清空本机数据",
      content: "将删除本机缓存的所有物品记录，且不可恢复。确定继续吗？",
      confirmText: "清空",
      confirmColor: "#D94040",
      success: (res) => {
        if (!res.confirm) return
        store.localClear()
        wx.showToast({ title: "已清空", icon: "success" })
        this.reload()
      }
    })
  },

  onAbout() {
    wx.showModal({
      title: "关于物记",
      content: "个人物品记录小工具 v1.0\n数据存储：微信云开发（PostgreSQL）\n本机模式：数据仅存当前设备",
      showCancel: false,
      confirmText: "知道了"
    })
  }
})
