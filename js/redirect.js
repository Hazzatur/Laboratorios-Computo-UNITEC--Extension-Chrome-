chrome.storage.sync.get(['enabled', 'setUrl', 'labsUrl'], function (data) {
    const url = data.setUrl !== '' ? data.setUrl : data.labsUrl;
    window.location.href = data.enabled ? url : data.labsUrl;
});
