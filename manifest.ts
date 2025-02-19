const manifest = {
    manifest_version: 3,
    name: 'ML Time Tracker',
    version: '1.0.0',
    description: 'Track your time with ML!',
    action: {
        default_popup: 'public/popup.html', // 确保指向 public 目录下的 popup.html
        default_icon: {
            '48': 'assets/images/icon-48.png', // 确保指向正确的图标路径
            '128': 'assets/images/icon-128.png',
        },
    },
    icons: {
        '48': 'assets/images/icon-48.png', // 确保指向正确的图标路径
        '128': 'assets/images/icon-128.png',
    },
    permissions: ['storage', 'alarms', 'notifications'],
    host_permissions: ['<all_urls>', "https://api.com/*"],
    background: {
        service_worker: 'background.js', // background.js 与 manifest.ts 在同一目录
        type: 'module',
    },
    content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self'",
    },
};

export default manifest;
