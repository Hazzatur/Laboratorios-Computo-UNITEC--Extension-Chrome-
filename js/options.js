document.addEventListener('DOMContentLoaded', function () {
    const UrlOption = {
        DEFAULT: 'default',
        EVALUATIONS: 'evaluations',
        CUSTOM: 'custom'
    }

    const checkbox = document.getElementById('enabled');
    const optionsContainer = document.getElementById('optionsContainer');
    const urlOptions = document.getElementsByName('urlOption');
    const customUrlInput = document.getElementById('customUrlInput');
    const customUrlLabel = document.getElementById('customUrlLabel');

    chrome.storage.sync.get(['enabled', 'urlOption', 'customUrl'], function (data) {
        const enabledValue = data.enabled === undefined ? true : data.enabled;
        chrome.storage.sync.set({enabled: enabledValue});
        checkbox.checked = enabledValue;

        const urlOptionValue = !!data.urlOption ? data.urlOption : UrlOption.DEFAULT;
        chrome.storage.sync.set({urlOption: urlOptionValue});

        const customUrlValue = !!data.customUrl ? data.customUrl : '';
        chrome.storage.sync.set({customUrl: customUrlValue});

        optionsContainer.style.display = checkbox.checked ? 'block' : 'none';

        for (let i = 0; i < urlOptions.length; i++) {
            urlOptions[i].checked = urlOptions[i].value === urlOptionValue;
        }

        setUrl(urlOptionValue);
    });

    checkbox.addEventListener('change', function () {
        chrome.storage.sync.set({enabled: checkbox.checked});
        optionsContainer.style.display = checkbox.checked ? 'block' : 'none';
        if (checkbox.checked) {
            chrome.storage.sync.get(['urlOption'], function (data) {
                setUrl(data.urlOption);
            });
        }
    });

    for (let i = 0; i < urlOptions.length; i++) {
        urlOptions[i].addEventListener('change', function () {
            const urlOption = urlOptions[i].value
            chrome.storage.sync.set({urlOption: urlOption});
            setUrl(urlOption)
        });
    }

    customUrlInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            saveCustomUrl();
        }
    });

    customUrlInput.addEventListener('blur', saveCustomUrl);

    function saveCustomUrl() {
        chrome.storage.sync.set({customUrl: customUrlInput.value}, function () {
            // Add the 'saved' class to the container of the input to show the tick
            document.querySelector('.input-container').classList.add('saved');
            // Remove the 'saved' class after a few seconds
            setTimeout(function () {
                document.querySelector('.input-container').classList.remove('saved');
            }, 3000);
        });
        setUrl(UrlOption.CUSTOM)
    }

    function formatUrl(url) {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (url.endsWith('/')) {
                url = url.substring(0, url.length - 1);
            }

            return 'https://' + url;
        }

        return url;
    }

    function toggleCustomUrlField(urlOption) {
        let customUrl;
        chrome.storage.sync.get(['customUrl'], function (data) {
            customUrl = data.customUrl;
        });

        customUrlInput.value = urlOption === UrlOption.CUSTOM ? customUrl : '';
        customUrlInput.disabled = urlOption !== UrlOption.CUSTOM;
        customUrlInput.style.display = urlOption === UrlOption.CUSTOM ? 'block' : 'none';
        customUrlLabel.style.display = urlOption === UrlOption.CUSTOM ? 'block' : 'none';
    }

    function setUrl(urlOption) {
        toggleCustomUrlField(urlOption)

        let url;
        switch (urlOption) {
            case UrlOption.DEFAULT:
                chrome.storage.sync.get(['defaultUrl'], function (data) {
                    url = data.defaultUrl;
                });
                break;
            case UrlOption.EVALUATIONS:
                chrome.storage.sync.get(['evaluationsUrl'], function (data) {
                    url = data.evaluationsUrl;
                });
                break;
            case UrlOption.CUSTOM:
                let customUrl;
                chrome.storage.sync.get(['customUrl'], function (data) {
                    customUrl = data.customUrl;
                });
                customUrlInput.value = !!customUrl ? customUrl : '';
                url = !!customUrl ? formatUrl(customUrl) : '';
                break;
            default:
                chrome.storage.sync.get(['labsUrl'], function (data) {
                    url = data.labsUrl;
                });
                break;
        }
        chrome.storage.sync.set({setUrl: url});
    }
});
