import { useEffect, useRef, useState } from 'react';

const initialFolders = {
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

const userStorageKeys = ['users', 'registeredUsers', 'sargamLabUsers', 'pulseplayUsers'];
const profileFields = ['username', 'userName', 'name', 'email', 'id'];
const signupRequestStorageKey = 'sargamLabSignupRequests';

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
  for (const key of userStorageKeys) {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      continue;
    }

    const records = normalizeStoredUsers(JSON.parse(storedValue));
    const match = records.find((record) => {
      const storedUsername = getStoredUserField(record, profileFields);
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

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return minutes + ':' + (remainder < 10 ? '0' : '') + remainder;
}

function LoginOverlay({
  mode,
  username,
  password,
  error,
  signupStatus,
  onModeChange,
  onUsernameChange,
  onPasswordChange,
  onLoginSubmit,
  onSignupSubmit
}) {
  return (
    <div className="login-overlay">
      <div className="login-card">
        <h2>Sargam Lab</h2>
        {mode === 'requested' ? (
          <div className="signup-success" role="status">
            <p>{signupStatus}</p>
            <button className="auth-return-button" onClick={() => onModeChange('login')} type="button">
              Back to Login
            </button>
          </div>
        ) : (
          <>
            <p>{mode === 'signup' ? 'Request an account to listen to your music' : 'Login to listen to your music'}</p>
            <div className="auth-tabs nav nav-pills nav-fill" role="tablist" aria-label="Account access">
              <button
                aria-selected={mode === 'login'}
                className={'nav-link' + (mode === 'login' ? ' active' : '')}
                onClick={() => onModeChange('login')}
                role="tab"
                type="button"
              >
                Login
              </button>
              <button
                aria-selected={mode === 'signup'}
                className={'nav-link' + (mode === 'signup' ? ' active' : '')}
                onClick={() => onModeChange('signup')}
                role="tab"
                type="button"
              >
                Sign up
              </button>
            </div>
            <form onSubmit={mode === 'signup' ? onSignupSubmit : onLoginSubmit}>
              <div className="form-group">
                <label htmlFor="login-user">Username</label>
                <input
                  autoComplete="username"
                  id="login-user"
                  onChange={(event) => onUsernameChange(event.target.value)}
                  placeholder="user"
                  required
                  type="text"
                  value={username}
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-pass">Password</label>
                <input
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  id="login-pass"
                  onChange={(event) => onPasswordChange(event.target.value)}
                  placeholder="user"
                  required
                  type="password"
                  value={password}
                />
              </div>
              <button className="btn-login btn btn-success" type="submit">
                {mode === 'signup' ? 'Send Signup Request' : 'Login'}
              </button>
              {error && <p className="login-error" role="alert">{error}</p>}
            </form>
          </>
        )}
        <a className="admin-login-link" href="/admin.html">Admin login</a>
      </div>
    </div>
  );
}

function Sidebar({
  folders,
  currentFolderKey,
  activeUsername,
  folderInputRef,
  onFolderChange,
  onOpenFolder,
  onLogout
}) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-title">Sargam Lab</span>
      </div>

      <div className="sidebar-section flex-grow-1 overflow-auto">
        <div className="section-top">
          <span className="section-label">Your Folders</span>
          <label className="btn-add-folder" htmlFor="folder-input" title="Open Music Folder">
            + Open Folder
          </label>
          <input
            ref={folderInputRef}
            accept="audio/*,image/*"
            className="visually-hidden"
            directory=""
            id="folder-input"
            multiple
            onChange={onFolderChange}
            type="file"
            webkitdirectory=""
          />
        </div>

        <nav aria-label="Music folders" className="folder-nav">
          {Object.entries(folders).map(([key, folder]) => (
            <button
              aria-current={currentFolderKey === key ? 'page' : undefined}
              className={'folder-nav-item' + (currentFolderKey === key ? ' active' : '')}
              key={key}
              onClick={() => onOpenFolder(key)}
              type="button"
            >
              <span>{folder.name}</span>
              <span className="folder-badge">{folder.tracks.length}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-user">
        <div className="avatar">{activeUsername.charAt(0).toUpperCase() || 'U'}</div>
        <div className="user-details">
          <div className="name">{activeUsername}</div>
          <div className="role-badge">Listener</div>
        </div>
        <button className="btn-logout" onClick={onLogout} title="Logout" type="button">
          Logout
        </button>
      </div>
    </aside>
  );
}

function TopHeader({
  isCategory,
  heading,
  isProfileOpen,
  profileControlRef,
  activeUsername,
  onBack,
  onOpenFolder,
  onToggleProfile,
  onLogout
}) {
  return (
    <header className="top-header d-flex justify-content-between align-items-center">
      <div className="header-left d-flex align-items-center">
        {isCategory && (
          <button
            className="btn-back"
            onClick={onBack}
            title="Back to All Folders"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}
        <button
          aria-label="Open Music Folder"
          className="btn-mobile-folder"
          onClick={onOpenFolder}
          title="Open Music Folder"
          type="button"
        >
          +
        </button>
        <h1 className="view-heading">{heading}</h1>
      </div>
      <div className="profile-control" ref={profileControlRef}>
        <button
          aria-expanded={isProfileOpen}
          aria-haspopup="true"
          aria-label="Open user profile"
          className="profile-trigger"
          onClick={onToggleProfile}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="8" r="4"></circle>
            <path d="M4.5 21a7.5 7.5 0 0 1 15 0"></path>
          </svg>
        </button>
        {isProfileOpen && (
          <div className="profile-menu">
            <div className="profile-name">{activeUsername}</div>
            <button className="profile-logout" onClick={onLogout} type="button">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

function FolderGrid({ folders, onOpenFolder }) {
  return (
    <section aria-label="Music folders" className="view-panel">
      <div className="crates-grid">
        {Object.entries(folders).map(([key, folder]) => (
          <button
            className="crate-card d-flex flex-column text-start"
            key={key}
            onClick={() => onOpenFolder(key)}
            type="button"
          >
            <div className="crate-art">
              <img alt={folder.name + ' cover'} src={folder.cover} />
            </div>
            <div className="crate-title">{folder.name}</div>
            <div className="crate-sub">{folder.tracks.length} songs</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function CategoryView({
  folder,
  activeSongIndex,
  isPlaying,
  onPlayFolder,
  onPlayTrack
}) {
  return (
    <section aria-label={folder.name + ' tracks'} className="view-panel">
      <div className="category-header">
        <div className="category-cover-wrap">
          <img alt={folder.name + ' cover'} id="detail-cover" src={folder.cover} />
          <img alt="" className="category-disc" src="cd.png" />
        </div>
        <div className="category-info">
          <span className="folder-tag">Folder Library</span>
          <h2 className="category-title">{folder.name}</h2>
          <p className="category-meta">{folder.tracks.length} songs</p>
          <button className="btn-play-category" onClick={onPlayFolder} type="button">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7.05 3.606l13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z" />
            </svg>
            Play Folder
          </button>
        </div>
      </div>

      <div className="track-list-card">
        <table className="tracks-table">
          <thead>
            <tr>
              <th className="col-num" scope="col">#</th>
              <th className="col-title" scope="col">Title</th>
              <th className="col-folder" scope="col">Folder</th>
            </tr>
          </thead>
          <tbody>
            {folder.tracks.length === 0 ? (
              <tr>
                <td colSpan="3" className="empty-track-list">
                  No audio tracks found in this folder.
                </td>
              </tr>
            ) : folder.tracks.map((song, index) => (
              <tr
                aria-current={activeSongIndex === index && isPlaying ? 'true' : undefined}
                className={activeSongIndex === index && isPlaying ? 'active-track' : ''}
                key={song.url + index}
                onClick={() => onPlayTrack(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onPlayTrack(index);
                  }
                }}
                tabIndex={0}
              >
                <td className="col-num">{index + 1}</td>
                <td className="col-title"><strong>{song.name}</strong></td>
                <td className="col-folder">{song.folder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PlayerBar({
  activeSong,
  activeCover,
  isPlaying,
  currentTime,
  duration,
  error,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <footer className="player-bar">
      <div className="player-left">
        <div className="thumb-wrap">
          <img alt="Now playing cover" src={activeCover} />
        </div>
        <div className="track-details">
          <div className="now-title">{activeSong?.name || 'audio.mp3'}</div>
          <div className="now-sub">{activeSong?.folder || 'Default Track'}</div>
        </div>
      </div>

      <div className="player-center">
        <div className="controls-row">
          <button className="btn-ctrl" onClick={onPrevious} title="Previous" type="button">
            <img alt="Previous" src="previous.svg" />
          </button>
          <button
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="btn-play-main"
            onClick={onTogglePlay}
            title="Play/Pause"
            type="button"
          >
            <img alt="" src={isPlaying ? 'pause.svg' : 'play.svg'} />
          </button>
          <button className="btn-ctrl" onClick={onNext} title="Next" type="button">
            <img alt="Next" src="next.svg" />
          </button>
          <div className={'equalizer-bars' + (isPlaying ? ' animating' : '')} aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div className="progress-row">
          <span className="time-text">{formatTime(currentTime)}</span>
          <div
            aria-label="Track progress"
            aria-valuemax={duration || 0}
            aria-valuemin="0"
            aria-valuenow={currentTime}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            className="progress-bar-wrap"
            onClick={onSeek}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') {
                onSeek(null, 5);
              } else if (event.key === 'ArrowLeft') {
                onSeek(null, -5);
              }
            }}
            role="slider"
            tabIndex={0}
          >
            <div className="progress-fill" style={{ width: progress + '%' }}></div>
          </div>
          <span className="time-text">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <svg className="vol-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
        <div className="vol-slider-wrap">
          <input
            aria-label="Volume"
            max="1"
            min="0"
            onChange={onVolumeChange}
            step="0.01"
            type="range"
            defaultValue="0.8"
          />
        </div>
      </div>
      {error && <div className="player-error" role="alert">{error}</div>}
    </footer>
  );
}

export default function App() {
  const [folders, setFolders] = useState(initialFolders);
  const [currentFolderKey, setCurrentFolderKey] = useState('Default Music');
  const [currentTrack, setCurrentTrack] = useState({ folderKey: 'Default Music', index: 0 });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeUsername, setActiveUsername] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [signupStatus, setSignupStatus] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [playerError, setPlayerError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const playerRef = useRef(null);
  const folderInputRef = useRef(null);
  const profileControlRef = useRef(null);
  const createdUrlsRef = useRef([]);

  const currentFolder = folders[currentFolderKey];
  const activeTrackFolder = folders[currentTrack.folderKey];
  const activeSong = activeTrackFolder?.tracks[currentTrack.index] || null;
  const activeSongIndex = currentTrack.folderKey === currentFolderKey ? currentTrack.index : -1;

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.volume = 0.8;
    }
    return () => {
      createdUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!isProfileOpen) {
      return undefined;
    }
    const closeOnOutsideClick = (event) => {
      if (!profileControlRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('click', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('click', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isProfileOpen]);

  function handleLogin(event) {
    event.preventDefault();
    const cleanedUsername = username.trim();
    try {
      const storedUser = findStoredUser(cleanedUsername, password);
      if ((cleanedUsername === 'user' && password === 'user') || storedUser) {
        const displayName = storedUser
          ? getStoredUserField(storedUser, profileFields) || cleanedUsername
          : 'user';
        setActiveUsername(displayName);
        setIsLoggedIn(true);
        setLoginError('');
      } else {
        setLoginError('Invalid ID or password. Use user / user or an account created by admin.');
      }
    } catch (error) {
      setLoginError('Unable to read saved users from browser storage. ' + error.message);
    }
  }

  function handleSignupRequest(event) {
    event.preventDefault();
    const cleanedUsername = username.trim();
    const normalizedUsername = cleanedUsername.toLowerCase();
    if (!cleanedUsername || !password) {
      setLoginError('Enter a username and password to request an account.');
      return;
    }
    if (normalizedUsername === 'admin' || normalizedUsername === 'user') {
      setLoginError('That username is reserved. Please choose another one.');
      return;
    }

    try {
      const usernameTaken = userStorageKeys.some((key) => {
        const storedValue = localStorage.getItem(key);
        if (storedValue === null) {
          return false;
        }
        return normalizeStoredUsers(JSON.parse(storedValue)).some((record) =>
          getStoredUserField(record, profileFields).toLowerCase() === normalizedUsername
        );
      });
      if (usernameTaken) {
        setLoginError('An account with that username already exists.');
        return;
      }

      const pendingValue = localStorage.getItem(signupRequestStorageKey);
      const pendingRequests = pendingValue === null ? [] : JSON.parse(pendingValue);
      if (!Array.isArray(pendingRequests)) {
        throw new Error('Pending signup requests are not in a valid format.');
      }
      if (pendingRequests.some((request) =>
        typeof request?.username === 'string' &&
        request.username.trim().toLowerCase() === normalizedUsername
      )) {
        setLoginError('A request for that username is already waiting for approval.');
        return;
      }

      pendingRequests.push({
        username: cleanedUsername,
        password,
        role: 'User',
        requestedAt: new Date().toISOString()
      });
      localStorage.setItem(signupRequestStorageKey, JSON.stringify(pendingRequests));
      setSignupStatus('Your signup request has been sent. You can log in after an admin approves it.');
      setLoginError('');
      setAuthMode('requested');
      setUsername('');
      setPassword('');
    } catch (error) {
      setLoginError('Unable to submit your signup request. ' + error.message);
    }
  }

  function handleLogout() {
    if (playerRef.current) {
      playerRef.current.pause();
    }
    setIsPlaying(false);
    setIsProfileOpen(false);
    setActiveUsername('user');
    setUsername('');
    setPassword('');
    setIsLoggedIn(false);
  }

  function openFolder(key) {
    if (!folders[key]) {
      return;
    }
    setCurrentFolderKey(key);
    setIsCategoryOpen(true);
  }

  function goHome() {
    setIsCategoryOpen(false);
  }

  function playTrack(index, folderKey = currentFolderKey) {
    const targetFolder = folders[folderKey];
    const song = targetFolder?.tracks[index];
    if (!song || !playerRef.current) {
      return;
    }
    setCurrentFolderKey(folderKey);
    setCurrentTrack({ folderKey, index });
    setPlayerError('');
    playerRef.current.src = song.url;
    playerRef.current.play().catch((error) => {
      setIsPlaying(false);
      setPlayerError('Unable to play this track: ' + error.message);
    });
  }

  function togglePlayPause() {
    const audio = playerRef.current;
    if (!audio) {
      return;
    }
    if (audio.paused) {
      setPlayerError('');
      audio.play().catch((error) => {
        setIsPlaying(false);
        setPlayerError('Unable to play this track: ' + error.message);
      });
    } else {
      audio.pause();
    }
  }

  function playNextSong() {
    const trackFolder = folders[currentTrack.folderKey];
    const trackCount = trackFolder?.tracks.length || 0;
    if (trackCount > 0) {
      playTrack((currentTrack.index + 1) % trackCount, currentTrack.folderKey);
    }
  }

  function playPreviousSong() {
    const trackFolder = folders[currentTrack.folderKey];
    const trackCount = trackFolder?.tracks.length || 0;
    if (trackCount > 0) {
      playTrack((currentTrack.index - 1 + trackCount) % trackCount, currentTrack.folderKey);
    }
  }

  function seekTrack(event, offsetSeconds = null) {
    const audio = playerRef.current;
    if (!audio || !Number.isFinite(audio.duration)) {
      return;
    }
    if (offsetSeconds !== null) {
      audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + offsetSeconds));
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    audio.currentTime = Math.max(0, Math.min(audio.duration, ratio * audio.duration));
  }

  function handleFolderChange(event) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    const updatedFolders = Object.fromEntries(
      Object.entries(folders).map(([key, folder]) => [
        key,
        { ...folder, tracks: [...folder.tracks] }
      ])
    );
    files.forEach((file) => {
      const relativePath = file.webkitRelativePath || file.name;
      const parts = relativePath.split('/');
      let folderName = 'Imported Music';
      if (parts.length === 2) {
        folderName = parts[0];
      } else if (parts.length >= 3) {
        folderName = parts[parts.length - 2];
      }

      if (!updatedFolders[folderName]) {
        updatedFolders[folderName] = {
          name: folderName,
          cover: 'album-art.png',
          tracks: []
        };
      }

      const isAudio = file.type.startsWith('audio/') ||
        /\.(mp3|wav|ogg|m4a|aac|flac)$/i.test(file.name);
      const isImage = file.type.startsWith('image/') ||
        /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

      if (isAudio) {
        const url = URL.createObjectURL(file);
        createdUrlsRef.current.push(url);
        updatedFolders[folderName].tracks.push({
          name: file.name.replace(/\.[^/.]+$/, ''),
          url,
          folder: folderName
        });
      } else if (isImage) {
        const url = URL.createObjectURL(file);
        createdUrlsRef.current.push(url);
        updatedFolders[folderName].cover = url;
      }
    });
    setFolders(updatedFolders);
    event.target.value = '';
  }

  function handleVolumeChange(event) {
    if (playerRef.current) {
      playerRef.current.volume = Number(event.target.value);
    }
  }

  return (
    <>
      {!isLoggedIn && (
        <LoginOverlay
          error={loginError}
          mode={authMode}
          onLoginSubmit={handleLogin}
          onModeChange={(mode) => {
            setAuthMode(mode);
            setLoginError('');
            setSignupStatus('');
          }}
          onPasswordChange={setPassword}
          onSignupSubmit={handleSignupRequest}
          onUsernameChange={setUsername}
          password={password}
          signupStatus={signupStatus}
          username={username}
        />
      )}

      <div className="app-layout d-flex">
        <Sidebar
          activeUsername={activeUsername}
          currentFolderKey={currentFolderKey}
          folderInputRef={folderInputRef}
          folders={folders}
          onFolderChange={handleFolderChange}
          onLogout={handleLogout}
          onOpenFolder={openFolder}
        />

        <div className="main-wrapper">
          <TopHeader
            activeUsername={activeUsername}
            heading={isCategoryOpen && currentFolder ? currentFolder.name : 'All Folders'}
            isCategory={isCategoryOpen}
            isProfileOpen={isProfileOpen}
            onBack={goHome}
            onOpenFolder={() => folderInputRef.current?.click()}
            onToggleProfile={() => setIsProfileOpen((isOpen) => !isOpen)}
            onLogout={handleLogout}
            profileControlRef={profileControlRef}
          />

          <main className="content-scroll">
            {isCategoryOpen && currentFolder ? (
              <CategoryView
                activeSongIndex={activeSongIndex}
                folder={currentFolder}
                isPlaying={isPlaying}
                onPlayFolder={() => playTrack(0)}
                onPlayTrack={(index) => playTrack(index)}
              />
            ) : (
              <FolderGrid folders={folders} onOpenFolder={openFolder} />
            )}
          </main>
        </div>

        <PlayerBar
          activeCover={activeTrackFolder?.cover || 'album-art.png'}
          activeSong={activeSong}
          currentTime={currentTime}
          duration={duration}
          error={playerError}
          isPlaying={isPlaying}
          onNext={playNextSong}
          onPrevious={playPreviousSong}
          onSeek={seekTrack}
          onTogglePlay={togglePlayPause}
          onVolumeChange={handleVolumeChange}
        />
      </div>

      {/* Track changes happen in playTrack; a dynamic src prop can interrupt playback. */}
      <audio
        aria-hidden="true"
        onDurationChange={(event) => setDuration(event.currentTarget.duration || 0)}
        onEnded={playNextSong}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        preload="metadata"
        ref={playerRef}
        src="audio.mp3"
      />
    </>
  );
}
