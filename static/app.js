// Application state
let state = {
    albums: [],
    currentAlbumId: null,
    currentPhotos: [],
    currentPhotoIndex: 0,
    isLoading: false
};

// DOM elements
const elements = {
    albumsContainer: null,
    photoViewer: null,
    controls: null,
    pageInfo: null,
    prevBtn: null,
    nextBtn: null,
    thumbnailSlider: null
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    elements.albumsContainer = document.getElementById('albums-container');
    elements.photoViewer = document.getElementById('photo-viewer');
    elements.controls = document.getElementById('controls');
    elements.pageInfo = document.getElementById('page-info');
    elements.prevBtn = document.getElementById('prev-btn');
    elements.nextBtn = document.getElementById('next-btn');
    elements.thumbnailSlider = document.getElementById('thumbnail-slider');

    // Set up event listeners
    elements.prevBtn.addEventListener('click', previousPhoto);
    elements.nextBtn.addEventListener('click', nextPhoto);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') previousPhoto();
        if (e.key === 'ArrowRight') nextPhoto();
    });

    // Load albums
    loadAlbums();
});

// Load albums from API
async function loadAlbums() {
    try {
        const response = await fetch('/api/albums');
        const data = await response.json();
        
        state.albums = data.albums || [];
        
        if (data.error) {
            console.error('Album loading error:', data.error);
        }
        
        renderAlbums();
    } catch (error) {
        console.error('Error loading albums:', error);
        elements.albumsContainer.innerHTML = 
            '<div class="p-4 text-center text-red-400">Failed to load albums</div>';
    }
}

// Render albums list
function renderAlbums() {
    if (state.albums.length === 0) {
        elements.albumsContainer.innerHTML = 
            '<div class="p-4 text-center text-gray-400">No albums found</div>';
        return;
    }

    elements.albumsContainer.innerHTML = state.albums.map(album => `
        <button 
            class="album-item ${state.currentAlbumId === album.id ? 'active' : ''} hover:bg-gray-700"
            onclick="selectAlbum('${album.id}')"
        >
            ${album.cover ? `
                <div class="album-cover">
                    <img src="${album.cover}" alt="${album.name}" 
                         onerror="this.style.display='none'">
                </div>
            ` : ''}
            <h3 class="font-semibold truncate">${album.name}</h3>
            ${album.photo_count ? `
                <p class="text-sm text-gray-300">${album.photo_count} photos</p>
            ` : ''}
        </button>
    `).join('');
}

// Select an album and load its photos
async function selectAlbum(albumId) {
    state.currentAlbumId = albumId;
    state.currentPhotoIndex = 0;
    state.isLoading = true;

    renderAlbums();
    elements.photoViewer.innerHTML = '<p class="text-gray-400">Loading photos...</p>';

    try {
        const response = await fetch(`/api/album/${albumId}/photos`);
        const data = await response.json();
        
        state.currentPhotos = data.photos || [];
        
        if (data.error) {
            console.error('Photo loading error:', data.error);
        }
        
        state.isLoading = false;
        renderViewer();
    } catch (error) {
        console.error('Error loading photos:', error);
        state.isLoading = false;
        elements.photoViewer.innerHTML = 
            '<p class="text-red-400">Failed to load photos</p>';
    }
}

// Render the photo viewer
function renderViewer() {
    if (state.currentPhotos.length === 0) {
        elements.photoViewer.innerHTML = 
            '<p class="text-gray-400">No photos in this album</p>';
        elements.controls.classList.add('hidden');
        return;
    }

    const photo = state.currentPhotos[state.currentPhotoIndex];
    
    elements.photoViewer.innerHTML = `
        <div class="relative w-full h-full flex items-center justify-center">
            <img 
                src="${photo.src}" 
                alt="${photo.caption || 'Photo'}"
                onerror="this.src='https://via.placeholder.com/400x600?text=Image+Not+Found'"
            >
            ${photo.caption ? `
                <div class="photo-caption">
                    <p class="text-sm">${photo.caption}</p>
                </div>
            ` : ''}
        </div>
        <button class="nav-button nav-button-left" onclick="previousPhoto()">
            ← Previous
        </button>
        <button class="nav-button nav-button-right" onclick="nextPhoto()">
            Next →
        </button>
    `;

    // Update controls
    elements.controls.classList.remove('hidden');
    updateControls();
}

// Update navigation controls
function updateControls() {
    const current = state.currentPhotoIndex + 1;
    const total = state.currentPhotos.length;

    elements.pageInfo.textContent = `Page ${current} of ${total}`;
    
    elements.prevBtn.disabled = state.currentPhotoIndex === 0;
    elements.nextBtn.disabled = state.currentPhotoIndex === total - 1;

    // Render thumbnails (max 10)
    const thumbs = state.currentPhotos.slice(0, 10);
    elements.thumbnailSlider.innerHTML = thumbs.map((photo, index) => `
        <button 
            class="thumbnail ${state.currentPhotoIndex === index ? 'active' : ''}"
            onclick="goToPhoto(${index})"
        >
            <img 
                src="${photo.src}" 
                alt="Thumbnail ${index + 1}"
                onerror="this.src='https://via.placeholder.com/64x64?text=...'"
            >
        </button>
    `).join('');
}

// Navigation functions
function previousPhoto() {
    if (state.currentPhotoIndex > 0) {
        state.currentPhotoIndex--;
        renderViewer();
    }
}

function nextPhoto() {
    if (state.currentPhotoIndex < state.currentPhotos.length - 1) {
        state.currentPhotoIndex++;
        renderViewer();
    }
}

function goToPhoto(index) {
    if (index >= 0 && index < state.currentPhotos.length) {
        state.currentPhotoIndex = index;
        renderViewer();
    }
}
