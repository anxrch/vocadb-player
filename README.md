# VocaDB Player (Tauri)

Focused desktop wrapper for VocaDB on Linux.

## Quick start

```bash
npm install
npm run dev:x11
```

## Development

```bash
npm run tauri dev
```

If Wayland fails with `Error 71`, use X11:

```bash
npm run dev:x11
```

Note: run `npm run dev:x11` (not `npx run dev:x11`).

## Build

```bash
npm run tauri build
```

## Releases (GitHub Actions)

Tag a version to trigger builds for AppImage, Windows, and macOS:

```bash
git tag v0.1.0
git push origin v0.1.0
```

### AppImage

```bash
npm run tauri build -- --bundles appimage
```

For Wayland issues during build:

```bash
npm run build:appimage:x11
```

Helper script:

```bash
./scripts/build-appimage.sh
```

If bundling fails with `unknown type [0x13] section .relr.dyn`, set:

```bash
NO_STRIP=1 npm run tauri build -- --bundles appimage
```

If AppImage fails on GNOME Wayland with GBM errors, run via:

```bash
./scripts/run-appimage.sh
```

The run script sets stability flags for WebKitGTK and NVIDIA GBM issues. Clear env vars if needed.

## Playback notes

Embedded playback is disabled in-app to avoid WebKitGTK crashes with sites like niconico.
Use "Open in Browser" or "Play in mpv" for videos.

## mpv integration

Install dependencies (Arch):

```bash
sudo pacman -S mpv yt-dlp
```

Use the "Play in mpv" button to open the current VocaDB page or a pasted URL in mpv.

## GStreamer (optional)

If media playback does not start for other sites, install GStreamer plugins (Arch):

```bash
sudo pacman -S gstreamer gst-plugins-base gst-plugins-good gst-plugins-bad gst-plugins-ugly gst-libav
```

### AUR (template)

Template files are in `packaging/aur`:

- `packaging/aur/PKGBUILD`
- `packaging/aur/vocadb-player.desktop`
- `packaging/aur/vocadb-player.sh`

Before publishing to AUR:

1) Update the `source` URL in `packaging/aur/PKGBUILD` to point to your repo.
2) Run `makepkg --printsrcinfo > .SRCINFO` inside the `packaging/aur` directory.

Helper script:

```bash
./packaging/aur/update-srcinfo.sh
```
