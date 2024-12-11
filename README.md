<p align="center">
  <img src="https://www.stremio.com/website/stremio-logo-small.png" alt="Stremio Web Desktop Logo" width="200" />
</p>
<h1 align="center">🌌 Stremio Web Desktop</h1>

<p align="center">Latest Stremio Web v5 and Server bundled as an Electron App and Docker Image</p>
<p align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=electron&logoColor=white" alt="Electron">
  <img src="https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white" alt="HTML">
  <img src="https://img.shields.io/badge/CSS-239120?style=for-the-badge&logo=css3&logoColor=white" alt="CSS">
</p>

## 🌟 **Features**
- 📦 **Bundled Latest Stremio Web and Server**: Always up-to-date with Stremio Web v5 and the latest Stremio Server.
- 🔧 **Custom Plugin Support**:
    - **Server API Key**: Adds an API key to every Stremio request, useful to make addons only callable by stremio.

<p align="center">
  <img src="https://i.imgur.com/s3vwk0z.png" alt="Stremio Web Desktop Screenshot" width="600" />
</p>


## 📥 **Downloads**
Visit the [Releases Tab](https://github.com/Zaarrg/stremio-web-desktop/releases) to download the appropriate version for your platform or use Docker to run the app.

| Platform     | Format                  |
|--------------|-------------------------|
| **Windows**  | Setup `.exe` and `.zip` |
| **Linux**    | `.deb` and `.rpm`       |
| **macOS**    | `.dmg`                  |
| **Docker**   | `zaarrg/stremio-web-desktop:latest` |

## 🛠️ **How to Use**
1. **Download**: Visit the [Releases Tab](https://github.com/Zaarrg/stremio-web-desktop/releases) and get the latest version for your OS.
2. **Install**:
    - Windows: Run the `.exe` installer or unzip the `.zip` file.
    - Linux: Install the `.deb` or `.rpm` package.
    - macOS: Open the `.dmg` file and drag the app to the Applications folder.
3. **Run**: Launch the app and enjoy Stremio Web on your desktop.

## 🐳 **Using Docker**

To run the Stremio server and Web ui using Docker:

1. 📥 **Pull the latest Docker image**:
    ```bash
   docker pull ghcr.io/zaarrg/stremio-web-desktop:latest
    ```
2. 🚀 **Run the container**:
    ```bash
   docker run -p 11470:11470 -p 12470:12470 -p 8080:8080 ghcr.io/zaarrg/stremio-web-desktop:latest
    ```
**📌 Ports Overview:**
- 🔌 **11470**: Stremio Server (http communication)
- 🌐 **12470**: Stremio Server (https communication)
- 🖥️ **8080**: HTTP server serving Stremio Web


## ⚠️ **Disclaimer**
This project is not affiliated with **Stremio** in any way.



## 🤝 **Support Development**
If you enjoy this project and want to support further development, consider [buying me a coffee](https://ko-fi.com/zaarrg). Your support means a lot! ☕

<p align="center">
  <strong>⭐ Made with ❤️ by <a href="https://github.com/Zaarrg">Zaarrg</a> ⭐</strong>
</p>
