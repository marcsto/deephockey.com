// Deep Hockey - Main JavaScript

/**
 * Reusable Components: Header and Footer
 * This script injects the header and footer into the page.
 * To update navigation, you only need to change it here.
 */

/**
 * Get the relative path to the home directory from current page
 */
function getHomePath() {
    try {
        const currentPath = window.location.pathname;
        
        // Handle root paths
        if (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html')) {
            return './';
        }
        
        const pathSegments = currentPath.split('/').filter(segment => segment !== '');
        
        // Remove the filename if it exists (e.g., 'early-season-power-plays.html')
        if (pathSegments.length > 0 && pathSegments[pathSegments.length - 1].includes('.')) {
            pathSegments.pop();
        }
        
        // Calculate relative path back to root
        if (pathSegments.length === 0) {
            return './'; // Already at root
        } else {
            return '../'.repeat(pathSegments.length);
        }
    } catch (error) {
        console.warn('Error calculating home path, using fallback:', error);
        // Fallback to absolute path from root
        return '/';
    }
}

/**
 * Generate header component template with correct paths
 */
function generateHeader() {
    const homePath = getHomePath();
    return `
        <div class="container">
            <div class="header-nav">
                <div>
                    <a href="${homePath}index.html" class="logo">
                       Deep <span class="logo-accent">Hockey</span>
                    </a>
                </div>
                <div class="nav-menu">
                    <a href="${homePath}index.html" class="nav-link">Home</a>
                    <a href="${homePath}about.html" class="nav-link">About</a>
                    <a href="https://www.youtube.com/@DeeperHockey/shorts" class="nav-link">YouTube</a>
                </div>
                <!-- Mobile menu button can be added here if needed -->
            </div>
        </div>
    `;
}

// Footer component template
const Footer = `
    <div class="container">
        <p class="footer-copyright">&copy; ${new Date().getFullYear()} Deep Hockey. All Rights Reserved.</p>
        <p class="footer-tagline">The future of hockey analysis is here.</p>
    </div>
`;

/**
 * Initialize the page components
 */
function initializePage() {
    // Inject header with dynamic paths
    const headerElement = document.getElementById('main-header');
    if (headerElement) {
        headerElement.innerHTML = generateHeader();
    }

    // Inject footer
    const footerElement = document.getElementById('main-footer');
    if (footerElement) {
        footerElement.innerHTML = Footer;
    }
}

/**
 * Enhanced card interactions
 */
function initializeCardInteractions() {
    // Remove existing listeners to avoid duplicates
    const cards = document.querySelectorAll('.blog-card, .video-card');
    
    cards.forEach(card => {
        // Skip if already initialized
        if (card.dataset.initialized === 'true') return;
        
        // Add keyboard navigation support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const link = card.querySelector('.card-link[href]:not(.card-link-disabled), .video-link[href]');
                if (link) {
                    e.preventDefault();
                    link.click();
                }
            }
        });

        // Make entire card clickable
        card.addEventListener('click', (e) => {
            // Don't trigger if clicking on a link directly
            if (e.target.tagName === 'A') return;
            
            const link = card.querySelector('.card-link[href]:not(.card-link-disabled), .video-link[href]');
            if (link) {
                // For external links (like YouTube videos), open in new tab
                if (link.hasAttribute('target')) {
                    window.open(link.href, link.getAttribute('target'));
                } else {
                    link.click();
                }
            }
        });

        // Add tabindex for accessibility
        const link = card.querySelector('.card-link[href]:not(.card-link-disabled), .video-link[href]');
        if (link) {
            card.setAttribute('tabindex', '0');
            card.style.cursor = 'pointer';
        }
        
        // Mark as initialized
        card.dataset.initialized = 'true';
    });
}

/**
 * Load and display videos from videos-clean.json
 */
async function loadVideos() {
    try {
        const response = await fetch('./videos-clean.json');
        const data = await response.json();
        
        if (data.videos && Array.isArray(data.videos)) {
            displayVideos(data.videos.slice(0, 6)); // Show first 6 videos
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        // Show fallback message
        const videoGrid = document.getElementById('video-grid');
        if (videoGrid) {
            videoGrid.innerHTML = '<p style="color: #9CA3AF; text-align: center; grid-column: 1 / -1;">Videos coming soon...</p>';
        }
    }
}

/**
 * Display videos in the grid
 */
function displayVideos(videos) {
    const videoGrid = document.getElementById('video-grid');
    if (!videoGrid) return;

    videoGrid.innerHTML = videos.map(video => {
        // Use the pre-optimized thumbnail from clean data
        const thumbnailUrl = video.thumbnail?.url || 'https://placehold.co/320x180/1F2937/E5E7EB?text=Video';
        
        // Clean and truncate title (remove hashtags)
        const title = video.title?.replace(/#\w+/g, '').trim() || 'Untitled Video';
        const description = video.description || 'No description available.';
        
        return `
            <article class="video-card">
                <img src="${thumbnailUrl}" alt="${title}" class="video-thumbnail">
                <div class="video-content">
                    <h3 class="video-title">${title}</h3>
                    <p class="video-description">${description}</p>
                    <a href="https://www.youtube.com/watch?v=${video.videoId}" target="_blank" rel="noopener noreferrer" class="video-link">Watch Video →</a>
                </div>
            </article>
        `;
    }).join('');
    
    // Re-initialize card interactions after videos are loaded
    initializeCardInteractions();
}

/**
 * Initialize page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    initializeCardInteractions();
    loadVideos();
});

/**
 * Utility functions for future enhancements
 */
const DeepHockey = {
    // Analytics tracking (placeholder)
    trackEvent: function(eventName, properties = {}) {
        console.log('Event tracked:', eventName, properties);
        // Add your analytics implementation here
    },
};

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeepHockey;
}
