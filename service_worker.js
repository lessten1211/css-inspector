/**
 * Service Worker - Background Script
 * 处理扩展图标点击、side panel 管理和消息转发
 */

// 点击扩展图标时打开 side panel
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id }).catch((err) => {
    console.error('Failed to open side panel:', err);
  });
});

// 监听来自 content script 和 panel 的消息并转发
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 转发消息到目标
  if (request.action === 'forwardToPanel') {
    // 从 content script 转发到 panel
    // 注意：直接从 background 发送到 panel 需要特殊处理
    // 这里我们将数据存储在 storage 中，panel 通过轮询获取
    chrome.storage.local.set({ 
      latestElementData: request.data,
      timestamp: Date.now()
    });
    sendResponse({ success: true });
  } else if (request.action === 'forwardToContent') {
    // 从 panel 转发到 content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, request.data, (response) => {
          sendResponse(response);
        });
      }
    });
    return true; // 保持消息通道开放
  } else if (request.action === 'injectContentScript') {
    // 确保 content script 已注入
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ['content_script.js']
          });
          sendResponse({ success: true });
        } catch (error) {
          console.error('Failed to inject content script:', error);
          sendResponse({ success: false, error: error.message });
        }
      }
    });
    return true;
  }
  
  return true; // 保持消息通道开放以支持异步响应
});

// 监听标签页更新，清理状态
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // 页面加载完成，清理旧的选中状态
    chrome.storage.local.remove(['latestElementData']);
  }
});

// 安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('StyleProbe extension installed12');
  
  // 设置默认配置
  chrome.storage.local.set({
    highlightColor: '#4A90E2',
    selectedColor: '#FF6B35'
  });
});
