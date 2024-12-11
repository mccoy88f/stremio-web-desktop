const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const archiver = require('archiver');

function getLatestServerTag() {
    return new Promise((resolve, reject) => {
        https.get('https://registry.hub.docker.com/v2/repositories/stremio/server/tags/?page_size=10', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    const results = json.results || [];
                    // Find first tag that starts with 'v' (not 'latest')
                    const versionTag = results.find(r => r.name.startsWith('v'));
                    if (versionTag && versionTag.name) {
                        resolve(versionTag.name);
                    } else {
                        reject(new Error('No version tag found (only "latest")'));
                    }
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', err => reject(err));
    });
}

function getLatestWebCommitHash() {
    const output = execSync('git ls-remote https://github.com/Stremio/stremio-web.git HEAD').toString().trim();
    const [commitHash] = output.split('\t');
    return commitHash;
}

function createZip(sourceFolder, outputZipPath) {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputZipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => resolve());
        archive.on('error', (err) => reject(err));

        archive.pipe(output);
        archive.directory(sourceFolder, false);
        archive.finalize();
    });
}


(async () => {
    try {
        const stremioWebPath = path.join('src', 'stremio-web');
        const stremioServerPath = path.join('src', 'stremio-server');

        console.log('Fetching latest stremio-web commit hash...');
        const latestCommitHash = getLatestWebCommitHash();
        console.log(`Latest stremio-web commit: ${latestCommitHash}`);

        let needsWebBuild = true;
        if (fs.existsSync(path.join(stremioWebPath, 'build'))) {
            const buildDir = path.join(stremioWebPath, 'build');
            const dirs = fs.readdirSync(buildDir).filter(name => name === latestCommitHash);
            if (dirs.length > 0) {
                console.log(`Found existing build for commit ${latestCommitHash}, skipping rebuild.`);
                needsWebBuild = false;
            } else {
                console.log(`No existing build matches commit ${latestCommitHash}, will rebuild.`);
            }
        }

        if (needsWebBuild) {
            if (fs.existsSync(stremioWebPath)) {
                fs.rmSync(stremioWebPath, { recursive: true, force: true });
            }

            console.log('Cloning stremio-web...');
            execSync(`git clone https://github.com/Stremio/stremio-web.git ${stremioWebPath}`, { stdio: 'inherit' });

            console.log(`Checking out commit ${latestCommitHash}...`);
            execSync(`git checkout ${latestCommitHash}`, { stdio: 'inherit', cwd: stremioWebPath });

            console.log('Installing stremio-web dependencies...');
            execSync('npm install', { stdio: 'inherit', cwd: stremioWebPath });

            console.log('Building stremio-web...');
            execSync('npm run build', { stdio: 'inherit', cwd: stremioWebPath });

            console.log('Cleaning up stremio-web folder...');
            fs.readdirSync(stremioWebPath).forEach(file => {
                if (file !== 'build') {
                    fs.rmSync(path.join(stremioWebPath, file), { recursive: true, force: true });
                }
            });

            console.log(`Build for commit ${latestCommitHash} completed and cleaned.`);
        }

        if (!fs.existsSync(stremioServerPath)) {
            fs.mkdirSync(stremioServerPath, { recursive: true });
        }

        console.log('Fetching latest Stremio server version...');
        const latestTag = await getLatestServerTag();
        console.log(`Latest server tag: ${latestTag}`);

        const versionMarker = path.join(stremioServerPath, `${latestTag}.txt`);
        const serverFilePath = path.join(stremioServerPath, 'server.js');

        let needsServerDownload = true;
        if (fs.existsSync(serverFilePath) && fs.existsSync(versionMarker)) {
            console.log(`Server version ${latestTag} already downloaded, skipping download.`);
            needsServerDownload = false;
        }

        if (needsServerDownload) {
            console.log('Downloading latest server.js...');
            execSync(`curl -L "https://dl.strem.io/server/${latestTag}/desktop/server.js" -o "${serverFilePath}"`, { stdio: 'inherit' });

            // Remove old version markers
            fs.readdirSync(stremioServerPath).forEach(file => {
                if (file.endsWith('.txt') && file !== `${latestTag}.txt`) {
                    fs.rmSync(path.join(stremioServerPath, file), { force: true });
                }
            });

            // Write the new version marker
            fs.writeFileSync(versionMarker, latestTag, 'utf8');
            console.log(`Server ${latestTag} downloaded and version marker updated.`);
        }

        // Write outputs for GitHub Actions
        const githubEnvPath = process.env.GITHUB_ENV;
        if (githubEnvPath) {
            fs.appendFileSync(githubEnvPath, `LATEST_COMMIT_HASH=${latestCommitHash}\n`);
            fs.appendFileSync(githubEnvPath, `LATEST_SERVER_TAG=${latestTag}\n`);
            console.log('Fetching and preparation completed successfully.');
        } else {
            console.log('Building Electron binaries for Windows...');
            execSync('npm run make -- --platform=win32', { stdio: 'inherit' });

            const windowsOutputFolder = path.join('out', 'stremio-web-desktop-win32-x64');
            const windowsZipPath = path.join('out', `stremio-web-desktop-win32-x64.zip`);
            console.log('Creating ZIP for Windows...');
            await createZip(windowsOutputFolder, windowsZipPath);

            console.log('Building Electron binaries for macOS...');
            execSync('npm run make -- --platform=darwin', { stdio: 'inherit' });

            console.log('Building Electron binaries for Linux...');
            execSync('npm run make -- --platform=linux', { stdio: 'inherit' });

            console.log('Build process completed successfully for all platforms!');
        }
    } catch (error) {
        console.error('Error during build process:', error);
        process.exit(1);
    }
})();
