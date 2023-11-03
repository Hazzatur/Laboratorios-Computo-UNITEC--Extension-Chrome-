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

    let urlOption;
    let labsUrl;
    let defaultUrl;
    let evaluationsUrl;
    let customUrl;

    chrome.storage.sync.get(['enabled', 'urlOption', 'labsUrl', 'defaultUrl', 'evaluationsUrl', 'customUrl'], function (data) {
        const enabledValue = data.enabled === undefined ? true : data.enabled;
        chrome.storage.sync.set({enabled: enabledValue});
        checkbox.checked = enabledValue;

        const urlOptionValue = !!data.urlOption ? data.urlOption : UrlOption.DEFAULT;
        chrome.storage.sync.set({urlOption: urlOptionValue});
        urlOption = urlOptionValue;
        labsUrl = data.labsUrl;
        defaultUrl = data.defaultUrl;
        evaluationsUrl = data.evaluationsUrl;

        const customUrlValue = !!data.customUrl ? data.customUrl : '';
        chrome.storage.sync.set({customUrl: customUrlValue});
        customUrl = customUrlValue;

        optionsContainer.style.display = checkbox.checked ? 'block' : 'none';

        for (let i = 0; i < urlOptions.length; i++) {
            urlOptions[i].checked = urlOptions[i].value === urlOption;
        }

        setUrl(urlOption);
    });

    checkbox.addEventListener('change', function () {
        chrome.storage.sync.set({enabled: checkbox.checked});
        optionsContainer.style.display = checkbox.checked ? 'block' : 'none';
        if (checkbox.checked) {
            setUrl(urlOption);
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
        customUrl = customUrlInput.value;
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
                url = defaultUrl;
                break;
            case UrlOption.EVALUATIONS:
                url = evaluationsUrl;
                break;
            case UrlOption.CUSTOM:
                customUrlInput.value = customUrl;
                url = customUrl !== '' ? formatUrl(customUrl) : '';
                break;
            default:
                url = labsUrl;
                break;
        }
        chrome.storage.sync.set({setUrl: url});
    }
});
