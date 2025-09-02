const path = require('path');
const { loadConfig, saveConfig } = require('./config');

// Traccia se l'handler è già stato registrato
let handlerRegistered = false;

function generateApiKey() {
    return [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
}

function initApiKeyLogic(app, ipcMain) {
    const userDataPath = app.getPath('userData');
    const configPath = path.join(userDataPath, 'config.json');

    let config = loadConfig(configPath);
    if (!config.api_key) {
        config.api_key = generateApiKey();
        saveConfig(configPath, config);
    }

    const apiKey = config.api_key;

    // Registra l'handler solo se non è già stato registrato
    if (!handlerRegistered) {
        ipcMain.handle('get-api-key', () => {
            return apiKey;
        });
        handlerRegistered = true;
    }

    return apiKey;
}

module.exports = { initApiKeyLogic };
