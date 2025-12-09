# AI 聊天前端界面

基于 React + TypeScript 的现代化 AI 聊天界面。

## 功能特性

- 🎨 **精美 UI 设计**
  - 渐变色主题
  - 流畅的动画效果
  - 响应式布局
  - 暗色模式友好

- 💬 **完整聊天功能**
  - 实时流式响应
  - 对话历史记录
  - 打字指示器
  - 消息时间戳

- 🚀 **用户体验优化**
  - 自动滚动到最新消息
  - Enter 发送，Shift+Enter 换行
  - 快捷建议按钮
  - 清空对话功能

## 快速开始

### 1. 安装依赖

```bash
cd React/draft
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm dev
```

应用将在 `http://localhost:3000` 启动。

### 3. 确保后端服务运行

前端需要连接到运行在 `http://localhost:5566` 的 Python 后端服务。

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Rsbuild** - 构建工具
- **CSS3** - 样式和动画

## 界面预览

### 欢迎屏幕
- 显示欢迎信息
- 提供快捷建议按钮
- 引导用户开始对话

### 聊天界面
- 用户消息：右侧，粉紫色渐变背景
- AI 消息：左侧，白色背景
- 流式打字效果
- 实时响应显示

### 输入区域
- 大尺寸输入框
- 圆形发送按钮
- 模型信息显示
- 键盘快捷键提示

## 自定义配置

### 修改后端地址

在 [`App.tsx`](src/App.tsx:51) 中修改：

```typescript
const response = await fetch('http://localhost:5566/api/chat', {
  // ...
});
```

### 修改主题颜色

在 [`App.css`](src/App.css) 中修改渐变色：

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 开发说明

### 组件结构
- `App.tsx` - 主应用组件
- `App.css` - 全局样式

### 关键功能
- 流式响应处理使用 Server-Sent Events (SSE)
- 消息状态管理使用 React Hooks
- 自动滚动使用 useRef 和 useEffect