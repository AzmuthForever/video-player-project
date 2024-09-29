const dropArea = document.getElementById('drop-area');
const videoPlayer = document.getElementById('videoPlayer');
const videoNameDisplay = document.getElementById('video-name');
let videoQueue = [];
let videoNames = [];

dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.classList.add('dragging');
});

dropArea.addEventListener('dragleave', () => {
    dropArea.classList.remove('dragging');
});

dropArea.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropArea.classList.remove('dragging');
    dropArea.classList.add('hidden'); // Hide the drop area after the video is dropped

    const items = e.dataTransfer.items;
    videoQueue = [];
    videoNames = [];

    // Stop the current video if it's playing and clear the queue
    videoPlayer.pause();
    videoPlayer.src = ''; // Clear current video src

    if (items) {
        for (const item of items) {
            if (item.webkitGetAsEntry().isDirectory) {
                const directory = item.webkitGetAsEntry();
                await readDirectory(directory);
            } else {
                // If it's a single video file, handle it directly
                const file = item.getAsFile();
                if (file && file.name.match(/\.(mp4|mkv|webm)$/i)) {
                    videoQueue.push(URL.createObjectURL(file));
                    videoNames.push(file.name);
                }
            }
        }
        if (videoQueue.length > 0) {
            requestFullScreen();
            playNextVideo();
        }
    }
});

async function readDirectory(directoryEntry) {
    const reader = directoryEntry.createReader();
    const entries = await new Promise((resolve) => reader.readEntries(resolve));

    for (const entry of entries) {
        if (entry.isDirectory) {
            await readDirectory(entry); // Recursively read subfolders
        } else if (entry.isFile && entry.name.match(/\.(mp4|mkv|webm)$/i)) { // Only pick video files
            const file = await new Promise((resolve) => entry.file(resolve));
            videoQueue.push(URL.createObjectURL(file));
            videoNames.push(entry.name); // Store the video names
        }
    }
}

function playNextVideo() {
    if (videoQueue.length > 0) {
        const nextVideoUrl = videoQueue.shift();
        const nextVideoName = videoNames.shift();
        videoPlayer.src = nextVideoUrl;
        videoPlayer.style.display = 'block';
        showVideoName(nextVideoName); // Show video name within the video player
        
        videoPlayer.play();
        
        videoPlayer.onended = () => playNextVideo(); // Automatically play the next video
    } else {
        videoPlayer.style.display = 'none'; // Hide the video player when done
    }
}

function showVideoName(name) {
    videoNameDisplay.textContent = name;
    videoNameDisplay.classList.add('show');

    // Fade away the video name after 3 seconds
    setTimeout(() => {
        videoNameDisplay.classList.remove('show');
    }, 3000);
}

function requestFullScreen() {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
    } else if (docEl.mozRequestFullScreen) { // Firefox
        docEl.mozRequestFullScreen();
    } else if (docEl.webkitRequestFullscreen) { // Chrome, Safari and Opera
        docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) { // IE/Edge
        docEl.msRequestFullscreen();
    }
}
