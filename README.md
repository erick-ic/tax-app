# 个人所得税 App 界面演示

使用 Vue 3、Vue Router、Vant 4 和 Vite 6 制作的移动端界面练习，包含首页、待办、办&查、消息和我的五个页面。本项目为非官方静态演示，不连接税务系统，也不能办理真实申报业务。

## 在线访问

- **部署地址**：https://erick-ic.github.io/tax-app/
- **数据管理页**：https://erick-ic.github.io/tax-app/#/admin

> 手机端可使用 Safari / 浏览器打开后「添加到主屏幕」，以接近原生 App 的独立全屏体验预览。

## 本地运行

建议使用 Node.js 22 和 npm。

```sh
npm ci
npm run dev
```

开发地址以终端输出为准，默认端口为 5173。开发服务监听所有网络接口，同一局域网内可通过电脑 IP 在手机上预览。

```sh
npm run build
npm run preview
npm run deploy:web
```

构建输出为 `dist/`，预览默认端口为 8931。路由使用 URL hash，资源路径采用 `./`，执行 `npm run deploy:web` 可直接构建并发布到 GitHub Pages（`gh-pages` 分支）。

## 项目结构

```text
src/
  main.js                   应用入口、路由和 Vant 注册
  App.vue                   页面容器
  components/               底部导航与公共头部组件
  data/                     统一数据 Schema、默认数据与兼容导出
  services/                 数据源适配层（local / remote-json / api）
  state/                    响应式数据状态与模块加载状态
  views/                    前台页面与独立数据管理页（/#/admin）
  assets/styles/            全局样式与主题变量
  assets/tax/               卡片、图标和参考素材
index.html                  HTML 入口与移动端设置
vite.config.js              开发、预览与构建配置
```

## 已实现交互

- 首页通知自动轮播：长文本横向滚动，随后整行向上切换。
- 待办页切换未办结和已办结空状态。
- 消息页支持未读筛选、点击标记已读与清除未读，并与底部消息角标实时联动。
- 首页与「办&查」页均支持进入收入纳税明细查询流程。
- 我的页面支持演示识别号显示/隐藏，菜单操作展示提示。

页面默认使用本地演示数据，已收口至统一数据管理流程，支持在移动端或桌面端通过 `/#/admin` 实时维护数据：

### 数据管理与前后台协同

- **可视化管理页**：可通过 `/#/admin` 直接访问，或在「我的」页面**连续点击头像 5 次**进入（懒加载独立分包，不影响前台首屏体积与视觉），可维护个人信息、按月收入纳税明细、消息列表及首页滚动通知，并支持 JSON 导出、导入与恢复默认数据。
- **三种数据源模式**（见 `.env.example`）：
  - `VITE_DATA_MODE=local`（默认）：读写浏览器 `localStorage`，无后端即可在手机演示时即时改数并持久化。
  - `VITE_DATA_MODE=remote-json`：启动时从 `VITE_DATA_URL`（默认 `./data/app-data.json`）拉取最新 JSON，适合后台导出静态文件发布，多端同步零服务器成本。
  - `VITE_DATA_MODE=api`：通过 `GET / PUT ${VITE_API_BASE_URL}/app-data` 与后端接口协同运行，切换后前台页面无需修改。
- **数据契约**：核心结构与校验规则位于 `src/data/schema.js`，收入明细仍以月份（`period: 'YYYY-MM'`）为最小维护单位，每条明细需有全局唯一 `id`，金额以元为单位并自动规范化为两位小数字符串。查询页按纳税年度与所得类型筛选，合计金额仅计算当前筛选结果。

## 素材与维护

部分资源来自参考截图裁切，部分由 AI 生成；界面中的一些文字已经嵌入图片，不能仅通过 CSS 字号修改。`home-declare-card-small-text.png` 是首页当前使用的申报卡片素材。

请在公开发布或复用素材前确认相应使用权。本仓库未声明统一的开源许可证，不能据此假定第三方图标、截图和品牌素材可自由使用。

个人信息字段使用明确的演示占位值，请勿将真实姓名、证件号码、账户信息或密钥写入前端源码及图片。消息中的公司名称、日期和提示文案仅用于界面展示。

## 提交与验证

提交源码、素材、`package.json` 和 `package-lock.json`；不要提交 `node_modules/`、`dist/`、本地环境变量和日志文件，相关路径已配置忽略。

当前验证命令为 `npm run build`，尚未配置自动化测试与 lint。修改界面后还需在浏览器移动端尺寸下核对布局、图标及滚动交互；构建成功不代表视觉效果已经验证。
