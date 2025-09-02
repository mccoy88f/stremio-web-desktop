const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

module.exports = {
    packagerConfig: {
        asar: true,
        icon: path.join(__dirname, 'src/icon')
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'Stremio',
                setupIcon: path.join(__dirname, 'src/icon.ico'),
            }
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['darwin'],
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    maintainer: 'Zarg',
                    homepage: 'https://github.com/Zaarrg/stremio-web-desktop',
                },
            },
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {
                options: {
                    summary: 'Stremio Web as electron App',
                    homepage: 'https://github.com/Zaarrg/stremio-web-desktop',
                },
            },
        },
        {
            name: '@electron-forge/maker-dmg',
            config: {
                icon: path.join(__dirname, 'src/icon.icns'),
                overwrite: true,
                format: 'ULFO',
            },
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {},
        },
        new FusesPlugin({
            version: FuseVersion.V1,
            [FuseV1Options.RunAsNode]: false,
            [FuseV1Options.EnableCookieEncryption]: true,
            [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
            [FuseV1Options.EnableNodeCliInspectArguments]: false,
            [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
            [FuseV1Options.OnlyLoadAppFromAsar]: true,
        }),
    ],
};
