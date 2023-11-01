chrome.storage.sync.get('customUrl', function (data) {
    window.location.href = data.customUrl || 'https://labcomputounitec.wixsite.com/home';
});
