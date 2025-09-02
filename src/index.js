const { app, BrowserWindow, ipcMain, session, Menu, shell, dialog } = require('electron');
const path = require('path');
const { initApiKeyLogic } = require('./plugins/logic/api_key');

// Multilingual support
const translations = {
    it: {
        // App menu
        'app.about': 'Informazioni su Stremio',
        'app.hide': 'Nascondi Stremio',
        'app.hideOthers': 'Nascondi Altri',
        'app.showAll': 'Mostra Tutti',
        'app.quit': 'Esci',
        
        // Edit menu
        'edit.title': 'Modifica',
        'edit.undo': 'Annulla',
        'edit.redo': 'Ripeti',
        'edit.cut': 'Taglia',
        'edit.copy': 'Copia',
        'edit.paste': 'Incolla',
        'edit.selectAll': 'Seleziona Tutto',
        
        // View menu
        'view.title': 'Visualizza',
        'view.reload': 'Ricarica',
        'view.forceReload': 'Forza Ricarica',
        'view.zoomIn': 'Zoom Avanti',
        'view.zoomOut': 'Zoom Indietro',
        'view.zoomReset': 'Zoom Reimposta',
        'view.fullscreen': 'Schermo Intero',
        
        // Navigation menu
        'nav.title': 'Navigazione',
        'nav.home': 'Home',
        'nav.discover': 'Scopri',
        'nav.library': 'Libreria',
        'nav.calendar': 'Calendario',
        'nav.addons': 'Addons',
        'nav.settings': 'Impostazioni',
        
        // Window menu
        'window.title': 'Finestra',
        'window.minimize': 'Riduci a Icona',
        'window.close': 'Chiudi',
        
        // Help menu
        'help.title': 'Aiuto',
        'help.support': 'Supporto Stremio',
        
        // About dialog
        'about.title': 'Stremio',
        'about.message': 'Stremio Web Desktop Community'
    },
    en: {
        // App menu
        'app.about': 'About Stremio',
        'app.hide': 'Hide Stremio',
        'app.hideOthers': 'Hide Others',
        'app.showAll': 'Show All',
        'app.quit': 'Quit',
        
        // Edit menu
        'edit.title': 'Edit',
        'edit.undo': 'Undo',
        'edit.redo': 'Redo',
        'edit.cut': 'Cut',
        'edit.copy': 'Copy',
        'edit.paste': 'Paste',
        'edit.selectAll': 'Select All',
        
        // View menu
        'view.title': 'View',
        'view.reload': 'Reload',
        'view.forceReload': 'Force Reload',
        'view.zoomIn': 'Zoom In',
        'view.zoomOut': 'Zoom Out',
        'view.zoomReset': 'Reset Zoom',
        'view.fullscreen': 'Toggle Fullscreen',
        
        // Navigation menu
        'nav.title': 'Navigation',
        'nav.home': 'Home',
        'nav.discover': 'Discover',
        'nav.library': 'Library',
        'nav.calendar': 'Calendar',
        'nav.addons': 'Addons',
        'nav.settings': 'Settings',
        
        // Window menu
        'window.title': 'Window',
        'window.minimize': 'Minimize',
        'window.close': 'Close',
        
        // Help menu
        'help.title': 'Help',
        'help.support': 'Stremio Support',
        
        // About dialog
        'about.title': 'Stremio',
        'about.message': 'Stremio Web Desktop Community'
    }
};

// Detect system language
function getSystemLanguage() {
    const locale = app.getLocale();
    console.log('System locale:', locale);
    
    // Check if Italian is the primary language
    if (locale.startsWith('it')) {
        return 'it';
    }
    
    // Default to English for all other languages
    return 'en';
}

// Get translation
function t(key) {
    const lang = getSystemLanguage();
    return translations[lang][key] || translations.en[key] || key;
}

const platform = process.platform;
//Stremio Server ENVs
process.env['APP_PATH'] = path.join(__dirname, 'stremio-server');
if (platform === 'win32') {
    process.env['FFMPEG_BIN'] = path.join(__dirname, 'ffmpeg', 'ffmpeg.exe');
    process.env['FFPROBE_BIN'] = path.join(__dirname, 'ffmpeg', 'ffprobe.exe');
}

let mainWindow, apiKey;

function getStremioWebVersion() {
    try {
        const fs = require('fs');
        const buildDir = path.join(__dirname, 'stremio-web', 'build');
        
        if (!fs.existsSync(buildDir)) {
            return 'N/A';
        }
        
        // Find the commit hash directory
        const dirs = fs.readdirSync(buildDir).filter(name => 
            fs.statSync(path.join(buildDir, name)).isDirectory() && 
            name.length === 40 // commit hash length
        );
        
        if (dirs.length === 0) {
            return 'N/A';
        }
        
        const commitDir = dirs[0]; // Use the first (and should be only) commit directory
        const mainJsPath = path.join(buildDir, commitDir, 'scripts', 'main.js');
        
        if (!fs.existsSync(mainJsPath)) {
            return 'N/A';
        }
        
        // Read the main.js file and extract version
        const content = fs.readFileSync(mainJsPath, 'utf8');
        const versionMatch = content.match(/5\.0\.0-beta\.[0-9]*/);
        
        if (versionMatch && versionMatch[0]) {
            return versionMatch[0];
        }
        
        return 'N/A';
    } catch (error) {
        console.log('Error reading Stremio Web version:', error.message);
        return 'N/A';
    }
}

function getVersionInfo() {
    const electronVersion = process.versions.electron;
    const nodeVersion = process.versions.node;
    const chromeVersion = process.versions.chrome;
    
    // Get Stremio Web version from the build files
    const stremioWebVersion = getStremioWebVersion();
    
    // Get Stremio Server version
    let stremioServerVersion = 'N/A';
    try {
        const serverPath = path.join(__dirname, 'stremio-server', 'server.js');
        if (require('fs').existsSync(serverPath)) {
            // Try to extract version from server.js or look for version marker
            const versionMarkerPath = path.join(__dirname, 'stremio-server');
            const files = require('fs').readdirSync(versionMarkerPath);
            const versionFile = files.find(file => file.endsWith('.txt'));
            if (versionFile) {
                stremioServerVersion = versionFile.replace('.txt', '');
            }
        }
    } catch (error) {
        console.log('Could not read Stremio Server version:', error.message);
    }
    
    return {
        electron: electronVersion,
        node: nodeVersion,
        chrome: chromeVersion,
        stremioWeb: stremioWebVersion,
        stremioServer: stremioServerVersion
    };
}

function showAboutDialog() {
    try {
        const versionInfo = getVersionInfo();
        
        const message = `

Latest Stremio Web v5 and Server bundled as an Electron App\n        
Versione Electron: ${versionInfo.electron}
Versione Node.js: ${versionInfo.node}
Versione Chrome: ${versionInfo.chrome}

Stremio Web UI: ${versionInfo.stremioWeb}
Stremio Server: ${versionInfo.stremioServer}

Piattaforma: ${process.platform} ${process.arch}

GITHUB: github.com/mccoy88f/stremio-web-desktop`;

        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: t('about.title'),
            message: t('about.message'),
            detail: message,
            buttons: ['OK']
        });
    } catch (error) {
        console.log('Error showing about dialog:', error.message);
        // Fallback dialog with basic info
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: t('about.title'),
            message: t('about.message'),
            detail: `Versione Electron: ${process.versions.electron}\nVersione Node.js: ${process.versions.node}\nVersione Chrome: ${process.versions.chrome}\n\nPiattaforma: ${process.platform} ${process.arch}`,
            buttons: ['OK']
        });
    }
}

function createMenu() {
    if (process.platform === 'darwin') {
        const template = [
            {
                label: 'Stremio',
                submenu: [
                    { label: t('app.about'), click: () => {
                        console.log('About menu clicked');
                        showAboutDialog();
                    }},
                    { type: 'separator' },
                    { label: t('app.hide'), accelerator: 'Command+H', role: 'hide' },
                    { label: t('app.hideOthers'), accelerator: 'Command+Shift+H', role: 'hideothers' },
                    { label: t('app.showAll'), role: 'unhide' },
                    { type: 'separator' },
                    { label: t('app.quit'), accelerator: 'Command+Q', click: () => app.quit() }
                ]
            },
            {
                label: t('edit.title'),
                submenu: [
                    { label: t('edit.undo'), accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                    { label: t('edit.redo'), accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                    { type: 'separator' },
                    { label: t('edit.cut'), accelerator: 'CmdOrCtrl+X', role: 'cut' },
                    { label: t('edit.copy'), accelerator: 'CmdOrCtrl+C', role: 'copy' },
                    { label: t('edit.paste'), accelerator: 'CmdOrCtrl+V', role: 'paste' },
                    { label: t('edit.selectAll'), accelerator: 'CmdOrCtrl+A', role: 'selectall' }
                ]
            },
            {
                label: t('view.title'),
                submenu: [
                    { label: t('view.reload'), accelerator: 'CmdOrCtrl+R', role: 'reload' },
                    { label: t('view.forceReload'), accelerator: 'CmdOrCtrl+Shift+R', role: 'forceReload' },
                    { type: 'separator' },
                    { label: t('view.zoomIn'), accelerator: 'CmdOrCtrl+Plus', role: 'zoomin' },
                    { label: t('view.zoomOut'), accelerator: 'CmdOrCtrl+-', role: 'zoomout' },
                    { label: t('view.zoomReset'), accelerator: 'CmdOrCtrl+0', role: 'resetzoom' },
                    { type: 'separator' },
                    { label: t('view.fullscreen'), accelerator: 'Ctrl+Cmd+F', role: 'togglefullscreen' }
                ]
            },
            {
                label: t('nav.title'),
                submenu: [
                    { label: t('nav.home'), accelerator: 'CmdOrCtrl+1', click: () => {
                        console.log('Home menu clicked');
                        // Trigger navigation directly
                        const currentUrl = mainWindow.webContents.getURL();
                        const baseUrl = currentUrl.split('#')[0];
                        const newUrl = baseUrl + '#/';
                        console.log('Current URL:', currentUrl);
                        console.log('New URL:', newUrl);
                        mainWindow.webContents.loadURL(newUrl);
                    }},
                    { label: t('nav.discover'), accelerator: 'CmdOrCtrl+2', click: () => {
                        console.log('Scopri menu clicked');
                        const currentUrl = mainWindow.webContents.getURL();
                        const baseUrl = currentUrl.split('#')[0];
                        const newUrl = baseUrl + '#/discover';
                        mainWindow.webContents.loadURL(newUrl);
                    }},
                    { label: t('nav.library'), accelerator: 'CmdOrCtrl+3', click: () => {
                        console.log('Libreria menu clicked');
                        const currentUrl = mainWindow.webContents.getURL();
                        const baseUrl = currentUrl.split('#')[0];
                        const newUrl = baseUrl + '#/library';
                        mainWindow.webContents.loadURL(newUrl);
                    }},
                    { label: t('nav.calendar'), accelerator: 'CmdOrCtrl+4', click: () => {
                        console.log('Calendario menu clicked');
                        const currentUrl = mainWindow.webContents.getURL();
                        const baseUrl = currentUrl.split('#')[0];
                        const newUrl = baseUrl + '#/calendar';
                        mainWindow.webContents.loadURL(newUrl);
                    }},
                    { label: t('nav.addons'), accelerator: 'CmdOrCtrl+5', click: () => {
                        console.log('Addons menu clicked');
                        const currentUrl = mainWindow.webContents.getURL();
                        const baseUrl = currentUrl.split('#')[0];
                        const newUrl = baseUrl + '#/addons';
                        mainWindow.webContents.loadURL(newUrl);
                    }},
                    { type: 'separator' },
                    { label: t('nav.settings'), accelerator: 'CmdOrCtrl+,', click: () => {
                        console.log('Impostazioni menu clicked');
                        const currentUrl = mainWindow.webContents.getURL();
                        const baseUrl = currentUrl.split('#')[0];
                        const newUrl = baseUrl + '#/settings';
                        mainWindow.webContents.loadURL(newUrl);
                    }}
                ]
            },
            {
                label: t('window.title'),
                submenu: [
                    { label: t('window.minimize'), accelerator: 'CmdOrCtrl+M', role: 'minimize' },
                    { label: t('window.close'), accelerator: 'CmdOrCtrl+W', role: 'close' }
                ]
            },
            {
                label: t('help.title'),
                submenu: [
                    { label: t('help.support'), click: () => {
                        shell.openExternal('https://stremio.zendesk.com/hc');
                    }}
                ]
            }
        ];

        const menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    }
}

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
        autoHideMenuBar: process.platform !== 'darwin', // Show menu bar on macOS
        icon: path.join(__dirname, 'icon.ico')
    });

    const filter = { urls: ['*://*/*'] };
    session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
        details.requestHeaders['stremio-api-key'] = apiKey;
        callback({ requestHeaders: details.requestHeaders });
    });

    mainWindow.loadFile(path.join(__dirname, 'stremio-web', 'build', 'index.html'));

    // Create macOS menu in Italian
    createMenu();



    const serverPath = path.join(__dirname, 'stremio-server', 'server.js');
    require(serverPath);
}

app.whenReady().then(createWindow);

// Handle macOS about menu
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
