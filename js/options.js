document.addEventListener('DOMContentLoaded', function () {
    const UrlOption = {
        DEFAULT: 'default',
        EVALUATIONS: 'evaluations',
        LABS: 'labs',
        CUSTOM: 'custom'
    }

    const checkbox = document.getElementById('enabled');
    const optionsContainer = document.getElementById('optionsContainer');
    const urlOptions = document.getElementsByName('urlOption');
    const customUrlInput = document.getElementById('customUrlInput');
    const customUrlLabel = document.getElementById('customUrlLabel');
    const iconOptions = document.getElementsByName('iconOption');
    const addCustomUrlButton = document.getElementById('addCustomUrlButton');

    chrome.storage.sync.get(['enabled', 'urlOption', 'customUrl', 'iconUrls', 'customIconUrls']).then((data) => {
        const enabledValue = data.enabled === undefined ? true : data.enabled;
        chrome.storage.sync.set({enabled: enabledValue});
        checkbox.checked = enabledValue;

        const urlOptionValue = !!data.urlOption ? data.urlOption : UrlOption.DEFAULT;
        chrome.storage.sync.set({urlOption: urlOptionValue});

        const customUrlValue = !!data.customUrl ? data.customUrl : '';
        chrome.storage.sync.set({customUrl: customUrlValue});

        const iconUrlsValue = data.iconUrls || [];
        chrome.storage.sync.set({iconUrls: iconUrlsValue});

        const customIconUrlsValue = data.customIconUrls || [];
        chrome.storage.sync.set({customIconUrls: customIconUrlsValue});

        optionsContainer.style.display = checkbox.checked ? 'block' : 'none';

        for (let i = 0; i < urlOptions.length; i++) {
            urlOptions[i].checked = urlOptions[i].value === urlOptionValue;
        }

        for (let i = 0; i < iconOptions.length; i++) {
            iconOptions[i].checked = data.iconUrls[i].enabled;
        }

        for (let i = 0; i < customIconUrlsValue.length; i++) {
            const {url, enabled} = customIconUrlsValue[i];
            const {checkbox, input} = createCustomUrlComponent(i, enabled);
            checkbox.checked = enabled;
            input.value = url;
        }

        setUrl(urlOptionValue);
    });

    checkbox.addEventListener('change', function () {
        chrome.storage.sync.set({enabled: checkbox.checked});
        optionsContainer.style.display = checkbox.checked ? 'block' : 'none';
        if (checkbox.checked) {
            chrome.storage.sync.get(['urlOption']).then((data) => {
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

    for (let i = 0; i < iconOptions.length; i++) {
        iconOptions[i].addEventListener('change', function () {
            chrome.storage.sync.get(['iconUrls']).then((data) => {
                data.iconUrls[i].enabled = iconOptions[i].checked;
                chrome.storage.sync.set({iconUrls: data.iconUrls});
            });
        });
    }

    customUrlInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            saveCustomUrl();
        }
    });

    customUrlInput.addEventListener('blur', saveCustomUrl);

    addCustomUrlButton.addEventListener('click', addCustomUrl);

    function saveCustomUrl() {
        chrome.storage.sync.set({customUrl: customUrlInput.value}).then(() => {
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
        chrome.storage.sync.get(['customUrl']).then((data) => {
            customUrl = data.customUrl;
        });

        customUrlInput.value = urlOption === UrlOption.CUSTOM ? customUrl : '';
        customUrlInput.disabled = urlOption !== UrlOption.CUSTOM;
        customUrlInput.style.display = urlOption === UrlOption.CUSTOM ? 'block' : 'none';
        customUrlLabel.style.display = urlOption === UrlOption.CUSTOM ? 'block' : 'none';
    }

    function setUrl(urlOption) {
        toggleCustomUrlField(urlOption);

        switch (urlOption) {
            case UrlOption.DEFAULT:
                chrome.storage.sync.get(['defaultUrl']).then((data) => {
                    chrome.storage.sync.set({setUrl: data.defaultUrl})
                });
                break;
            case UrlOption.EVALUATIONS:
                chrome.storage.sync.get(['evaluationsUrl']).then((data) => {
                    chrome.storage.sync.set({setUrl: data.evaluationsUrl})
                });
                break;
            case UrlOption.CUSTOM:
                chrome.storage.sync.get(['customUrl']).then((data) => {
                    let customUrl = data.customUrl;
                    customUrlInput.value = !!customUrl ? customUrl : '';
                    chrome.storage.sync.set({setUrl: !!customUrl ? formatUrl(customUrl) : ''})
                });
                break;
            case UrlOption.LABS:
            default:
                chrome.storage.sync.get(["labsUrl"]).then((data) => {
                    chrome.storage.sync.set({setUrl: data.labsUrl})
                });
                break;
        }
    }

    function createCustomUrlComponent(index, isEnabled = true) {
        const container = document.createElement('div');
        container.classList.add('custom-url-container');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `customUrlEnabled-${index}`;
        checkbox.checked = isEnabled;

        const input = document.createElement('input');
        input.type = 'text';
        input.id = `customUrl-${index}`;
        input.placeholder = 'Especifique la URL';
        input.disabled = !isEnabled;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = '✖';
        deleteButton.classList.add('delete-custom-url');
        deleteButton.id = `deleteCustomUrl-${index}`; // Set unique ID for each delete button
        deleteButton.type = 'button'; // Ensure this button does not submit forms
        deleteButton.title = 'Eliminar URL';

        container.appendChild(checkbox);
        container.appendChild(input);
        container.appendChild(deleteButton);

        checkbox.addEventListener('change', function () {
            input.disabled = !checkbox.checked;
            saveCustomIconUrls(index, input.value, checkbox.checked);
        });

        deleteButton.addEventListener('click', function () {
            removeCustomUrl(index, container);
        });

        input.addEventListener('blur', function () {
            if (input.value) {
                const url = formatUrl(input.value);
                saveCustomIconUrls(index, url, checkbox.checked);
            }
        });

        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (input.value) {
                    const url = formatUrl(input.value);
                    saveCustomIconUrls(index, url, checkbox.checked);
                }
            }
        });

        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.appendChild(container);

        return {checkbox, input, deleteButton};
    }

    function saveCustomIconUrls(index, url, enabled) {
        chrome.storage.sync.get(['customIconUrls'], function (data) {
            const customIconUrls = data.customIconUrls || [];

            // Expand the array to the new index if necessary
            while (index >= customIconUrls.length) {
                customIconUrls.push({url: '', enabled: false});
            }

            // Update the entry
            customIconUrls[index] = {url, enabled};

            // Save the updated array back to storage
            chrome.storage.sync.set({customIconUrls: customIconUrls}, function () {
                if (chrome.runtime.lastError) {
                    console.error('Error saving custom icon URLs:', chrome.runtime.lastError);
                } else {
                    console.log('Custom icon URLs saved successfully.');
                }
            });
        });
        location.reload();
    }

    function addCustomUrl() {
        const customUrlComponents = document.querySelectorAll('.custom-url-container').length;
        createCustomUrlComponent(customUrlComponents);
    }

    function removeCustomUrl(index, container) {
        chrome.storage.sync.get(['customIconUrls'], function (data) {
            const customIconUrls = data.customIconUrls || [];
            if (customIconUrls[index]) {
                // Remove the URL from the array
                customIconUrls.splice(index, 1);

                // Save the updated array back to storage
                chrome.storage.sync.set({customIconUrls: customIconUrls}, function () {
                    if (chrome.runtime.lastError) {
                        console.error('Error removing custom icon URL:', chrome.runtime.lastError);
                    } else {
                        console.log('Custom icon URL removed successfully.');
                        // Remove the container from the DOM
                        container.remove();
                    }
                });
            }
        });
        location.reload();
    }
});
