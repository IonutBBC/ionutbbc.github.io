const playlistFiles = window.LYRA_SONG_FILES;
const playlistIsValid = Array.isArray(playlistFiles) && playlistFiles.every((file) =>
  typeof file === "string" &&
  file.toLowerCase().endsWith(".mp3") &&
  !file.includes("/") &&
  !file.includes("\\")
);
const songs = playlistIsValid
  ? playlistFiles.map((file) => ({ file, title: file.slice(0, -4) }))
  : [];

const loopPlaylist = true;
const audio = document.getElementById("audio");
const trackList = document.getElementById("track-list");
const player = document.getElementById("mini-player");
const playerTitle = document.getElementById("player-title");
const playerStatus = document.getElementById("player-status");
const playButton = document.getElementById("play-button");
const seekSlider = document.getElementById("seek-slider");
const currentTimeLabel = document.getElementById("current-time");
const totalTimeLabel = document.getElementById("total-time");
const volumeSlider = document.getElementById("volume-slider");
const speakers = document.getElementById("speakers");

let activeIndex = -1;
let audioContext;
let analyser;
let mediaSource;
let animationFrame = 0;
let seekInProgress = false;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function renderPlaylist(emptyMessage = "Nu există melodii în folderul song.") {
  const fragment = document.createDocumentFragment();
  document.getElementById("song-count").textContent = `· ${songs.length}`;

  if (songs.length === 0) {
    const message = document.createElement("li");
    message.className = "track-empty";
    message.textContent = emptyMessage;
    fragment.append(message);
  }

  songs.forEach((song, index) => {
    const item = document.createElement("li");
    item.className = "track-card";
    item.dataset.index = String(index);
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `Redă melodia ${index + 1}: ${song.title}`);

    const number = document.createElement("span");
    number.className = "track-number";
    number.textContent = String(index + 1).padStart(2, "0");

    const icon = document.createElement("span");
    icon.className = "track-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "♫";

    const copy = document.createElement("span");
    copy.className = "track-copy";
    const title = document.createElement("span");
    title.className = "track-title";
    title.textContent = song.title;
    copy.append(title);

    const visualizer = document.createElement("span");
    visualizer.className = "track-visualizer";
    visualizer.setAttribute("aria-hidden", "true");
    visualizer.innerHTML = "<i></i><i></i><i></i>";

    item.append(number, icon, copy, visualizer);
    item.addEventListener("click", () => selectSong(index, true));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectSong(index, true);
      }
    });
    fragment.append(item);
  });

  trackList.replaceChildren(fragment);
}

function updateActiveTrack() {
  const cards = trackList.querySelectorAll(".track-card");
  cards.forEach((card, index) => {
    const isActive = index === activeIndex;
    card.classList.toggle("is-active", isActive);
    card.classList.toggle("is-playing", isActive && !audio.paused);
    if (isActive) {
      card.setAttribute("aria-current", "true");
    } else {
      card.removeAttribute("aria-current");
    }
  });
}

function setPlayerVisible(visible) {
  player.classList.toggle("is-visible", visible);
  player.setAttribute("aria-hidden", String(!visible));
  document.querySelector(".app-shell").classList.toggle("player-open", visible);
}

function setStatus(message) {
  playerStatus.textContent = message;
}

function updateSlider(slider, fraction) {
  const percent = Math.max(0, Math.min(1, fraction)) * 100;
  slider.style.background = `linear-gradient(90deg, #c07aff 0%, #ef8bdc ${percent}%, rgba(255, 255, 255, .18) ${percent}%)`;
}

function updateProgress() {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    if (!seekInProgress) {
      seekSlider.value = String(Math.round((audio.currentTime / audio.duration) * 1000));
    }
    updateSlider(seekSlider, Number(seekSlider.value) / 1000);
    totalTimeLabel.textContent = formatTime(audio.duration);

    const activeCard = trackList.querySelector(".track-card.is-active");
    if (activeCard) {
      let duration = activeCard.querySelector(".track-duration");
      if (!duration) {
        duration = document.createElement("span");
        duration.className = "track-duration";
        activeCard.querySelector(".track-copy").append(duration);
      }
      duration.textContent = formatTime(audio.duration);
    }
  }
  currentTimeLabel.textContent = formatTime(audio.currentTime);
}

function stopSpeakerAnimation() {
  speakers.classList.remove("is-playing");
  speakers.classList.remove("is-fallback");
  speakers.querySelectorAll(".led-segment").forEach((segment) => segment.classList.remove("is-lit"));
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }
}

function animateSpeakers() {
  if (audio.paused || animationFrame) return;

  let samples = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
  const bars = [...speakers.querySelectorAll(".led-bar")];
  const measure = () => {
    if (audio.paused) {
      stopSpeakerAnimation();
      return;
    }
    if (analyser) {
      if (!samples || samples.length !== analyser.frequencyBinCount) {
        samples = new Uint8Array(analyser.frequencyBinCount);
      }
      analyser.getByteFrequencyData(samples);
    }
    bars.forEach((bar, barIndex) => {
      let litCount;
      if (analyser) {
        const start = Math.floor(barIndex * samples.length / bars.length);
        const end = Math.max(start + 1, Math.floor((barIndex + 1) * samples.length / bars.length));
        let peak = 0;
        for (let index = start; index < end; index += 1) peak = Math.max(peak, samples[index]);
        litCount = Math.round(Math.min(1, peak / 96) * bar.children.length);
      } else {
        const beat = (Math.sin(audio.currentTime * 5 + barIndex * 0.9) + 1) / 2;
        litCount = Math.round(beat * bar.children.length);
      }
      [...bar.children].forEach((segment, segmentIndex) => {
        segment.classList.toggle("is-lit", segmentIndex >= bar.children.length - litCount);
      });
    });
    animationFrame = requestAnimationFrame(measure);
  };
  animationFrame = requestAnimationFrame(measure);
}

function enableSpeakerAnimation() {
  speakers.classList.add("is-playing");
  if (!analyser) {
    speakers.classList.add("is-fallback");
    animateSpeakers();
    return;
  }
  speakers.classList.remove("is-fallback");
  animateSpeakers();
}

async function setupAudioAnalysis() {
  // file:// pages have an opaque origin in some browsers; Web Audio can mute local media.
  if (window.location.protocol === "file:") return false;

  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return false;

  try {
    if (!audioContext) audioContext = new AudioContextConstructor();
    if (audioContext.state === "suspended") await audioContext.resume();
    if (audioContext.state !== "running" || mediaSource) return Boolean(analyser);

    const nextAnalyser = audioContext.createAnalyser();
    nextAnalyser.fftSize = 128;
    mediaSource = audioContext.createMediaElementSource(audio);
    try {
      mediaSource.connect(nextAnalyser);
      nextAnalyser.connect(audioContext.destination);
      analyser = nextAnalyser;
      return true;
    } catch (error) {
      mediaSource.connect(audioContext.destination);
      console.warn("Analiza audio nu este disponibilă; se folosește redarea directă.", error);
      return false;
    }
  } catch (error) {
    console.warn("Analiza audio nu este disponibilă; se folosește animația de rezervă.", error);
    return false;
  }
}

async function playActiveSong() {
  if (activeIndex < 0) return;
  setPlayerVisible(true);
  setStatus("");
  const playback = audio.play();
  await setupAudioAnalysis();

  try {
    await playback;
    player.classList.add("is-playing");
    setStatus("");
    updateActiveTrack();
    enableSpeakerAnimation();
  } catch (error) {
    player.classList.remove("is-playing");
    stopSpeakerAnimation();
    updateActiveTrack();
    setStatus(error.name === "NotAllowedError"
      ? "Apasă Play pentru a începe redarea."
      : "Melodia nu poate fi redată. Verifică fișierul MP3.");
    console.warn("Redarea melodiei a eșuat.", error);
  }
}

function selectSong(index, startPlayback) {
  if (index < 0 || index >= songs.length) return;
  activeIndex = index;
  const song = songs[index];
  audio.pause();
  audio.src = `song/${encodeURIComponent(song.file)}`;
  audio.load();
  playerTitle.textContent = song.title;
  currentTimeLabel.textContent = "0:00";
  totalTimeLabel.textContent = "--:--";
  seekSlider.value = "0";
  updateSlider(seekSlider, 0);
  setStatus("");
  setPlayerVisible(true);
  updateActiveTrack();

  const activeCard = trackList.querySelector(".track-card.is-active");
  if (activeCard) activeCard.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "nearest" });
  if (startPlayback) playActiveSong();
}

function moveTrack(direction, startPlayback) {
  if (songs.length === 0) return;
  const nextIndex = activeIndex + direction;
  if (nextIndex < 0) {
    if (loopPlaylist) selectSong(songs.length - 1, startPlayback);
    return;
  }
  if (nextIndex >= songs.length) {
    if (loopPlaylist) selectSong(0, startPlayback);
    else {
      audio.pause();
      setPlayerVisible(false);
    }
    return;
  }
  selectSong(nextIndex, startPlayback);
}

playButton.addEventListener("click", () => {
  if (activeIndex < 0) return;
  if (audio.paused) playActiveSong();
  else audio.pause();
});

document.getElementById("previous-button").addEventListener("click", () => moveTrack(-1, true));
document.getElementById("next-button").addEventListener("click", () => moveTrack(1, true));

document.getElementById("stop-button").addEventListener("click", () => {
  audio.pause();
  audio.currentTime = 0;
  player.classList.remove("is-playing");
  stopSpeakerAnimation();
  updateActiveTrack();
  setStatus("");
  setPlayerVisible(false);
});

volumeSlider.addEventListener("input", () => {
  audio.volume = Number(volumeSlider.value);
  updateSlider(volumeSlider, audio.volume);
});

seekSlider.addEventListener("input", () => {
  seekInProgress = true;
  const fraction = Number(seekSlider.value) / 1000;
  updateSlider(seekSlider, fraction);
  if (Number.isFinite(audio.duration)) {
    currentTimeLabel.textContent = formatTime(audio.duration * fraction);
  }
});

seekSlider.addEventListener("change", () => {
  if (Number.isFinite(audio.duration)) {
    audio.currentTime = (Number(seekSlider.value) / 1000) * audio.duration;
  }
  seekInProgress = false;
});

audio.addEventListener("loadedmetadata", updateProgress);
audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("play", () => {
  player.classList.add("is-playing");
  updateActiveTrack();
  enableSpeakerAnimation();
});
audio.addEventListener("pause", () => {
  if (!audio.paused) return;
  player.classList.remove("is-playing");
  stopSpeakerAnimation();
  updateActiveTrack();
});
audio.addEventListener("ended", () => {
  if (activeIndex < songs.length - 1) {
    selectSong(activeIndex + 1, true);
  } else if (loopPlaylist && songs.length > 0) {
    selectSong(0, true);
  } else {
    setPlayerVisible(false);
  }
});
audio.addEventListener("error", () => {
  if (activeIndex < 0 || !audio.currentSrc) return;
  player.classList.remove("is-playing");
  stopSpeakerAnimation();
  updateActiveTrack();
  setStatus(window.location.protocol === "file:"
    ? "Browserul nu a putut încărca MP3-ul din file://. Deschide pagina prin localhost."
    : "Fișierul MP3 lipsește sau nu poate fi citit.");
});

function createParticles() {
  if (reducedMotion.matches) return;
  const container = document.getElementById("particles");
  for (let index = 0; index < 17; index += 1) {
    const particle = document.createElement("span");
    particle.className = "particle";
    particle.style.left = `${(index * 37 + 13) % 100}%`;
    particle.style.top = `${(index * 53 + 7) % 100}%`;
    particle.style.setProperty("--drift-duration", `${7 + (index % 5)}s`);
    particle.style.setProperty("--drift-delay", `${-(index % 8)}s`);
    container.append(particle);
  }
}

function createLedMeter() {
  const fragment = document.createDocumentFragment();
  for (let barIndex = 0; barIndex < 6; barIndex += 1) {
    const bar = document.createElement("span");
    bar.className = "led-bar";
    for (let segmentIndex = 0; segmentIndex < 6; segmentIndex += 1) {
      const segment = document.createElement("i");
      segment.className = "led-segment";
      bar.append(segment);
    }
    fragment.append(bar);
  }
  speakers.replaceChildren(fragment);
}

audio.volume = Number(volumeSlider.value);
updateSlider(volumeSlider, audio.volume);
createLedMeter();
if (!playlistIsValid) {
  console.error("Lista de melodii nu a putut fi încărcată din song/playlist.js.");
}
renderPlaylist(playlistIsValid
  ? "Nu există melodii în folderul song."
  : "Lista de melodii nu a putut fi încărcată. Verifică song/playlist.js.");
createParticles();
