const audio = new Audio();
audio.preload = "metadata";

const state = {
  catalog: [],
  currentAlbum: null,
  currentTrackIndex: 0,
  previousVolume: 0.5,
};

const elements = {
  loading: document.querySelector("#loading"),
  message: document.querySelector(".app-message"),
  cards: document.querySelector(".card-container"),
  allSongs: document.querySelector(".all-songs-list"),
  playlistCount: document.querySelector(".playlist-count"),
  songList: document.querySelector(".song-list"),
  songName: document.querySelector(".song-name"),
  artistName: document.querySelector(".artist-name"),
  albumArt: document.querySelector(".album-art"),
  playButton: document.querySelector("#play"),
  playIcon: document.querySelector("#play-icon"),
  previousButton: document.querySelector("#previous"),
  nextButton: document.querySelector("#next"),
  seekbar: document.querySelector(".seekbar"),
  currentTime: document.querySelector(".current-time"),
  duration: document.querySelector(".duration"),
  volumeButton: document.querySelector(".volume-button"),
  volumeIcon: document.querySelector(".volume-icon"),
  volumeSlider: document.querySelector(".volume-slider"),
  sidebar: document.querySelector(".sidebar"),
  openSidebarButton: document.querySelector(".open-sidebar"),
  closeSidebarButton: document.querySelector(".close-sidebar"),
};

function assetPath(...parts) {
  return parts.map((part) => encodeURIComponent(part)).join("/");
}

function albumPath(album, file) {
  return assetPath("songs", album.folder, file);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function formatTrackName(filename) {
  const name = filename.replace(/\.mp3$/i, "");
  const duplicateMatch = name.match(/^1 copy(?: (\d+))?$/i);

  if (name === "1") return "Track 1";
  if (duplicateMatch) {
    const copyNumber = duplicateMatch[1] ? Number(duplicateMatch[1]) : 1;
    return `Track ${copyNumber + 1}`;
  }

  return name.replaceAll("_", " ");
}

function setMessage(message, type = "info") {
  elements.message.textContent = message;
  elements.message.dataset.type = type;
  elements.message.hidden = !message;
}

function setRangeFill(input, value) {
  input.style.setProperty("--range-value", `${value}%`);
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderAlbums() {
  elements.cards.replaceChildren();
  elements.playlistCount.textContent = `${state.catalog.length} playlists`;

  state.catalog.forEach((album) => {
    const card = createElement("article", "playlist-card");
    card.dataset.album = album.folder;

    const button = createElement("button", "playlist-card-button");
    button.type = "button";
    button.setAttribute("aria-label", `Open ${album.title}`);

    const artwork = document.createElement("img");
    artwork.src = albumPath(album, album.cover);
    artwork.alt = `${album.title} cover`;
    artwork.loading = "lazy";

    const playBadge = createElement("span", "card-play", "▶");
    playBadge.setAttribute("aria-hidden", "true");

    const title = createElement("h3", "", album.title);
    const description = createElement("p", "", album.description);
    const trackCount = createElement(
      "span",
      "track-count",
      `${album.tracks.length} ${album.tracks.length === 1 ? "track" : "tracks"}`,
    );

    button.append(artwork, playBadge, title, description, trackCount);
    card.append(button);
    elements.cards.append(card);
  });
}

function renderAllSongs() {
  elements.allSongs.replaceChildren();

  state.catalog.forEach((album) => {
    const category = createElement("article", "song-category");
    category.dataset.album = album.folder;

    const header = createElement("div", "song-category-header");
    const artwork = document.createElement("img");
    artwork.src = albumPath(album, album.cover);
    artwork.alt = "";
    artwork.loading = "lazy";

    const copy = createElement("div");
    copy.append(
      createElement("h3", "", album.title),
      createElement("p", "", album.description),
    );
    header.append(artwork, copy);

    const list = createElement("ol", "category-track-list");
    album.tracks.forEach((track, trackIndex) => {
      const item = document.createElement("li");
      const button = createElement("button", "track-button");
      button.type = "button";
      button.dataset.album = album.folder;
      button.dataset.trackIndex = String(trackIndex);

      const number = createElement("span", "track-number", String(trackIndex + 1));
      const name = createElement("span", "track-title", formatTrackName(track));
      const action = createElement("span", "track-action", "Play");
      button.append(number, name, action);
      item.append(button);
      list.append(item);
    });

    category.append(header, list);
    elements.allSongs.append(category);
  });
}

function renderCurrentPlaylist() {
  elements.songList.replaceChildren();
  if (!state.currentAlbum) return;

  state.currentAlbum.tracks.forEach((track, trackIndex) => {
    const item = document.createElement("li");
    const button = createElement("button", "library-track-button");
    button.type = "button";
    button.dataset.trackIndex = String(trackIndex);

    const icon = document.createElement("img");
    icon.src = "img/music.svg";
    icon.alt = "";

    const details = createElement("span", "library-track-copy");
    details.append(
      createElement("strong", "", formatTrackName(track)),
      createElement("small", "", state.currentAlbum.title),
    );

    const action = createElement("span", "library-track-action", "Play");
    button.append(icon, details, action);
    item.append(button);
    elements.songList.append(item);
  });

  updateActiveStates();
}

function updateActiveStates() {
  const currentFolder = state.currentAlbum?.folder;
  const currentIndex = String(state.currentTrackIndex);
  const isPlaying = !audio.paused;

  document.querySelectorAll("[data-album]").forEach((element) => {
    element.classList.toggle("is-current", element.dataset.album === currentFolder);
  });

  document.querySelectorAll(".track-button").forEach((button) => {
    const active =
      button.dataset.album === currentFolder && button.dataset.trackIndex === currentIndex;
    button.classList.toggle("is-current", active);
    button.setAttribute("aria-current", active ? "true" : "false");
    const action = button.querySelector(".track-action");
    if (action) action.textContent = active && isPlaying ? "Playing" : "Play";
  });

  document.querySelectorAll(".library-track-button").forEach((button) => {
    const active = button.dataset.trackIndex === currentIndex;
    button.classList.toggle("is-current", active);
    button.setAttribute("aria-current", active ? "true" : "false");
    const action = button.querySelector(".library-track-action");
    if (action) action.textContent = active && isPlaying ? "Playing" : "Play";
  });
}

function updateNowPlaying() {
  if (!state.currentAlbum) return;

  const track = state.currentAlbum.tracks[state.currentTrackIndex];
  elements.songName.textContent = formatTrackName(track);
  elements.artistName.textContent = state.currentAlbum.title;
  elements.albumArt.src = albumPath(state.currentAlbum, state.currentAlbum.cover);
  elements.albumArt.alt = `${state.currentAlbum.title} cover`;

  if ("mediaSession" in navigator && "MediaMetadata" in window) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: formatTrackName(track),
      artist: state.currentAlbum.title,
      album: "Spotify Clone",
      artwork: [{ src: new URL(elements.albumArt.src, document.baseURI).href }],
    });
  }
}

async function playCurrentTrack() {
  try {
    await audio.play();
    setMessage("");
  } catch (error) {
    setMessage("Playback was blocked. Press play once more to start the track.", "error");
    console.error("Unable to start playback:", error);
  }
}

function loadTrack(trackIndex, autoplay = true) {
  if (!state.currentAlbum?.tracks.length) return;

  const trackCount = state.currentAlbum.tracks.length;
  state.currentTrackIndex = (trackIndex + trackCount) % trackCount;
  const track = state.currentAlbum.tracks[state.currentTrackIndex];

  audio.src = albumPath(state.currentAlbum, track);
  audio.load();
  elements.seekbar.value = "0";
  elements.currentTime.textContent = "00:00";
  elements.duration.textContent = "00:00";
  setRangeFill(elements.seekbar, 0);
  updateNowPlaying();
  updateActiveStates();

  if (autoplay) playCurrentTrack();
}

function selectAlbum(folder, { autoplay = true, trackIndex = 0 } = {}) {
  const album = state.catalog.find((item) => item.folder === folder);
  if (!album) return;

  state.currentAlbum = album;
  renderCurrentPlaylist();
  loadTrack(trackIndex, autoplay);
}

function togglePlayback() {
  if (!state.currentAlbum) {
    const firstAlbum = state.catalog[0];
    if (firstAlbum) selectAlbum(firstAlbum.folder);
    return;
  }

  if (audio.paused) {
    playCurrentTrack();
  } else {
    audio.pause();
  }
}

function playAdjacentTrack(direction) {
  if (!state.currentAlbum) return;
  loadTrack(state.currentTrackIndex + direction);
}

function updatePlaybackButton() {
  const playing = !audio.paused;
  elements.playIcon.src = playing ? "img/pause.svg" : "img/play.svg";
  elements.playButton.setAttribute("aria-label", playing ? "Pause" : "Play");
  document.body.classList.toggle("is-playing", playing);
  updateActiveStates();
}

function updateVolume(volume) {
  const nextVolume = Math.max(0, Math.min(1, volume));
  audio.volume = nextVolume;
  elements.volumeSlider.value = String(Math.round(nextVolume * 100));
  setRangeFill(elements.volumeSlider, nextVolume * 100);

  const muted = nextVolume === 0;
  elements.volumeIcon.src = muted ? "img/mute.svg" : "img/volume.svg";
  elements.volumeButton.setAttribute("aria-label", muted ? "Unmute" : "Mute");
  elements.volumeButton.classList.toggle("is-muted", muted);

  if (!muted) state.previousVolume = nextVolume;
}

function toggleMute() {
  updateVolume(audio.volume === 0 ? state.previousVolume || 0.5 : 0);
}

function openSidebar() {
  elements.sidebar.classList.add("is-open");
  elements.openSidebarButton.setAttribute("aria-expanded", "true");
  elements.closeSidebarButton.focus();
}

function closeSidebar({ returnFocus = true } = {}) {
  elements.sidebar.classList.remove("is-open");
  elements.openSidebarButton.setAttribute("aria-expanded", "false");
  if (returnFocus) elements.openSidebarButton.focus();
}

function handleKeyboardShortcuts(event) {
  const target = event.target;
  const isInteractive =
    target.matches("button, a, input, textarea, select") || target.isContentEditable;

  if (isInteractive || event.metaKey || event.ctrlKey || event.altKey) return;

  switch (event.code) {
    case "Space":
      event.preventDefault();
      togglePlayback();
      break;
    case "ArrowLeft":
      event.preventDefault();
      playAdjacentTrack(-1);
      break;
    case "ArrowRight":
      event.preventDefault();
      playAdjacentTrack(1);
      break;
    case "ArrowUp":
      event.preventDefault();
      updateVolume(audio.volume + 0.1);
      break;
    case "ArrowDown":
      event.preventDefault();
      updateVolume(audio.volume - 0.1);
      break;
    case "KeyM":
      event.preventDefault();
      toggleMute();
      break;
    case "Escape":
      if (elements.sidebar.classList.contains("is-open")) closeSidebar();
      break;
  }
}

function bindEvents() {
  elements.cards.addEventListener("click", (event) => {
    const card = event.target.closest("[data-album]");
    if (card) selectAlbum(card.dataset.album);
  });

  elements.allSongs.addEventListener("click", (event) => {
    const button = event.target.closest(".track-button");
    if (!button) return;
    selectAlbum(button.dataset.album, { trackIndex: Number(button.dataset.trackIndex) });
  });

  elements.songList.addEventListener("click", (event) => {
    const button = event.target.closest(".library-track-button");
    if (button) loadTrack(Number(button.dataset.trackIndex));
  });

  elements.playButton.addEventListener("click", togglePlayback);
  elements.previousButton.addEventListener("click", () => playAdjacentTrack(-1));
  elements.nextButton.addEventListener("click", () => playAdjacentTrack(1));
  elements.volumeButton.addEventListener("click", toggleMute);

  elements.seekbar.addEventListener("input", () => {
    const percentage = Number(elements.seekbar.value);
    setRangeFill(elements.seekbar, percentage);
    if (Number.isFinite(audio.duration)) {
      audio.currentTime = (percentage / 100) * audio.duration;
    }
  });

  elements.volumeSlider.addEventListener("input", () => {
    updateVolume(Number(elements.volumeSlider.value) / 100);
  });

  elements.openSidebarButton.addEventListener("click", openSidebar);
  elements.closeSidebarButton.addEventListener("click", () => closeSidebar());

  elements.sidebar.addEventListener("click", (event) => {
    if (event.target.closest("a") && window.matchMedia("(max-width: 900px)").matches) {
      closeSidebar({ returnFocus: false });
    }
  });

  document.addEventListener("click", (event) => {
    if (
      window.matchMedia("(max-width: 900px)").matches &&
      elements.sidebar.classList.contains("is-open") &&
      !elements.sidebar.contains(event.target) &&
      !elements.openSidebarButton.contains(event.target)
    ) {
      closeSidebar({ returnFocus: false });
    }
  });

  document.addEventListener("keydown", handleKeyboardShortcuts);

  audio.addEventListener("play", updatePlaybackButton);
  audio.addEventListener("pause", updatePlaybackButton);
  audio.addEventListener("ended", () => playAdjacentTrack(1));
  audio.addEventListener("loadedmetadata", () => {
    elements.duration.textContent = formatTime(audio.duration);
  });
  audio.addEventListener("timeupdate", () => {
    elements.currentTime.textContent = formatTime(audio.currentTime);
    const percentage = Number.isFinite(audio.duration)
      ? (audio.currentTime / audio.duration) * 100
      : 0;
    elements.seekbar.value = String(percentage);
    setRangeFill(elements.seekbar, percentage);
  });
  audio.addEventListener("error", () => {
    setMessage("This audio file could not be loaded. Try another track.", "error");
  });

  if ("mediaSession" in navigator) {
    const mediaActions = {
      play: playCurrentTrack,
      pause: () => audio.pause(),
      previoustrack: () => playAdjacentTrack(-1),
      nexttrack: () => playAdjacentTrack(1),
    };

    Object.entries(mediaActions).forEach(([action, handler]) => {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Some browsers expose Media Session but do not support every action.
      }
    });
  }
}

async function initialize() {
  bindEvents();
  updateVolume(0.5);

  try {
    const response = await fetch("songs/catalog.json");
    if (!response.ok) throw new Error(`Catalog request failed with ${response.status}`);

    const catalog = await response.json();
    if (!Array.isArray(catalog) || catalog.length === 0) {
      throw new Error("The music catalog is empty.");
    }

    state.catalog = catalog;
    renderAlbums();
    renderAllSongs();

    const initialAlbum = state.catalog.find((album) => album.folder === "ncs") ?? state.catalog[0];
    selectAlbum(initialAlbum.folder, { autoplay: false });
  } catch (error) {
    setMessage(
      "The music library could not be loaded. Run the project through a local web server.",
      "error",
    );
    console.error("Unable to initialize the music library:", error);
  } finally {
    elements.loading.classList.add("is-hidden");
  }
}

initialize();
