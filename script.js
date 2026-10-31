
// Edit this array to change the playlist. Keep each file name identical to its MP3.
const songs = [
  { file: "Alessio - Hindi Punjabi.mp3", title: "Alessio - Hindi Punjabi" },
  { file: "Are Baiatul Vrajeala.mp3", title: "Are Baiatul Vrajeala" },
  { file: "Artur, Kira & Mr. Juvy - Te joci cu mintea mea.mp3", title: "Artur, Kira & Mr. Juvy - Te joci cu mintea mea" },
  { file: "Babasha - Nu rasariti stele.mp3", title: "Babasha - Nu rasariti stele" },
  { file: "Bianca Roz - Inima Mea Bate.mp3", title: "Bianca Roz - Inima Mea Bate" },
  { file: "Bianca Roz - Sunt Vorbita Pe La Spate.mp3", title: "Bianca Roz - Sunt Vorbita Pe La Spate" },
  { file: "Bianca Roz - Vreau Sa Simt Gurita Ta.mp3", title: "Bianca Roz - Vreau Sa Simt Gurita Ta" },
  { file: "Carmen de la Salciua si Armin Nicoara - Traiesc viata ca-n Monaco.mp3", title: "Carmen de la Salciua si Armin Nicoara - Traiesc viata ca-n Monaco" },
  { file: "Connect-R x Karmen - Fa-ti Talentu.mp3", title: "Connect-R x Karmen - Fa-ti Talentu" },
  { file: "Costel Biju - Cadre CBX.mp3", title: "Costel Biju - Cadre CBX" },
  { file: "Cristi Dules ❌ Miruna Tavas ❌ Mr. Juve - Nu-i de joaca cu iubirea.mp3", title: "Cristi Dules ❌ Miruna Tavas ❌ Mr. Juve - Nu-i de joaca cu iubirea" },
  { file: "DUET (Maya&Ale) Asi, asi, asi.mp3", title: "DUET (Maya&Ale) Asi, asi, asi" },
  { file: "Daria Dia - Inima Te Cheama.mp3", title: "Daria Dia - Inima Te Cheama" },
  { file: "Daria Dia - Numai Tu Esti Alinare.mp3", title: "Daria Dia - Numai Tu Esti Alinare" },
  { file: "Dj Sebi - Sa dau foc la suparare.mp3", title: "Dj Sebi - Sa dau foc la suparare" },
  { file: "Eu cuminte, tu golan.mp3", title: "Eu cuminte, tu golan" },
  { file: "FUG DE ACASA.mp3", title: "FUG DE ACASA" },
  { file: "GHEBOASA - Cutia de valori.mp3", title: "GHEBOASA - Cutia de valori" },
  { file: "Iuly Neamtu feat. Georgiana Lobont - Te voi iubi mereu.mp3", title: "Iuly Neamtu feat. Georgiana Lobont - Te voi iubi mereu" },
  { file: "JO x Lazy Ed - Ce te-as.mp3", title: "JO x Lazy Ed - Ce te-as" },
  { file: "Jasmina - M-ai Tradat Iubirea Mea.mp3", title: "Jasmina - M-ai Tradat Iubirea Mea" },
  { file: "Jasmina - Om Cu Suflet Mare.mp3", title: "Jasmina - Om Cu Suflet Mare" },
  { file: "Jasmina - Vreau O Noapte De Iubire.mp3", title: "Jasmina - Vreau O Noapte De Iubire" },
  { file: "Karma feat. Susanu - Pirania.mp3", title: "Karma feat. Susanu - Pirania" },
  { file: "Lele - Cutremur Pe Scara 2.mp3", title: "Lele - Cutremur Pe Scara 2" },
  { file: "Leo de la Kuweit  Susanu - PANTERA.mp3", title: "Leo de la Kuweit  Susanu - PANTERA" },
  { file: "Leo de la Rosiori - Platesc eu diferenta.mp3", title: "Leo de la Rosiori - Platesc eu diferenta" },
  { file: "Livia T - Du-ma La Tine.mp3", title: "Livia T - Du-ma La Tine" },
  { file: "Livia T - Fetele Cu Ochii Verzi.mp3", title: "Livia T - Fetele Cu Ochii Verzi" },
  { file: "Liviu Guta - Bugatti, Ferrari, Micul Dejun In Bali.mp3", title: "Liviu Guta - Bugatti, Ferrari, Micul Dejun In Bali" },
  { file: "Liviu Pustiu feat. Susanu - Sunt bine de tot.mp3", title: "Liviu Pustiu feat. Susanu - Sunt bine de tot" },
  { file: "LuCash Music - Si ce!_ Aia e.mp3", title: "LuCash Music - Si ce!_ Aia e" },
  { file: "Luci Diamantul x Babasha - Mesaje dimineata.mp3", title: "Luci Diamantul x Babasha - Mesaje dimineata" },
  { file: "MADATORRICELLI - MAMACITA DALE.mp3", title: "MADATORRICELLI - MAMACITA DALE" },
  { file: "Înflorit-a ruguțu.mp3", title: "Înflorit-a ruguțu" }
];

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

function renderPlaylist() {
  const fragment = document.createDocumentFragment();
  document.getElementById("song-count").textContent = `· ${songs.length}`;

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
  speakers.style.setProperty("--speaker-pulse", "0");
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }
}

function animateSpeakers() {
  if (!analyser || audio.paused || reducedMotion.matches) return;

  const samples = new Uint8Array(analyser.frequencyBinCount);
  const measure = () => {
    if (audio.paused) {
      stopSpeakerAnimation();
      return;
    }
    analyser.getByteFrequencyData(samples);
    let total = 0;
    for (let index = 0; index < samples.length; index += 1) total += samples[index];
    const energy = samples.length ? total / samples.length / 255 : 0;
    speakers.style.setProperty("--speaker-pulse", String(Math.min(1, energy * 2.8)));
    animationFrame = requestAnimationFrame(measure);
  };
  animationFrame = requestAnimationFrame(measure);
}

function enableSpeakerAnimation() {
  if (reducedMotion.matches) return;
  speakers.classList.add("is-playing");
  if (!analyser) {
    speakers.classList.add("is-fallback");
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

reducedMotion.addEventListener?.("change", () => {
  if (reducedMotion.matches) stopSpeakerAnimation();
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

audio.volume = Number(volumeSlider.value);
updateSlider(volumeSlider, audio.volume);
renderPlaylist();
createParticles();
