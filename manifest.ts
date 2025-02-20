const manifest = {
    manifest_version: 3 as const,
    name: 'ML Time Tracker',
    version: '1.0.0',
    description: 'Track your time with ML!',
    action: {
        default_popup: 'public/popup.html',
        default_icon: {
            '48': 'assets/images/icon-48.png',
            '128': 'assets/images/icon-128.png',
        },
    },
    icons: {
        '48': 'assets/images/icon-48.png',
        '128': 'assets/images/icon-128.png',
    },
    permissions: ['storage', 'alarms', 'notifications'] as const,
    host_permissions: ['<all_urls>', "https://api.com/*"],
    background: {
        service_worker: 'src/background.ts',
        type: 'module',
    },
    content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self'",
    },
} as const;

export default manifest;
