# CSS Inspector

一个功能强大的 Chrome 扩展，用于查看、调试并临时更改页面元素的 CSS 样式。类似 CSS Peeper 的功能，但更加灵活和可定制。

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
git clone <your-repo-url>
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

3. **查看样式**
   - 选中元素后自动显示所有信息
   - 查看 Box Model 了解元素尺寸
   - 滚动查看所有计算样式

4. **编辑样式**
   - 直接点击样式值进行编辑
   - 按 Enter 或点击其他地方应用修改
   - 点击 "+" 按钮添加新属性
   - 点击删除按钮移除属性

5. **导出修改**
   - 点击 "Export CSS" 按钮
   - 查看生成的 CSS 代码
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
   - 处理扩展图标点击事件
   - 转发 content script 和 panel 之间的消息
   - 使用 `chrome.storage.local` 进行状态共享

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
         (chrome.runtime)     (chrome.tabs)
              ↓
      chrome.storage.local
         (状态共享)
```

## 已知限制 & 未来优化

### 当前限制

1. **选择器唯一性**
   - 使用 ID、类名和 nth-child 生成选择器
   - 对于动态生成的元素可能不够精确
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

## 开发指南

### 开发环境设置

1. 克隆项目并在 Chrome 中加载
2. 修改代码后，在 `chrome://extensions/` 点击刷新按钮
3. 重新打开测试页面查看效果

### 调试技巧

- **Service Worker**：`chrome://extensions/` → 点击 "service worker" 链接
- **Content Script**：在网页中打开开发者工具 → Console 标签
- **Panel**：在 Side Panel 中右键 → 检查

### 代码风格

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
