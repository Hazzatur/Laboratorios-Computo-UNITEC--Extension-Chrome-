const OPEN = "open-incognito";
const OPEN_CLOSE = "open-incognito-close";

// On install
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        chrome.storage.sync.set({
            labsUrl: 'https://labcomputounitec.wixsite.com/home',
            defaultUrl: 'https://www.unitec.mx',
            evaluationsUrl: 'https://unitecsiee.com',
            iconUrls: [
                {url: 'https://unitecsiee.com', enabled: true},
                {url: 'https://unitecmx.ca1.qualtrics.com/jfe/form/SV_0j2bf0rn3O9YzBk', enabled: true}
            ]
        });
        chrome.runtime.openOptionsPage();
    }
});

// Icon click
chrome.action.onClicked.addListener(function (tab) {
    chrome.storage.sync.get(['enabled', 'iconUrls', 'customIconUrls']).then((data) => {
        if (data.enabled) {
            openTabsInIncognito(data.iconUrls, data.customIconUrls);
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

// Keyboard shortcut
chrome.commands.onCommand.addListener(function (command) {
    if (command === "open_in_incognito") {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            if (tabs[0]) {
                openInIncognito({menuItemId: OPEN}, tabs[0]);
            }
        });
    }
});


// Functions
async function openTabsInIncognito(iconUrls, customIconUrls) {
    const urlsToOpen = iconUrls.concat(customIconUrls)
        .filter(urlObj => urlObj && urlObj.enabled && urlObj.url)
        .map(urlObj => urlObj.url);

    if (urlsToOpen.length === 0) {
        urlsToOpen.push('https://labcomputounitec.wixsite.com/home');
    }

    await chrome.windows.create({
        url: urlsToOpen,
        incognito: true
    });
}

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

        if (info.menuItemId === OPEN_CLOSE && tab.url === url) {
            chrome.tabs.remove(tab.id);
        }
    });
}

function checkChromeUrl(url) {
    return url.startsWith('chrome://') || url.startsWith('chrome-extension://');
}
