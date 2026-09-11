const store = require("../../services/store")
const format = require("../../utils/format")
const { PRESET_CATEGORIES, PRESET_IMAGES } = require("../../config")

Page({
  data: {
    isEdit: false,
    saving: false,
    uploading: false,
    categoryOptions: PRESET_CATEGORIES.slice(),
    presetImages: PRESET_IMAGES,
    customizing: false,
    customName: "",
    today: "",
    form: {
      name: "",
      category: "其他",
      quantity: 1,
      location: "",
      note: "",
      image: "",
      preset: "",
      date: "",
      time: ""
    }
  },

  itemId: "",

  onLoad(options) {
    const nowPick = format.nowPickValues()
    this.setData({ today: nowPick.date })
    if (options && options.id) {
      wx.setNavigationBarTitle({ title: "编辑物品" })
      this.itemId = String(options.id)
      this.setData({ isEdit: true })
      this.loadItem()
    } else {
      wx.setNavigationBarTitle({ title: "新增物品" })
      this.setData({
        "form.date": nowPick.date,
        "form.time": nowPick.time
      })
    }
  },

  loadItem() {
    store
      .listItems()
      .then((items) => {
        const it = (items || []).find((x) => String(x.id) === this.itemId)
        if (!it) {
          wx.showToast({ title: "物品不存在或已删除", icon: "none" })
          setTimeout(() => wx.navigateBack(), 800)
          return
        }
        const pick = format.dateToPickValues(it.recordedAt)
        const options = this.data.categoryOptions.slice()
        if (options.indexOf(it.category) < 0) options.push(it.category)
        this.setData({
          categoryOptions: options,
          form: {
            name: it.name,
            category: it.category,
            quantity: Number(it.quantity) || 1,
            location: it.location || "",
            note: it.note || "",
            image: it.image || "",
            preset: it.preset || "",
            date: pick.date,
            time: pick.time
          }
        })
      })
      .catch((e) => {
        wx.showToast({ title: e.message || "加载失败", icon: "none" })
      })
  },

  /* ===== 图片 ===== */

  onUploadImage() {
    if (this.data.uploading) return
    wx.chooseMedia({
      count: 1,
      mediaType: ["image"],
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const temp = res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath
        if (!temp) return
        this.setData({ uploading: true })
        store
          .uploadImage(temp)
          .then((saved) => {
            this.setData({ "form.image": saved, "form.preset": "", uploading: false })
          })
          .catch((e) => {
            this.setData({ uploading: false })
            wx.showToast({ title: e.message || "图片保存失败", icon: "none" })
          })
      },
      fail: () => {}
    })
  },

  onPickPreset(e) {
    const key = e.currentTarget.dataset.key
    if (this.data.form.preset === key) {
      this.setData({ "form.preset": "" })
    } else {
      this.setData({ "form.preset": key, "form.image": "" })
    }
  },

  onClearImage() {
    this.setData({ "form.image": "" })
  },

  /* ===== 表单事件 ===== */

  onName(e) { this.setData({ "form.name": e.detail.value }) },
  onLocation(e) { this.setData({ "form.location": e.detail.value }) },
  onNote(e) { this.setData({ "form.note": e.detail.value }) },
  onQuantity(e) {
    const n = parseInt(e.detail.value, 10)
    this.setData({ "form.quantity": isNaN(n) ? "" : n })
  },
  onStepUp() {
    const n = parseInt(this.data.form.quantity, 10) || 0
    this.setData({ "form.quantity": Math.min(n + 1, 9999) })
  },
  onStepDown() {
    const n = parseInt(this.data.form.quantity, 10) || 2
    this.setData({ "form.quantity": Math.max(n - 1, 1) })
  },

  onPickCat(e) {
    this.setData({ "form.category": e.currentTarget.dataset.cat, customizing: false })
  },

  onToggleCustom() {
    this.setData({ customizing: !this.data.customizing })
  },

  onCustomName(e) {
    this.setData({ customName: e.detail.value })
  },

  onConfirmCustom() {
    const name = this.data.customName.trim()
    if (!name) {
      wx.showToast({ title: "请输入分类名", icon: "none" })
      return
    }
    const options = this.data.categoryOptions.slice()
    if (options.indexOf(name) < 0) options.push(name)
    this.setData({
      categoryOptions: options,
      "form.category": name,
      customizing: false,
      customName: ""
    })
  },

  onDateChange(e) { this.setData({ "form.date": e.detail.value }) },
  onTimeChange(e) { this.setData({ "form.time": e.detail.value }) },

  /* ===== 保存 / 删除 ===== */

  onSave() {
    if (this.data.saving) return
    const f = this.data.form
    const payload = {
      name: f.name,
      category: f.category,
      quantity: parseInt(f.quantity, 10) || 1,
      location: f.location,
      note: f.note,
      image: f.image,
      preset: f.preset,
      recordedAt: format.pickToIso(f.date, f.time)
    }
    this.setData({ saving: true })
    const op = this.data.isEdit
      ? store.updateItem(this.itemId, payload)
      : store.createItem(payload)
    op
      .then(() => {
        wx.showToast({ title: this.data.isEdit ? "已保存" : "已添加", icon: "success" })
        setTimeout(() => wx.navigateBack(), 500)
      })
      .catch((e) => {
        this.setData({ saving: false })
        wx.showToast({ title: e.message || "保存失败", icon: "none" })
      })
  },

  onDelete() {
    wx.showModal({
      title: "删除物品",
      content: "确定删除「" + (this.data.form.name || "该物品") + "」吗？删除后不可恢复。",
      confirmText: "删除",
      confirmColor: "#D94040",
      success: (res) => {
        if (!res.confirm) return
        store
          .deleteItem(this.itemId)
          .then(() => {
            wx.showToast({ title: "已删除", icon: "success" })
            setTimeout(() => wx.navigateBack(), 500)
          })
          .catch((e) => {
            wx.showToast({ title: e.message || "删除失败", icon: "none" })
          })
      }
    })
  }
})
