// 监听扩展安装或更新事件
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

// 处理来自内容脚本或弹出窗口的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'someAction') {
        // 执行相应操作
        sendResponse({ result: 'Action completed' });
    }
});

// 设置定期任务
chrome.alarms.create('checkTimer', { periodInMinutes: 30 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkTimer') {
        // 执行定期任务
    }
});

// 其他后台逻辑...

