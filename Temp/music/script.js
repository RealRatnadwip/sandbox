class MusicPlayer {
    constructor() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.songIds = [];
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.isMuted = false;
        this.isAuthenticated = false;
        this.accessToken = null;
        this.tokenClient = null;
        this.isGoogleAPIReady = false;
        this.currentBlobUrl = null; // Track current blob URL for cleanup
        this.nextSongData = null; // Pre-loaded next song data
        this.isPreloading = false; // Prevent multiple pre-load attempts
        this.isShuffleMode = false; // Shuffle mode state
        this.shuffledPlaylist = []; // Shuffled order of song indices
        this.shuffleIndex = 0; // Current position in shuffled playlist
        this.endDetectionInterval = null; // For detecting song end when locked
        this.lastKnownTime = 0; // Track playback position
        this.stuckTimeCount = 0; // Count how long time has been stuck
        this.mediaSessionInitialized = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupKeyboardControls();
        this.initializeGoogleAPI();
    }

    updateMediaSession() {
       if ('mediaSession' in navigator) {
           // Ensure we have valid metadata before setting
           const title = this.songTitle.textContent || 'Unknown Title';
           const artist = this.artistName.textContent || 'Unknown Artist';
           const artwork = this.albumArt.src || '';
           
           // Always set metadata, even if empty
           navigator.mediaSession.metadata = new MediaMetadata({
               title: title,
               artist: artist,
               album: '', // Add empty album field
               artwork: artwork ? [
                   { src: artwork, sizes: '96x96', type: 'image/jpeg' },
                   { src: artwork, sizes: '128x128', type: 'image/jpeg' },
                   { src: artwork, sizes: '192x192', type: 'image/jpeg' },
                   { src: artwork, sizes: '256x256', type: 'image/jpeg' },
                   { src: artwork, sizes: '384x384', type: 'image/jpeg' },
                   { src: artwork, sizes: '512x512', type: 'image/jpeg' }
               ] : []
           });
           
           // Update playback state - this is crucial for mobile
           navigator.mediaSession.playbackState = this.isPlaying ? 'playing' : 'paused';
           
           // Update position state immediately if audio is ready
           if (this.audioPlayer.duration && !isNaN(this.audioPlayer.duration) && this.audioPlayer.duration > 0) {
               this.updateMediaSessionPosition();
           }
       }
    }

    updateMediaSessionPosition() {
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
            if (this.audioPlayer.duration && !isNaN(this.audioPlayer.duration) && this.audioPlayer.duration > 0) {
                navigator.mediaSession.setPositionState({
                    duration: this.audioPlayer.duration,
                    playbackRate: this.audioPlayer.playbackRate,
                    position: this.audioPlayer.currentTime
                });
            }
        }
    }

    handleVisibilityChange() {
        if (document.hidden) {
            console.log('Page hidden - background mode');
            // Ensure media session is active for background controls
            if (this.isPlaying) {
                this.updateMediaSession();
            }
        } else {
            console.log('Page visible - foreground mode');
            // Sync UI state with actual audio state
            const actuallyPlaying = !this.audioPlayer.paused && this.audioPlayer.currentTime > 0;
            if (this.isPlaying !== actuallyPlaying) {
                console.log('Syncing play state:', actuallyPlaying);
                this.isPlaying = actuallyPlaying;
                this.playPauseBtn.innerHTML = this.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
                this.updateMediaSession();
            }
        }
    }

    handlePageUnload() {
        // Clean up resources
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
        }
        if (this.nextSongData) {
            URL.revokeObjectURL(this.nextSongData.audioUrl);
        }
    }

    handlePageHide() {
        // Page is being hidden (mobile app switch, etc.)
        console.log('Page hidden, preserving playback state');
    }

    handlePageShow() {
        // Page is being shown again
        console.log('Page shown, checking playback state');
        if (this.isPlaying && this.audioPlayer.paused) {
            // Try to resume playback if it was interrupted
            this.audioPlayer.play().catch(error => {
                console.warn('Could not resume playback:', error);
            });
        }
    }

    initializeElements() {
        this.authSection = document.getElementById('authSection');
        this.playerContainer = document.getElementById('playerContainer');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        this.authButton = document.getElementById('authButton');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.muteBtn = document.getElementById('muteBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        
        // Disable auth button initially
        this.authButton.disabled = true;
        this.authButton.textContent = 'Loading...';
        
        this.albumArt = document.getElementById('albumArt');
        this.songTitle = document.getElementById('songTitle');
        this.artistName = document.getElementById('artistName');
        this.currentTime = document.getElementById('currentTime');
        this.duration = document.getElementById('duration');
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.getElementById('progressFill');
    }

    setupEventListeners() {
        this.authButton.addEventListener('click', () => this.handleAuthClick());
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.handleSongEnd());
        this.audioPlayer.addEventListener('ended', () => this.handleSongEndBackup());
        this.audioPlayer.addEventListener('error', (e) => this.handleAudioError(e));
        
        // Add more audio event listeners for better background support
        this.audioPlayer.addEventListener('loadstart', () => {
            console.log('Audio loading started');
        });
        this.audioPlayer.addEventListener('canplay', () => {
            console.log('Audio can start playing');
            this.updateMediaSession();
        });
        this.audioPlayer.addEventListener('playing', () => {
            console.log('Audio started playing');
            this.isPlaying = true;
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            this.updateMediaSession();
        });
        this.audioPlayer.addEventListener('pause', () => {
            console.log('Audio paused');
            this.isPlaying = false;
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.updateMediaSession();
        });
        this.audioPlayer.addEventListener('stalled', () => {
            console.log('Audio stalled - checking if song ended');
            this.checkIfSongShouldEnd();
        });
        this.audioPlayer.addEventListener('suspend', () => {
            console.log('Audio suspended - setting up end detection');
            this.setupEndDetection();
        });
        this.audioPlayer.addEventListener('loadeddata', () => {
            console.log('Audio loaded and ready');
            // Clear any existing end detection
            if (this.endDetectionInterval) {
                clearInterval(this.endDetectionInterval);
                this.endDetectionInterval = null;
            }
        });
        
        // Add visibility change listener for background playback
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());
        
        // Add page lifecycle events for better mobile support
        window.addEventListener('beforeunload', () => this.handlePageUnload());
        window.addEventListener('pagehide', () => this.handlePageHide());
        window.addEventListener('pageshow', () => this.handlePageShow());
        
        // Media session API for multimedia keys
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {
                console.log('Media session: play action');
                if (!this.isPlaying && !this.audioPlayer.paused) {
                    // Audio is ready to play
                    this.audioPlayer.play().then(() => {
                        this.isPlaying = true;
                        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                        this.updateMediaSession();
                    }).catch(error => {
                        console.error('Media session play failed:', error);
                    });
                } else if (!this.isPlaying && this.audioPlayer.paused) {
                    // Audio is paused, resume it
                    this.togglePlayPause();
                }
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                console.log('Media session: pause action');
                if (this.isPlaying && !this.audioPlayer.paused) {
                    this.togglePlayPause();
                }
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                console.log('Media session: previous track');
                this.previousSong();
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                console.log('Media session: next track');
                this.nextSong();
            });

            navigator.mediaSession.setActionHandler('seekto', (details) => {
                console.log('Media session: seek to', details.seekTime);
                if (details.seekTime && this.audioPlayer.duration) {
                    this.audioPlayer.currentTime = details.seekTime;
                    this.updateMediaSessionPosition();
                }
            });

            // Add these additional handlers for better mobile support
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const skipTime = details.seekOffset || 10;
                this.audioPlayer.currentTime = Math.max(0, this.audioPlayer.currentTime - skipTime);
                this.updateMediaSessionPosition();
            });

            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const skipTime = details.seekOffset || 10;
                this.audioPlayer.currentTime = Math.min(this.audioPlayer.duration, this.audioPlayer.currentTime + skipTime);
                this.updateMediaSessionPosition();
            });
        }
    }

    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            // Prevent default behavior if target is not an input field
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                switch(e.code) {
                    case 'Space':
                        e.preventDefault();
                        this.togglePlayPause();
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.previousSong();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.nextSong();
                        break;
                    case 'KeyM':
                        e.preventDefault();
                        this.toggleMute();
                        break;
                    case 'KeyS':
                        e.preventDefault();
                        this.toggleShuffle();
                        break;
                }
            }
        });
    }

    async initializeGoogleAPI() {
        try {
            console.log('Starting Google API initialization...');
            
            // Wait for both gapi and google to be available
            await Promise.all([
                this.waitForGapi(),
                this.waitForGoogle()
            ]);
            
            console.log('Google libraries loaded');

            // Initialize gapi client
            await new Promise((resolve, reject) => {
                gapi.load('client', {
                    callback: resolve,
                    onerror: reject
                });
            });

            await gapi.client.init({
                apiKey: '', // We'll use OAuth token instead
                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
            });
            
            console.log('GAPI client initialized');

            // Initialize Google Identity Services
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: '652948871244-mcv01l9rj8vfpj74he0obhq0uoa8tejb.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/drive.readonly',
                callback: (response) => {
                    if (response.error) {
                        console.error('Token error:', response.error);
                        alert(`Authentication failed: ${response.error}`);
                        return;
                    }
                    this.accessToken = response.access_token;
                    gapi.client.setToken({access_token: this.accessToken});
                    this.handleAuthSuccess();
                }
            });
            
            this.isGoogleAPIReady = true;
            console.log('Google API initialized successfully');
            
            // Enable the auth button
            this.authButton.disabled = false;
            this.authButton.innerHTML = 'Sign in with Google<i class="fab fa-google auth-btn-google-icon"></i>';
            
        } catch (error) {
            console.error('Failed to initialize Google API:', error);
            alert('Failed to initialize Google API. Please check your setup and try refreshing the page.');
            this.authButton.textContent = 'Initialization Failed - Refresh Page';
        }
    }

    initializeMediaSessionForSong() {
        if ('mediaSession' in navigator) {
            // Set initial metadata
            this.updateMediaSession();

            // Set up action handlers if not already done
            if (!this.mediaSessionInitialized) {
                this.setupMediaSessionHandlers();
                this.mediaSessionInitialized = true;
            }
        }
    }

    setupMediaSessionHandlers() {
        if ('mediaSession' in navigator) {
            // Set all action handlers
            const handlers = {
                play: () => {
                    console.log('Media session: play');
                    if (!this.isPlaying) this.togglePlayPause();
                },
                pause: () => {
                    console.log('Media session: pause');
                    if (this.isPlaying) this.togglePlayPause();
                },
                previoustrack: () => {
                    console.log('Media session: previous');
                    this.previousSong();
                },
                nexttrack: () => {
                    console.log('Media session: next');
                    this.nextSong();
                },
                seekto: (details) => {
                    if (details.seekTime && this.audioPlayer.duration) {
                        this.audioPlayer.currentTime = details.seekTime;
                        this.updateMediaSessionPosition();
                    }
                },
                seekbackward: (details) => {
                    const skipTime = details.seekOffset || 10;
                    this.audioPlayer.currentTime = Math.max(0, this.audioPlayer.currentTime - skipTime);
                    this.updateMediaSessionPosition();
                },
                seekforward: (details) => {
                    const skipTime = details.seekOffset || 10;
                    this.audioPlayer.currentTime = Math.min(this.audioPlayer.duration, this.audioPlayer.currentTime + skipTime);
                    this.updateMediaSessionPosition();
                }
            };

            // Set all handlers
            for (const [action, handler] of Object.entries(handlers)) {
                try {
                    navigator.mediaSession.setActionHandler(action, handler);
                } catch (error) {
                    console.warn(`Media session action ${action} not supported:`, error);
                }
            }
        }
    }

    setupEndDetection() {
        // Clear any existing interval
        if (this.endDetectionInterval) {
            clearInterval(this.endDetectionInterval);
        }

        // Only set up if audio is playing
        if (this.isPlaying && !this.audioPlayer.paused) {
            this.endDetectionInterval = setInterval(() => {
                this.checkIfSongShouldEnd();
            }, 1000);
        }
    }

    checkIfSongShouldEnd() {
        if (!this.isPlaying || this.audioPlayer.paused) {
            if (this.endDetectionInterval) {
                clearInterval(this.endDetectionInterval);
                this.endDetectionInterval = null;
            }
            return;
        }

        const currentTime = this.audioPlayer.currentTime;
        const duration = this.audioPlayer.duration;

        // Check if time is stuck (hasn't changed)
        if (Math.abs(currentTime - this.lastKnownTime) < 0.1) {
            this.stuckTimeCount++;

            // If time has been stuck for 3+ seconds and we're near the end
            if (this.stuckTimeCount >= 3 && duration && currentTime >= duration - 1) {
                console.log('Detected stuck audio near end, triggering song end');
                if (this.endDetectionInterval) {
                    clearInterval(this.endDetectionInterval);
                    this.endDetectionInterval = null;
                }
                this.handleSongEnd();
            }
        } else {
            this.lastKnownTime = currentTime;
            this.stuckTimeCount = 0;
        }
    }

    waitForGapi() {
        return new Promise((resolve) => {
            const checkGapi = () => {
                if (typeof gapi !== 'undefined') {
                    resolve();
                } else {
                    setTimeout(checkGapi, 100);
                }
            };
            checkGapi();
        });
    }

    waitForGoogle() {
        return new Promise((resolve) => {
            const checkGoogle = () => {
                if (typeof google !== 'undefined' && google.accounts) {
                    resolve();
                } else {
                    setTimeout(checkGoogle, 100);
                }
            };
            checkGoogle();
        });
    }

    handleAuthClick() {
        try {
            console.log('Auth button clicked');
            console.log('isGoogleAPIReady:', this.isGoogleAPIReady);
            console.log('tokenClient:', this.tokenClient);
            
            console.log('Auth button clicked');
            console.log('isGoogleAPIReady:', this.isGoogleAPIReady);
            console.log('tokenClient:', this.tokenClient);
            
            if (!this.isGoogleAPIReady || !this.tokenClient) {
                throw new Error('Google API not initialized. Please wait or refresh the page.');
            }
            
            // Request access token
            this.tokenClient.requestAccessToken({prompt: 'consent'});
        } catch (error) {
            console.error('Authentication failed:', error);
            alert(`Authentication failed: ${error.message}. Please try again.`);
        }
    }

    async handleAuthSuccess() {
        this.isAuthenticated = true;
        
        this.authSection.style.display = 'none';
        this.showLoading();
        
        try {
            await this.loadSongIds();
            this.hideLoading();
            this.playerContainer.style.display = 'block';
            await this.loadSong(this.currentSongIndex);
            this.createShuffledPlaylist(); // Create initial shuffle playlist
        } catch (error) {
            this.hideLoading();
            console.error('Failed to load songs:', error);
            
            // Show user-friendly error message
            const errorMessage = error.message.includes('❌') ? error.message : 
                `❌ Failed to Load Songs\n\n${error.message}\n\nPlease check your setup and try again.`;
            
            alert(errorMessage);
            
            // Show auth section again so user can retry
            this.authSection.style.display = 'block';
            this.playerContainer.style.display = 'none';
        }
    }

    async loadSongIds() {
        try {
            console.log('Loading song IDs from Google Drive...');
            
            // Step 1: Find the "rMusic" folder
            const folderResponse = await gapi.client.drive.files.list({
                q: "name='rMusic' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                fields: 'files(id, name)'
            });
            
            if (!folderResponse.result.files || folderResponse.result.files.length === 0) {
                throw new Error('FOLDER_NOT_FOUND');
            }
            
            const folderId = folderResponse.result.files[0].id;
            console.log('Found rMusic folder:', folderId);
            
            // Step 2: Find the "rSongList.csv" file in the folder
            const fileResponse = await gapi.client.drive.files.list({
                q: `name='rSongList.csv' and parents in '${folderId}' and trashed=false`,
                fields: 'files(id, name)'
            });
            
            if (!fileResponse.result.files || fileResponse.result.files.length === 0) {
                throw new Error('CSV_NOT_FOUND');
            }
            
            const csvFileId = fileResponse.result.files[0].id;
            console.log('Found rSongList.csv file:', csvFileId);
            
            // Step 3: Download the CSV content
            const csvResponse = await gapi.client.drive.files.get({
                fileId: csvFileId,
                alt: 'media'
            });
            
            const csvText = csvResponse.body;
            console.log('Downloaded CSV content, length:', csvText.length);
            
            this.songIds = csvText.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            if (this.songIds.length === 0) {
                throw new Error('EMPTY_CSV');
            }
            
            console.log(`Loaded ${this.songIds.length} song IDs`);
        } catch (error) {
            console.error('Failed to load song IDs:', error);
            
            // Handle specific errors with user-friendly messages
            if (error.message === 'FOLDER_NOT_FOUND') {
                throw new Error(`
❌ Folder Setup Required

Please create a folder named "rMusic" in your Google Drive root directory.

Steps:
1. Go to drive.google.com
2. Click "New" → "Folder"
3. Name it exactly: rMusic
4. Refresh this page and try again
                `);
            } else if (error.message === 'CSV_NOT_FOUND') {
                throw new Error(`
❌ CSV File Missing

Please create "rSongList.csv" file inside your "rMusic" folder.

Steps:
1. Go to your "rMusic" folder in Google Drive
2. Click "New" → "Google Sheets"
3. Add your song file IDs (one per row)
4. Download as CSV and upload as "rSongList.csv"
5. Refresh this page and try again

Example CSV content:
1abc2def3ghi4jkl5mno6pqr7stu8vwx9yz0
2def3ghi4jkl5mno6pqr7stu8vwx9yz01abc
                `);
            } else if (error.message === 'EMPTY_CSV') {
                throw new Error(`
❌ Empty Playlist

Your "rSongList.csv" file is empty.

Please add Google Drive file IDs to your CSV file:
1. Open "rSongList.csv" in your "rMusic" folder
2. Add one file ID per line
3. Save the file
4. Refresh this page and try again
                `);
            } else {
                throw new Error(`Failed to load playlist: ${error.message}`);
            }
        }
    }

    createShuffledPlaylist() {
        // Create array of indices [0, 1, 2, ..., songIds.length-1]
        this.shuffledPlaylist = Array.from({length: this.songIds.length}, (_, i) => i);
        
        // Fisher-Yates shuffle algorithm
        for (let i = this.shuffledPlaylist.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.shuffledPlaylist[i], this.shuffledPlaylist[j]] = [this.shuffledPlaylist[j], this.shuffledPlaylist[i]];
        }
        
        // Set shuffle index to current song position in shuffled playlist
        this.shuffleIndex = this.shuffledPlaylist.indexOf(this.currentSongIndex);
        
        console.log('Shuffled playlist created:', this.shuffledPlaylist);
    }

    toggleShuffle() {
        this.isShuffleMode = !this.isShuffleMode;
        
        if (this.isShuffleMode) {
            this.shuffleBtn.innerHTML = '<i class="fas fa-random" style="color: #E0F11F;"></i>';
            this.shuffleBtn.style.background = 'rgba(224, 241, 31, 0.2)';
            console.log('Shuffle mode ON');
            
            // Create new shuffled playlist if not exists or recreate
            this.createShuffledPlaylist();
        } else {
            this.shuffleBtn.innerHTML = '<i class="fas fa-random"></i>';
            this.shuffleBtn.style.background = 'rgba(255, 255, 255, 0.1)';
            console.log('Shuffle mode OFF');
        }
    }

    getNextSongIndex() {
        if (this.isShuffleMode) {
            // In shuffle mode, move to next song in shuffled playlist
            const nextShuffleIndex = this.shuffleIndex + 1;
            if (nextShuffleIndex < this.shuffledPlaylist.length) {
                return this.shuffledPlaylist[nextShuffleIndex];
            } else {
                return -1; // End of shuffled playlist
            }
        } else {
            // Normal mode, just next song
            if (this.currentSongIndex < this.songIds.length - 1) {
                return this.currentSongIndex + 1;
            } else {
                return -1; // End of playlist
            }
        }
    }

    getPreviousSongIndex() {
        if (this.isShuffleMode) {
            // In shuffle mode, move to previous song in shuffled playlist
            const prevShuffleIndex = this.shuffleIndex - 1;
            if (prevShuffleIndex >= 0) {
                return this.shuffledPlaylist[prevShuffleIndex];
            } else {
                return -1; // Beginning of shuffled playlist
            }
        } else {
            // Normal mode, just previous song
            if (this.currentSongIndex > 0) {
                return this.currentSongIndex - 1;
            } else {
                return -1; // Beginning of playlist
            }
        }
    }

    async loadSong(index) {
        if (index < 0 || index >= this.songIds.length) return;
        
        // Clean up previous blob URL to free memory
        if (this.currentBlobUrl) {
            URL.revokeObjectURL(this.currentBlobUrl);
            this.currentBlobUrl = null;
        }
        
        this.showLoading();
        this.albumArtLoaded = false; // Reset album art flag
        
        try {
            let songData;
            
            // Check if we have pre-loaded data for this song
            if (this.nextSongData && this.nextSongData.index === index) {
                console.log('Using pre-loaded song data');
                songData = this.nextSongData;
                this.nextSongData = null; // Clear pre-loaded data
            } else {
                // Load song data normally
                songData = await this.fetchSongData(index);
            }
            
            // Set up audio player
            this.currentBlobUrl = songData.audioUrl;
            this.audioPlayer.src = songData.audioUrl;
            
            // Extract metadata from the blob
            await this.extractMetadataFromBlob(songData.blob);
            
            // Get file metadata from Google Drive API
            await this.getFileMetadata(songData.fileId);
            
            this.hideLoading();
            this.initializeMediaSessionForSong();
            
        } catch (error) {
            console.error('Failed to load song:', error);
            console.error('File ID that failed:', this.songIds[index]);
            this.hideLoading();
            
            // Try next song on error
            if (index < this.songIds.length - 1) {
                this.currentSongIndex = index + 1;
                await this.loadSong(this.currentSongIndex);
            } else {
                alert('Failed to load any songs. Please check your setup.');
            }
        }
    }

    async getFileMetadata(fileId) {
        try {
            // Get file info from Google Drive API
            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                fields: 'name,mimeType'
            });

            const fileName = response.result.name;

            // Extract title and artist from filename if possible
            let title = 'Unknown Title';
            let artist = 'Unknown Artist';

            if (fileName) {
                // Remove file extension
                const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');

                // Try to parse different formats, being more flexible with non-Latin text
                if (nameWithoutExt.includes(' - ')) {
                    const parts = nameWithoutExt.split(' - ');
                    artist = parts[0].trim();
                    title = parts.slice(1).join(' - ').trim();
                } else if (nameWithoutExt.includes(' – ')) { // em dash
                    const parts = nameWithoutExt.split(' – ');
                    artist = parts[0].trim();
                    title = parts.slice(1).join(' – ').trim();
                } else if (nameWithoutExt.includes('—')) { // em dash without spaces
                    const parts = nameWithoutExt.split('—');
                    artist = parts[0].trim();
                    title = parts.slice(1).join('—').trim();
                } else {
                    title = nameWithoutExt;
                }

                // Fallback: if title or artist is empty, use filename
                if (!title || title.trim() === '') {
                    title = nameWithoutExt;
                }
                if (!artist || artist.trim() === '') {
                    artist = 'Unknown Artist';
                }
            }

            // Update song info
            this.songTitle.textContent = title;
            this.artistName.textContent = artist;

            // Handle artist name scrolling
            this.setupTextScrolling();

            // Set default album art only if no album art was loaded from metadata
            if (!this.albumArtLoaded) {
                this.albumArt.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEwxMDAgMTUwTDUwIDEwMEwxMDAgNTBaIiBmaWxsPSIjRTBGMTFGIi8+Cjwvc3ZnPg==";
            }

            // Update media session
            this.updateMediaSession();

            console.log('Song info updated:', {
                title: this.songTitle.textContent,
                artist: this.artistName.textContent
            });

        } catch (error) {
            console.error('Failed to get file metadata:', error);
            this.songTitle.textContent = 'Unknown Title';
            this.artistName.textContent = 'Unknown Artist';
            this.setupTextScrolling();
        }
    }

    async fetchSongData(index) {
        const fileId = this.songIds[index];
        
        // Use authenticated fetch to get the file
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Get the response as blob
        const blob = await response.blob();
        console.log('Blob created:', blob.type, blob.size);
        
        // Create object URL
        const audioUrl = URL.createObjectURL(blob);
        
        return {
            index,
            fileId,
            blob,
            audioUrl
        };
    }

    async preloadNextSong() {
        // Don't preload if already preloading or no next song
        const nextIndex = this.getNextSongIndex();
        if (this.isPreloading || nextIndex === -1) {
            return;
        }
        
        // Don't preload if next song is already preloaded
        if (this.nextSongData && this.nextSongData.index === nextIndex) {
            return;
        }
        
        this.isPreloading = true;
        
        try {
            console.log('Pre-loading next song...');
            
            // Clean up any existing pre-loaded data
            if (this.nextSongData) {
                URL.revokeObjectURL(this.nextSongData.audioUrl);
            }
            
            // Pre-load next song
            this.nextSongData = await this.fetchSongData(nextIndex);
            console.log('Next song pre-loaded successfully');
            
        } catch (error) {
            console.warn('Failed to pre-load next song:', error);
            this.nextSongData = null;
        } finally {
            this.isPreloading = false;
        }
    }

    async extractMetadataFromBlob(blob) {
        return new Promise((resolve, reject) => {
            console.log('Extracting metadata from blob:', blob.size, 'bytes');

            jsmediatags.read(blob, {
                onSuccess: (tag) => {
                    console.log('Metadata extraction successful:', tag.tags);
                    const { title, artist, picture } = tag.tags;

                    // Update song info only if metadata is available and not empty
                    // Be more lenient with text validation for non-Latin languages
                    if (title && typeof title === 'string' && title.trim().length > 0) {
                        this.songTitle.textContent = title.trim();
                        console.log('Using metadata title:', title);
                    }
                    if (artist && typeof artist === 'string' && artist.trim().length > 0) {
                        this.artistName.textContent = artist.trim();
                        console.log('Using metadata artist:', artist);
                    }

                    // Handle artist name scrolling
                    this.setupTextScrolling();

                    // Update album art
                    if (picture) {
                        console.log('Album art found in metadata');
                        const { data, type } = picture;
                        const byteArray = new Uint8Array(data);
                        const albumBlob = new Blob([byteArray], { type });
                        const url = URL.createObjectURL(albumBlob);
                        this.albumArt.src = url;
                        this.albumArtLoaded = true; // Mark album art as loaded
                    }

                    resolve();
                },
                onError: (error) => {
                    console.warn('Metadata extraction failed, keeping filename info:', error);
                    resolve(); // Don't reject, just use default values
                }
            });
        });
    }

    setupTextScrolling() {
        const artistElement = this.artistName;
        const container = artistElement.parentElement;
        
        // Reset animation
        artistElement.classList.remove('no-scroll');
        
        // Check if text overflows
        setTimeout(() => {
            if (artistElement.scrollWidth > container.clientWidth) {
                artistElement.style.animationDuration = `${Math.max(10, artistElement.scrollWidth / 20)}s`;
            } else {
                artistElement.classList.add('no-scroll');
            }
        }, 100);
    }

    async handleSongEnd() {
        console.log('Song ended, preparing next song...');
        
        // Store the current playing state before any changes
        const wasPlaying = this.isPlaying;
        
        // Clear any end detection interval immediately
        if (this.endDetectionInterval) {
            clearInterval(this.endDetectionInterval);
            this.endDetectionInterval = null;
        }

        // Reset stuck time tracking
        this.lastKnownTime = 0;
        this.stuckTimeCount = 0;

        // Determine next song index based on shuffle mode
        let nextSongIndex;

        if (this.isShuffleMode) {
            // Move to next position in shuffled playlist
            const nextShuffleIndex = this.shuffleIndex + 1;

            if (nextShuffleIndex < this.shuffledPlaylist.length) {
                this.shuffleIndex = nextShuffleIndex;
                nextSongIndex = this.shuffledPlaylist[this.shuffleIndex];
            } else {
                // End of shuffled playlist, create new shuffle and start over
                console.log('End of shuffled playlist, creating new shuffle');
                this.createShuffledPlaylist();
                this.shuffleIndex = 0;
                nextSongIndex = this.shuffledPlaylist[0];
            }
        } else {
            // Normal sequential mode
            if (this.currentSongIndex < this.songIds.length - 1) {
                nextSongIndex = this.currentSongIndex + 1;
            } else {
                // Reached end of playlist
                console.log('Reached end of playlist');
                this.isPlaying = false;
                this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                this.updateMediaSession();
                return;
            }
        }

        try {
            // Update current song index
            this.currentSongIndex = nextSongIndex;

            // Load the next song
            await this.loadSong(this.currentSongIndex);

            // If the previous song was playing, attempt to auto-play the next one
            if (wasPlaying) {
                console.log('Attempting to auto-play next song...');

                // Create a promise-based approach for better error handling
                const attemptAutoPlay = () => {
                    return new Promise((resolve, reject) => {
                        // Set a reasonable timeout
                        const timeout = setTimeout(() => {
                            reject(new Error('Auto-play timeout'));
                        }, 3000);

                        const tryPlay = () => {
                            // Check if audio is ready to play
                            if (this.audioPlayer.readyState >= 2) { // HAVE_CURRENT_DATA or better
                                clearTimeout(timeout);

                                // Attempt to play
                                this.audioPlayer.play()
                                    .then(() => {
                                        console.log('Auto-play successful');
                                        this.isPlaying = true;
                                        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                                        this.updateMediaSession();
                                        resolve();
                                    })
                                    .catch((error) => {
                                        console.warn('Auto-play failed:', error);
                                        reject(error);
                                    });
                            } else {
                                // Wait for audio to be ready
                                const onCanPlay = () => {
                                    clearTimeout(timeout);
                                    this.audioPlayer.removeEventListener('canplay', onCanPlay);
                                    this.audioPlayer.removeEventListener('loadeddata', onCanPlay);
                                    this.audioPlayer.removeEventListener('error', onError);

                                    // Now try to play
                                    this.audioPlayer.play()
                                        .then(() => {
                                            console.log('Auto-play successful after loading');
                                            this.isPlaying = true;
                                            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                                            this.updateMediaSession();
                                            resolve();
                                        })
                                        .catch((error) => {
                                            console.warn('Auto-play failed after loading:', error);
                                            reject(error);
                                        });
                                };

                                const onError = (error) => {
                                    clearTimeout(timeout);
                                    this.audioPlayer.removeEventListener('canplay', onCanPlay);
                                    this.audioPlayer.removeEventListener('loadeddata', onCanPlay);
                                    this.audioPlayer.removeEventListener('error', onError);
                                    reject(error);
                                };

                                // Listen for when audio is ready
                                this.audioPlayer.addEventListener('canplay', onCanPlay, { once: true });
                                this.audioPlayer.addEventListener('loadeddata', onCanPlay, { once: true });
                                this.audioPlayer.addEventListener('error', onError, { once: true });
                            }
                        };

                        // Start the attempt
                        tryPlay();
                    });
                };

                // Execute the auto-play attempt
                try {
                    await attemptAutoPlay();
                } catch (error) {
                    console.warn('Auto-play failed, user interaction required:', error.message);

                    // Set UI to paused state so user can manually play
                    this.isPlaying = false;
                    this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    this.updateMediaSession();

                    // Optional: Show a brief visual indicator that user action is needed
                    // You could add a subtle animation or notification here
                }
            } else {
                // Previous song was paused, keep next song paused
                this.isPlaying = false;
                this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                this.updateMediaSession();
            }

        } catch (error) {
            console.error('Failed to load next song:', error);

            // Fallback: try to load the next song in sequence
            if (nextSongIndex < this.songIds.length - 1) {
                console.log('Trying next song due to load error...');
                this.currentSongIndex = nextSongIndex;

                // Update shuffle index if needed
                if (this.isShuffleMode) {
                    this.shuffleIndex++;
                }

                // Recursive call to try the next song
                setTimeout(() => this.handleSongEnd(), 1000);
            } else {
                // No more songs to try
                console.error('No more songs available');
                this.isPlaying = false;
                this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                this.updateMediaSession();
                alert('Unable to load the next song. Please check your connection.');
            }
        }
    }

    async nextSong() {
        const wasPlaying = this.isPlaying;
        
        // Stop current playback
        this.audioPlayer.pause();
        
        const nextIndex = this.getNextSongIndex();
        if (nextIndex === -1) {
            console.log('No next song available');
            return;
        }
        
        if (this.isShuffleMode) {
            this.shuffleIndex++;
            this.currentSongIndex = this.shuffledPlaylist[this.shuffleIndex];
        } else {
            this.currentSongIndex = nextIndex;
        }
        
        await this.loadSong(this.currentSongIndex);
        
        // Restore previous playing state
        if (wasPlaying) {
            setTimeout(() => {
                this.audioPlayer.play().then(() => {
                    this.isPlaying = true;
                    this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    this.updateMediaSession();
                }).catch(error => {
                    console.warn('Could not auto-play next song:', error);
                    this.isPlaying = false;
                    this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    this.updateMediaSession();
                });
            }, 300);
        } else {
            this.isPlaying = false;
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.updateMediaSession();
        }
    }

    async previousSong() {
        const wasPlaying = this.isPlaying;
        
        // Stop current playback
        this.audioPlayer.pause();
        
        const prevIndex = this.getPreviousSongIndex();
        if (prevIndex === -1) {
            console.log('No previous song available');
            return;
        }
        
        if (this.isShuffleMode) {
            this.shuffleIndex--;
            this.currentSongIndex = this.shuffledPlaylist[this.shuffleIndex];
        } else {
            this.currentSongIndex = prevIndex;
        }
        
        await this.loadSong(this.currentSongIndex);
        
        // Restore previous playing state
        if (wasPlaying) {
            setTimeout(() => {
                this.audioPlayer.play().then(() => {
                    this.isPlaying = true;
                    this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    this.updateMediaSession();
                }).catch(error => {
                    console.warn('Could not auto-play previous song:', error);
                    this.isPlaying = false;
                    this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    this.updateMediaSession();
                });
            }, 300);
        } else {
            this.isPlaying = false;
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.updateMediaSession();
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audioPlayer.pause();
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.isPlaying = false;
        } else {
            const playPromise = this.audioPlayer.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    this.isPlaying = true;
                    this.updateMediaSession();
                }).catch(error => {
                    console.error('Play failed:', error);
                    this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    this.isPlaying = false;
                });
            } else {
                this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                this.isPlaying = true;
            }
        }

        // Always update media session after state change
        this.updateMediaSession();
    }

    toggleMute() {
        if (this.isMuted) {
            this.audioPlayer.muted = false;
            this.muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        } else {
            this.audioPlayer.muted = true;
            this.muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        }
        this.isMuted = !this.isMuted;
    }

    seekTo(event) {
        const progressBar = event.currentTarget;
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        const seekTime = percent * this.audioPlayer.duration;
        this.audioPlayer.currentTime = seekTime;
        this.updateMediaSessionPosition();
    }

    updateProgress() {
        const { currentTime, duration } = this.audioPlayer;
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            this.progressFill.style.width = `${progressPercent}%`;
            this.currentTime.textContent = this.formatTime(currentTime);
            
            // Track time for end detection
            this.lastKnownTime = currentTime;
            this.stuckTimeCount = 0; // Reset stuck counter when time updates
            
            // Update media session position every second
            if (Math.floor(currentTime) !== Math.floor(this.lastKnownTime)) {
                this.updateMediaSessionPosition();
            }
            
            // Pre-load next song when current song is 80% complete
            if (progressPercent >= 80 && !this.isPreloading) {
                this.preloadNextSong();
            }
        }
    }

    updateDuration() {
        const { duration } = this.audioPlayer;
        if (duration) {
            this.duration.textContent = this.formatTime(duration);
            // Update media session when duration is available
            this.updateMediaSessionPosition();
            this.updateMediaSession();
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    showLoading() {
        this.loadingIndicator.style.display = 'block';
    }

    hideLoading() {
        this.loadingIndicator.style.display = 'none';
    }

    handleAudioError(error) {
        console.error('Audio error:', error);
        this.hideLoading();
        
        // Try next song on error
        if (this.currentSongIndex < this.songIds.length - 1) {
            this.nextSong();
        } else {
            alert('Failed to play audio. Please check your connection and try again.');
        }
    }
}