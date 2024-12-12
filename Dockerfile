# Use a lightweight Node.js image as the base
FROM node:18-alpine3.18 AS base

RUN apk update && apk upgrade

FROM base AS ffmpeg

# We build our own ffmpeg since 4.X is the only one supported
ENV BIN="/usr/bin"
RUN cd && \
  apk add --no-cache --virtual \
  .build-dependencies \
  gnutls \
  freetype-dev \
  gnutls-dev \
  lame-dev \
  libass-dev \
  libogg-dev \
  libtheora-dev \
  libvorbis-dev \
  libvpx-dev \
  libwebp-dev \
  libssh2 \
  opus-dev \
  rtmpdump-dev \
  x264-dev \
  x265-dev \
  yasm-dev \
  build-base \
  coreutils \
  gnutls \
  nasm \
  dav1d-dev \
  libbluray-dev \
  libdrm-dev \
  zimg-dev \
  aom-dev \
  xvidcore-dev \
  fdk-aac-dev \
  libva-dev \
  git \
  x264 && \
  DIR=$(mktemp -d) && \
  cd "${DIR}" && \
  git clone --depth 1 --branch v4.4.1-4 https://github.com/jellyfin/jellyfin-ffmpeg.git && \
  cd jellyfin-ffmpeg* && \
  PATH="$BIN:$PATH" && \
  ./configure --help && \
  ./configure --bindir="$BIN" --disable-debug \
  --prefix=/usr/lib/jellyfin-ffmpeg --extra-version=Jellyfin --disable-doc --disable-ffplay --disable-shared --disable-libxcb --disable-sdl2 --disable-xlib --enable-lto --enable-gpl --enable-version3 --enable-gmp --enable-gnutls --enable-libdrm --enable-libass --enable-libfreetype --enable-libfribidi --enable-libfontconfig --enable-libbluray --enable-libmp3lame --enable-libopus --enable-libtheora --enable-libvorbis --enable-libdav1d --enable-libwebp --enable-libvpx --enable-libx264 --enable-libx265  --enable-libzimg --enable-small --enable-nonfree --enable-libxvid --enable-libaom --enable-libfdk_aac --enable-vaapi --enable-hwaccel=h264_vaapi --toolchain=hardened && \
  make -j4 && \
  make install && \
  make distclean && \
  rm -rf "${DIR}"  && \
  apk del --purge .build-dependencies
#########################################################################

# Main image
FROM base AS final

# Set the working directory inside the container
WORKDIR /app

# Copy ffmpeg
COPY --from=ffmpeg /usr/bin/ffmpeg /usr/bin/ffprobe /usr/bin/
COPY --from=ffmpeg /usr/lib/jellyfin-ffmpeg /usr/lib/

# Add libs
RUN apk add --no-cache libwebp libvorbis x265-libs x264-libs libass opus libgmpxx lame-libs gnutls libvpx libtheora libdrm libbluray zimg libdav1d aom-libs xvidcore fdk-aac libva curl

# Add arch specific libs
RUN if [ "$(uname -m)" = "x86_64" ]; then \
  apk add --no-cache intel-media-driver; \
  fi

# Copy the server and web build into the container
COPY src/stremio-server/server.js /app/server.js
COPY src/stremio-web/build /app/build

# Install dependencies for the HTTP server
RUN npm install -g http-server

# full path to the ffmpeg binary
#ENV FFMPEG_BIN=

# full path to the ffprobe binary
#ENV FFPROBE_BIN=

# Custom application path for storing server settings, certificates, etc
#ENV APP_PATH=

# Use `NO_CORS=1` to disable the server's CORS checks
#ENV NO_CORS=

# "Docker image shouldn't attempt to find network devices or local video players."
# See: https://github.com/Stremio/server-docker/issues/7
ENV CASTING_DISABLED=1

VOLUME ["/root/.stremio-server"]

# Expose the ports for the Stremio server and HTTP server
EXPOSE 11470 12470 8080

# Start both the Stremio server and HTTP server
CMD ["sh", "-c", "node server.js & http-server /app/build -p 8080"]
