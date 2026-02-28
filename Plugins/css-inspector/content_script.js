/**
 * Content Script - 页面注入脚本
 * 负责元素选择、高亮、CSS 修改应用和与 panel 通信
 */

(function() {
  'use strict';

  // 防止重复注入
  if (window.__CSS_INSPECTOR_INJECTED__) {
    return;
  }
  window.__CSS_INSPECTOR_INJECTED__ = true;

  // === 状态管理 ===
  const state = {
    isPickingMode: false,
    selectedElement: null,
    hoveredElement: null,
    modifications: new Map(), // 存储修改历史: element -> {selector, changes: []}
    highlightOverlay: null,
    selectedOverlay: null
  };

  // === 创建高亮覆盖层 ===
  function createOverlay(type) {
    const overlay = document.createElement('div');
    overlay.className = `css-inspector-overlay css-inspector-${type}`;
    overlay.style.cssText = `
      position: absolute;
      pointer-events: none;
      z-index: 2147483647;
      box-sizing: border-box;
      ${type === 'hover' ? 'border: 3px solid #4A90E2;' : 'border: 3px solid #FF6B35;'}
      ${type === 'hover' ? 'background: rgba(74, 144, 226, 0.15);' : 'background: rgba(255, 107, 53, 0.2);'}
      transition: all 0.15s ease;
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  // === 更新覆盖层位置 ===
  function updateOverlay(overlay, element) {
    if (!overlay || !element) return;
    
    const rect = element.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    
    overlay.style.top = `${rect.top + scrollY}px`;
    overlay.style.left = `${rect.left + scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
  }

  // === 隐藏覆盖层 ===
  function hideOverlay(overlay) {
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  // === 显示覆盖层 ===
  function showOverlay(overlay) {
    if (overlay) {
      overlay.style.display = 'block';
    }
  }

  // === 生成唯一选择器 ===
  function generateSelector(element) {
    if (!element || element === document.body) return 'body';
    if (element === document.documentElement) return 'html';

    // 优先使用 ID
    if (element.id) {
      const id = CSS.escape(element.id);
      return `#${id}`;
    }

    // 构建路径
    const path = [];
    let current = element;

    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();

      // 添加类名（最多3个）
      if (current.classList.length > 0) {
        const classes = Array.from(current.classList)
          .slice(0, 3)
          .map(c => `.${CSS.escape(c)}`)
          .join('');
        selector += classes;
      }

      // 添加 nth-child 以确保唯一性
      if (current.parentElement) {
        const siblings = Array.from(current.parentElement.children);
        const index = siblings.indexOf(current) + 1;
        const sameTagSiblings = siblings.filter(s => s.tagName === current.tagName);
        
        if (sameTagSiblings.length > 1) {
          selector += `:nth-child(${index})`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
    }

    return path.join(' > ');
  }

  // === 获取计算样式 ===
  function getComputedStyles(element) {
    const computed = window.getComputedStyle(element);
    const styles = {};
    
    // 常用的 CSS 属性
    const importantProps = [
      // Box Model
      'width', 'height', 'margin', 'padding', 'border',
      'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'border-width', 'border-style', 'border-color', 'border-radius',
      
      // Position & Display
      'display', 'position', 'top', 'right', 'bottom', 'left',
      'float', 'clear', 'z-index', 'overflow', 'overflow-x', 'overflow-y',
      
      // Flexbox
      'flex', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items',
      'align-content', 'flex-grow', 'flex-shrink', 'flex-basis',
      
      // Grid
      'grid-template-columns', 'grid-template-rows', 'grid-gap', 'gap',
      
      // Typography
      'font-family', 'font-size', 'font-weight', 'font-style', 'line-height',
      'text-align', 'text-decoration', 'text-transform', 'letter-spacing',
      'word-spacing', 'white-space', 'color',
      
      // Background
      'background', 'background-color', 'background-image', 'background-size',
      'background-position', 'background-repeat',
      
      // Effects
      'opacity', 'box-shadow', 'text-shadow', 'transform', 'transition',
      'animation', 'filter', 'cursor', 'visibility'
    ];

    importantProps.forEach(prop => {
      const value = computed.getPropertyValue(prop);
      if (value) {
        styles[prop] = value;
      }
    });

    return styles;
  }

  // === 获取 Box Model 信息 ===
  function getBoxModel(element) {
    const computed = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return {
      content: {
        width: parseFloat(computed.width),
        height: parseFloat(computed.height)
      },
      padding: {
        top: parseFloat(computed.paddingTop),
        right: parseFloat(computed.paddingRight),
        bottom: parseFloat(computed.paddingBottom),
        left: parseFloat(computed.paddingLeft)
      },
      border: {
        top: parseFloat(computed.borderTopWidth),
        right: parseFloat(computed.borderRightWidth),
        bottom: parseFloat(computed.borderBottomWidth),
        left: parseFloat(computed.borderLeftWidth)
      },
      margin: {
        top: parseFloat(computed.marginTop),
        right: parseFloat(computed.marginRight),
        bottom: parseFloat(computed.marginBottom),
        left: parseFloat(computed.marginLeft)
      }
    };
  }

  // === 获取元素信息 ===
  function getElementInfo(element) {
    if (!element) return null;

    return {
      tagName: element.tagName.toLowerCase(),
      id: element.id || '',
      classes: Array.from(element.classList),
      selector: generateSelector(element),
      computedStyles: getComputedStyles(element),
      boxModel: getBoxModel(element),
      inlineStyles: element.style.cssText
    };
  }

  // === 鼠标移动处理 ===
  function handleMouseMove(e) {
    if (!state.isPickingMode) return;

    // 忽略我们自己创建的覆盖层
    let target = e.target;
    if (target.classList && target.classList.contains('css-inspector-overlay')) {
      return;
    }

    // 更新 hover 状态
    if (state.hoveredElement !== target) {
      state.hoveredElement = target;
      
      if (!state.highlightOverlay) {
        state.highlightOverlay = createOverlay('hover');
      }
      
      showOverlay(state.highlightOverlay);
      updateOverlay(state.highlightOverlay, target);
    }
  }

  // === 点击处理 ===
  function handleClick(e) {
    console.log('handleClick called, isPickingMode:', state.isPickingMode);
    if (!state.isPickingMode) return;

    e.preventDefault();
    e.stopPropagation();

    let target = e.target;
    console.log('Clicked element:', target);
    if (target.classList && target.classList.contains('css-inspector-overlay')) {
      return;
    }

    // 选中元素
    state.selectedElement = target;

    // 创建或更新选中覆盖层
    if (!state.selectedOverlay) {
      state.selectedOverlay = createOverlay('selected');
    }
    
    showOverlay(state.selectedOverlay);
    updateOverlay(state.selectedOverlay, target);

    // 隐藏 hover 覆盖层
    hideOverlay(state.highlightOverlay);

    // 获取元素信息并发送到 panel
    const elementInfo = getElementInfo(target);
    sendToPanel('elementSelected', elementInfo);

    // 不再自动停止选择模式，允许连续选择
    // stopPickingMode();
  }

  // === 启动选择模式 ===
  function startPickingMode() {
    console.log('startPickingMode called');
    state.isPickingMode = true;
    document.body.style.cursor = 'crosshair';
    
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    console.log('Event listeners added, picking mode active');
  }

  // === 停止选择模式 ===
  function stopPickingMode() {
    state.isPickingMode = false;
    document.body.style.cursor = '';
    
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('click', handleClick, true);
    
    hideOverlay(state.highlightOverlay);
  }

  // === 应用样式修改 ===
  function applyStyleChange(selector, property, value) {
    try {
      // 找到对应的元素
      const element = state.selectedElement || document.querySelector(selector);
      if (!element) {
        return { success: false, error: 'Element not found' };
      }

      // 应用样式
      if (value === null || value === '') {
        element.style.removeProperty(property);
      } else {
        element.style.setProperty(property, value, 'important');
      }

      // 记录修改
      if (!state.modifications.has(element)) {
        state.modifications.set(element, {
          selector: generateSelector(element),
          changes: []
        });
      }

      const mod = state.modifications.get(element);
      const existingChange = mod.changes.find(c => c.property === property);
      
      if (existingChange) {
        existingChange.value = value;
        existingChange.timestamp = Date.now();
      } else {
        mod.changes.push({
          property,
          value,
          timestamp: Date.now()
        });
      }

      // 更新选中覆盖层（样式可能改变了尺寸）
      if (state.selectedElement === element) {
        updateOverlay(state.selectedOverlay, element);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // === 清除所有修改 ===
  function clearAllChanges() {
    state.modifications.forEach((mod, element) => {
      mod.changes.forEach(change => {
        element.style.removeProperty(change.property);
      });
    });
    
    state.modifications.clear();
    
    return { success: true };
  }

  // === 导出修改为 CSS ===
  function exportChanges() {
    const cssRules = [];
    
    state.modifications.forEach((mod, element) => {
      if (mod.changes.length === 0) return;
      
      const selector = mod.selector;
      const declarations = mod.changes
        .filter(c => c.value !== null && c.value !== '')
        .map(c => `  ${c.property}: ${c.value};`)
        .join('\n');
      
      if (declarations) {
        cssRules.push(`${selector} {\n${declarations}\n}`);
      }
    });
    
    return cssRules.join('\n\n');
  }

  // === 发送消息到 panel ===
  function sendToPanel(action, data) {
    console.log('sendToPanel called with action:', action, 'data:', data);
    chrome.runtime.sendMessage({
      action: 'forwardToPanel',
      data: { action, data }
    }).catch(err => {
      console.error('Failed to send message to panel:', err);
    });
  }

  // === 监听来自 panel 的消息 ===
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    try {
      switch (request.action) {
        case 'ping':
          console.log('Ping received, responding...');
          sendResponse({ success: true });
          break;

        case 'startPicking':
          console.log('startPicking message received');
          startPickingMode();
          sendResponse({ success: true });
          break;

        case 'stopPicking':
          stopPickingMode();
          sendResponse({ success: true });
          break;

        case 'applyStyle':
          const result = applyStyleChange(
            request.selector,
            request.property,
            request.value
          );
          sendResponse(result);
          break;

        case 'clearChanges':
          sendResponse(clearAllChanges());
          break;

        case 'exportChanges':
          sendResponse({ css: exportChanges() });
          break;

        case 'getSelectedElement':
          if (state.selectedElement) {
            sendResponse({ 
              success: true, 
              data: getElementInfo(state.selectedElement) 
            });
          } else {
            sendResponse({ success: false, error: 'No element selected' });
          }
          break;

        case 'refreshElement':
          if (state.selectedElement) {
            sendToPanel('elementSelected', getElementInfo(state.selectedElement));
            sendResponse({ success: true });
          } else {
            sendResponse({ success: false, error: 'No element selected' });
          }
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }

    return true; // 保持消息通道开放
  });

  // === 监听窗口大小变化，更新覆盖层 ===
  window.addEventListener('resize', () => {
    if (state.selectedElement) {
      updateOverlay(state.selectedOverlay, state.selectedElement);
    }
  });

  // === 监听滚动，更新覆盖层 ===
  window.addEventListener('scroll', () => {
    if (state.selectedElement) {
      updateOverlay(state.selectedOverlay, state.selectedElement);
    }
    if (state.hoveredElement && state.isPickingMode) {
      updateOverlay(state.highlightOverlay, state.hoveredElement);
    }
  }, true);

  console.log('CSS Inspector content script loaded');
})();
