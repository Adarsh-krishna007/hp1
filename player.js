// player.js
// Harry Potter and the Prisoner of Azkaban - Audiobook Player
// Full-featured audio player with chapters, bookmarks, sleep timer, and speed control

// ============================================================
// CHAPTER DATA (Based on actual MP3 files)
// ============================================================
const chapters = [
    { number: 0, title: "Opening Credits", file: "01 - Opening Credits.mp3" },
    { number: 1, title: "Owl Post", file: "02 - Owl Post.mp3" },
    { number: 2, title: "Aunt Marge's Big Mistake", file: "03 - Aunt Marge's Big Mistake.mp3" },
    { number: 3, title: "The Knight Bus", file: "04 - The Knight Bus.mp3" },
    { number: 4, title: "The Leaky Cauldron", file: "05 - The Leaky Cauldron.mp3" },
    { number: 5, title: "The Dementor", file: "06 - The Dementor.mp3" },
    { number: 6, title: "Talons and Tea Leaves", file: "07 - Talons and Tea Leaves.mp3" },
    { number: 7, title: "The Boggart in the Wardrobe", file: "08 - The Boggart in the Wardrobe.mp3" },
    { number: 8, title: "Flight of the Fat Lady", file: "09 - Flight of the Fat Lady.mp3" },
    { number: 9, title: "Grim Defeat", file: "10 - Grim Defeat.mp3" },
    { number: 10, title: "The Marauder's Map", file: "11 - The Marauder's Map.mp3" },
    { number: 11, title: "The Firebolt", file: "12 - The Firebolt.mp3" },
    { number: 12, title: "The Patronus", file: "13 - The Patronus.mp3" },
    { number: 13, title: "Gryffindor versus Ravenclaw", file: "14 - Gryffindor versus Ravenclaw.mp3" },
    { number: 14, title: "Snape's Grudge", file: "15 - Snape's Grudge.mp3" },
    { number: 15, title: "The Quidditch Final", file: "16 - The Quidditch Final.mp3" },
    { number: 16, title: "Professor Trelawney's Prediction", file: "17 - Professor Trelawney's Prediction.mp3" },
    { number: 17, title: "Cat, Rat and Dog", file: "18 - Cat, Rat and Dog.mp3" },
    { number: 18, title: "Moony, Wormtail, Padfoot and Prongs", file: "19 - Moony, Wormtail, Padfoot and Prongs.mp3" },
    { number: 19, title: "The Servant of Lord Voldemort", file: "20 - The Servant of Lord Voldemort.mp3" },
    { number: 20, title: "The Dementor's Kiss", file: "21 - The Dementor's Kiss.mp3" },
    { number: 21, title: "Hermione's Secret", file: "22 - Hermione's Secret.mp3" },
    { number: 22, title: "Owl Post Again", file: "23 - Owl Post Again.mp3" },
    { number: 23, title: "End Credits", file: "24 - End Credits.mp3" }
];

// ============================================================
// STORAGE KEYS
// ============================================================
const STORAGE_KEYS = {
    CURRENT_CHAPTER: 'hp_prisoner_current_chapter',
    CURRENT_TIME: 'hp_prisoner_current_time',
    PLAYBACK_SPEED: 'hp_prisoner_speed',
    VOLUME: 'hp_prisoner_volume',
    BOOKMARKS: 'hp_prisoner_bookmarks',
    SLEEP_TIMER: 'hp_prisoner_sleep_timer',
    SLEEP_TIMER_TYPE: 'hp_prisoner_sleep_timer_type'
};

// ============================================================
// DOM ELEMENTS
// ============================================================
const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('btn-play');
const prevBtn = document.getElementById('btn-prev');
const nextBtn = document.getElementById('btn-next');
const rewindBtn = document.getElementById('btn-rewind');
const forwardBtn = document.getElementById('btn-forward');
const coverPlayBtn = document.getElementById('btn-cover-play');
const coverIconPlay = document.getElementById('cover-icon-play');
const coverIconPause = document.getElementById('cover-icon-pause');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressBarBuffered = document.getElementById('progress-bar-buffered');
const progressBarHandle = document.getElementById('progress-bar-handle');
const progressBarContainer = document.getElementById('progress-bar-container');
const progressBarBg = document.getElementById('progress-bar-bg');
const timeCurrentSpan = document.getElementById('time-current');
const timeRemainingSpan = document.getElementById('time-remaining');
const chapterNumberSpan = document.getElementById('chapter-number');
const chapterNameSpan = document.getElementById('chapter-name');
const speedLabel = document.getElementById('speed-label');
const volumeSlider = document.getElementById('volume-slider');
const volumeBtn = document.getElementById('btn-volume');
const iconVolumeOn = document.getElementById('icon-volume-on');
const iconVolumeOff = document.getElementById('icon-volume-off');
const bookProgressFill = document.getElementById('book-progress-bar-fill');
const bookProgressPct = document.getElementById('book-progress-pct');
const bookChaptersDone = document.getElementById('book-chapters-done');
const bookTimeLeft = document.getElementById('book-time-left');

// Drawers and Modals
const chaptersDrawer = document.getElementById('chapters-drawer');
const bookmarksDrawer = document.getElementById('bookmarks-drawer');
const chaptersList = document.getElementById('chapters-list');
const bookmarksList = document.getElementById('bookmarks-list');
const bookmarksEmpty = document.getElementById('bookmarks-empty');
const btnChapters = document.getElementById('btn-chapters');
const btnChaptersClose = document.getElementById('btn-chapters-close');
const btnBookmarksToggle = document.getElementById('btn-bookmarks-toggle');
const btnBookmarksClose = document.getElementById('btn-bookmarks-close');
const btnBookmarkAdd = document.getElementById('btn-bookmark-add');
const speedModal = document.getElementById('speed-modal');
const sleepModal = document.getElementById('sleep-modal');
const btnSpeed = document.getElementById('btn-speed');
const btnSpeedClose = document.getElementById('btn-speed-close');
const btnSleep = document.getElementById('btn-sleep');
const btnSleepCancel = document.getElementById('btn-sleep-cancel');
const btnSleepClose = document.getElementById('btn-sleep-close');
const sleepBadge = document.getElementById('sleep-badge');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

// ============================================================
// APP STATE
// ============================================================
let currentChapterIndex = 0;
let isPlaying = false;
let currentSpeed = 1.0;
let sleepTimerTimeout = null;
let sleepTimerEndOfChapter = false;
let bookmarks = [];
let volumeBeforeMute = 100;
let isMuted = false;

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function formatTime(seconds) {
    if (isNaN(seconds) || seconds === Infinity || seconds === undefined) return '0:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function showToast(message, duration = 3000) {
    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

function saveCurrentPosition() {
    localStorage.setItem(STORAGE_KEYS.CURRENT_CHAPTER, currentChapterIndex);
    localStorage.setItem(STORAGE_KEYS.CURRENT_TIME, audio.currentTime);
    localStorage.setItem(STORAGE_KEYS.PLAYBACK_SPEED, currentSpeed);
    localStorage.setItem(STORAGE_KEYS.VOLUME, volumeSlider.value);
}

function saveBookmarks() {
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

function loadBookmarks() {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (saved) {
        try {
            bookmarks = JSON.parse(saved);
        } catch (e) { bookmarks = []; }
    }
    renderBookmarks();
}

function addBookmark() {
    const currentTime = audio.currentTime;
    const chapter = chapters[currentChapterIndex];
    const bookmark = {
        id: Date.now(),
        chapterIndex: currentChapterIndex,
        chapterNumber: chapter.number,
        chapterTitle: chapter.title,
        time: currentTime,
        formattedTime: formatTime(currentTime),
        createdAt: new Date().toISOString()
    };

    // Check if bookmark already exists at this position
    const exists = bookmarks.some(b =>
        b.chapterIndex === currentChapterIndex &&
        Math.abs(b.time - currentTime) < 1.0
    );

    if (!exists) {
        bookmarks.push(bookmark);
        bookmarks.sort((a, b) => {
            if (a.chapterIndex !== b.chapterIndex) return a.chapterIndex - b.chapterIndex;
            return a.time - b.time;
        });
        saveBookmarks();
        renderBookmarks();
        showToast(`Bookmark added at ${formatTime(currentTime)}`);
    } else {
        showToast('Bookmark already exists at this position');
    }
}

function deleteBookmark(id) {
    bookmarks = bookmarks.filter(b => b.id !== id);
    saveBookmarks();
    renderBookmarks();
    showToast('Bookmark removed');
}

function jumpToBookmark(bookmark) {
    if (bookmark.chapterIndex !== currentChapterIndex) {
        loadChapter(bookmark.chapterIndex);
        // Wait for chapter to load before seeking
        audio.addEventListener('loadedmetadata', function onLoad() {
            audio.currentTime = bookmark.time;
            audio.removeEventListener('loadedmetadata', onLoad);
            if (isPlaying) {
                audio.play().catch(e => console.log('Playback error:', e));
            }
        });
    } else {
        audio.currentTime = bookmark.time;
        if (isPlaying) {
            audio.play().catch(e => console.log('Playback error:', e));
        }
    }
    showToast(`Jumped to ${bookmark.formattedTime} in ${bookmark.chapterTitle}`);
    bookmarksDrawer.classList.add('hidden');
}

function renderBookmarks() {
    if (bookmarks.length === 0) {
        bookmarksEmpty.classList.remove('hidden');
        bookmarksList.classList.add('hidden');
        return;
    }

    bookmarksEmpty.classList.add('hidden');
    bookmarksList.classList.remove('hidden');

    bookmarksList.innerHTML = '';
    bookmarks.forEach(bookmark => {
        const li = document.createElement('li');
        li.className = 'bookmark-item';
        li.innerHTML = `
            <div class="bookmark-info" data-id="${bookmark.id}">
                <div class="bookmark-chapter">Ch ${bookmark.chapterNumber}: ${bookmark.chapterTitle}</div>
                <div class="bookmark-time">${bookmark.formattedTime}</div>
            </div>
            <button class="bookmark-delete" data-id="${bookmark.id}">×</button>
        `;

        const infoDiv = li.querySelector('.bookmark-info');
        infoDiv.addEventListener('click', () => jumpToBookmark(bookmark));

        const deleteBtn = li.querySelector('.bookmark-delete');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteBookmark(bookmark.id);
        });

        bookmarksList.appendChild(li);
    });
}

// ============================================================
// AUDIO LOADING & PLAYBACK
// ============================================================
function loadChapter(index) {
    if (index < 0 || index >= chapters.length) return;

    currentChapterIndex = index;
    const chapter = chapters[currentChapterIndex];

    // Update UI
    chapterNumberSpan.textContent = `Chapter ${chapter.number}`;
    chapterNameSpan.textContent = chapter.title;

    // Load audio file
    audio.src = chapter.file;
    audio.load();
    audio.playbackRate = currentSpeed;

    // Update active chapter in drawer
    document.querySelectorAll('.chapter-item').forEach((item, i) => {
        if (i === currentChapterIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

function playAudio() {
    audio.play()
        .then(() => {
            isPlaying = true;
            document.getElementById('icon-play').classList.add('hidden');
            document.getElementById('icon-pause').classList.remove('hidden');
            if(coverIconPlay) coverIconPlay.classList.add('hidden');
            if(coverIconPause) coverIconPause.classList.remove('hidden');
        })
        .catch(err => {
            console.log('Play error:', err);
            isPlaying = false;
        });
}

function pauseAudio() {
    audio.pause();
    isPlaying = false;
    document.getElementById('icon-play').classList.remove('hidden');
    document.getElementById('icon-pause').classList.add('hidden');
    if(coverIconPlay) coverIconPlay.classList.remove('hidden');
    if(coverIconPause) coverIconPause.classList.add('hidden');
}

function togglePlay() {
    if (isPlaying) {
        pauseAudio();
    } else {
        playAudio();
    }
}

function nextChapter() {
    if (currentChapterIndex + 1 < chapters.length) {
        loadChapter(currentChapterIndex + 1);
        if (isPlaying) {
            playAudio();
        }
        saveCurrentPosition();
    } else {
        showToast('You\'ve reached the end of the audiobook!');
    }
}

function prevChapter() {
    if (currentChapterIndex - 1 >= 0) {
        loadChapter(currentChapterIndex - 1);
        if (isPlaying) {
            playAudio();
        }
        saveCurrentPosition();
    } else {
        // Seek to beginning of first chapter
        audio.currentTime = 0;
        showToast('Beginning of audiobook');
    }
}

function skipForward(seconds = 30) {
    audio.currentTime = Math.min(audio.currentTime + seconds, audio.duration || 0);
    showToast(`Forward ${seconds}s`);
}

function skipBackward(seconds = 30) {
    audio.currentTime = Math.max(audio.currentTime - seconds, 0);
    showToast(`Rewind ${seconds}s`);
}

// ============================================================
// SLEEP TIMER
// ============================================================
function cancelSleepTimer() {
    if (sleepTimerTimeout) {
        clearTimeout(sleepTimerTimeout);
        sleepTimerTimeout = null;
    }
    sleepTimerEndOfChapter = false;
    sleepBadge.classList.add('hidden');
    btnSleepCancel.classList.add('hidden');
    showToast('Sleep timer cancelled');
}

function setSleepTimer(minutes) {
    cancelSleepTimer();

    if (minutes === 0) {
        // End of chapter mode
        sleepTimerEndOfChapter = true;
        sleepBadge.textContent = '∞';
        sleepBadge.classList.remove('hidden');
        showToast('Sleep timer set: End of current chapter');
    } else {
        sleepTimerTimeout = setTimeout(() => {
            pauseAudio();
            showToast('Sleep timer: Playback paused');
            sleepBadge.classList.add('hidden');
            btnSleepCancel.classList.add('hidden');
            sleepTimerTimeout = null;
        }, minutes * 60 * 1000);

        sleepBadge.textContent = `${minutes}m`;
        sleepBadge.classList.remove('hidden');
        btnSleepCancel.classList.remove('hidden');
        showToast(`Sleep timer set for ${minutes} minutes`);
    }

    localStorage.setItem(STORAGE_KEYS.SLEEP_TIMER, minutes);
    localStorage.setItem(STORAGE_KEYS.SLEEP_TIMER_TYPE, minutes === 0 ? 'endOfChapter' : 'minutes');
}

// ============================================================
// PLAYBACK SPEED
// ============================================================
function setPlaybackSpeed(speed) {
    currentSpeed = speed;
    audio.playbackRate = speed;
    speedLabel.textContent = `${speed}×`;
    saveCurrentPosition();
    showToast(`Speed: ${speed}×`);
}

// ============================================================
// VOLUME CONTROL
// ============================================================
function setVolume(value) {
    const volume = parseInt(value) / 100;
    audio.volume = volume;
    volumeSlider.value = value;

    if (value == 0) {
        iconVolumeOn.classList.add('hidden');
        iconVolumeOff.classList.remove('hidden');
        isMuted = true;
    } else {
        iconVolumeOn.classList.remove('hidden');
        iconVolumeOff.classList.add('hidden');
        isMuted = false;
        volumeBeforeMute = value;
    }

    localStorage.setItem(STORAGE_KEYS.VOLUME, value);
}

function toggleMute() {
    if (isMuted) {
        setVolume(volumeBeforeMute);
    } else {
        volumeBeforeMute = volumeSlider.value;
        setVolume(0);
    }
}

// ============================================================
// PROGRESS BAR & TIME UPDATE
// ============================================================
function updateProgress() {
    if (!audio.duration || isNaN(audio.duration)) return;

    const percent = (audio.currentTime / audio.duration) * 100;
    progressBarFill.style.width = `${percent}%`;
    progressBarHandle.style.left = `${percent}%`;

    timeCurrentSpan.textContent = formatTime(audio.currentTime);
    const remaining = audio.duration - audio.currentTime;
    timeRemainingSpan.textContent = `-${formatTime(remaining)}`;
}

function updateBufferedProgress() {
    if (!audio.duration || isNaN(audio.duration) || audio.buffered.length === 0) return;

    const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
    const bufferedPercent = (bufferedEnd / audio.duration) * 100;
    progressBarBuffered.style.width = `${bufferedPercent}%`;
}

function updateBookProgress() {
    const totalChapters = chapters.length;
    const percentComplete = ((currentChapterIndex) / totalChapters) * 100;
    bookProgressFill.style.width = `${percentComplete}%`;
    bookProgressPct.textContent = `${Math.floor(percentComplete)}%`;
    bookChaptersDone.textContent = `${currentChapterIndex} of ${totalChapters} chapters`;

    // Estimate time left (rough calculation)
    if (audio.duration && !isNaN(audio.duration)) {
        const remainingInChapter = audio.duration - audio.currentTime;
        const avgChapterTime = 1200; // ~20 min average
        const remainingChapters = totalChapters - currentChapterIndex - 1;
        const estimatedRemaining = remainingInChapter + (remainingChapters * avgChapterTime);
        bookTimeLeft.textContent = `~${Math.ceil(estimatedRemaining / 60)} min left`;
    } else {
        bookTimeLeft.textContent = 'calculating...';
    }
}

// ============================================================
// CHAPTER SELECTION
// ============================================================
function renderChapters() {
    chaptersList.innerHTML = '';
    chapters.forEach((chapter, idx) => {
        const li = document.createElement('li');
        li.className = 'chapter-item';
        if (idx === currentChapterIndex) {
            li.classList.add('active');
        }
        li.innerHTML = `
            <span class="chapter-number">${chapter.number}</span>
            <span class="chapter-title">${chapter.title}</span>
            ${idx === currentChapterIndex ? '<span class="playing-indicator">▶</span>' : ''}
        `;
        li.addEventListener('click', () => {
            loadChapter(idx);
            if (isPlaying) {
                playAudio();
            }
            chaptersDrawer.classList.add('hidden');
            saveCurrentPosition();
        });
        chaptersList.appendChild(li);
    });
}

// ============================================================
// EVENT LISTENERS
// ============================================================
// Audio events
audio.addEventListener('timeupdate', () => {
    updateProgress();
    updateBookProgress();

    // Check for end of chapter
    if (audio.currentTime >= audio.duration - 0.5 && audio.duration) {
        if (currentChapterIndex + 1 < chapters.length) {
            nextChapter();
        } else {
            pauseAudio();
            showToast('End of audiobook!');
        }
    }
});

audio.addEventListener('loadedmetadata', () => {
    updateProgress();
    updateBookProgress();
});

audio.addEventListener('progress', updateBufferedProgress);
audio.addEventListener('ended', () => {
    if (currentChapterIndex + 1 < chapters.length) {
        nextChapter();
    } else {
        pauseAudio();
    }
});

// Progress bar seeking
function seekToPosition(e) {
    const rect = progressBarBg.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = x / rect.width;
    audio.currentTime = percent * audio.duration;
}

progressBarContainer.addEventListener('click', seekToPosition);

// Control buttons
playBtn.addEventListener('click', togglePlay);
if(coverPlayBtn) coverPlayBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', nextChapter);
prevBtn.addEventListener('click', prevChapter);
forwardBtn.addEventListener('click', () => skipForward(30));
rewindBtn.addEventListener('click', () => skipBackward(30));
btnBookmarkAdd.addEventListener('click', addBookmark);

// Volume
volumeSlider.addEventListener('input', (e) => setVolume(e.target.value));
volumeBtn.addEventListener('click', toggleMute);

// Speed
btnSpeed.addEventListener('click', () => speedModal.classList.remove('hidden'));
btnSpeedClose.addEventListener('click', () => speedModal.classList.add('hidden'));

document.querySelectorAll('.speed-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const speed = parseFloat(btn.dataset.speed);
        setPlaybackSpeed(speed);
        speedModal.classList.add('hidden');

        // Update active class
        document.querySelectorAll('.speed-option').forEach(opt => opt.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Sleep Timer
btnSleep.addEventListener('click', () => sleepModal.classList.remove('hidden'));
btnSleepClose.addEventListener('click', () => sleepModal.classList.add('hidden'));
btnSleepCancel.addEventListener('click', cancelSleepTimer);

document.querySelectorAll('.sleep-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const minutes = parseInt(btn.dataset.minutes);
        setSleepTimer(minutes);
        sleepModal.classList.add('hidden');
    });
});

// Drawers
btnChapters.addEventListener('click', () => {
    renderChapters();
    chaptersDrawer.classList.remove('hidden');
});
btnChaptersClose.addEventListener('click', () => chaptersDrawer.classList.add('hidden'));

btnBookmarksToggle.addEventListener('click', () => {
    renderBookmarks();
    bookmarksDrawer.classList.remove('hidden');
});
btnBookmarksClose.addEventListener('click', () => bookmarksDrawer.classList.add('hidden'));

// Close drawers when clicking backdrop
document.querySelectorAll('.drawer-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', () => {
        chaptersDrawer.classList.add('hidden');
        bookmarksDrawer.classList.add('hidden');
    });
});

// Close modals on backdrop click
document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', () => {
        speedModal.classList.add('hidden');
        sleepModal.classList.add('hidden');
    });
});

// ============================================================
// INITIALIZATION
// ============================================================
function init() {
    // Load saved settings
    const savedChapter = localStorage.getItem(STORAGE_KEYS.CURRENT_CHAPTER);
    const savedTime = localStorage.getItem(STORAGE_KEYS.CURRENT_TIME);
    const savedSpeed = localStorage.getItem(STORAGE_KEYS.PLAYBACK_SPEED);
    const savedVolume = localStorage.getItem(STORAGE_KEYS.VOLUME);
    const savedSleepTimer = localStorage.getItem(STORAGE_KEYS.SLEEP_TIMER);

    if (savedSpeed) {
        currentSpeed = parseFloat(savedSpeed);
        setPlaybackSpeed(currentSpeed);
    }

    if (savedVolume) {
        setVolume(savedVolume);
    } else {
        setVolume(100);
    }

    // Load chapter
    const chapterToLoad = savedChapter ? parseInt(savedChapter) : 0;
    loadChapter(chapterToLoad);

    // Restore position
    if (savedTime && chapterToLoad === currentChapterIndex) {
        audio.addEventListener('loadedmetadata', function onLoad() {
            audio.currentTime = parseFloat(savedTime);
            audio.removeEventListener('loadedmetadata', onLoad);
        });
    }

    // Restore sleep timer
    if (savedSleepTimer && savedSleepTimer !== 'null') {
        const minutes = parseInt(savedSleepTimer);
        if (!isNaN(minutes)) {
            setSleepTimer(minutes);
        }
    }

    // Load bookmarks
    loadBookmarks();
    renderChapters();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            skipBackward(10);
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            skipForward(10);
        }
    });

    // Preload next chapter
    audio.addEventListener('ended', () => {
        if (currentChapterIndex + 1 < chapters.length) {
            const nextAudio = new Audio();
            nextAudio.src = chapters[currentChapterIndex + 1].file;
            nextAudio.preload = 'auto';
        }
    });
}

// Start the app
init();