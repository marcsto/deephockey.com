// The HTML contains every clip, description and link; these are optional controls.
(() => {
    const videos = Array.from(document.querySelectorAll('.goal-card video'));
    const speed = document.getElementById('playback-speed');
    const status = document.getElementById('collection-status');
    const track = (eventName, params) => {
        if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    };

    document.querySelector('.playback-control').hidden = false;
    speed.addEventListener('change', () => {
        videos.forEach(video => { video.playbackRate = Number(speed.value); });
    });

    videos.forEach(video => {
        const card = video.closest('.goal-card');
        video.addEventListener('play', () => {
            videos.forEach(other => { if (other !== video) other.pause(); });
            video.playbackRate = Number(speed.value);
            if (!video.dataset.counted) {
                track('shootout_collection_play', {
                    collection: 'one_handed', goal_id: card.id, player: card.dataset.player
                });
                video.dataset.counted = 'true';
            }
        });
        video.addEventListener('error', () => { card.querySelector('.video-error').hidden = false; });
    });

    document.querySelectorAll('.copy-goal').forEach(button => {
        button.hidden = false;
        button.addEventListener('click', async () => {
            const card = button.closest('.goal-card');
            const url = new URL(window.location.href);
            url.search = '';
            url.hash = card.id;
            try {
                await navigator.clipboard.writeText(url.href);
                status.textContent = `Link copied for ${card.dataset.player}.`;
                button.textContent = 'Copied';
                setTimeout(() => { button.textContent = 'Copy goal link'; }, 2000);
            } catch {
                window.location.hash = card.id;
                status.textContent = 'Copy the address from your browser to share this goal.';
            }
        });
    });

    document.querySelectorAll('[data-player-history]').forEach(link => {
        link.addEventListener('click', () => track('shootout_collection_player', {
            collection: 'one_handed', player: link.closest('.goal-card').dataset.player
        }));
    });
})();
