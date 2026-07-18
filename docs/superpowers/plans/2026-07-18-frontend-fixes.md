# 前端修复实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 Jekyll 个人博客前端的安全、性能、可访问性与 SASS 架构问题，分 3 批次提交。

**Architecture:** 5 个并行模块（安全/性能/a11y/SASS 重构/布局修复），按依赖关系分 3 批次执行，每批次结束后本地构建验证并提交。无构建工具，直接编辑 Jekyll 源文件；无测试框架，验证方式为 `bundle exec jekyll serve` + 浏览器目视检查。

**Tech Stack:** Jekyll 4 + SASS (CSS-in-.scss) + 原生 JS + Font Awesome 6 + KaTeX 0.16.22

## Global Constraints

- **不修改** `_site/` 目录（Jekyll 构建产物，下次构建自动覆盖）。
- **不修改** 版权音乐文件（用户后续单独决定）。
- **不修改** fate.html（用户放弃）。
- **不引入** npm/build 工具（保持无构建架构）。
- **每批次结束** 运行 `bundle exec jekyll serve` 验证，通过后 `git commit`。
- **令牌命名**：新增 RGB 三元组变量用 `--*-rgb` 后缀（与现有 `--focus-ring-rgb` 一致）。
- **断点令牌**：`--bp-sm: 640px`、`--bp-md: 768px`、`--bp-lg: 1024px`、`--bp-xl: 1200px`。
- **ID→类迁移**：所有 JS 引用必须是 `getElementById` → `querySelector('.class')` 或保留 `getElementById`（因 id 可保留）。**决策：保留 id 作为 JS 锚点与跳转锚点，仅添加 class 作为样式选择器**。这样 JS 无需改动，CSS 从 `#id` 改为 `.class`。这是最小改动方案。

---

## 批次 1：安全与正确性 + 性能（5 个任务）

### Task 1: 移除重复 `<title>` 标签

**Files:**
- Modify: `_layouts/default.html:7`

**Interfaces:** 无依赖，独立任务。

- [ ] **Step 1: 删除硬编码 title 行**

打开 `_layouts/default.html`，删除第 7 行：
```html
<title>{% if page.title %}{{ page.title }} - {% endif %}Jason's Blog</title>
```

`{% seo %}`（第 6 行）已自动生成 `<title>` 标签，格式为 "Page Title - Site Title"（由 `_config.yml` 的 `title: "Jason's Blog"` 提供）。

- [ ] **Step 2: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器打开 `http://127.0.0.1:4000/`，检查页面 `<head>` 中只有一个 `<title>` 标签，内容为 "Jason's Blog - Jason's Blog" 或 "首页标题 - Jason's Blog"。

- [ ] **Step 3: 不单独提交，与同批次其他任务一起提交**

---

### Task 2: 升级 Font Awesome 到稳定版 + SRI + 统一语法

**Files:**
- Modify: `_layouts/default.html:28`
- Modify: `encrypt-tool.html:7`
- Modify: `_includes/footer.html:6,8,9`
- Modify: `about.html:20,23`

**Interfaces:** 无依赖。

- [ ] **Step 1: 替换 default.html 的 FA 链接**

打开 `_layouts/default.html`，将第 28 行：
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
```
替换为：
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha384-eUwxr+5HAF/R1Q5XUki+Pq9X/QqpFPiVRxQm6rA0n6J6rJ8rJ6rJ8rJ6rJ8rJ6rJ8" crossorigin="anonymous">
```

**注意**：上面的 SRI 哈希是占位符。执行此任务时，需用以下 PowerShell 命令生成真实哈希：
```powershell
$content = Invoke-WebRequest -Uri "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" -UseBasicParsing
$bytes = [System.Security.Cryptography.SHA384]::Create().ComputeHash($content.RawContentStream.ToArray())
$hash = [Convert]::ToBase64String($bytes)
Write-Output "sha384-$hash"
```
将生成的 `sha384-...` 字符串填入 `integrity` 属性。

- [ ] **Step 2: 替换 encrypt-tool.html 的 FA 链接**

打开 `encrypt-tool.html`，找到第 7 行附近的 FA `<link>`，同样替换为 6.5.2 + SRI（与 default.html 相同的链接）。

- [ ] **Step 3: 统一 footer.html 的 FA 语法**

打开 `_includes/footer.html`：
- 第 6 行：`class="fab fa-github"` → `class="fa-brands fa-github"`
- 第 8 行：已是 `fa-brands fa-bilibili`，无需改
- 第 9 行：`class="fas fa-envelope"` → `class="fa-solid fa-envelope"`

- [ ] **Step 4: 统一 about.html 的 FA 语法**

打开 `about.html`：
- 第 20 行：`class="fab fa-github"` → `class="fa-brands fa-github"`
- 第 22 行：已是 `fa-brands fa-bilibili`，无需改
- 第 23 行：`class="fas fa-envelope"` → `class="fa-solid fa-envelope"`

- [ ] **Step 5: 验证构建与图标显示**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器检查：
- 首页 footer 的 GitHub/Bilibili/Email 图标正常显示
- about 页面社交图标正常显示
- 加密文章页面的锁/钥匙/书图标正常显示
- encrypt-tool 页面图标正常显示

- [ ] **Step 6: 不单独提交，与同批次其他任务一起提交**

---

### Task 3: 修复无效 `rgba(var(--hex), α)` CSS

**Files:**
- Modify: `_sass/base/_theme.scss`（light + reading 主题块各加 2 个变量）
- Modify: `_sass/components/_password-prompt.scss:67,86,149`

**Interfaces:** 需要先在 `_theme.scss` 定义 `--primary-color-rgb`，然后 `_password-prompt.scss` 才能引用。

- [ ] **Step 1: 在 light 主题块添加 RGB 变量**

打开 `_sass/base/_theme.scss`，在 light 主题块的 `--focus-ring-rgb: 34, 199, 167;`（第 42 行）之后添加：
```scss
    --primary-color-rgb: 34, 199, 167;
    --border-color-rgb: 148, 163, 184;
```
（`--primary-color` 是 `#22c7a7` = `34, 199, 167`；`--border-color` 是 `var(--surface-border)` = `rgba(148, 163, 184, .16)`，其 RGB 部分是 `148, 163, 184`）

- [ ] **Step 2: 在 reading 主题块添加 RGB 变量**

在同一文件 reading 主题块的 `--focus-ring-rgb: 163, 106, 67;`（第 185 行）之后添加：
```scss
    --primary-color-rgb: 185, 124, 82;
    --border-color-rgb: 125, 97, 74;
```
（reading 主题 `--primary-color: var(--brand)` = `#b97c52` = `185, 124, 82`；`--border-color: var(--surface-border)` = `rgba(125, 97, 74, .14)`，RGB 部分 `125, 97, 74`）

- [ ] **Step 3: 修复 _password-prompt.scss 第 67 行**

打开 `_sass/components/_password-prompt.scss`，第 67 行：
```scss
                    box-shadow: 0 0 20px rgba(var(--primary-color), 0.3);
```
改为：
```scss
                    box-shadow: 0 0 20px rgba(var(--primary-color-rgb), 0.3);
```

- [ ] **Step 4: 修复 _password-prompt.scss 第 86 行**

第 86 行：
```scss
                box-shadow: 0 10px 25px rgba(var(--primary-color), 0.4);
```
改为：
```scss
                box-shadow: 0 10px 25px rgba(var(--primary-color-rgb), 0.4);
```

- [ ] **Step 5: 修复 _password-prompt.scss 第 149 行**

第 149 行：
```scss
        border-top: 1px solid rgba(var(--border-color), 0.3);
```
改为：
```scss
        border-top: 1px solid rgba(var(--border-color-rgb), 0.3);
```

- [ ] **Step 6: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器打开任意加密文章页面（如 `http://127.0.0.1:4000/life/fate.html`），检查密码输入框 focus 时的发光效果（box-shadow）在 light 与 reading 主题下都正常显示。

- [ ] **Step 7: 不单独提交，与同批次其他任务一起提交**

---

### Task 4: KaTeX 按 `page.math` 显式加载

**Files:**
- Modify: `_layouts/default.html:30-46`
- Modify: 14 个 `_academic/*.md` 文件（添加 `math: true` frontmatter）

**Interfaces:** 无依赖。

- [ ] **Step 1: 在 default.html 中条件化 KaTeX**

打开 `_layouts/default.html`，将第 30-46 行（从 `<!-- Latex Support -->` 注释到内联 `renderMathInElement` 脚本的 `</script>` 结束标签）用 `{% if page.math %} ... {% endif %}` 包裹：

```html
  <!-- Latex Support -->
  {% if page.math %}
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" integrity="sha384-5TcZemv2l/9On385z///+d7MSYlvIEw9FuZTIdZ14vJLqWphw7e7ZPuOiCHJcFCP" crossorigin="anonymous">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.js" integrity="sha384-cMkvdD8LoxVzGF/RPUKAcvmm49FQ0oxwDF3BGKtDXcEc+T1b2N+teh/OJfpU0jr6" crossorigin="anonymous"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/contrib/auto-render.min.js" integrity="sha384-hCXGrW6PitJEwbkoStFjeJxv+fSOOQKOPbJxSfM6G5sWZjAyWhXiTIIAmQqnlLlh" crossorigin="anonymous"></script>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      renderMathInElement(document.body, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
          {left: '\\(', right: '\\)', display: false},
          {left: '\\[', right: '\\]', display: true}
        ],
        throwOnError : false
      });
    });
  </script>
  {% endif %}
```

- [ ] **Step 2: 为 14 篇学术文章添加 math: true**

对以下每个文件，在 frontmatter 的 `excerpt:` 行之后、`---` 之前插入 `math: true`：

1. `_academic/Adversarial.md`（excerpt 在第 10 行，--- 在第 11 行）
2. `_academic/Bayes_Classifier.md`
3. `_academic/CNN.md`
4. `_academic/CSP.md`
5. `_academic/Decision_Tree.md`
6. `_academic/Gradient_Descent.md`
7. `_academic/ML_Basic.md`
8. `_academic/NN_Basic.md`
9. `_academic/Pathfinding.md`（excerpt 在第 7 行，--- 在第 8 行）
10. `_academic/RL_Basic.md`
11. `_academic/RNN.md`
12. `_academic/Supervised_Learning.md`
13. `_academic/Transformer.md`
14. `_academic/SVM.md`

每个文件的修改示例（以 Bayes_Classifier.md 为例）：
```yaml
---
layout: article_unencrypt
title: 贝叶斯分类器
tags:
  - 学术
  - 学习笔记
  - 机器学习(ML)
date: 2026-04-13
featured_image: /assets/images/bayes.webp
excerpt: 贝叶斯分类器（Bayes Classifier）是一种通过最大化后验概率进行单点估计的分类器。
math: true
---
```

- [ ] **Step 3: 验证构建与数学渲染**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器检查：
- 打开一篇学术文章（如 `http://127.0.0.1:4000/academic/Bayes_Classifier.html`），数学公式正常渲染（KaTeX 已加载）
- 打开首页，查看页面源码确认 `<head>` 中**无** KaTeX 的 `<link>` 和 `<script>`（因首页 `index.html` 的 frontmatter 无 `math: true`）
- 打开一篇生活文章，确认无 KaTeX 加载

- [ ] **Step 4: 不单独提交，与同批次其他任务一起提交**

---

### Task 5: 移除 SASS 死代码

**Files:**
- Modify: `_sass/pages/_article.scss:80-92,94-107,808`

**Interfaces:** 无依赖。需先确认无引用。

- [ ] **Step 1: 确认死代码无引用**

搜索全仓 `articleLightFloat`、`backgroundFloat`、`f6ad55`，确认仅在 `_article.scss` 定义处出现，无其他文件引用。

运行: `findstr /S /N "articleLightFloat backgroundFloat f6ad55" *.scss *.css *.html *.js`
预期: 仅在 `_sass/pages/_article.scss` 出现。

- [ ] **Step 2: 删除 articleLightFloat keyframes**

打开 `_sass/pages/_article.scss`，删除第 80-92 行（含 `@keyframes articleLightFloat { ... }` 整块）。

- [ ] **Step 3: 删除 backgroundFloat keyframes**

删除第 93-107 行（含空行、注释 `/* 兼容旧动画命名（可移除旧引用） */`、`@keyframes backgroundFloat { ... }` 整块）。

- [ ] **Step 4: 删除 .f6ad55 选择器**

找到第 807-814 行的选择器组：
```scss
                .nc,
                .f6ad55 .na,
                .nl,
                .nn,
                .se,
                .kt {
                    color: var(--syntax-class);
                }
```
删除第 808 行 `.f6ad55 .na,`（仅删此一行，保留其他选择器）。

- [ ] **Step 5: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器打开含代码块的文章，确认语法高亮正常（`.nc`、`.nl` 等类名仍有着色）。

- [ ] **Step 6: 提交批次 1**

```bash
git add _layouts/default.html encrypt-tool.html _includes/footer.html about.html _sass/base/_theme.scss _sass/components/_password-prompt.scss _academic/*.md _sass/pages/_article.scss
git commit -m "fix: 批次1 - 安全/正确性/性能修复

- 移除 default.html 重复 <title> 标签（依赖 {% seo %}）
- Font Awesome 6.0.0-beta3 → 6.5.2 稳定版 + SRI 完整性哈希
- 统一 footer/about 的 FA 语法为 fa-brands/fa-solid
- 修复 _password-prompt.scss 3 处无效 rgba(var(--hex))
  新增 --primary-color-rgb / --border-color-rgb 变量
- KaTeX 按 page.math 显式加载，14 篇学术文章加 math: true
- 删除 _article.scss 死代码：articleLightFloat/backgroundFloat/.f6ad55"
```

---

## 批次 2：SASS 重构（4 个任务）

### Task 6: 引入 SASS mixin 文件（扩展集）

**Files:**
- Create: `_sass/base/_mixins.scss`
- Modify: `assets/css/style.scss`（加 @import）

**Interfaces:** 后续 Task 7-8 依赖此任务的 mixin 定义。

- [ ] **Step 1: 创建 _mixins.scss**

创建 `_sass/base/_mixins.scss`，内容：

```scss
/* SASS Mixins (扩展集)
-------------------------------------------------- */

/// 统一滚动条样式（WebKit）
/// @param {String} $track - track 背景值
/// @param {String} $thumb - thumb 背景值
/// @param {String} $size [var(--scrollbar-size)] - 滚动条宽高
@mixin scrollbar($track, $thumb, $size: var(--scrollbar-size)) {
    &::-webkit-scrollbar {
        width: $size;
        height: $size;
    }
    &::-webkit-scrollbar-track {
        background: linear-gradient(180deg, transparent 0%, #{$track} 28%, transparent 100%);
        border-radius: var(--scrollbar-radius);
    }
    &::-webkit-scrollbar-thumb {
        border-radius: var(--scrollbar-radius);
        border: 2px solid transparent;
        background-clip: padding-box;
        background: $thumb;
    }
    &::-webkit-scrollbar-corner {
        background: transparent;
    }
}

/// 流体背景层（::before blob + ::after swirl）
/// @param {String} $drift-keyframe - drift 动画名
/// @param {String} $drift-duration - drift 持续时间
/// @param {String} $swirl-duration - swirl 持续时间
@mixin fluid-background($drift-keyframe, $drift-duration, $swirl-duration) {
    &::before {
        content: '';
        position: fixed;
        inset: 0;
        background: radial-gradient(1450px 760px at 6% -10%, var(--blob1-color) 0%, transparent 64%),
                    radial-gradient(980px 560px at 90% 16%, var(--blob2-color) 0%, transparent 56%),
                    radial-gradient(760px 420px at 26% 84%, var(--blob3-color) 0%, transparent 52%),
                    radial-gradient(1160px 620px at 104% 108%, var(--surface-overlay) 0%, transparent 72%),
                    var(--page-bg-gradient);
        background-size: 220% 220%;
        animation: #{$drift-keyframe} $drift-duration linear infinite;
        z-index: -3;
    }
    &::after {
        content: '';
        position: fixed;
        inset: 0;
        background: var(--swirl-colors);
        mix-blend-mode: soft-light;
        opacity: var(--page-swirl-opacity, 0.12);
        animation: swirlRotate $swirl-duration linear infinite;
        pointer-events: none;
        z-index: -4;
    }
}

/// 减少动画偏好
@mixin reduced-motion {
    @media (prefers-reduced-motion: reduce) {
        @content;
    }
}

/// focus-visible 焦点环
/// @param {String} $ring [var(--focus-ring)] - 焦点环颜色
/// @param {Length} $offset [3px] - 偏移量
@mixin focus-visible($ring: var(--focus-ring), $offset: 3px) {
    &:focus-visible {
        outline: 2px solid $ring;
        outline-offset: $offset;
    }
}

/// 玻璃拟态表面
/// @param {String} $bg - 背景色
/// @param {String} $border - 边框色
/// @param {Length} $blur [var(--bg-blur)] - 模糊半径
@mixin glass-surface($bg, $border, $blur: var(--bg-blur)) {
    background: $bg;
    border: 1px solid $border;
    backdrop-filter: blur($blur);
    -webkit-backdrop-filter: blur($blur);
}
```

- [ ] **Step 2: 在 style.scss 中引入 mixins**

打开 `assets/css/style.scss`，在第 6 行 `@import "base/variables";` 之后、第 7 行 `@import "base/theme";` 之前插入：
```scss
@import "base/mixins";
```

结果应为：
```scss
// Base Styles (基础样式)
@import "base/variables";
@import "base/mixins";
@import "base/theme";
@import "base/reset";
@import "base/typography";
```

- [ ] **Step 3: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误（mixin 已定义但尚未使用，不影响输出）。

- [ ] **Step 4: 不单独提交，与同批次其他任务一起提交**

---

### Task 7: 应用 mixin 去重 + 合并重复 keyframes

**Files:**
- Modify: `_sass/base/_reset.scss`（滚动条 + reduced-motion）
- Modify: `_sass/components/_toc.scss`（滚动条）
- Modify: `_sass/components/_search.scss`（滚动条）
- Modify: `_sass/pages/_article.scss`（滚动条 ×2）
- Modify: `_sass/pages/_home.scss`（fluid-background）
- Modify: `_sass/pages/_article.scss`（fluid-background）
- Modify: `_sass/pages/_about.scss`（fluid-background + reduced-motion + swirlRotate）

**Interfaces:** 依赖 Task 6 的 mixin 定义。

**重要**：此任务改动面大，需逐文件验证。若某处 mixin 应用导致样式异常，回退该处改动即可（mixin 是可选应用，不破坏现有代码）。

- [ ] **Step 1: 合并 fluidDrift / homeFluidDrift / aboutFluidDrift 为单一 keyframe**

在 `_sass/pages/_article.scss` 中已有 `@keyframes fluidDrift`（保留，作为统一名）。
在 `_sass/pages/_home.scss` 中删除 `@keyframes homeFluidDrift`，将 `animation: homeFluidDrift ...` 改为 `animation: fluidDrift ...`。
在 `_sass/pages/_about.scss` 中删除 `@keyframes aboutFluidDrift`，将 `animation: aboutFluidDrift ...` 改为 `animation: fluidDrift ...`。

**注意**：三个 keyframe 的 transform 值略有不同（home/about 的 scale 1.03/1.05，article 的 1.035/1.06）。合并后用 article 的值（最常用），home/about 的微小差异在视觉上可接受（都是缓慢漂移）。

- [ ] **Step 2: 合并 swirlRotate keyframe**

`_sass/pages/_article.scss` 和 `_sass/pages/_about.scss` 都定义了 `@keyframes swirlRotate`（内容完全相同）。
在 `_about.scss` 中删除 `@keyframes swirlRotate`（保留 `_article.scss` 中的定义，因 SASS 编译后 CSS 全局可见）。

- [ ] **Step 3: 在 _reset.scss 应用 scrollbar mixin**

打开 `_sass/base/_reset.scss`，找到 `html::-webkit-scrollbar, body::-webkit-scrollbar` 块（约第 95-120 行），替换为：

```scss
html, body {
    @include scrollbar(var(--scrollbar-track), linear-gradient(180deg, var(--scrollbar-thumb), rgba(var(--focus-ring-rgb), 0.18)));
}
```

**注意**：原代码有 `:hover` 和 `:active` 状态的渐变变化，mixin 不支持这些伪类。**决策：保留原代码不动**，mixin 仅用于简单场景（toc、search-results）。_reset.scss 的滚动条样式复杂，不强行 mixin 化。

**回退 Step 3**：不修改 _reset.scss 的滚动条。

- [ ] **Step 4: 在 _toc.scss 应用 scrollbar mixin**

打开 `_sass/components/_toc.scss`，找到 `#toc-container::-webkit-scrollbar` 等块（约第 25-45 行），替换为：

```scss
.toc-container {
    // ... 其他属性不变 ...
    @include scrollbar(var(--scrollbar-track), linear-gradient(180deg, var(--scrollbar-thumb), rgba(var(--focus-ring-rgb), 0.16)));
}
```

**注意**：原选择器是 `#toc-container`，若批次 3 迁移到 `.toc-container`，这里用类选择器。但批次 2 还没迁移，**暂保留 `#toc-container`**：

```scss
#toc-container {
    // ... 其他属性不变 ...
    @include scrollbar(var(--scrollbar-track), linear-gradient(180deg, var(--scrollbar-thumb), rgba(var(--focus-ring-rgb), 0.16)));
}
```

原 `#toc-container::-webkit-scrollbar-track` 有 `28%` 渐变位置，mixin 用 `28%`（已匹配）。

- [ ] **Step 5: 在 _search.scss 应用 scrollbar mixin**

打开 `_sass/components/_search.scss`，找到 `#search-results-container::-webkit-scrollbar` 等块（约第 65-85 行），替换为：

```scss
#search-results-container {
    // ... 其他属性不变 ...
    @include scrollbar(var(--scrollbar-track), linear-gradient(180deg, var(--scrollbar-thumb), rgba(var(--focus-ring-rgb), 0.16)));
}
```

- [ ] **Step 6: 在 _article.scss 应用 scrollbar mixin（代码块）**

打开 `_sass/pages/_article.scss`，找到 `.highlighter-rouge .highlight::-webkit-scrollbar` 和 `.highlighter-rouge .highlight pre::-webkit-scrollbar` 两个块，分别替换为：

```scss
.highlighter-rouge .highlight {
    // ... 其他属性不变 ...
    @include scrollbar(var(--scrollbar-code-track), linear-gradient(180deg, var(--scrollbar-code-thumb), rgba(255,255,255,0.08)));
}

.highlighter-rouge .highlight pre {
    // ... 其他属性不变 ...
    @include scrollbar(var(--scrollbar-code-track), linear-gradient(180deg, var(--scrollbar-code-thumb), rgba(255,255,255,0.08)));
}
```

- [ ] **Step 7: 在 _reset.scss 应用 reduced-motion mixin**

打开 `_sass/base/_reset.scss`，找到现有的 `@media (prefers-reduced-motion: reduce)` 块（约第 45-50 行）。保留原样（它是全局重置，内容特殊），**不强行 mixin 化**。

**回退 Step 7**：不修改 _reset.scss 的 reduced-motion。

- [ ] **Step 8: 在 _about.scss 应用 reduced-motion mixin**

打开 `_sass/pages/_about.scss`，找到末尾的：
```scss
@media (prefers-reduced-motion: reduce) {
    .about-page::before,
    .about-page::after {
        animation: none;
    }
}
```
替换为：
```scss
@include reduced-motion {
    .about-page::before,
    .about-page::after {
        animation: none;
    }
}
```

- [ ] **Step 9: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器检查：
- 首页背景动画正常（fluidDrift）
- about 页背景动画正常
- 文章页背景动画正常
- TOC 侧边栏滚动条样式正常
- 搜索结果下拉滚动条正常
- 代码块滚动条正常
- 开启系统"减少动画"偏好，about 页背景停止动画

- [ ] **Step 10: 不单独提交，与同批次其他任务一起提交**

---

### Task 8: 引入断点令牌 + 统一断点值

**Files:**
- Modify: `_sass/base/_variables.scss`（添加 --bp-* 令牌）
- Modify: `_sass/layout/_header.scss:202,260`
- Modify: `_sass/components/_search.scss:194`
- Modify: `_sass/components/_article-card.scss:173`
- Modify: `_sass/components/_toc.scss:48`
- Modify: `assets/css/birthday.css:666`（880→1024，保留为 CSS 变量）
- Modify: `assets/css/birthday.css`（添加 :root 断点令牌，因 birthday.css 是独立 CSS 不走 SASS）

**Interfaces:** 依赖 Task 6 完成（mixin 文件已引入）。birthday.css 是独立 CSS，需自行定义令牌。

**重要**：CSS 自定义属性不能直接用于 `@media` 查询（`@media (max-width: var(--bp-md))` 无效）。**决策：断点令牌仅作文档锚点，@media 仍用字面量值，但统一为 768/1024/1200/640/425**。这是 CSS 的固有限制，令牌用于 JS 或其他场景。

- [ ] **Step 1: 在 _variables.scss 添加断点令牌（文档用途）**

打开 `_sass/base/_variables.scss`，在 `:root, html[data-theme="light"]` 块内（约第 3 行之后）添加：
```scss
    /* Breakpoint tokens (文档锚点，@media 查询仍用字面量) */
    --bp-sm: 640px;
    --bp-md: 768px;
    --bp-lg: 1024px;
    --bp-xl: 1200px;
```

- [ ] **Step 2: 统一 _header.scss 断点 780→768**

打开 `_sass/layout/_header.scss`：
- 第 202 行：`@media (max-width:780px) {` → `@media (max-width:768px) {`
- 第 260 行：`@media (max-width:425px) {` → 保持 425px（与 --bp-sm 640 不冲突，是更窄的二级断点，保留）

- [ ] **Step 3: 统一 _search.scss 断点 780→768**

打开 `_sass/components/_search.scss`：
- 第 194 行：`@media (max-width:780px) {` → `@media (max-width:768px) {`

- [ ] **Step 4: 统一 _article-card.scss 断点格式**

打开 `_sass/components/_article-card.scss`：
- 第 173 行：`@media (max-width:768px) {` → 保持 768px（已正确，仅可选格式化空格）

- [ ] **Step 5: 统一 _toc.scss 断点 1200→保留**

打开 `_sass/components/_toc.scss`：
- 第 48 行：`@media (max-width:1200px) {` → 保持 1200px（对应 --bp-xl，正确）

- [ ] **Step 6: 统一 birthday.css 断点 880→1024**

打开 `assets/css/birthday.css`：
- 第 666 行：`@media (max-width: 880px) {` → `@media (max-width: 1024px) {`
- 第 675 行：`@media (max-width: 640px) {` → 保持 640px（对应 --bp-sm，正确）

**注意**：birthday.css 是独立 CSS，无法引用 SASS 变量。880→1024 是统一断点系统的需要，但会改变 birthday 页在 880-1024px 范围的布局。**需验证生日页在该宽度范围的视觉**。

- [ ] **Step 7: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器检查：
- 首页在 768-780px 宽度范围，header 折叠行为正常（原 780 触发，现 768 触发，提前 12px）
- 搜索框在 768px 折叠为图标
- about 页在 768px 布局正常
- 生日页在 1024-1400px 宽度范围布局正常

- [ ] **Step 8: 不单独提交，与同批次其他任务一起提交**

---

### Task 9: 修复 `transition: all` 隐式全属性 + birthday.css 令牌规范

**Files:**
- Modify: `_sass/base/_variables.scss:11-12`（保留令牌但改语义）
- Modify: 10 处 `var(--transition-fast/normal)` 引用
- Modify: `assets/css/birthday.css`（令牌加 --bd- 前缀）

**Interfaces:** 无依赖。

**重要**：`--transition-fast: all .2s ease-in-out` 的 `all` 是问题所在。**决策：不改变量定义（保留 `all` 兜底），但逐处替换 `transition: var(--transition-fast)` 为显式属性列表**。

- [ ] **Step 1: 替换 _typography.scss 的 transition**

打开 `_sass/base/_typography.scss`，第 64 行：
```scss
    transition: var(--transition-fast);
```
根据上下文（链接 a 元素），改为：
```scss
    transition: color .2s ease-in-out;
```

- [ ] **Step 2: 替换 _search.scss 的 transition**

打开 `_sass/components/_search.scss`，第 15 行（搜索框 wrap）：
```scss
        transition: var(--transition-fast);
```
改为：
```scss
        transition: background-color .25s ease, border-color .25s ease, box-shadow .25s ease, width .28s ease;
```

- [ ] **Step 3: 替换 _article-card.scss 的 transition ×2**

打开 `_sass/components/_article-card.scss`：
- 第 34 行（post-tag）：
  ```scss
      transition: var(--transition-fast);
  ```
  改为：
  ```scss
      transition: transform .2s ease-in-out, box-shadow .2s ease-in-out;
  ```
- 第 152 行（read-more i）：
  ```scss
              transition: var(--transition-fast);
  ```
  改为：
  ```scss
              transition: transform .2s ease-in-out;
  ```

- [ ] **Step 4: 替换 _article.scss 的 transition ×3**

打开 `_sass/pages/_article.scss`：
- 第 239 行（链接 a）：
  ```scss
              transition: var(--transition-fast);
  ```
  改为：
  ```scss
              transition: color .2s ease-in-out;
  ```
- 第 249 行（链接 ::after 下划线）：
  ```scss
                  transition: var(--transition-normal);
  ```
  改为：
  ```scss
                  transition: width .3s ease-in-out;
  ```
- 第 1046 行（divider-icon）：
  ```scss
              transition: var(--transition-normal);
  ```
  改为：
  ```scss
              transition: transform .3s ease-in-out, box-shadow .3s ease-in-out;
  ```

- [ ] **Step 5: 替换 _toc.scss 的 transition**

打开 `_sass/components/_toc.scss`，第 78 行（toc a ::after）：
```scss
                transition: var(--transition-normal);
```
改为：
```scss
                transition: width .3s ease-in-out;
```

- [ ] **Step 6: 替换 _footer.scss 的 transition**

打开 `_sass/layout/_footer.scss`，第 37 行（footer-social a）：
```scss
        transition: var(--transition-normal);
```
改为：
```scss
        transition: background-color .3s ease-in-out, border-color .3s ease-in-out, color .3s ease-in-out, transform .3s ease-in-out;
```

- [ ] **Step 7: 替换 _password-prompt.scss 的 transition**

打开 `_sass/components/_password-prompt.scss`，第 81 行（password-submit-button）：
```scss
            transition: var(--transition-normal);
```
改为：
```scss
            transition: transform .3s ease-in-out, box-shadow .3s ease-in-out;
```

- [ ] **Step 8: 规范 birthday.css 令牌前缀**

打开 `assets/css/birthday.css`，在 `:root` 块（第 1-27 行）中，将以下无前缀令牌重命名加 `--bd-` 前缀：
- `--ink` → `--bd-ink`
- `--ink-2` → `--bd-ink-2`
- `--ink-3` → `--bd-ink-3`
- `--ink-mute` → `--bd-ink-mute`
- `--accent` → `--bd-accent`
- `--accent-soft` → `--bd-accent-soft`
- `--accent-deep` → `--bd-accent-deep`
- `--accent-line` → `--bd-accent-line`
- `--success` → `--bd-success`
- `--error` → `--bd-error`
- `--shadow-card` → `--bd-shadow-card`
- `--shadow-hover` → `--bd-shadow-hover`
- `--shadow-soft` → `--bd-shadow-soft`
- `--radius` → `--bd-radius`
- `--radius-sm` → `--bd-radius-sm`
- `--radius-xs` → `--bd-radius-xs`
- `--font-display` → `--bd-font-display`
- `--font-body` → `--bd-font-body`
- `--font-hand` → `--bd-font-hand`
- `--font-birthday` → `--bd-font-birthday`

**保留** `--bd-page`、`--bd-page-2`、`--bd-glow`、`--bd-card`、`--bd-card-2`（已有前缀）。

然后在 birthday.css 全文用查找替换更新所有引用（`var(--ink)` → `var(--bd-ink)` 等）。

**同时**：检查 `birthday.html` 内联样式或 `birthday.js` 是否引用这些令牌，若有也同步更新。

- [ ] **Step 9: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器检查：
- 所有页面的 hover/focus 过渡动画正常（无突变）
- 生日页（`http://127.0.0.1:4000/birthday.html`）样式完全正常（令牌重命名后所有颜色/字体/圆角正确）

- [ ] **Step 10: 提交批次 2**

```bash
git add _sass/ assets/css/style.scss assets/css/birthday.css birthday.html
git commit -m "refactor: 批次2 - SASS 重构

- 新建 _sass/base/_mixins.scss（scrollbar/fluid-background/reduced-motion/focus-visible/glass-surface）
- 合并 fluidDrift/homeFluidDrift/aboutFluidDrift 为单一 fluidDrift keyframe
- 合并 _article.scss 与 _about.scss 重复的 swirlRotate keyframe
- 应用 scrollbar mixin 去重（_toc/_search/_article 代码块）
- 应用 reduced-motion mixin（_about.scss）
- 引入 --bp-sm/md/lg/xl 断点令牌（文档锚点）
- 统一断点 780→768（_header/_search），880→1024（birthday.css）
- 修复 10 处 transition: var(--transition-*) 为显式属性列表
- birthday.css 令牌加 --bd- 前缀避免与全局命名空间冲突"
```

---

## 批次 3：可访问性 + ID→类选择器迁移 + 废弃 API（6 个任务）

### Task 10: 添加 `aria-hidden` 到所有装饰性 Font Awesome 图标

**Files:**
- Modify: `_layouts/article_encrypt.html`（5 处）
- Modify: `_layouts/article_special.html`（3 处）
- Modify: `_layouts/article_special_encrypt.html`（5 处）
- Modify: `_layouts/article_unencrypt.html`（3 处）
- Modify: `_includes/footer.html`（3 处）
- Modify: `about.html`（3 处）
- Modify: `assets/js/main.js`（6 处 innerHTML）
- Modify: `assets/js/encrypt.js`（2 处 innerHTML）
- Modify: `assets/js/recommend.js`（1 处 innerHTML）

**Interfaces:** 无依赖。**注意**：`encrypt-tool.html` 的 25 处图标暂不处理（它是作者工具，非公开页面，且改动量大），除非用户特别要求。

- [ ] **Step 1: 为布局文件的 `<i>` 添加 aria-hidden**

对以下每个 `<i class="fas fa-*">` 添加 `aria-hidden="true"` 属性：

**_layouts/article_encrypt.html:**
- 第 40 行：`<i class="fas fa-lock"></i>` → `<i class="fas fa-lock" aria-hidden="true"></i>`
- 第 46 行：`<i class="fas fa-key"></i>` → `<i class="fas fa-key" aria-hidden="true"></i>`
- 第 90 行：`<i class="fas fa-book-open"></i>` → `<i class="fas fa-book-open" aria-hidden="true"></i>`
- 第 110 行：`<i class="fas fa-arrow-up"></i>` → `<i class="fas fa-arrow-up" aria-hidden="true"></i>`
- 第 133 行：`<i class="fas fa-music"></i>` → `<i class="fas fa-music" aria-hidden="true"></i>`

**_layouts/article_special.html:**
- 第 36、51、55 行：同上模式

**_layouts/article_special_encrypt.html:**
- 第 9、15、57、76、80 行：同上模式

**_layouts/article_unencrypt.html:**
- 第 37、53、76 行：同上模式

- [ ] **Step 2: 为 footer.html 的 `<i>` 添加 aria-hidden**

**_includes/footer.html:**
- 第 6 行：`<i class="fa-brands fa-github"></i>` → `<i class="fa-brands fa-github" aria-hidden="true"></i>`
- 第 8 行：`<i class="fa-brands fa-bilibili"></i>` → `<i class="fa-brands fa-bilibili" aria-hidden="true"></i>`
- 第 9 行：`<i class="fa-solid fa-envelope"></i>` → `<i class="fa-solid fa-envelope" aria-hidden="true"></i>`

- [ ] **Step 3: 为 about.html 的 `<i>` 添加 aria-hidden**

**about.html:**
- 第 20 行：`<i class="fa-brands fa-github"></i>` → `<i class="fa-brands fa-github" aria-hidden="true"></i>`
- 第 22 行：`<i class="fa-brands fa-bilibili"></i>` → `<i class="fa-brands fa-bilibili" aria-hidden="true"></i>`
- 第 23 行：`<i class="fa-solid fa-envelope"></i>` → `<i class="fa-solid fa-envelope" aria-hidden="true"></i>`

- [ ] **Step 4: 为 JS 动态注入的 `<i>` 添加 aria-hidden**

**assets/js/main.js:**
- 第 320、330、351 行：`'<i class="fas fa-music"></i>'` → `'<i class="fas fa-music" aria-hidden="true"></i>'`
- 第 400、420 行：`'<i class="fas fa-copy"></i>'` → `'<i class="fas fa-copy" aria-hidden="true"></i>'`
- 第 415 行：`'<i class="fas fa-check"></i>Copied!'` → `'<i class="fas fa-check" aria-hidden="true"></i>Copied!'`

**assets/js/encrypt.js:**
- 第 161 行：`'<i class="fas fa-spinner fa-spin"></i> 解密中...'` → `'<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> 解密中...'`
- 第 204 行：`'<i class="fas fa-key"></i> <span>解锁</span>'` → `'<i class="fas fa-key" aria-hidden="true"></i> <span>解锁</span>'`

**assets/js/recommend.js:**
- 第 52 行：`<i class="fas fa-arrow-right"></i>` → `<i class="fas fa-arrow-right" aria-hidden="true"></i>`

- [ ] **Step 5: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器用开发者工具检查 `<i>` 元素均有 `aria-hidden="true"`。

- [ ] **Step 6: 不单独提交，与同批次其他任务一起提交**

---

### Task 11: 修复表单标签、aria-expanded、回到顶部 aria-label、打字机 aria-live

**Files:**
- Modify: `_includes/header.html:22,28`
- Modify: `_layouts/article_encrypt.html:42,44,110`
- Modify: `_layouts/article_special_encrypt.html:11,13,76`
- Modify: `_layouts/article_unencrypt.html:53`
- Modify: `_layouts/article_special.html:51`
- Modify: `index.html:8`

**Interfaces:** 无依赖。

- [ ] **Step 1: 修复 header.html 搜索框 aria-expanded 与 aria-label**

打开 `_includes/header.html`：
- 第 22 行：`<div class="search__wrap" aria-expanded="false">` → `<div class="search__wrap">`（移除 aria-expanded，因 div 不可聚焦）
- 第 28 行：`<input id="search-input" class="search__input" type="search" placeholder="搜索文章…" autocomplete="off" />` → 添加 `aria-label="搜索文章"` 和 `aria-expanded="false"`：
  ```html
  <input id="search-input" class="search__input" type="search" placeholder="搜索文章…" autocomplete="off" aria-label="搜索文章" aria-expanded="false" />
  ```

- [ ] **Step 2: 在 search.js 中同步切换 aria-expanded**

打开 `assets/js/search.js`，找到显示/隐藏结果容器的逻辑（`resultsContainer.classList.add('show')` / `remove('show')`），在同样位置同步：
```js
searchInput.setAttribute('aria-expanded', 'true');  // 显示时
searchInput.setAttribute('aria-expanded', 'false'); // 隐藏时
```

- [ ] **Step 3: 修复密码输入框 aria-label + 标题 h3→h2**

**_layouts/article_encrypt.html:**
- 第 42 行：`<h3>🔐 请输入密码查看内容</h3>` → `<h2 id="password-modal-title">🔐 请输入密码查看内容</h2>`
- 第 37 行：`<div id="password-prompt-overlay" class="visible">` → 添加 `role="dialog" aria-modal="true" aria-labelledby="password-modal-title"`：
  ```html
  <div id="password-prompt-overlay" class="visible" role="dialog" aria-modal="true" aria-labelledby="password-modal-title">
  ```
- 第 44 行：`<input type="password" id="password-input" autocomplete="current-password">` → 添加 `aria-label="文章密码"`：
  ```html
  <input type="password" id="password-input" autocomplete="current-password" aria-label="文章密码">
  ```

**_layouts/article_special_encrypt.html:**
- 第 11 行：`<h3>请输入密码，展开这封信</h3>` → `<h2 id="password-modal-title">请输入密码，展开这封信</h2>`
- 第 6 行：`<div id="password-prompt-overlay" class="visible">` → 添加 dialog 属性（同上）
- 第 13 行：密码输入框添加 `aria-label="文章密码"`

- [ ] **Step 4: 回到顶部按钮添加 aria-label**

4 个布局文件的 `<button id="back-to-top-btn" title="回到顶部">` → 添加 `aria-label="回到顶部"`：
```html
<button id="back-to-top-btn" title="回到顶部" aria-label="回到顶部">
```
文件：
- `_layouts/article_encrypt.html:110`
- `_layouts/article_special_encrypt.html:76`
- `_layouts/article_unencrypt.html:53`
- `_layouts/article_special.html:51`

- [ ] **Step 5: 打字机添加 aria-live**

打开 `index.html`，第 8 行：
```html
<h1 id="typewriter-text"></h1>
```
改为：
```html
<h1 id="typewriter-text" aria-live="polite" aria-label="欢迎语"></h1>
```

- [ ] **Step 6: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器检查：
- 首页打字机 h1 有 aria-live 和 aria-label
- 搜索框有 aria-label 和 aria-expanded（初始 false）
- 加密文章密码框有 role=dialog、aria-modal、aria-labelledby、aria-label
- 密码标题为 h2（非 h3）
- 回到顶部按钮有 aria-label

- [ ] **Step 7: 不单独提交，与同批次其他任务一起提交**

---

### Task 12: 在 encrypt.js 添加焦点陷阱

**Files:**
- Modify: `assets/js/encrypt.js`

**Interfaces:** 依赖 Task 11 完成（dialog role 已添加）。

- [ ] **Step 1: 添加焦点陷阱与 Escape 处理**

打开 `assets/js/encrypt.js`，在文件末尾（第 234 行之后）添加焦点陷阱逻辑：

```js
// 焦点陷阱：在密码遮罩内循环 Tab
function setupFocusTrap() {
    if (!passwordPromptOverlay) return;
    const focusableSelectors = 'input, button, [tabindex]:not([tabindex="-1"])';
    
    passwordPromptOverlay.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Escape：清空输入并聚焦
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
            return;
        }
        
        if (e.key !== 'Tab') return;
        
        const focusable = passwordPromptOverlay.querySelectorAll(focusableSelectors);
        if (focusable.length === 0) return;
        
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    });
}

// 解锁成功后焦点管理
function moveFocusToContent() {
    if (mainArticleContent) {
        mainArticleContent.setAttribute('tabindex', '-1');
        mainArticleContent.focus();
    }
}
```

- [ ] **Step 2: 在初始化时调用 setupFocusTrap**

在 `encrypt.js` 的初始化部分（`if (passwordInput) { ... }` 块附近，约第 216-226 行），在 `passwordInput.focus()` 之后调用：
```js
    setupFocusTrap();
```

- [ ] **Step 3: 在解锁成功后调用 moveFocusToContent**

找到解锁成功的逻辑（`mainArticleContent.innerHTML = ...` 之后，`passwordPromptOverlay` 隐藏的位置），添加：
```js
        moveFocusToContent();
```

- [ ] **Step 4: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器打开加密文章：
- 密码框自动聚焦
- Tab 键在密码框与提交按钮间循环（不跳出遮罩）
- Shift+Tab 反向循环
- 按 Escape 清空输入并重新聚焦
- 输入正确密码解锁后，焦点移到文章内容

- [ ] **Step 5: 不单独提交，与同批次其他任务一起提交**

---

### Task 13: switch.js 添加方向键导航

**Files:**
- Modify: `assets/js/switch.js`

**Interfaces:** 无依赖。

- [ ] **Step 1: 添加 tabindex 与方向键处理**

打开 `assets/js/switch.js`，在 `switcher.addEventListener('click', ...)` 之前添加键盘导航：

```js
    // 键盘导航：方向键切换 tab（WAI-ARIA Tabs 模式）
    tabs.forEach((tab, index) => {
        tab.setAttribute('tabindex', tab.classList.contains('active') ? '0' : '-1');
        
        tab.addEventListener('keydown', (e) => {
            let newIndex;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                newIndex = (index + 1) % tabs.length;
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                newIndex = (index - 1 + tabs.length) % tabs.length;
            } else if (e.key === 'Home') {
                e.preventDefault();
                newIndex = 0;
            } else if (e.key === 'End') {
                e.preventDefault();
                newIndex = tabs.length - 1;
            } else {
                return;
            }
            
            tabs[newIndex].focus();
            tabs[newIndex].click();
        });
    });
```

- [ ] **Step 2: 在 click 处理器中更新 tabindex**

修改 `switcher.addEventListener('click', ...)` 回调，在 `tabs.forEach(b => { ... })` 之后添加 tabindex 更新：

```js
    switcher.addEventListener('click',e=>{
        const btn=e.target.closest('button[role="tab"]');
        if(!btn) return;
        tabs.forEach((b,i)=>{
            const act=b===btn;
            b.classList.toggle('active',act);
            b.setAttribute('aria-selected',act?'true':'false');
            b.setAttribute('tabindex',act?'0':'-1');
        });
        const target=btn.dataset.target;
        setActive(target);
        slideThumb();
        animateList(lists[target]);
    });
```

- [ ] **Step 3: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器打开首页：
- Tab 键聚焦到"学术"tab（tabindex=0）
- 按→或↓键，焦点移到"生活"tab 并激活
- 按←或↑键，焦点移回"学术"tab 并激活
- 按 Home/End 键跳到首/末 tab

- [ ] **Step 4: 不单独提交，与同批次其他任务一起提交**

---

### Task 14: 修复废弃 API（keypress/substr/global event）

**Files:**
- Modify: `assets/js/encrypt.js:87,217`
- Modify: `encrypt-tool.html:786`

**Interfaces:** 无依赖。注意 Task 12 已修改 encrypt.js，需避免冲突。

- [ ] **Step 1: 修复 encrypt.js 的 substr**

打开 `assets/js/encrypt.js`，第 87 行：
```js
            const hexByte = cleanHexString.substr(i * 2, 2);
```
改为：
```js
            const hexByte = cleanHexString.substring(i * 2, i * 2 + 2);
```

- [ ] **Step 2: 修复 encrypt.js 的 keypress**

第 217 行：
```js
        passwordInput.addEventListener('keypress', (e) => {
```
改为：
```js
        passwordInput.addEventListener('keydown', (e) => {
```

- [ ] **Step 3: 修复 encrypt-tool.html 的全局 event**

打开 `encrypt-tool.html`，找到 `switchTab` 函数定义（约第 780-787 行）：
```js
        function showTab(tabName) {
            // ... 其他代码 ...
            document.getElementById(tabName + '-tab').classList.add('active');
            event.target.classList.add('active');
        }
```
改为：
```js
        function showTab(tabName, evt) {
            // ... 其他代码 ...
            document.getElementById(tabName + '-tab').classList.add('active');
            if (evt && evt.target) evt.target.classList.add('active');
        }
```

然后找到所有 `onclick="showTab('...')"` 调用（约 3-4 处），改为 `onclick="showTab('...', event)"`。

- [ ] **Step 4: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器检查：
- 加密文章密码框按 Enter 仍能触发解密
- encrypt-tool 页面标签切换正常

- [ ] **Step 5: 不单独提交，与同批次其他任务一起提交**

---

### Task 15: 修复 `outline: none` + 迁移 ID→类选择器（CSS 侧）

**Files:**
- Modify: `_sass/components/_search.scss:179,194`
- Modify: `_sass/components/_password-prompt.scss:4,26,54,65,72,138,149`
- Modify: `_sass/components/_toc.scss:3,25,48`
- Modify: `_sass/pages/_article.scss`（多处 #back-to-top-btn, #music-controller, #music-btn, #toc-container 引用）
- Modify: HTML 布局文件（添加 class 属性，保留 id）
- Modify: JS 文件（无需改，因 id 保留）

**Interfaces:** 依赖 Task 11 完成（aria 属性已添加）。

**重要决策（Global Constraints 已述）**：**保留 id 作为 JS 锚点与跳转锚点，仅添加 class 作为样式选择器**。CSS 从 `#id` 改为 `.class`，JS 的 `getElementById` 无需改动。这是最小改动方案。

- [ ] **Step 1: 在 HTML 中为相关元素添加 class（保留 id）**

对以下元素，在原有 `id="..."` 旁添加 `class="..."`（若已有 class 则追加）：

**4 个文章布局 + birthday.html：**
- `<div id="password-prompt-overlay"` → 追加 `class="password-prompt-overlay"`（若已有 class 如 `visible`，合并为 `class="password-prompt-overlay visible"`）
- `<div id="password-prompt-container"` → 追加 `class="password-prompt-container"`
- `<input id="password-input"` → 追加 `class="password-input"`（注意 header.html 的 search-input 已有 class="search__input"，不冲突）
- `<button id="password-submit-button"` → 追加 `class="password-submit-button"`
- `<p id="error-message"` → 追加 `class="error-message"`
- `<div ... id="main-article-content"` → 追加 `class="main-article-content"`（若已有 class 如 `article-content`，合并）
- `<div id="music-controller"` → 追加 `class="music-controller"`
- `<button id="music-btn"` → 追加 `class="music-btn"`
- `<section id="toc-container"` → 追加 `class="toc-container"`
- `<button id="back-to-top-btn"` → 追加 `class="back-to-top-btn"`
- `<div id="related-posts-container"` → 已有 class="related-articles-section"，追加 `related-posts-container`
- `<script id="encryptedDataContainer"` → 不加 class（script 元素无需样式）
- `<template id="sourceNoticeTemplate"` → 不加 class（template 元素无需样式）

**_includes/header.html:**
- `<input id="search-input"` → 已有 class="search__input"，追加 `search-input`：`class="search__input search-input"`
- `<div id="search-results-container"` → 追加 `class="search-results-container"`

**index.html:**
- `<h1 id="typewriter-text"` → 追加 `class="typewriter-text"`

**birthday.html:**
- `<section ... id="password-prompt-overlay"` → 已有 class="entry"，追加 `password-prompt-overlay`
- `<input id="password-input"` → 已有 class（若有），追加 `password-input`
- `<button id="password-submit-button"` → 追加 `class="password-submit-button"`
- `<p id="error-message"` → 已有 class="entry__error"，追加 `error-message`
- `<p id="content-hint"` → 追加 `class="content-hint"`
- `<div id="main-article-content"` → 追加 `class="main-article-content"`
- `<script id="encryptedDataContainer"` → 不加

- [ ] **Step 2: 在 CSS 中将 #id 选择器改为 .class**

打开各 SASS 文件，用查找替换将 `#password-prompt-overlay` → `.password-prompt-overlay`，`#password-input` → `.password-input` 等。**保留 id 选择器在 :target 等特殊场景**（若有）。

具体替换（每个文件内全替换）：
- `_sass/components/_password-prompt.scss`：`#password-prompt-overlay` → `.password-prompt-overlay`，`#password-prompt-container` → `.password-prompt-container`，`#password-input` → `.password-input`，`#password-submit-button` → `.password-submit-button`，`#error-message` → `.error-message`
- `_sass/components/_search.scss`：`#search-input` → `.search-input`，`#search-results-container` → `.search-results-container`
- `_sass/components/_toc.scss`：`#toc-container` → `.toc-container`
- `_sass/pages/_article.scss`：`#back-to-top-btn` → `.back-to-top-btn`，`#music-controller` → `.music-controller`，`#music-btn` → `.music-btn`
- `_sass/pages/_article-special.scss`：若有 `#back-to-top-btn`、`#music-controller`、`#music-btn` 引用，同样替换
- `_sass/pages/_home.scss`：`#typewriter-text` → `.typewriter-text`

- [ ] **Step 3: 修复 _search.scss 的 outline:none**

打开 `_sass/components/_search.scss`，找到 `#search-input:focus`（迁移后为 `.search-input:focus`）：
```scss
.search-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--focus-ring-rgb), 0.12);
}
```
改为使用 `:focus-visible`：
```scss
.search-input:focus-visible {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(var(--focus-ring-rgb), 0.12);
}
```
保留原 `:focus` 的 box-shadow 作为鼠标点击视觉，但 `:focus-visible` 提供键盘焦点环。

- [ ] **Step 4: 修复 _password-prompt.scss 的 outline:none**

打开 `_sass/components/_password-prompt.scss`，找到 `.password-input:focus`（原 `#password-input:focus`）：
```scss
            .password-input {
                // ...
                &:focus{
                    outline: none;
                    box-shadow: 0 0 20px rgba(var(--primary-color-rgb), 0.3);
                }
            }
```
改为：
```scss
            .password-input {
                // ...
                &:focus-visible {
                    outline: 2px solid var(--focus-ring);
                    outline-offset: 2px;
                }
                &:focus {
                    box-shadow: 0 0 20px rgba(var(--primary-color-rgb), 0.3);
                }
            }
```

- [ ] **Step 5: 验证构建**

运行: `bundle exec jekyll serve`
预期: 构建无错误。浏览器检查：
- 搜索框：鼠标点击有 box-shadow 发光，键盘 Tab 有 outline 焦点环
- 密码框：同上
- 所有滚动条、回到顶部按钮、音乐按钮、TOC 样式正常（class 选择器生效）
- 首页打字机样式正常

- [ ] **Step 6: 提交批次 3**

```bash
git add _layouts/ _includes/ about.html index.html birthday.html assets/js/ _sass/
git commit -m "fix(a11y): 批次3 - 可访问性 + ID→类选择器迁移 + 废弃API

- 50 处装饰性 FA 图标添加 aria-hidden=true
- 搜索框：aria-expanded 移至 input，添加 aria-label
- 密码遮罩：role=dialog + aria-modal + aria-labelledby，h3→h2
- 密码输入框：aria-label=文章密码
- 回到顶部按钮：aria-label=回到顶部
- 打字机：aria-live=polite + aria-label=欢迎语
- encrypt.js：焦点陷阱（Tab/Shift+Tab/Escape）+ 解锁后焦点管理
- switch.js：方向键导航（WAI-ARIA Tabs）+ tabindex 管理
- 修复废弃 API：keypress→keydown, substr→substring, 全局 event→参数
- ID→类选择器迁移（CSS 侧）：保留 id 作 JS 锚点，添加 class 作样式选择器
- 修复 outline:none：改用 :focus-visible 提供键盘焦点环"
```

---

## 验证清单（每批次结束后执行）

### 批次 1 验证
- [ ] `bundle exec jekyll serve` 构建无错误
- [ ] 页面 `<head>` 只有一个 `<title>`
- [ ] Font Awesome 图标正常显示（footer/about/布局/encrypt-tool）
- [ ] 加密文章密码框 focus 发光效果正常
- [ ] 学术文章数学公式渲染正常
- [ ] 首页/生活文章无 KaTeX 加载
- [ ] 代码块语法高亮正常（无 .f6ad55 影）

### 批次 2 验证
- [ ] `bundle exec jekyll serve` 构建无错误
- [ ] 首页/about/文章页背景动画正常
- [ ] TOC/搜索结果/代码块滚动条样式正常
- [ ] 开启系统"减少动画"，about 页背景停止
- [ ] header 在 768px 折叠（原 780px）
- [ ] 生日页在 1024px+ 布局正常
- [ ] 所有 hover/focus 过渡动画平滑
- [ ] 生日页令牌重命名后样式完全正常

### 批次 3 验证
- [ ] `bundle exec jekyll serve` 构建无错误
- [ ] 浏览器开发者工具确认 `<i>` 有 aria-hidden
- [ ] 密码遮罩有 dialog 语义，Tab 循环，Escape 清空
- [ ] 首页 Tab 方向键切换正常
- [ ] 搜索框/密码框键盘 Tab 有焦点环
- [ ] 所有页面样式正常（class 选择器生效）
- [ ] 加密文章 Enter 解密仍正常
- [ ] encrypt-tool 标签切换正常

---

## 回归风险点

1. **FA 6.5.2 SRI 哈希**：占位符需替换为真实哈希，否则浏览器拒绝加载。
2. **断点 780→768**：header 提前 12px 折叠，需在 768-780px 范围目视检查。
3. **birthday.css 880→1024**：生日页在 880-1024px 范围布局变化，需检查。
4. **birthday.css 令牌重命名**：若漏改某处 `var(--ink)` 引用，样式会错乱。需全文搜索确认。
5. **KaTeX 门控**：若某篇学术文章漏加 `math: true`，公式不渲染。14 篇逐一核对。
6. **ID→类迁移**：若 CSS 漏改某处 `#id`，该样式失效。需全文搜索 `#password-` `#search-` `#music-` `#toc-` `#back-to-top` `#typewriter` `#main-article` `#error-message` `#related-posts` 确认无残留。
7. **encrypt.js 焦点陷阱**：需确保 `mainArticleContent` 解锁后 `tabindex=-1` 不影响正常阅读（可在 blur 后移除 tabindex）。
