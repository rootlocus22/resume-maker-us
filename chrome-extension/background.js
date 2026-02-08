const LINKEDIN_ORIGIN = 'linkedin.com';

function setupSidePanel(tabId, url) {
    if (!url) return;
    const urlObj = new URL(url);
    if (urlObj.origin.includes(LINKEDIN_ORIGIN)) {
        chrome.sidePanel.setOptions({
            tabId,
            path: 'sidepanel.html',
            enabled: true
        });
    } else {
        // Explicitly disable for other sites to ensure auto-close
        chrome.sidePanel.setOptions({
            tabId,
            enabled: false
        });
    }
}

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
    if (info.status === 'complete' && tab.url) {
        setupSidePanel(tabId, tab.url);
    }
});

// Also check on activation to force state update
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    if (tab.url) {
        setupSidePanel(activeInfo.tabId, tab.url);
    }
});

// Initial check on install/update
chrome.runtime.onInstalled.addListener(async () => {
    const tabs = await chrome.tabs.query({});
    tabs.forEach(tab => {
        if (tab.url) setupSidePanel(tab.id, tab.url);
    });
});
