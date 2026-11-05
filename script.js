const player = document.getElementById('my-player');
const playBtn = document.getElementById('btn-play');
const playIcon = document.getElementById('play-icon');
const progressBar = document.getElementById('progress-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const equalizerBars = document.getElementById('equalizer-bars');
const nowTitle = document.getElementById('now-title');
const nowSub = document.getElementById('now-sub');
const nowArt = document.getElementById('now-art');

const loginOverlay = document.getElementById('login-overlay');

const viewHome = document.getElementById('view-home');
const viewCategory = document.getElementById('view-category');
const btnBack = document.getElementById('btn-back');
const viewHeading = document.getElementById('view-heading');
const cratesGrid = document.getElementById('crates-grid');
const categoryTrackList = document.getElementById('category-track-list');
const detailCover = document.getElementById('detail-cover');
const detailTitle = document.getElementById('detail-title');
const detailFolderTag = document.getElementById('detail-folder-tag');
const detailMeta = document.getElementById('detail-meta');
const sidebarFolderList = document.getElementById('sidebar-folder-list');
const folderInput = document.getElementById('folder-input');

let isPlaying = false;
let currentFolderKey = 'Default Music';
let currentSongIndex = 0;

let folders = {
  'Default Music': {
    name: 'Default Music',
    cover: 'album-art.png',
    tracks: [
      {
        name: 'audio.mp3',
        url: 'audio.mp3',
        folder: 'Default Music'
      }
    ]
  }
};

function initApp() {
  loginOverlay.style.display = 'flex';
  renderFolders();
}

function handleLogin(e) {
  e.preventDefault();
  const user = document.getElementById('login-user').value.trim();
  const pass = document.getElementById('login-pass').value.trim();

  if (user === 'user' && pass === 'user') {
    loginOverlay.style.display = 'none';
  } else {
    alert('Invalid ID or Password! Use: user / user');
  }
}

function handleLogout() {
  player.pause();
  isPlaying = false;
  updatePlayButton();
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  loginOverlay.style.display = 'flex';
}

if (folderInput) {
  folderInput.addEventListener('change', function (event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relPath = file.webkitRelativePath || file.name;
      const parts = relPath.split('/');

      let folderName = 'Imported Music';
      if (parts.length === 2) {
        folderName = parts[0];
      } else if (parts.length >= 3) {
        folderName = parts[parts.length - 2];
      }

      if (!folders[folderName]) {
        folders[folderName] = {
          name: folderName,
          cover: 'album-art.png',
          tracks: []
        };
      }

      const isAudio = file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a|aac|flac)$/i);
      const isImage = file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i);

      if (isAudio) {
        const fileUrl = URL.createObjectURL(file);
        folders[folderName].tracks.push({
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: fileUrl,
          folder: folderName
        });
      } else if (isImage) {
        folders[folderName].cover = URL.createObjectURL(file);
      }
    }

    renderFolders();
    alert('Successfully loaded folder music!');
  });
}

function renderFolders() {
  cratesGrid.innerHTML = '';
  sidebarFolderList.innerHTML = '';

  const keys = Object.keys(folders);

  keys.forEach(function (key) {
    const folder = folders[key];

    const card = document.createElement('div');
    card.className = 'crate-card';
    card.onclick = function () {
      openFolder(key);
    };

    card.innerHTML = `
      <div class="crate-art">
        <img src="${folder.cover}" alt="${folder.name}">
      </div>
      <div class="crate-title">${folder.name}</div>
      <div class="crate-sub">${folder.tracks.length} songs</div>
    `;
    cratesGrid.appendChild(card);

    const navItem = document.createElement('div');
    navItem.className = 'folder-nav-item' + (currentFolderKey === key ? ' active' : '');
    navItem.onclick = function () {
      openFolder(key);
    };
    navItem.innerHTML = `
      <span>${folder.name}</span>
      <span class="folder-badge">${folder.tracks.length}</span>
    `;
    sidebarFolderList.appendChild(navItem);
  });
}

function openFolder(key) {
  currentFolderKey = key;
  const folder = folders[key];
  if (!folder) return;

  viewHome.classList.add('hidden');
  viewCategory.classList.remove('hidden');
  btnBack.classList.remove('hidden');

  viewHeading.textContent = folder.name;
  detailTitle.textContent = folder.name;
  detailFolderTag.textContent = 'Folder Library';
  detailCover.src = folder.cover;
  detailMeta.textContent = folder.tracks.length + ' songs';

  renderTrackList(folder.tracks);
}

function goHome() {
  viewCategory.classList.add('hidden');
  viewHome.classList.remove('hidden');
  btnBack.classList.add('hidden');
  viewHeading.textContent = 'All Folders';
  renderFolders();
}

function renderTrackList(tracks) {
  categoryTrackList.innerHTML = '';

  if (tracks.length === 0) {
    categoryTrackList.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px; color:#888;">No audio tracks found in this folder.</td></tr>';
    return;
  }

  tracks.forEach(function (song, index) {
    const tr = document.createElement('tr');
    if (folders[currentFolderKey] && currentSongIndex === index && isPlaying) {
      tr.classList.add('active-track');
    }

    tr.innerHTML = `
      <td class="col-num">${index + 1}</td>
      <td class="col-title"><strong>${song.name}</strong></td>
      <td class="col-folder">${song.folder}</td>
    `;

    tr.onclick = function () {
      playSong(index);
    };

    categoryTrackList.appendChild(tr);
  });
}

function playSong(index) {
  const currentFolder = folders[currentFolderKey];
  if (!currentFolder || !currentFolder.tracks[index]) return;

  currentSongIndex = index;
  const song = currentFolder.tracks[index];

  player.src = song.url;
  nowTitle.textContent = song.name;
  nowSub.textContent = song.folder;
  nowArt.src = currentFolder.cover;

  player.play();
  isPlaying = true;
  updatePlayButton();
  equalizerBars.classList.add('animating');

  renderTrackList(currentFolder.tracks);
}

function playCurrentFolder() {
  const currentFolder = folders[currentFolderKey];
  if (currentFolder && currentFolder.tracks.length > 0) {
    playSong(0);
  }
}

function togglePlayPause() {
  if (isPlaying) {
    player.pause();
    isPlaying = false;
    equalizerBars.classList.remove('animating');
  } else {
    player.play();
    isPlaying = true;
    equalizerBars.classList.add('animating');
  }
  updatePlayButton();
}

function updatePlayButton() {
  if (isPlaying) {
    playIcon.src = 'pause.svg';
  } else {
    playIcon.src = 'play.svg';
  }
}

function playNextSong() {
  const currentFolder = folders[currentFolderKey];
  if (!currentFolder || currentFolder.tracks.length === 0) return;

  currentSongIndex = (currentSongIndex + 1) % currentFolder.tracks.length;
  playSong(currentSongIndex);
}

function playPreviousSong() {
  const currentFolder = folders[currentFolderKey];
  if (!currentFolder || currentFolder.tracks.length === 0) return;

  currentSongIndex = (currentSongIndex - 1 + currentFolder.tracks.length) % currentFolder.tracks.length;
  playSong(currentSongIndex);
}

player.addEventListener('timeupdate', function () {
  if (player.duration) {
    const progressPercent = (player.currentTime / player.duration) * 100;
    progressBar.style.width = progressPercent + '%';
    currentTimeEl.textContent = formatTime(player.currentTime);
    durationEl.textContent = formatTime(player.duration);
  }
});

player.addEventListener('ended', function () {
  playNextSong();
});

function seekTrack(e) {
  const width = e.currentTarget.clientWidth;
  const clickX = e.offsetX;
  if (player.duration) {
    player.currentTime = (clickX / width) * player.duration;
  }
}

function changeVolume(val) {
  player.volume = val;
}

function formatTime(sec) {
  const mins = Math.floor(sec / 60);
  const secs = Math.floor(sec % 60);
  return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

Object.assign(window, {
  handleLogin,
  handleLogout,
  goHome,
  playCurrentFolder,
  playPreviousSong,
  togglePlayPause,
  playNextSong,
  seekTrack,
  changeVolume
});

initApp();
