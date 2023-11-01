chrome.storage.sync.get(['enabled', 'customUrl'], function (data) {
    if (data.enabled !== false) {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            const activeTab = tabs[0];
            let url = activeTab.url;
            if (url.startsWith('chrome://')) {
                url = data.customUrl || 'chrome://newtab/';
            }
            chrome.windows.create({
                url: url,
                incognito: true,
            });
        });
    } else {
        chrome.runtime.openOptionsPage();
    }
});
