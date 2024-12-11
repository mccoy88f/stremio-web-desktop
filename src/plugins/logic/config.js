const fs = require('fs');
const path = require('path');

function loadConfig(configPath) {
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
        return {};
    }
}

function saveConfig(configPath, config) {
    fs.writeFileSync(configPath, JSON.stringify(config), 'utf8');
}

module.exports = { loadConfig, saveConfig };
