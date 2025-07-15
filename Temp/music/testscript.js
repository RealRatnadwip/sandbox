class MusicPlayerTest {
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

        // Test songs array - add more local files here
        this.songs = [
            'test.mp3',
            'test2.mp3'
            // Add more local MP3 files here like:
            // 'song2.mp3',
            // 'song3.mp3'
        ];
        
        this.currentSongIndex = 0;
        this.isPlaying = false;
        this.isMuted = false;
        this.isDragging = false;

        this.init();
    }

    async init() {
        this.bindEvents();
        this.hideAuthButton();
        await this.loadCurrentSong();
        this.setupProgressBar();
    }

    hideAuthButton() {
        this.authBtn.classList.add('hidden');
    }

    bindEvents() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousSong());
        this.nextBtn.addEventListener('click', () => this.nextSong());
        this.muteBtn.addEventListener('click', () => this.toggleMute());

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

    async loadCurrentSong() {
        if (this.currentSongIndex >= this.songs.length) return;

        const fileName = this.songs[this.currentSongIndex];
        console.log('Attempting to load:', fileName);
        
        this.showLoading();
        
        try {
            this.audioPlayer.src = fileName;
            
            // Wait for the audio to load before trying to extract metadata
            this.audioPlayer.addEventListener('loadeddata', () => {
                this.extractMetadata(fileName);
            }, { once: true });
            
            // Set basic info immediately
            this.updateSongInfo(
                this.getFileNameWithoutExtension(fileName),
                'Loading...',
                'Unknown Album'
            );
            
            this.updateNavigationButtons();
        } catch (error) {
            console.error('Error loading current song:', error);
            this.handleLoadError();
        }
    }

    async extractMetadata(fileName) {
        console.log('Extracting metadata from:', fileName);
        
        // Try to read metadata, but don't block the UI if it fails
        try {
            jsmediatags.read(fileName, {
                onSuccess: (tag) => {
                    console.log('Metadata extracted successfully:', tag.tags);
                    const { title, artist, album, picture } = tag.tags;
                    
                    this.updateSongInfo(
                        title || this.getFileNameWithoutExtension(fileName),
                        artist || 'Unknown Artist',
                        album || 'Unknown Album'
                    );
                    
                    if (picture) {
                        this.updateAlbumArt(picture);
                    } else {
                        this.setDefaultAlbumArt();
                    }
                    
                    this.hideLoading();
                },
                onError: (error) => {
                    console.warn('Could not read metadata, using filename:', error);
                    this.updateSongInfo(
                        this.getFileNameWithoutExtension(fileName),
                        'Local File',
                        'Unknown Album'
                    );
                    this.setDefaultAlbumArt();
                    this.hideLoading();
                }
            });
        } catch (error) {
            console.warn('jsmediatags failed, using filename:', error);
            this.updateSongInfo(
                this.getFileNameWithoutExtension(fileName),
                'Local File',
                'Unknown Album'
            );
            this.setDefaultAlbumArt();
            this.hideLoading();
        }
    }

    getFileNameWithoutExtension(fileName) {
        return fileName.replace(/\.[^/.]+$/, "")
                      .replace(/[-_]/g, ' ')
                      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letters
    }

    handleAudioError(e) {
        console.error('Audio error:', e);
        this.hideLoading();
        this.updateSongInfo('Audio Error', 'File may be corrupted or unsupported', '');
        this.setDefaultAlbumArt();
    }

    handleLoadError() {
        this.hideLoading();
        this.updateSongInfo('File Not Found', 'Please check if test.mp3 exists in the same folder', '');
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

    async extractMetadata(audioSrc) {
        console.log('Extracting metadata from:', audioSrc);
        
        // For local files, jsmediatags often fails due to browser security
        // Let's try it but have a robust fallback
        try {
            await new Promise((resolve, reject) => {
                jsmediatags.read(audioSrc, {
                    onSuccess: (tag) => {
                        console.log('Metadata extracted successfully:', tag.tags);
                        const { title, artist, album, picture } = tag.tags;
                        
                        this.updateSongInfo(
                            title || this.getFilenameFromPath(audioSrc),
                            artist || 'Unknown Artist',
                            album || 'Unknown Album'
                        );
                        
                        if (picture) {
                            this.updateAlbumArt(picture);
                        } else {
                            this.setDefaultAlbumArt();
                        }
                        
                        resolve();
                    },
                    onError: (error) => {
                        reject(error);
                    }
                });
            });
        } catch (error) {
            console.log('jsmediatags failed (expected for local files), using filename:', error.message);
            
            // Fallback to filename - this is normal for local files
            const filename = this.getFilenameFromPath(audioSrc);
            this.updateSongInfo(filename, 'Local Test File', 'Test Album');
            this.setDefaultAlbumArt();
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audioPlayer.pause();
            this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.audioPlayer.play().catch(error => {
                console.error('Error playing audio:', error);
                alert('Error playing audio. Please check if the file exists and is a valid MP3.');
            });
            this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        this.isPlaying = !this.isPlaying;
    }

    previousSong() {
        if (this.currentSongIndex > 0) {
            this.currentSongIndex--;
            this.loadCurrentSong();
            if (this.isPlaying) {
                setTimeout(() => {
                    this.audioPlayer.play().catch(console.error);
                }, 100);
            }
        }
    }

    nextSong() {
        if (this.currentSongIndex < this.songs.length - 1) {
            this.currentSongIndex++;
            this.loadCurrentSong();
            if (this.isPlaying) {
                setTimeout(() => {
                    this.audioPlayer.play().catch(console.error);
                }, 100);
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

// Initialize the test music player when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MusicPlayerTest();
});