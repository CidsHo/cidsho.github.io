// slideshow.js
const screenMedia = document.querySelector('.screen-media');
const captionLine1 = document.querySelector('.caption-line-1');
const captionLine2 = document.querySelector('.caption-line-2');
const captionLine3 = document.querySelector('.caption-line-3');
const screenContainer = document.querySelector('.screen-container');

let images = [];
let currentImageIndex = 0;
let playedIndices = [];

async function loadImages() {
    try {
        const response = await fetch('assets/data/images.json');
        if (!response.ok) {
            throw new Error('Failed to load images');
        }
        images = await response.json();
        console.log('Loaded images:', images);

        // 预加载图片
        images.forEach(image => {
            const img = new Image();
            img.src = image.src;
        });

        startSlideshow();
    } catch (error) {
        console.error('Error loading images:', error);
    }
}

function showImage(index, skipAnimation = false) {
    const image = images[index];
    console.log('Showing image:', image);
    if (screenMedia) {
        if (!skipAnimation) {
            screenMedia.classList.add('fade-out');
        }
        setTimeout(() => {
            screenMedia.src = image.src;
            if (!skipAnimation) {
                screenMedia.classList.remove('fade-out');
            }
        }, skipAnimation ? 0 : 500);
    }
    if (captionLine1) captionLine1.textContent = image.captionLine1;
    if (captionLine2) captionLine2.textContent = image.captionLine2;
    if (captionLine3) captionLine3.textContent = image.captionLine3;
}

function showRandomImage(skipAnimation = false) {
    if (playedIndices.length === images.length) {
        playedIndices = [];
    }

    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * images.length);
    } while (playedIndices.includes(newIndex));

    playedIndices.push(newIndex);
    currentImageIndex = newIndex;
    showImage(currentImageIndex, skipAnimation);
}

function startSlideshow() {
    if (images.length > 0) {
        showRandomImage(true);
        setInterval(showRandomImage, 10000);
    } else {
        console.error('No images loaded');
    }
}

if (screenContainer) {
    screenContainer.addEventListener('click', () => {
        const currentImage = images[currentImageIndex];
        if (currentImage && currentImage.link) {
            window.location.href = currentImage.link;
        } else {
            console.error('Current image or link not found');
        }
    });
} else {
    console.error('screenContainer not found');
}

document.addEventListener('DOMContentLoaded', loadImages);

export function loadImages() {
    // 加载图片逻辑
}

export function startSlideshow() {
    // 启动幻灯片逻辑
}