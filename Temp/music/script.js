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
        
        this.initializeElements();
        this.setupEventListeners();
        this.initializeGoogleAPI();
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
        
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        
        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.nextSong());
        this.audioPlayer.addEventListener('error', (e) => this.handleAudioError(e));
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

    async loadSong(index) {
        if (index < 0 || index >= this.songIds.length) return;
        
        this.showLoading();
        
        try {
            const fileId = this.songIds[index];
            
            // Get file content using Google Drive API with authentication
            const response = await gapi.client.drive.files.get({
                fileId: fileId,
                alt: 'media'
            });
            
            // Create blob URL from the response
            const blob = new Blob([response.body], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(blob);
            
            this.audioPlayer.src = audioUrl;
            
            // Get file metadata from Google Drive API
            await this.getFileMetadata(fileId);
            
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
            
            // Set default album art
            this.albumArt.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEwxMDAgMTUwTDUwIDEwMEwxMDAgNTBaIiBmaWxsPSIjRTBGMTFGIi8+Cjwvc3ZnPg==";
            
            // Try to extract metadata from the audio file after it loads
            this.audioPlayer.addEventListener('loadeddata', () => {
                this.extractMetadataFromAudio();
            }, { once: true });
            
        } catch (error) {
            console.error('Failed to get file metadata:', error);
            this.songTitle.textContent = 'Unknown Title';
            this.artistName.textContent = 'Unknown Artist';
            this.setupTextScrolling();
        }
    }

    async extractMetadataFromAudio() {
        return new Promise(async (resolve) => {
            try {
                // Get the current file ID
                const fileId = this.songIds[this.currentSongIndex];
                
                // Get file content using Google Drive API for metadata extraction
                const response = await gapi.client.drive.files.get({
                    fileId: fileId,
                    alt: 'media'
                });
                
                // Convert response to blob for metadata extraction
                const uint8Array = new Uint8Array(response.body.length);
                for (let i = 0; i < response.body.length; i++) {
                    uint8Array[i] = response.body.charCodeAt(i);
                }
                const blob = new Blob([uint8Array], { type: 'audio/mpeg' });
                
                jsmediatags.read(blob, {
                    onSuccess: (tag) => {
                        const { title, artist, picture } = tag.tags;
                        
                        // Update song info only if metadata is available
                        if (title) {
                            this.songTitle.textContent = title;
                        }
                        if (artist) {
                            this.artistName.textContent = artist;
                        }
                        
                        // Handle artist name scrolling
                        this.setupTextScrolling();
                        
                        // Update album art
                        if (picture) {
                            const { data, type } = picture;
                            const byteArray = new Uint8Array(data);
                            const albumBlob = new Blob([byteArray], { type });
                            const url = URL.createObjectURL(albumBlob);
                            this.albumArt.src = url;
                        }
                        
                        resolve();
                    },
                    onError: (error) => {
                        console.warn('Metadata extraction failed, using filename info:', error);
                        resolve(); // Don't reject, just use filename-based info
                    }
                });
                
            } catch (error) {
                console.warn('Could not get file for metadata extraction:', error);
                resolve(); // Don't reject, just use filename-based info
            }
        });
    }

    // Keep the old method as backup (not used now)
    async extractMetadataFromBlob(blob) {
        return new Promise((resolve, reject) => {
            jsmediatags.read(blob, {
                onSuccess: (tag) => {
                    const { title, artist, picture } = tag.tags;
                    
                    // Update song info
                    this.songTitle.textContent = title || 'Unknown Title';
                    this.artistName.textContent = artist || 'Unknown Artist';
                    
                    // Handle artist name scrolling
                    this.setupTextScrolling();
                    
                    // Update album art
                    if (picture) {
                        const { data, type } = picture;
                        const byteArray = new Uint8Array(data);
                        const albumBlob = new Blob([byteArray], { type });
                        const url = URL.createObjectURL(albumBlob);
                        this.albumArt.src = url;
                    } else {
                        this.albumArt.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMzMzIi8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEwxMDAgMTUwTDUwIDEwMEwxMDAgNTBaIiBmaWxsPSIjRTBGMTFGIi8+Cjwvc3ZnPg==";
                    }
                    
                    resolve();
                },
                onError: (error) => {
                    console.error('Metadata extraction failed:', error);
                    this.songTitle.textContent = 'Unknown Title';
                    this.artistName.textContent = 'Unknown Artist';
                    this.setupTextScrolling();
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

    async previousSong() {
        if (this.currentSongIndex > 0) {
            this.currentSongIndex--;
            this.isPlaying = false;
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            await this.loadSong(this.currentSongIndex);
        }
    }

    async nextSong() {
        if (this.currentSongIndex < this.songIds.length - 1) {
            this.currentSongIndex++;
            this.isPlaying = false;
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            await this.loadSong(this.currentSongIndex);
        }
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