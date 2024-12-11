const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const { initApiKeyLogic } = require('./plugins/logic/api_key');

let mainWindow, apiKey;

function createWindow() {
    // Initialize API key logic
    apiKey = initApiKeyLogic(app, ipcMain);

    mainWindow = new BrowserWindow({
        width: 1500,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
        },
        autoHideMenuBar: true,
        icon: path.join(__dirname, 'icon.ico')
    });

    const filter = { urls: ['*://*/*'] };
    session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
        details.requestHeaders['stremio-api-key'] = apiKey;
        callback({ requestHeaders: details.requestHeaders });
    });

    mainWindow.loadFile(path.join(__dirname, 'stremio-web', 'build', 'index.html'));

    const serverPath = path.join(__dirname, 'stremio-server', 'server.js');
    require(serverPath);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
