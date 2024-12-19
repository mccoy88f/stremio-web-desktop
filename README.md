<p align="center">
  <img src="https://www.stremio.com/website/stremio-logo-small.png" alt="Stremio Web Desktop Logo" width="200" />
</p>
<div align="center">
  <h1>🌌 Stremio Web Desktop<br/><span style="font-size: 0.6em; font-weight: normal;">Community</span></h1>
</div>


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
    - **Server API Key**: Adds an API key to every Stremio request, useful to make addons only callable by Stremio.

<p align="center">
  <img src="https://i.imgur.com/s3vwk0z.png" alt="Stremio Web Desktop Screenshot" width="600" />
</p>

## 📥 **Disclaimer**

⚠️ **Important Notice:**
- Using this **Electron/Chromium** build **forces Stremio to always transcode** your media. This means you **won't receive native 4K** playback, as everything is transcoded to **1920p**.

> **⚡ New:** Use the this [Stremio Desktop App](https://github.com/Zaarrg/stremio-desktop-v5) instead. Build with latest qt6 with native 4k playback. No transcoding.


🔧 **Solution**

1. Use default [Stremio app](https://www.stremio.com/downloads) instead

2. Or use  [Stremio app v5 Support](https://github.com/Zaarrg/stremio-shell-web-v5) instead

> **⏳ Note:** Recommended is the Stremio app with v5 support. As this fixes some bugs like very unresponsive ui. When using the Stremio app v5 `--webui-url` is not needed and the steps below can be skipped.


To prevent transcoding and utilize the **default Stremio app**, follow these steps:

1. ### 🛠️ **Use the Default Stremio App (`stremio-shell`):**
    - This allows you to use the **Web v5 UI** without transcoding.

2. ### ➕ **Add Start Argument:**
    - **Add** the following argument to Stremio's start command:
      ```
      --webui-url=https://web.stremio.com/
      ```
    - **Alternatively**, if you're using a self-hosted Docker Web UI, use:
      ```
      --webui-url=https://stremio.mydomain.com/
      ```

3. ### 🪟 **Windows Example:**
    - **Right-click** on `stremio.exe`.
    - Select **Create Shortcut**.
    - **Right-click** on the created shortcut and choose **Properties**.
    - In the **Target** field, **append** the start argument:
      ```
      --webui-url=https://web.stremio.com/
      ```
    - **Example:**
      ```
      "C:\Path\to\stremio.exe" --webui-url=https://web.stremio.com/
      ```

✅ **Outcome:**
- Stremio will **run with the v5 Web UI** and **will not use transcoding**, enabling **native playback**.


## 📥 **Downloads**
Visit the [Releases Tab](https://github.com/Zaarrg/stremio-web-desktop/releases) to download the appropriate version for your platform or use Docker to run the app.

| Platform     | Format                  |
|--------------|-------------------------|
| **Windows**  | Setup `.exe` and `.zip` |
| **Linux**    | `.deb` and `.rpm`       |
| **macOS**    | `.dmg`                  |
| **Docker**   | `ghcr.io/zaarrg/stremio-web-desktop:latest` |

## 🛠️ **How to Use**
1. **Download**: Visit the [Releases Tab](https://github.com/Zaarrg/stremio-web-desktop/releases) and get the latest version for your OS.
2. **Install**:
    - **Windows**: Run the `.exe` installer or unzip the `.zip` file.
        - Installer installation path ``%AppData%\Local\stremio-web-desktop``
    - **Linux**: Install the `.deb` or `.rpm` package.
    - **macOS**: Open the `.dmg` file and drag the app to the Applications folder.
3. **Run**: Launch the app and enjoy Stremio Web v5 on your desktop.

## 🐳 **Using Docker**

To run the Stremio server and Web UI using Docker:

1. 📥 **Pull the latest Docker image**:
    ```bash
    docker pull ghcr.io/zaarrg/stremio-web-desktop:latest
    ```
2. 🚀 **Run the container**:
    ```bash
    docker run -p 11470:11470 -p 12470:12470 -p 8080:8080 ghcr.io/zaarrg/stremio-web-desktop:latest
    ```
**📌 Ports Overview:**
- 🔌 **11470**: Stremio Server (HTTP communication)
- 🌐 **12470**: Stremio Server (HTTPS communication)
- 🖥️ **8080**: HTTP server serving Stremio Web


## 📋 **Environment Variables**

The application supports the following environment variables to customize its behavior:

- **FFMPEG_BIN**  
  *Description:* Full path to the `ffmpeg` binary.  
  *Example:* `FFMPEG_BIN=/usr/local/bin/ffmpeg`

- **FFPROBE_BIN**  
  *Description:* Full path to the `ffprobe` binary.  
  *Example:* `FFPROBE_BIN=/usr/local/bin/ffprobe`

- **APP_PATH**  
  *Description:* Custom application path for storing server settings, certificates, etc.  
  *Example:* `APP_PATH=/path/to/app/data`

- **NO_CORS**  
  *Description:* Use `NO_CORS=1` to disable the server's CORS checks.  
  *Example:* `NO_CORS=1`

- **CASTING_DISABLED**  
  *Description:* Won't attempt to find network devices or local video players.  
  *Default:* `CASTING_DISABLED=1`

## ⚠️ **Common Issues**

### 🎬 **Video Not Supported**

**Explanation:**

- **Issue:** If you encounter "Video not supported" during playback, ensure that `ffmpeg` is installed correctly.

- **For Windows:**
    - The current Windows build includes `ffmpeg` by default.

- **For Linux and macOS:**
    - **Option 1:** Specify the path to `ffmpeg` and `ffprobe` using the `FFMPEG_BIN` and `FFPROBE_BIN` environment variables.
    - **Option 2:** Ensure that `ffmpeg` and `ffprobe` are installed globally on your system.

**Paths Stremio Server Looks for `ffmpeg` and `ffprobe`:**

- **ffmpeg:**
    - `process.env.FFMPEG_BIN`
    - `/usr/lib/jellyfin-ffmpeg/ffmpeg`
    - `/usr/bin/ffmpeg`
    - `/usr/local/bin/ffmpeg`

- **ffprobe:**
    - `process.env.FFPROBE_BIN`
    - `/usr/lib/jellyfin-ffmpeg/ffprobe`
    - `/usr/bin/ffprobe`
    - `/usr/local/bin/ffprobe`

- **Alternatively:** Use an external video player.


## ⚠️ **Disclaimer**
This project is not affiliated with **Stremio** in any way.

## 🤝 **Support Development**
If you enjoy this project and want to support further development, consider [buying me a coffee](https://ko-fi.com/zaarrg). Your support means a lot! ☕

<p align="center">
  <strong>⭐ Made with ❤️ by <a href="https://github.com/Zaarrg">Zaarrg</a> ⭐</strong>
</p>
