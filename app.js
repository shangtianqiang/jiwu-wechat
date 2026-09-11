const { USE_CLOUD, ENV_ID } = require("./config")

App({
  globalData: {
    cloudReady: false
  },

  onLaunch() {
    if (USE_CLOUD && wx.cloud) {
      try {
        wx.cloud.init({ env: ENV_ID, traceUser: true })
        this.globalData.cloudReady = true
      } catch (e) {
        console.warn("云开发初始化失败，回落本地模式：", e)
      }
    }
  }
})
