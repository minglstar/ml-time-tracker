/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// 监听标签页变化并发送消息
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (tab.url) {
      try {
        const resp = chrome.runtime.sendMessage({
          action: 'tabChanged',
          url: tab.url,
        });
        console.log('Message sent, response:', resp);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  });
});

// 处理来自popup或content script的消息
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'getData') {
    chrome.storage.sync.get(['key'], result => {
      sendResponse({ data: result.key });
    });
    return true; // 保持消息通道开放以进行异步响应
  }
});
