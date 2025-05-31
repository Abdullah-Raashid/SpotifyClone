# Spotify Clone

Spotify Clone is a static, front-end–only web application that mimics the essential functionality of a modern music streaming platform. Users can browse “albums” (folders) inside the `songs/` directory, view a list of tracks, and stream audio directly in the browser. Playback controls (play, pause, next, previous, seek, volume) are implemented using the HTML5 `<audio>` element, and the layout is fully responsive.

---

## Features

- **Album Grid**  
  Fetches every subfolder inside `songs/` and displays them as “album cards” (cover + title + description from `info.json`).
- **All Songs Section**  
  A grid of all available “song categories” (folder name + cover image + sample track) with a *Play* button.
- **Music Playback Controls**  
  - Play / Pause  
  - Next / Previous  
  - Seek (click on the progress bar)  
  - Volume slider + Mute toggle  
  - Displays current time/duration  
  - Displays track title and album art
- **Responsive Layout**  
  - Desktop: sidebar on the left (hidden on mobile), content on the right  
  - Tablet / Mobile: collapsible sidebar (hamburger menu)  
  - Adaptive grid for album cards and “All Songs” section
- **Directory-Based Data Fetching**  
  - Uses `fetch()` to load the directory listing of `songs/` and each album’s contents  
  - Expects each album folder to contain:
    - `cover.jpg` (displayed as the album’s thumbnail)
    - `info.json` (with `title` & `description` fields)
    - One or more `.mp3` files (tracks)
  - Automatically populates the UI based on actual file structure (no hard-coded track list)
---

## info.json Format

``
{
  "title": "Angry Hits",
  "description": "Songs to down-regulate your anger."
}
``
