const OPEN = "open-incognito";
const OPEN_CLOSE = "open-incognito-close";

// On install
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        chrome.storage.sync.set({
            labsUrl: 'https://labcomputounitec.wixsite.com/home',
            defaultUrl: 'https://www.unitec.mx',
            evaluationsUrl: 'https://unitecsiee.com'
        });
        chrome.runtime.openOptionsPage();
    }
});

// Icon click
chrome.action.onClicked.addListener(function (tab) {
    chrome.storage.sync.get(['enabled']).then((data) => {
        if (data.enabled) {
            openInIncognito({menuItemId: OPEN}, tab);
        } else {
            chrome.runtime.openOptionsPage();
        }
    });
});

// Context menu
chrome.contextMenus.onClicked.addListener(openInIncognito);
chrome.contextMenus.create(
    {
        "title": "Abrir esta pestaña en modo incógnito",
        "contexts": ["page"],
        "id": OPEN
    });

chrome.contextMenus.create(
    {
        "title": "Abrir esta pestaña en modo incógnito y cerrar esta pestaña",
        "contexts": ["page"],
        "id": OPEN_CLOSE
    });

function openInIncognito(info, tab) {
    chrome.storage.sync.get(['setUrl', 'defaultUrl']).then((data) => {
        let url = tab.url;
        if (checkChromeUrl(url)) {
            url = data.setUrl || data.defaultUrl;
        }
        chrome.windows.create(
            {
                "url": url,
                "incognito": !tab.incognito,
                "focused": true,
                "state": "maximized"
            });

        if (info.menuItemId === OPEN_CLOSE) {
            chrome.tabs.remove(tab.id);
        }
    });
}

function checkChromeUrl(url) {
    return url.startsWith('chrome://') || url.startsWith('chrome-extension://');
}
