# StyleProbe

一个功能强大的 Chrome 扩展，用于查看、调试并临时更改页面元素的 CSS 样式。类似 Figma 的设计工具，提供直观的元素间距显示和实时样式编辑。

![StyleProbe Demo](https://i.imgur.com/c1ou3JU.png)

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
   - 点击浏览器工具栏中的 StyleProbe 图标
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

### Manifest V3
使用最新的 Chrome Extension Manifest V3 标准，确保安全性和性能。

### 通信机制

```
Panel ←→ Service Worker ←→ Content Script
         Content Script (chrome.tabs.sendMessage)
   ↓
chrome.storage.local (元素数据共享)
   ↓
自动清理（窗口关闭/隐藏时）
```

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

StyleProbe Extension Team

---

**享受 CSS 调试的乐趣！** 🎨
# css-inspector
