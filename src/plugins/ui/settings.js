const { ipcRenderer } = require('electron');
const path = require("path");
const fs = require("fs");

async function injectCopyButton() {
    const footer = document.querySelector('[class^="footer-"]');
    if (!footer) return;

    // Check if Copy button already exists
    if (footer.querySelector('[title="Copy API Key"]')) return;


    const copyBtn = document.createElement('div');
    copyBtn.setAttribute('tabindex', '0');
    copyBtn.setAttribute('title', 'Copy API Key');

    // Apply the same classes as reloadBtn
    const reloadClasses = ["reload","button-container"]

    reloadClasses.forEach(cls => copyBtn.classList.add(cls));

    const label = document.createElement('div');
    label.innerText = 'Copy API Key';
    copyBtn.appendChild(label);

    copyBtn.addEventListener('click', async () => {
        console.log('BUTTON CLICK')
        const key = await ipcRenderer.invoke('get-api-key');
        await navigator.clipboard.writeText(key);
        toast_create('Copied API Key', 'API Key copied to clipboard!');
    });

    // Insert the copy button after the reload button, or anywhere in footer
    footer.appendChild(copyBtn);
}

function toast_create(title, message) {
    const appDiv = document.getElementById('app');
    if (!appDiv) return;

    const toastContainer = appDiv.querySelector('[class^="toasts-container-"]');
    if (!toastContainer) return;

    // Create the toast element
    const toast = document.createElement('div');
    toast.setAttribute('tabIndex', '-1');
    const toastClasses = ["toast-item-container", "success", "button-container"]
    toastClasses.forEach(cls => toast.classList.add(cls));

    // Create icon container
    const iconContainer = document.createElement('div');
    iconContainer.className = "icon-container"
    const svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgIcon.setAttribute('class', "icon");
    svgIcon.setAttribute('viewBox', '0 0 512 512');

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M416 128l-224 256-96-96');
    path1.setAttribute('style', 'stroke: currentcolor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 60; fill: none;');

    svgIcon.appendChild(path1);
    iconContainer.appendChild(svgIcon);
    toast.appendChild(iconContainer);

    // Create info container
    const infoContainer = document.createElement('div');
    infoContainer.className = "info-container"

    const titleContainer = document.createElement('div');
    titleContainer.className = "title-container"
    titleContainer.innerText = title;

    const messageContainer = document.createElement('div');
    messageContainer.className = "message-container"
    messageContainer.innerText = message;

    infoContainer.appendChild(titleContainer);
    infoContainer.appendChild(messageContainer);
    toast.appendChild(infoContainer);

    // Create close button
    const closeButton = document.createElement('div');
    closeButton.setAttribute('tabIndex', '-1');
    closeButton.setAttribute('title', 'Close');
    const closeClasses = ["close-button-container", "button-container"]
    closeClasses.forEach(cls => closeButton.classList.add(cls));

    const svgClose = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgClose.setAttribute('class', 'icon');
    svgClose.setAttribute('viewBox', '0 0 512 512');

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M289.90000000000146 256l95-95c4.5-4.53 7-10.63 7.1-17 0-6.38-2.5-12.5-7-17.02s-10.6-7.07-17-7.08c-3.2-0.01-6.3 0.61-9.2 1.81s-5.6 2.96-7.8 5.19l-95 95-95-95c-3.4-3.33-7.6-5.6-12.3-6.51-4.6-0.91-9.4-0.42-13.8 1.4-4.4 1.79-8.1 4.86-10.8 8.81-2.6 3.94-4 8.58-4 13.33-0.1 3.15 0.5 6.28 1.7 9.19 1.2 2.92 3 5.57 5.2 7.78l95 95-95 95c-2.8 2.8-4.8 6.24-6 10.02-1.1 3.78-1.3 7.78-0.5 11.64 0.8 3.87 2.5 7.48 5 10.52 2.5 3.05 5.8 5.43 9.4 6.93 4.4 1.81 9.2 2.29 13.8 1.39 4.7-0.91 8.9-3.17 12.3-6.5l95-95 95 95c3.4 3.34 7.6 5.6 12.3 6.51 4.6 0.92 9.4 0.43 13.8-1.39 4.4-1.8 8.1-4.87 10.8-8.82 2.6-3.94 4-8.58 4-13.33 0.1-3.15-0.5-6.28-1.7-9.2-1.2-2.91-3-5.56-5.2-7.77z');
    path2.setAttribute('style', 'fill: currentcolor;');
    svgClose.appendChild(path2);
    closeButton.appendChild(svgClose);
    toast.appendChild(closeButton);

    // Close the toast when the close button is clicked
    closeButton.addEventListener('click', () => {
        toast.remove();
    });

    // Append the toast to the container
    toastContainer.appendChild(toast);

    // remove the toast after a delay
    setTimeout(() => {
        toast.remove();
    }, 3000); // 3 seconds
}

function injectCSS() {
    const cssPath = path.join(__dirname, 'styles.css');
    if (fs.existsSync(cssPath)) {
        const head = document.getElementsByTagName('head')[0];
        const link = document.createElement('link');
        link.id = "global_styles_inject";
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = 'file://' + cssPath;
        link.media = 'all';
        head.appendChild(link);
    } else {
        console.error(`styles.css not found at path: ${cssPath}`);
    }
}

function checkSettingsPage() {
    if (!document.querySelector('[id="global_styles_inject"]')) {
        setTimeout(injectCSS, 250);
    }

    if (location.hash.endsWith('/settings')) {
        setTimeout(injectCopyButton, 500);
    }
}

window.addEventListener('hashchange', checkSettingsPage);
document.addEventListener('DOMContentLoaded', checkSettingsPage);
