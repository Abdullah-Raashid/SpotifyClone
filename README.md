# Spotify Clone

A responsive browser-based music player inspired by Spotify. It is built with plain HTML,
CSS, and JavaScript and plays audio files stored in the repository.

> This is an unofficial educational project and is not affiliated with or endorsed by
> Spotify.

## Features

- Playlist and track browsing
- Play, pause, previous, and next controls
- Seek and volume controls
- Automatic playback of the next track
- Keyboard shortcuts
- Responsive mobile library drawer
- Media Session support on compatible browsers
- Static-host-friendly catalog (no directory listing required)
- Reduced-motion and keyboard accessibility support

## Run locally

The app uses `fetch()` to load its music catalog, so opening `index.html` directly with a
`file://` URL will not work. Start a local web server from the project directory:

```bash
python3 -m http.server 5500
```

Then open [http://localhost:5500](http://localhost:5500).

You can also use any static server, such as the VS Code Live Server extension.

## Project structure

```text
.
├── index.html          # Application markup
├── css/
│   └── style.css       # Layout, theme, and responsive styles
├── js/
│   └── script.js       # Catalog rendering and player behavior
├── img/                # Interface icons and fallback artwork
└── songs/
    ├── catalog.json    # Playlist and track manifest
    └── <playlist>/     # Cover image and audio files
```

## Add a playlist

1. Create a folder inside `songs/`.
2. Add a square `cover.jpg` and one or more `.mp3` files.
3. Add the playlist to `songs/catalog.json`:

```json
{
  "folder": "my-playlist",
  "title": "My Playlist",
  "description": "A short description.",
  "cover": "cover.jpg",
  "tracks": ["first-song.mp3", "second-song.mp3"]
}
```

The `folder`, cover filename, and track filenames are case-sensitive on most hosts.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `Space` | Play or pause |
| `←` / `→` | Previous or next track |
| `↑` / `↓` | Raise or lower volume |
| `M` | Mute or unmute |

Shortcuts are ignored while a button, link, or form control has focus.

## Deployment

This is a static site and can be deployed to GitHub Pages, Netlify, Vercel, or any
standard static host. Keep the repository structure intact so the relative asset paths
continue to work.

Before publishing, confirm that you have permission to distribute every audio file,
cover image, logo, and icon included in the deployment. Large audio files can also make
repository clones and page loads expensive; for a production project, consider object
storage or a streaming service.

## Browser support

The player targets current versions of Chrome, Edge, Firefox, and Safari. Browsers may
require a user interaction before audio playback begins.
