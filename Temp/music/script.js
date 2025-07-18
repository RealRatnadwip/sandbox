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
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupKeyboardControls();
        this.initializeGoogleAPI();
    }

    updateMediaSession() {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: this.songTitle.textContent || 'Unknown Title',
                artist: this.artistName.textContent || 'Unknown Artist',
                artwork: [
                    { src: this.albumArt.src, sizes: '200x200', type: 'image/jpeg' }
                ]
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
        this.audioPlayer.addEventListener('error', (e) => this.handleAudioError(e));
        
        // Media session API for multimedia keys
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {
                if (!this.isPlaying) this.togglePlayPause();
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                if (this.isPlaying) this.togglePlayPause();
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => this.previousSong());
            navigator.mediaSession.setActionHandler('nexttrack', () => this.nextSong());
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
                client_id: '652948871244-mcv01l9rj8vfpj74he0obhq0uoa8tejb.apps.googleusercontent.com', // Replace with your full client ID
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
            this.authButton.textContent = 'Sign in with Google';
            
        } catch (error) {
            console.error('Failed to initialize Google API:', error);
            alert('Failed to initialize Google API. Please check your setup and try refreshing the page.');
            this.authButton.textContent = 'Initialization Failed - Refresh Page';
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
            alert('Failed to load songs. Please check your CSV file and try again.');
        }
    }

    async loadSongIds() {
        try {
            const response = await fetch('songs.csv');
            const csvText = await response.text();
            
            this.songIds = csvText.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            if (this.songIds.length === 0) {
                throw new Error('No song IDs found in CSV file');
            }
            
            console.log(`Loaded ${this.songIds.length} song IDs`);
        } catch (error) {
            console.error('Failed to load song IDs:', error);
            throw error;
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
                
                // Try to parse "Artist - Title" format
                if (nameWithoutExt.includes(' - ')) {
                    const parts = nameWithoutExt.split(' - ');
                    artist = parts[0].trim();
                    title = parts.slice(1).join(' - ').trim();
                } else {
                    title = nameWithoutExt;
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
                    
                    // Update song info only if metadata is available and better than filename
                    if (title && title.trim()) {
                        this.songTitle.textContent = title;
                    }
                    if (artist && artist.trim()) {
                        this.artistName.textContent = artist;
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
        console.log('Song ended, auto-playing next song...');
        
        const nextIndex = this.getNextSongIndex();
        if (nextIndex !== -1) {
            this.currentSongIndex = nextIndex;
            await this.loadSong(nextIndex);
            // Auto-play the next song
            setTimeout(() => {
                this.audioPlayer.play().then(() => {
                    this.isPlaying = true;
                    this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    console.log('Next song auto-playing');
                }).catch(error => {
                    console.log('Auto-play blocked by browser, user needs to click play');
                    // Browser blocked auto-play, user needs to manually play
                });
            }, 500); // Small delay to ensure audio is loaded
        } else {
            console.log('Reached end of playlist/shuffle');
            this.isPlaying = false;
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audioPlayer.pause();
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.audioPlayer.play();
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        this.isPlaying = !this.isPlaying;
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
    }

    updateProgress() {
        const { currentTime, duration } = this.audioPlayer;
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            this.progressFill.style.width = `${progressPercent}%`;
            this.currentTime.textContent = this.formatTime(currentTime);
            
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