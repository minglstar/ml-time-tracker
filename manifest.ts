import { type ManifestV3Export } from '@samrum/vite-plugin-web-extension';

const manifest: ManifestV3Export = {
    manifest_version: 3,
    name: 'ML Time Tracker',
    version: '1.0.0',
    description: 'Track your time with ML!',
    action: {
        default_popup: 'public/popup.html',
        default_icon: {
            // '16': 'public/images/icon16.png',
            // '32': 'public/images/icon32.png',
            '48': 'assets/images/icon-48.png',
            '128': 'assets/images/icon-128.png',
        },
    },
    icons: {
        // '16': 'public/images/icon16.png',
        // '32': 'public/images/icon32.png',
        '48': 'assets/images/icon-48.png',
        '128': 'assets/images/icon-128.png',
    },
    permissions: ['storage', 'alarms', 'notifications'],
    host_permissions: ['<all_urls>'],
    background: {
        service_worker: 'background.js',
        type: 'module'
    },
    content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self'"
    }
};

export default manifest;
