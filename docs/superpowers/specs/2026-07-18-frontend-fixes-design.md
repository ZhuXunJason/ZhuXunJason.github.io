# 前端修复设计文档

**日期**：2026-07-18
**状态**：已批准，待写实施计划
**作者**：与用户协作产出

---

## 背景与范围

基于对 ZhuXunJason.github.io（Jekyll 个人博客）的全面前端审查，本次修复覆盖以下问题（按用户选定的审查报告条目）：

- **二（严重问题）**：1（重复 title）、2（FA beta+SRI）、5（fate.html 无效 HTML）、6（无效 rgba）、7（outline:none）。3（版权音乐）本次不做；4（fate.html 占位）已修复。
- **三（架构性）**：1（SASS mixin）、3（断点令牌）、5（birthday.css 迁移）。
- **四（可访问性）**：全部系统性问题。
- **五（性能）**：KaTeX 门控 + Font Awesome（FA 部分与二.2 合并处理）。
- **八（代码异味）**：1（transition:all）、2（死代码）、3（混用 FA 语法）、4（outline:none，与二.7 合并）、9（废弃 API）。

### 已确认跳过的项

- 二.3 版权音乐（用户后续单独决定）
- 二.4 fate.html 占位内容（已修复）
- 二.5 fate.html 无效 HTML（用户决定放弃修改）
- 标签改链接、暗色主题、打印样式、结构化数据、滚动监听节流、`_article.scss` 拆分、四个文章布局合并（均不在本次范围）

---

## 关键设计决策（用户已拍板）

| 决策点 | 选择 |
|---|---|
| Font Awesome | 升级稳定版 6.x + SRI 完整性哈希 |
| KaTeX 门控 | 每篇文章显式声明 `math: true`（不引入集合级 frontmatter defaults） |
| 断点策略 | 引入 `--bp-*` 令牌 + 统一值（780→768，880→1024，1400→1200） |
| SASS mixin 范围 | 扩展集：scrollbar、fluid-background、reduced-motion、focus-visible、glass-surface |
| ID→类选择器迁移 | 顺便迁移（与 a11y 修复协同） |
| 执行顺序 | 分批并行（5 模块），必要依赖保留 |
| birthday.css | 降级方案（保留独立但迁到 `_sass/pages/_birthday.scss`，仅规范令牌命名，不合并到 style.css） |
| 提交策略 | 每批次结束提交一次 |

---

## 模块 A：安全与正确性修复

### A1. 移除重复 `<title>`
- `_layouts/default.html:7` 删除硬编码 `<title>` 行。
- `{% seo %}` 已生成 title。验证格式与原硬编码一致；若不一致，调整 `_config.yml` 的 `title` 字段。

### A2. Font Awesome 升级稳定版 + SRI
- `_layouts/default.html:28` 替换为 FA 6.5.2（或最新 6.x）正式版 CDN，附 `integrity` + `crossorigin="anonymous"`。
- `encrypt-tool.html:7` 同步替换。
- **不改 icon 语法**（`fab fa-*` / `fa-brands fa-*` 在 6.x 兼容）。
- 与 D7（统一 FA 语法）一起提交：footer.html / about.html 的 `fab fa-github` → `fa-brands fa-github`，`fas fa-*` → `fa-solid fa-*`。

### A3. ~~fate.html 无效 HTML~~（用户放弃修改，跳过）

### A4. 修复无效 `rgba(var(--hex), α)`
- 全仓搜索 `rgba(var(--` 模式，定位 `_sass/components/_password-prompt.scss` 等处。
- 为相关颜色新增 `--*-rgb` 三元组变量（如 `--primary-color-rgb: 34, 199, 167`，与现有 `--focus-ring-rgb` 模式一致）。
- 改写为 `rgba(var(--primary-color-rgb), 0.3)`。
- 在 light/reading 两个主题块都补齐。

### A5. 修复 `outline: none` + 迁移 ID→类选择器（与模块 D/C 协同）
- `_sass/components/_search.scss`：`#search-input:focus { outline: none }` → `:focus-visible` + `box-shadow` 替代环。
- `_sass/components/_password-prompt.scss`：同理处理 `#password-input:focus`。
- **顺便迁移 ID→类**：
  - `#search-input` → `.search__input`（header 已有该类）
  - `#password-input` → `.password-input`
  - `#music-controller` → `.music-controller`
  - `#music-btn` → `.music-btn`
  - `#toc-container` → `.toc-container`
  - `#back-to-top-btn` → `.back-to-top-btn`
  - `#password-prompt-overlay` → `.password-prompt-overlay`
  - `#password-prompt-container` → `.password-prompt-container`
  - `#password-submit-button` → `.password-submit-button`
  - `#error-message` → `.error-message`
  - `#main-article-content` → `.main-article-content`
  - `#search-results-container` → `.search-results-container`
  - `#typewriter-text` → `.typewriter-text`
  - `#content-hint` → `.content-hint`（若存在）
- **JS 同步改**：main.js、encrypt.js、toc.js、search.js、birthday.js 中的 `getElementById`/`querySelector`。
- **HTML 同步改**：所有布局与 include 中的 `id=` 改为 `class=`（保留必要的锚点 id 如 `#main-content` 跳转目标）。
- 此子项依赖模块 D 的 mixin 引入，放批次 3 执行。

---

## 模块 B：性能优化

### B1. KaTeX 按 `page.math` 显式加载
- `default.html:30-46` 的 KaTeX 三行（CSS + JS + auto-render）用 `{% if page.math %} ... {% endif %}` 包裹。
- 内联 auto-render 脚本也一并条件化。
- 为 13 篇 `_academic/*.md` 逐篇加 `math: true` 到 frontmatter（紧跟 `excerpt` 后）。
- `_life/` 文章不加（默认不渲染数学）。
- **核对清单**：Adversarial、Bayes_Classifier、CNN、CSP、Decision_Tree、Gradient_Descent、ML_Basic、NN_Basic、Pathfinding、RL_Basic、RNN、Supervised_Learning、Transformer、SVM（共 14 篇，逐一核对）。

### B2. FA 升级（已在 A2 完成）
无额外工作。

---

## 模块 C：可访问性系统性修复

### C1. 表单标签
- `header.html` 搜索框：加 `aria-label="搜索文章"` 到 `<input>`。
- 4 个加密布局的密码输入框：加 `aria-label="文章密码"`。

### C2. 密码遮罩改对话框
4 个加密布局的 `.password-prompt-overlay`（迁移后）：
- 加 `role="dialog"`、`aria-modal="true"`、`aria-labelledby` 指向标题。
- 标题 `<h3>` 提升为 `<h2>`（修正层级，因为文章 `<h1>` 在解锁前隐藏）。
- **焦点陷阱**：`encrypt.js` 加 Tab/Shift+Tab 循环逻辑。
- **Escape 行为**：Esc 清空输入并聚焦到输入框（遮罩不可关闭）。
- **解锁后焦点管理**：焦点移到 `.article-container` 或文章首个标题。

### C3. 图标 `aria-hidden`
- `footer.html` 3 个 `<i>` 加 `aria-hidden="true"`。
- `about.html` 3 个 `<i>` 加 `aria-hidden="true"`。
- 4 个布局中所有装饰性 `<i class="fas fa-*">` 加 `aria-hidden="true"`。
- `encrypt.js`、`main.js`、`recommend.js` 中动态注入的 `<i>` 也加 `aria-hidden="true"`。

### C4. 回到顶部按钮
4 个布局的 `<button class="back-to-top-btn">`（迁移后）加 `aria-label="回到顶部"`（保留 `title` 作 tooltip）。

### C5. `aria-expanded` 修正
`header.html` 的 `<div class="search__wrap" aria-expanded="false">` → 移除 `aria-expanded`，改到 `<input>` 上。`search.js` 同步切换。

### C6. 打字机 `aria-live`
`index.html` 的 `<h1 class="typewriter-text">`（迁移后）加 `aria-live="polite"`、`aria-label="欢迎语"`。

### C7. Tab 方向键导航
`switch.js` 加 Left/Right 方向键处理（WAI-ARIA Tabs 模式）：聚焦到 tab 后按方向键切换并激活。`role="tab"` 元素加 `tabindex="0"`（活动）/`tabindex="-1"`（非活动）。

### C8. 八.9 废弃 API
- `encrypt.js:217` `keypress` → `keydown`，判定 `event.key === 'Enter'`。
- `encrypt.js:87` `substr` → `substring`。
- `encrypt-tool.html:786` 全局 `event` → 函数参数显式接收 `event`，内联 `onclick="switchTab(event, 'yaml')"`。

---

## 模块 D：SASS 重构

### D1. 引入 SASS mixin（扩展集）
新建 `_sass/base/_mixins.scss`，定义：
- `@mixin scrollbar($track, $thumb, $size: var(--scrollbar-size))` — 统一滚动条样式。
- `@mixin fluid-background($drift-name, $drift-duration, $swirl-duration)` — 流体背景层（::before blob + ::after swirl）。
- `@mixin reduced-motion` — `@media (prefers-reduced-motion: reduce)` 内容块。
- `@mixin focus-visible($ring: var(--focus-ring), $offset: 3px)` — `:focus-visible` 焦点环。
- `@mixin glass-surface($bg, $border, $blur)` — 玻璃拟态快捷方式。

在 `style.scss` 的 `base/variables` 之后 `@import 'base/mixins'`。

### D2. 应用 mixin 去重
- `_reset.scss`、`_toc.scss`、`_search.scss`、`_article.scss`（2 处）、`birthday.scss` 的滚动条 → `@include scrollbar(...)`。**预计消除 ~100 行**。
- `_home.scss`、`_article.scss`、`_about.scss` 的 `fluidDrift`/`homeFluidDrift`/`aboutFluidDrift` → 合并为单一 `fluidDrift` keyframe + `@include fluid-background(...)`。**消除 ~50 行 + 3 个重复 keyframe**。
- `_article.scss` 与 `_about.scss` 的 `swirlRotate` → 单一定义，共享。
- `_reset.scss`、`_about.scss`、`birthday.scss` 的 reduced-motion 块 → `@include reduced-motion`。

### D3. 引入断点令牌 + 统一值
`_variables.scss` 新增：
```scss
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1200px;
```
全仓 `@media (max-width: 780px)` → `@media (max-width: var(--bp-md))`（即 768px）。`birthday.scss` 的 `880px` → `var(--bp-lg)`（1024px），`1400px` → `var(--bp-xl)`（1200px）。**需验证**：header 在 768px 折叠的视觉（比原 780px 早 12px 触发）。

### D4. 修复 `transition: all`（八.1）
`_variables.scss` 的 `--transition-fast: all .2s` / `--transition-normal: all .3s` 保留为兜底，但**逐处替换**为具体属性：
- 链接/按钮 hover → `transition: color .2s, background-color .2s, border-color .2s`。
- 卡片 hover → `transition: transform .2s, box-shadow .2s`。
- 不再使用 `var(--transition-fast)` 的"全属性"语义。

### D5. 移除死代码（八.2）
- `_article.scss`：删除 `@keyframes articleLightFloat`、`@keyframes backgroundFloat`、`.f6ad55 .na` 选择器。
- 全仓 grep `articleLightFloat|backgroundFloat|f6ad55` 确认无引用后删除。

### D6. `birthday.css` 迁移（降级方案）
- `assets/css/birthday.css`（650 行）→ `_sass/pages/_birthday.scss`。
- 保留 `--bd-*` / `--ink-*` / `--accent-*` 专属语义令牌。
- `--font-display` / `--font-hand` / `--radius` / `--radius-sm` / `--shadow-card` 等与全局重名的 → 改为 `--bd-font-display` 等前缀，避免覆盖全局。
- **不合并到 style.css**：`birthday.html` 仍独立加载该样式。实现方式：保留 `assets/css/birthday.scss`（前置 front matter 空），`@import` `_sass/pages/_birthday` 的内容；或直接保留 `birthday.css` 在 `assets/css/` 但内容来自 `_sass/pages/_birthday.scss` 的 Jekyll 编译产物。
- **简化实现**：直接把 `assets/css/birthday.css` 重命名为 `assets/css/birthday.scss`，内容不变，仅在文件头加 Jekyll front matter（空 `---\n---`），让 SASS 编译器处理。令牌重命名照做。`birthday.html` 的 `<link>` 路径不变（Jekyll 会生成 `birthday.css`）。

### D7. 统一 FA 语法（八.3，与 A2 一起提交）
footer.html / about.html 的 `fab fa-github` → `fa-brands fa-github`，`fas fa-*` → `fa-solid fa-*`。

### D8. 修复 `outline: none`（八.4，已在 A5）
无额外工作。

---

## 模块 E：执行顺序与依赖

```
批次 1（并行）：
  - A1（移除重复 title）
  - A2 + D7（FA 升级 + SRI + 统一语法）
  - A4（修复无效 rgba）
  - B1（KaTeX 门控）
  - D5（删除死代码）
  → 提交 1

批次 2（并行，依赖批次 1 完成）：
  - D1 + D2（mixin 引入 + 应用去重）
  - D3（断点令牌 + 统一值）
  - D4（transition:all 替换）
  - D6（birthday.css 迁移，降级方案）
  → 提交 2

批次 3（依赖 D1 的 mixin 与 D3 的断点令牌）：
  - A5 + C 全部（a11y 修复 + ID→类选择器迁移）
  - C8（废弃 API 修复）
  - 二.7 outline:none 收尾
  → 提交 3
```

### 验证策略
每批次结束后，本地 `bundle exec jekyll serve` 启动，逐页目视检查：
- 首页（打字机、tab、卡片）
- 一篇学术文章（验证 KaTeX、代码块、TOC、回到顶部）
- 一篇生活文章（验证音乐控件、无 KaTeX）
- 一篇加密文章（验证密码遮罩 a11y、焦点陷阱）
- 生日页、lovepage、encrypt-tool（验证独立性未破坏）
- 主题切换 light↔reading（验证所有令牌正确）

### 回归风险点
1. FA 升级后 icon 字体名变化（6.0→6.5 应兼容，但需逐个核对 14 个 icon）。
2. 断点 780→768 可能让 header 在特定宽度提前折叠。
3. ID→类选择器迁移若有遗漏，JS 会 `getElementById` 返回 null。
4. KaTeX 门控若有 academic 文章漏加 `math: true`，公式不渲染。
5. birthday.css 迁移若令牌重命名有遗漏，生日页视觉会错乱。

---

## 不在本次范围（已确认跳过）

- 二.3 版权音乐（用户后续单独决定）
- 二.4 fate.html 占位内容（已修复）
- 二.5 fate.html 无效 HTML（用户放弃修改）
- 标签改链接、暗色主题、打印样式、结构化数据、滚动监听节流、`_article.scss` 拆分、四个文章布局合并
