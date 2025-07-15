class MusicPlayer {
    constructor() {
        this.audioPlayer = document.getElementById('audioPlayer');
        this.songName = document.getElementById('songName');
        this.artistName = document.getElementById('artistName');
        this.albumArt = document.getElementById('albumArt');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.muteBtn = document.getElementById('muteBtn');
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressHandle = document.getElementById('progressHandle');
        this.currentTime = document.getElementById('currentTime');
        this.totalTime = document.getElementById('totalTime');
        this.authBtn = document.getElementById('authBtn');
        this.loadingSpinner = document.getElementById('loadingSpinner');

        this.songs = [];
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.isMuted = false;
        this.isAuthenticated = false;
        this.isDragging = false;

        // Google Drive API configuration
        this.API_KEY = 'AIzaSyCOwYCgzFDeA7f8xVzzqPNIx4ieLKJphV8'; // Replace with your actual API key
        this.CLIENT_ID = '652948871244-mcv01l9rj8vfpj74he0obhq0uoa8tejb.apps.googleusercontent.com'; // Replace with your actual client ID
        this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
        this.SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

        this.gapi = null;
        this.authInstance = null;

        this.init();
    }

    async init() {
        this.bindEvents();
        await this.initializeGoogleAPI();
        await this.loadSongList();
        this.setupProgressBar();
    }

    bindEvents() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        this.muteBtn.addEventListener('click', () => this.toggleMute());
        this.authBtn.addEventListener('click', () => this.authenticate());

        this.audioPlayer.addEventListener('loadedmetadata', () => this.updateTotalTime());
        this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.audioPlayer.addEventListener('ended', () => this.nextSong());
        this.audioPlayer.addEventListener('loadstart', () => this.showLoading());
        this.audioPlayer.addEventListener('canplay', () => this.hideLoading());
        this.audioPlayer.addEventListener('error', (e) => this.handleAudioError(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePlayPause();
            } else if (e.code === 'ArrowLeft') {
                this.previousSong();
            } else if (e.code === 'ArrowRight') {
                this.nextSong();
            }
        });
    }

    handleAudioError(e) {
        console.error('Audio error:', e);
        this.hideLoading();
        this.updateSongInfo('Audio Error', 'File may be corrupted or inaccessible', '');
        this.setDefaultAlbumArt();
    }

    async initializeGoogleAPI() {
        try {
            // Wait for gapi to be available
            if (typeof gapi === 'undefined') {
                console.error('Google API library not loaded');
                this.showConfigurationError();
                return;
            }

            await new Promise((resolve) => {
                gapi.load('api:client', resolve);
            });
            
            await gapi.client.init({
                apiKey: this.API_KEY,
                discoveryDocs: [this.DISCOVERY_DOC],
            });

            await new Promise((resolve) => {
                gapi.load('auth2', resolve);
            });

            this.authInstance = await gapi.auth2.init({
                client_id: this.CLIENT_ID,
                scope: this.SCOPES
            });

            console.log('Google API initialized');
            this.updateAuthButton();
        } catch (error) {
            console.error('Error initializing Google API:', error);
            this.showConfigurationError();
        }
    }

    showConfigurationError() {
        this.updateSongInfo(
            'Configuration Required',
            'Please configure Google API keys in script.js',
            ''
        );
        this.setDefaultAlbumArt();
        this.authBtn.textContent = 'Configure API Keys';
        this.authBtn.disabled = true;
    }

    updateAuthButton() {
        if (this.authInstance && this.authInstance.isSignedIn.get()) {
            this.isAuthenticated = true;
            this.authBtn.classList.add('hidden');
            this.loadSongs();
        } else {
            this.authBtn.textContent = 'Connect to Google Drive';
            this.authBtn.disabled = false;
        }
    }

    async authenticate() {
        try {
            if (!this.authInstance) {
                console.error('Google Auth not initialized');
                this.showConfigurationError();
                return;
            }

            if (this.authInstance.isSignedIn.get()) {
                console.log('Already signed in');
                this.isAuthenticated = true;
                this.authBtn.classList.add('hidden');
                await this.loadSongs();
                return;
            }

            console.log('Starting sign-in process...');
            await this.authInstance.signIn();
            this.isAuthenticated = true;
            this.authBtn.classList.add('hidden');
            console.log('Authentication successful');
            await this.loadSongs();
        } catch (error) {
            console.error('Authentication failed:', error);
            this.updateSongInfo(
                'Authentication Failed',
                'Please check your Google API configuration',
                ''
            );
        }
    }

    async loadSongList() {
        try {
            const response = await fetch('songs.csv');
            const csvText = await response.text();
            
            // Parse CSV - assuming simple comma-separated file IDs
            this.songs = csvText.split(',').map(id => id.trim()).filter(id => id);
            
            if (this.songs.length > 0) {
                this.currentSongIndex = 0;
                this.updateNavigationButtons();
            }
            
            console.log(`Loaded ${this.songs.length} songs`);
        } catch (error) {
            console.error('Error loading song list:', error);
        }
    }

    async loadSongs() {
        if (!this.isAuthenticated || this.songs.length === 0) return;

        try {
            await this.loadCurrentSong();
        } catch (error) {
            console.error('Error loading songs:', error);
        }
    }

    async loadCurrentSong() {
        if (this.currentSongIndex >= this.songs.length) return;

        const fileId = this.songs[this.currentSongIndex];
        console.log('Attempting to load file ID:', fileId);
        
        this.showLoading();
        
        try {
            const fileUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
            
            this.audioPlayer.src = fileUrl;
            
            // Wait for the audio to load before trying to extract metadata
            this.audioPlayer.addEventListener('loadeddata', () => {
                this.extractMetadata(fileUrl);
            }, { once: true });
            
            // Set basic info immediately
            this.updateSongInfo('Loading...', 'Please wait...', 'Unknown Album');
            
            this.updateNavigationButtons();
        } catch (error) {
            console.error('Error loading current song:', error);
            this.handleLoadError();
        }
    }

    async extractMetadata(fileUrl) {
        console.log('Extracting metadata from:', fileUrl);
        
        try {
            await new Promise((resolve, reject) => {
                jsmediatags.read(fileUrl, {
                    onSuccess: (tag) => {
                        console.log('Metadata extracted successfully:', tag.tags);
                        const { title, artist, album, picture } = tag.tags;
                        
                        this.updateSongInfo(
                            title || 'Unknown Title',
                            artist || 'Unknown Artist',
                            album || 'Unknown Album'
                        );
                        
                        if (picture) {
                            this.updateAlbumArt(picture);
                        } else {
                            this.setDefaultAlbumArt();
                        }
                        
                        this.hideLoading();
                        resolve();
                    },
                    onError: (error) => {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.warn('Could not read metadata from Google Drive file:', error);
            this.updateSongInfo('Unknown Title', 'Unknown Artist', 'Unknown Album');
            this.setDefaultAlbumArt();
            this.hideLoading();
        }
    }

    handleLoadError() {
        this.hideLoading();
        this.updateSongInfo('Load Error', 'Could not load song from Google Drive', '');
        this.setDefaultAlbumArt();
    }

    updateSongInfo(title, artist, album) {
        this.songName.textContent = title;
        this.artistName.textContent = artist;
        
        // Handle text scrolling for long titles
        this.setupTextScrolling(this.songName, title);
        this.setupTextScrolling(this.artistName, artist);
    }

    setupTextScrolling(element, text) {
        element.classList.remove('scrolling');
        
        // Check if text is longer than container
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.fontSize = window.getComputedStyle(element).fontSize;
        tempSpan.style.fontFamily = window.getComputedStyle(element).fontFamily;
        tempSpan.textContent = text;
        document.body.appendChild(tempSpan);
        
        const textWidth = tempSpan.offsetWidth;
        const containerWidth = element.offsetWidth;
        
        document.body.removeChild(tempSpan);
        
        if (textWidth > containerWidth) {
            element.classList.add('scrolling');
        }
    }

    updateAlbumArt(picture) {
        const { data, format } = picture;
        const base64String = data.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        const base64 = btoa(base64String);
        this.albumArt.src = `data:${format};base64,${base64}`;
    }

    setDefaultAlbumArt() {
        // Create a canvas-based default album art to avoid ad blocker issues
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        
        // Background
        ctx.fillStyle = '#E0F11F';
        ctx.fillRect(0, 0, 300, 300);
        
        // Music note symbol
        ctx.fillStyle = '#121212';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♪', 150, 150);
        
        this.albumArt.src = canvas.toDataURL();
    }

    togglePlayPause() {
        if (!this.isAuthenticated) {
            this.authenticate();
            return;
        }

        if (this.isPlaying) {
            this.audioPlayer.pause();
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.audioPlayer.play();
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        this.isPlaying = !this.isPlaying;
    }

    previousSong() {
        if (this.currentSongIndex > 0) {
            this.currentSongIndex--;
            this.loadCurrentSong();
            if (this.isPlaying) {
                this.audioPlayer.play();
            }
        }
    }

    nextSong() {
        if (this.currentSongIndex < this.songs.length - 1) {
            this.currentSongIndex++;
            this.loadCurrentSong();
            if (this.isPlaying) {
                this.audioPlayer.play();
            }
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audioPlayer.muted = this.isMuted;
        
        if (this.isMuted) {
            this.muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.muteBtn.classList.add('muted');
        } else {
            this.muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.muteBtn.classList.remove('muted');
        }
    }

    updateNavigationButtons() {
        this.prevBtn.disabled = this.currentSongIndex === 0;
        this.nextBtn.disabled = this.currentSongIndex === this.songs.length - 1;
    }

    setupProgressBar() {
        const progressContainer = document.querySelector('.progress-bar-container');
        
        progressContainer.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.updateProgressFromEvent(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.updateProgressFromEvent(e);
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        progressContainer.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.updateProgressFromEvent(e);
            }
        });
    }

    updateProgressFromEvent(e) {
        const progressContainer = document.querySelector('.progress-bar-container');
        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
        
        if (this.audioPlayer.duration) {
            const newTime = (percentage / 100) * this.audioPlayer.duration;
            this.audioPlayer.currentTime = newTime;
        }
    }

    updateProgress() {
        if (!this.isDragging && this.audioPlayer.duration) {
            const percentage = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
            this.progressFill.style.width = `${percentage}%`;
            this.progressHandle.style.left = `${percentage}%`;
            this.currentTime.textContent = this.formatTime(this.audioPlayer.currentTime);
        }
    }

    updateTotalTime() {
        this.totalTime.textContent = this.formatTime(this.audioPlayer.duration);
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    showLoading() {
        this.loadingSpinner.classList.add('active');
    }

    hideLoading() {
        this.loadingSpinner.classList.remove('active');
    }
}

// Initialize the music player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayer();
});
