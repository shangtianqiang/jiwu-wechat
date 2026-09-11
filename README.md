# 物记 (wuji-miniprogram) 📦

个人物品记录微信小程序：四个标签页（首页 / 统计 / 时间线 / 我的），物品按分类分组管理，支持搜索、图片配置（图库预设 + 上传）、新增/编辑/删除（二次确认），数据存云开发数据库，换设备登录同一微信账号数据不丢。

## ✨ 功能

- **首页**：汇总卡（种类/总件数/分类数）+ 按分类分组的图片卡片列表 + 搜索
- **统计**：分类分布条形图 + 近 7 天录入统计
- **时间线**：按录入日期分组的时间轴，带图倒序展示
- **我的**：数据概览、模式徽章（本机/云端）、清空本机数据
- **新增/编辑**：图片（拍照/相册上传 或 20 款白底通用图库）、名称、分类（预设 + 自定义）、数量（步进器）、存放位置、备注、录入时间（日期+时间选择）
- **图片策略**：上传图 > 图库预设 > 分类默认图（电脑/手机/书本等通用白底图）> 包裹兜底
- **删除二次确认**：编辑页删除按钮 / 列表长按删除，均弹出确认框
- **数据同步**：云函数 + PostgreSQL，按用户 openid 隔离；本机模式用于云端恢复前的开发验证

## 🛠 技术方案

- 微信原生小程序框架，零第三方依赖
- 数据层双模式适配器（`services/store.js`）：
  - **云端模式**（`config.js` 中 `USE_CLOUD: true`）：`wx.cloud.callFunction` → 云函数 `items` → CloudBase PostgreSQL（表 `items`），按 `openid` 隔离
  - **本地模式**（默认，`USE_CLOUD: false`）：数据存本机缓存，开箱即用，用于云端数据库恢复前的界面验证
- 云函数位于 `cloudfunctions/items/`，建表 SQL 位于 `migrations/`

## 🚀 运行

1. 用[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)「导入项目」选择本目录
2. `project.config.json` 中填入你的小程序 AppID（当前为占位符 `touristappid`）
3. 编译即可看到界面（本机模式带示例流程）

## ☁️ 切换云开发模式（云端数据库恢复后执行）

1. **建表**：通过 CloudBase MCP 执行 `managePgDatabase(action="applyMigration", ...)` 应用 `migrations/20260909120000_create_items.sql`
2. **部署云函数**：开发者工具中右键 `cloudfunctions/items` →「上传并部署：云端安装依赖」，或通过 MCP `manageFunctions(action="createFunction")`
3. **关联环境**：CloudBase 控制台 → 环境配置 → 安全配置 → 小程序关联，填入本小程序 AppID
4. **切换开关**：`config.js` 中 `USE_CLOUD` 改为 `true`
5. 重新编译，列表页提示条消失即表示已上云

## 📁 目录结构

```
├── app.js / app.json / app.wxss     # 小程序入口、全局配置、极简留白主题
├── config.js                        # 环境 ID / USE_CLOUD 开关 / 预设分类
├── pages/
│   ├── list/                        # 列表页（分类分组 + 搜索）
│   └── edit/                        # 新增 / 编辑（含删除二次确认）
├── components/empty-state/          # 空状态组件
├── services/store.js                # 数据层（云端 / 本地双模式）
├── utils/format.js                  # 日期格式化工具
├── cloudfunctions/items/            # 云函数：PostgreSQL CRUD
└── migrations/                      # PG 建表迁移 SQL
```

## 🔐 数据安全

- 云端数据按 `user_id = openid` 隔离，读写都在云函数内强制带上该条件（update/delete 同时校验归属）
- 小程序端不直连数据库，唯一入口是云函数；管理端凭据不出现在任何前端代码中
