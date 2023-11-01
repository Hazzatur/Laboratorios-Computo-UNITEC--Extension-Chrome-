document.addEventListener('DOMContentLoaded', function () {
    const checkbox = document.getElementById('enabled');
    const optionsContainer = document.getElementById('optionsContainer');
    const urlOptions = document.getElementsByName('urlOption');
    const customUrlInput = document.getElementById('customUrlInput');
    const customUrlLabel = document.getElementById('customUrlLabel');

    chrome.storage.sync.get(['enabled', 'urlOption', 'customUrl'], function (data) {
        checkbox.checked = data.enabled !== false;
        optionsContainer.style.display = checkbox.checked ? 'block' : 'none';

        const urlOption = data.urlOption || 'default';
        let customUrl = data.customUrl || 'https://www.unitec.mx';

        if (checkbox.checked) {
            chrome.storage.sync.set({customUrl: formatUrl(customUrl)});
        }

        for (let i = 0; i < urlOptions.length; i++) {
            urlOptions[i].checked = urlOptions[i].value === urlOption;
        }

        customUrlInput.value = urlOption === 'custom' ? customUrl : '';
        customUrlInput.disabled = urlOption !== 'custom';
        customUrlInput.style.display = urlOption === 'custom' ? 'block' : 'none';
        customUrlLabel.style.display = urlOption === 'custom' ? 'block' : 'none';
    });

    checkbox.addEventListener('change', function () {
        chrome.storage.sync.set({enabled: checkbox.checked});
        optionsContainer.style.display = checkbox.checked ? 'block' : 'none';
        if (checkbox.checked) {
            const selectedUrlOption = document.querySelector('input[name="urlOption"]:checked').value;
            if (selectedUrlOption === 'custom') {
                const customUrl = customUrlInput.value || '';
                chrome.storage.sync.set({customUrl: formatUrl(customUrl)});
            } else {
                const url = selectedUrlOption === 'default' ? 'https://www.unitec.mx' : 'https://unitecsiee.com';
                chrome.storage.sync.set({customUrl: url});
            }
        } else {
            chrome.storage.sync.remove('customUrl');
        }
    });

    for (let i = 0; i < urlOptions.length; i++) {
        urlOptions[i].addEventListener('change', function () {
            const value = urlOptions[i].value;
            chrome.storage.sync.set({urlOption: value});

            customUrlInput.disabled = value !== 'custom';
            customUrlInput.style.display = value === 'custom' ? 'block' : 'none';
            customUrlLabel.style.display = value === 'custom' ? 'block' : 'none';

            if (value === 'custom') {
                customUrlInput.value = '';
                chrome.storage.sync.remove('customUrl');
            } else {
                const url = value === 'default' ? 'https://www.unitec.mx' : 'https://unitecsiee.com';
                chrome.storage.sync.set({customUrl: url});
            }
        });
    }

    customUrlInput.addEventListener('input', function () {
        const value = customUrlInput.value;
        if (value) {
            const formattedUrl = formatUrl(value);
            chrome.storage.sync.set({customUrl: formattedUrl});
        } else {
            chrome.storage.sync.remove('customUrl');
        }
    });

    function formatUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return 'https://' + url;
        }
        return url;
    }
});
