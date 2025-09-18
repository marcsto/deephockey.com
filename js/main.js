// Deep Hockey - Main JavaScript

/**
 * Reusable Components: Header and Footer
 * This script injects the header and footer into the page.
 * To update navigation, you only need to change it here.
 */

// Header component template
const Header = `
    <div class="container">
        <div class="header-nav">
            <div>
                <a href="./index.html" class="logo">
                   Deep <span class="logo-accent">Hockey</span>
                </a>
            </div>
            <div class="nav-menu">
                <a href="./index.html" class="nav-link">Home</a>
                <a href="#" class="nav-link">About</a>
                <a href="https://www.youtube.com/@DeeperHockey/shorts" class="nav-link">YouTube</a>
            </div>
            <!-- Mobile menu button can be added here if needed -->
        </div>
    </div>
`;

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
    // Inject header
    const headerElement = document.getElementById('main-header');
    if (headerElement) {
        headerElement.innerHTML = Header;
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
    const cards = document.querySelectorAll('.blog-card');
    
    cards.forEach(card => {
        // Add keyboard navigation support
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const link = card.querySelector('.card-link[href]:not(.card-link-disabled)');
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
            
            const link = card.querySelector('.card-link[href]:not(.card-link-disabled)');
            if (link) {
                link.click();
            }
        });

        // Add tabindex for accessibility
        if (card.querySelector('.card-link[href]:not(.card-link-disabled)')) {
            card.setAttribute('tabindex', '0');
            card.style.cursor = 'pointer';
        }
    });
}

/**
 * Initialize page when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    initializeCardInteractions();
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
