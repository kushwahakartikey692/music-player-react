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
const profileTrigger = document.getElementById('profile-trigger');
const profileMenu = document.getElementById('profile-menu');

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
let activeUsername = 'user';

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
  const pass = document.getElementById('login-pass').value;

  try {
    const storedUser = findStoredUser(user, pass);
    if ((user === 'user' && pass === 'user') || storedUser) {
      activeUsername = storedUser
        ? getStoredUserField(storedUser, ['username', 'userName', 'name', 'email', 'id']) || user
        : 'user';
      document.getElementById('profile-name').textContent = activeUsername;
      loginOverlay.style.display = 'none';
    } else {
      alert('Invalid ID or Password! Use: user / user or an account created by admin.');
    }
  } catch (error) {
    alert('Unable to read saved users from browser storage. ' + error.message);
  }
}

function normalizeStoredUsers(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (!value || typeof value !== 'object') {
    return [];
  }
  if (Array.isArray(value.users)) {
    return value.users;
  }
  if ('username' in value || 'userName' in value || 'email' in value || 'name' in value) {
    return [value];
  }
  return Object.entries(value).map(([username, record]) => {
    if (record && typeof record === 'object' && !Array.isArray(record)) {
      return { username, ...record };
    }
    return { username, password: typeof record === 'string' ? record : '' };
  });
}

function getStoredUserField(user, fields) {
  if (!user || typeof user !== 'object') {
    return '';
  }
  for (const field of fields) {
    const value = user[field];
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
  }
  return '';
}

function findStoredUser(username, password) {
  const keys = ['users', 'registeredUsers', 'sargamLabUsers', 'pulseplayUsers'];
  for (const key of keys) {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      continue;
    }

    const records = normalizeStoredUsers(JSON.parse(storedValue));
    const match = records.find((record) => {
      const storedUsername = getStoredUserField(record, ['username', 'userName', 'name', 'email', 'id']);
      const storedPassword = getStoredUserField(record, ['password', 'pass']);
      return storedUsername.toLowerCase() === username.toLowerCase() &&
        storedPassword === password;
    });
    if (match) {
      return match;
    }
  }
  return null;
}

function handleLogout() {
  player.pause();
  isPlaying = false;
  updatePlayButton();
  closeProfileMenu();
  activeUsername = 'user';
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
  loginOverlay.style.display = 'flex';
}

function closeProfileMenu() {
  profileMenu.classList.add('hidden');
  profileTrigger.setAttribute('aria-expanded', 'false');
}

profileTrigger.addEventListener('click', function () {
  const isExpanded = profileTrigger.getAttribute('aria-expanded') === 'true';
  profileTrigger.setAttribute('aria-expanded', String(!isExpanded));
  profileMenu.classList.toggle('hidden', isExpanded);
});

document.addEventListener('click', function (event) {
  if (!event.target.closest('.profile-control')) {
    closeProfileMenu();
  }
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeProfileMenu();
  }
});

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

    const art = document.createElement('div');
    art.className = 'crate-art';
    const image = document.createElement('img');
    image.src = folder.cover;
    image.alt = folder.name;
    art.appendChild(image);

    const title = document.createElement('div');
    title.className = 'crate-title';
    title.textContent = folder.name;

    const subtitle = document.createElement('div');
    subtitle.className = 'crate-sub';
    subtitle.textContent = folder.tracks.length + ' songs';

    card.append(art, title, subtitle);
    cratesGrid.appendChild(card);

    const navItem = document.createElement('div');
    navItem.className = 'folder-nav-item' + (currentFolderKey === key ? ' active' : '');
    navItem.onclick = function () {
      openFolder(key);
    };
    const navName = document.createElement('span');
    navName.textContent = folder.name;
    const badge = document.createElement('span');
    badge.className = 'folder-badge';
    badge.textContent = String(folder.tracks.length);
    navItem.append(navName, badge);
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
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.textContent = 'No audio tracks found in this folder.';
    cell.style.textAlign = 'center';
    cell.style.padding = '20px';
    cell.style.color = '#888';
    row.appendChild(cell);
    categoryTrackList.appendChild(row);
    return;
  }

  tracks.forEach(function (song, index) {
    const tr = document.createElement('tr');
    if (folders[currentFolderKey] && currentSongIndex === index && isPlaying) {
      tr.classList.add('active-track');
    }

    const numberCell = document.createElement('td');
    numberCell.className = 'col-num';
    numberCell.textContent = String(index + 1);

    const titleCell = document.createElement('td');
    titleCell.className = 'col-title';
    const title = document.createElement('strong');
    title.textContent = song.name;
    titleCell.appendChild(title);

    const folderCell = document.createElement('td');
    folderCell.className = 'col-folder';
    folderCell.textContent = song.folder;

    tr.append(numberCell, titleCell, folderCell);

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
