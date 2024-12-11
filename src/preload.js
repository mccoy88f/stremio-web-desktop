const { ipcRenderer } = require('electron');
const path = require('path');
const fs = require('fs');

const pluginDir = path.join(__dirname, 'plugins');
const uiDir = path.join(pluginDir, 'ui');

if (fs.existsSync(uiDir)) {
    const plugins = fs.readdirSync(uiDir).filter(file => file.endsWith('.js'));
    for (const plugin of plugins) {
        require(path.join(uiDir, plugin));
    }
}
