# CSS Inspector

一个功能强大的 Chrome 扩展，用于查看、调试并临时更改页面元素的 CSS 样式。类似 Figma 的设计工具，提供直观的元素间距显示和实时样式编辑。

![CSS Inspector Demo](https://i.imgur.com/c1ou3JU.png)

## ✨ 主要特性

### 🎯 智能元素选择
- 鼠标悬停时蓝色高亮显示
- 点击锁定元素，橙色高亮
- 显示元素完整选择器路径
- 一键复制选择器

### 📏 Figma 风格间距显示
- **实时测量元素间距**：悬停时自动显示选中元素（橙色）与悬停元素（蓝色）之间的距离
- **智能间距计算**：支持上下左右四个方向的间距显示
- **嵌套元素支持**：自动识别父子关系，显示内边距
- **防抖优化**：300ms 延迟，性能优化避免过度计算
- **橙色标注**：清晰的距离数值和方向线

### 📊 元素信息展示
- 标签名、ID、类名完整显示
- Box Model 可视化（margin、border、padding、content）
- 所有计算样式实时查看
- 智能生成唯一 CSS 选择器

### ✏️ 实时样式编辑
- 直接编辑任何 CSS 属性
- 修改立即应用到页面
- 支持添加/删除属性
- 输入框增强（悬停效果、占位符提示）

### 🎨 现代化 UI 设计
- 蓝红灰渐变主题
- 流畅的动画效果
- 响应式布局，完美适配小窗口
- 卡片式设计，信息层次清晰

## 功能特性

### ✨ 核心功能

- **🎯 元素选择器**
  - 启用选择模式后，鼠标悬停时高亮显示元素
  - 点击元素进行锁定和详细查看
  - 显示元素的完整选择器路径

- **📊 元素信息显示**
  - 标签名、ID、类名
  - 智能生成的唯一 CSS 选择器
  - 完整的 Box Model 可视化（margin、border、padding、content）
  - 所有计算样式（Computed Styles）

- **✏️ 实时 CSS 编辑**
  - 直接在面板中编辑任何 CSS 属性
  - 修改立即应用到页面元素
  - 支持添加新属性
  - 支持删除属性
  - 支持属性搜索过滤

- **📝 修改历史**
  - 显示所有修改记录和时间戳
  - 一键清除所有修改
  - 导出修改为标准 CSS 代码
  - 复制 CSS 到剪贴板

## 安装步骤

### 1. 下载/克隆项目

```bash
git clone https://github.com/lessten1211/css-inspector.git
cd css-inspector
```

或直接下载 ZIP 并解压。

### 2. 在 Chrome 中加载扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的「开发者模式」
4. 点击「加载已解压的扩展程序」
5. 选择 `css-inspector` 文件夹
6. 扩展安装完成！

## 使用方法

### 基本使用

1. **打开扩展**
   - 点击浏览器工具栏中的 CSS Inspector 图标
   - Side Panel 会在右侧打开

2. **选择元素**
   - 点击 "Start Picking" 按钮
   - 鼠标移动到页面元素上会看到蓝色高亮
   - 点击元素进行选中（变为橙色高亮）
   - 停止选择模式会自动清除所有高亮
4. **查看样式**
   - 选中元素后自动显示所有信息
   - 查看 Box Model 了解元素尺寸
   - 滚动查看所有计算样式

5. **编辑样式**
   - 直接点击输入框编辑样式值
   - 按 Enter 或失焦后应用修改
   - 所有修改实时生效

6. **停止选择**
   - 再次点击 "Stop Picking" 按钮
   - 或关闭 Side Panel
   - 页面上所有高亮和间距标注自动清除

### 高级功能

- **间距可视化**：类似 Figma 的测量工具，实时显示元素间距
- **复制选择器**：点击选择器旁的复制按钮快速复制
- **自适应布局**：支持窄屏显示，标签自动缩小，内容自适应换行
   - 点击 "Copy to Clipboard" 复制代码

### 高级功能

- **样式过滤**：在 "Filter properties..." 输入框中输入关键词快速查找属性
- **复制选择器**：点击选择器旁的复制按钮快速复制
- **刷新元素**：点击刷新按钮重新获取元素最新状态
- **清除修改**：点击 "Clear All" 一键撤销所有修改

## 项目结构

```
css-inspector/
├── manifest.json           # 扩展配置文件
├── service_worker.js       # 后台脚本（消息转发、扩展生命周期）
├── content_script.js       # 内容脚本（元素选择、高亮、样式应用）
├── panel.html              # Side Panel HTML
├── panel.js                # Side Panel 逻辑
├── panel.css               # Side Panel 样式
├── icons/                  # 扩展图标
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon.svg
└── README.md               # 本文档
```

## 技术架构

### Manifest V3
使用最新的 Chrome Extension Manifest V3 标准，确保安全性和性能。

### 核心组件

1. **Service Worker** (`service_worker.js`)
   - 管理扩展生命周期
   - 处理扩展图标点击事（蓝色悬停、橙色选中）
   - Figma 风格间距测量和显示
   - 获取元素信息和计算样式
   - 应用 CSS 修改到页面元素
   - 滚动和窗口大小变化时自动更新覆盖层
2. **Content Script** (`content_script.js`)
   - 注入到网页中运行
   - 处理元素选择和高亮
   - 获取元素信息和计算样式
   - 应用 CSS 修改到页面元素
   - 管理修改历史

3. **Side Panel** (`panel.html/js/css`)
   - 提供用户界面
   - 显示元素信息和样式
   - 处理用户交互
   - 与 content script 通信

### 通信机制

```
Panel ←→ Service Worker ←→ Content Script
         Content Script (chrome.tabs.sendMessage)
   ↓
chrome.storage.local (元素数据共享)
   ↓
自动清理（窗口关闭/隐藏时）
```

## 🎨 设计亮点

### 视觉设计
- **渐变主题**：蓝色→红色渐变 Header，现代感十足
- **卡间距显示**
   - 仅在选择模式下可用
   - 需要同时存在选中元素和悬停元素
   - 选择器唯一性**
   - 使用 ID、类名和 nth-child 生成选择器
   - 对于动态生成的元素可能不够精确
   - 未来可考虑使用 XPath 或更复杂的算法
伪类和伪元素**
   - 当前无法直接编辑 `:hover`、`::before` 等伪类/伪元素
   - 未来可添加伪类编辑模式

4. **
3. **距离小于 1px 时不显示
样式来源**
   - 只显示计算后的样式
   - 未显示样式的来源（inline、CSS 文件、规则优先级等）
   - 未来可集成 devtools protocol 获取更详细信息

5. **
2. **片设计**：圆角卡片，悬停效果，层次分明
- **颜色系统**：主色 #4A90E2（蓝）、辅助色 #E74C3C（红）、文字 #2C3E50（深灰）
- **微动画**：输入框悬停、按钮点击、卡片提升效果

### 交互优化
- *x] Figma 风格的元素间距测量
- [x] 自动清理页面覆盖层
- [x] 响应式布局优化
- [x] 现代化 UI 设计
- [ ] 支持查看样式来源和层叠规则
- [ ] 支持伪类和伪元素的编辑
- [ ] 添加颜色选择器和其他专用编辑器
- [ ] 支持导出和导入样式
- [ ] 添加修改历史的撤销/重做功能
- [ ] 添加快捷键支持
- [ ] 添加暗色主题
- [ ] 性能优化：虚拟滚动精确
   - 未来可考虑使用 XPath 或更复杂的算法

2. **伪类和伪元素**
   - 当前无法直接编辑 `:hover`、`::before` 等伪类/伪元素
   - 未来可添加伪类编辑模式

3. **样式来源**
   - 只显示计算后的样式
   - 未显示样式的来源（inline、CSS 文件、规则优先级等）
   - 未来可集成 devtools protocol 获取更详细信息

4. **媒体查询**
   - 未处理响应式设计的媒体查询
   - 未来可添加断点切换功能

5. **持久化**
   - 修改不会自动保存
   - 刷新页面后所有修改丢失
   - 未来可添加修改持久化功能

### 未来优化方向

- [ ] 支持查看样式来源和层叠规则
- [ ] 支持伪类和伪元素的编辑
- [ ] 添加颜色选择器和其他专用编辑器
- [ ] 支持批量导入/导出样式
- [ ] 添加修改历史的撤销/重做功能
- ✅ 关闭扩展自动清理页面注入的元素
- [ ] 支持样式对比（修改前后对比）
- [ ] 添加快捷键支持
- [ ] 支持保存修改到 localStorage 并在下次访问时应用
- [ ] 支持导出为 CSS、SCSS 或其他格式
- [ ] 添加暗色主题
- [ ] 性能优化：懒加载样式列表
- [ ] 国际化支持

## 兼容性

- ✅ Chrome 88+（需要 Manifest V3 支持）
- ✅ Edge 88+（基于 Chromium）
- ✅ 其他基于 Chromium 的浏览器

## 安全性

- ✅ 不发送任何数据到外部服务器
- ✅ 不引入远程脚本
- ✅ 仅在用户授权的页面上运行
- ✅ 所有修改仅在当前会话有效，不会永久修改网站

## 贡献指南

欢迎提交 Issue 和 Pull Request！

### 如何贡献

1. Fork 本项目
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

### 联系方式

- **微信**：Lessten56
- **GitHub**：[@lessten1211](https://github.com/lessten1211)
- **项目地址**：[css-inspector](https://github.com/lessten1211/css-inspector)

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

Copyright (c) 2026 Lessten

## 致谢

感谢所有为这个项目做出贡献的开发者！

---

**享受 CSS 调试的乐趣！** 🎨✨

如果这个项目对您有帮助，请给个 ⭐️ Star 支持一下！
- 使用原生 JavaScript（ES6+）
- 使用严格模式 `'use strict'`
- 详细的注释和文档
- 错误处理和边界情况考虑

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 作者

CSS Inspector Extension Team

---

**享受 CSS 调试的乐趣！** 🎨
# css-inspector
