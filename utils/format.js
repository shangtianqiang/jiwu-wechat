// 日期与文本格式化工具

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

function pad2(n) {
  return (n < 10 ? "0" : "") + n
}

// ISO 字符串 -> "2026-09-09 14:30"（按本地时区显示）
function formatDateTime(iso) {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return String(iso)
  return (
    d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) +
    " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes())
  )
}

// ISO 字符串 -> "09-09"
function formatShortDate(iso) {
  if (!iso) return ""
  const d = new Date(iso)
  if (isNaN(d.getTime())) return String(iso)
  return pad2(d.getMonth() + 1) + "-" + pad2(d.getDate())
}

// 顶部日期头：{ date: "9月9日", weekday: "周二" }
function headerInfo() {
  const d = new Date()
  return {
    date: (d.getMonth() + 1) + "月" + d.getDate() + "日",
    weekday: WEEKDAYS[d.getDay()]
  }
}

// 当前时间拆成 picker 需要的 { date, time }
function nowPickValues() {
  return dateToPickValues(new Date().toISOString())
}

// ISO 字符串拆成 picker 需要的 { date, time }（本地时区）
function dateToPickValues(iso) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) {
    const n = new Date()
    return {
      date: n.getFullYear() + "-" + pad2(n.getMonth() + 1) + "-" + pad2(n.getDate()),
      time: pad2(n.getHours()) + ":" + pad2(n.getMinutes())
    }
  }
  return {
    date: d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()),
    time: pad2(d.getHours()) + ":" + pad2(d.getMinutes())
  }
}

// picker 的 date + time -> ISO 字符串（本地时间转 UTC 存储；补秒以兼容 iOS 严格解析）
function pickToIso(date, time) {
  const d = new Date(date + "T" + (time || "00:00") + ":00")
  if (isNaN(d.getTime())) return new Date().toISOString()
  return d.toISOString()
}

module.exports = {
  formatDateTime,
  formatShortDate,
  headerInfo,
  nowPickValues,
  dateToPickValues,
  pickToIso
}
