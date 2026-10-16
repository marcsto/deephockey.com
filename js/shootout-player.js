document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('shootout-video');
    if (!video) return;
    const container = document.querySelector('.video-player-container');
    const items = Array.from(document.querySelectorAll('.attempt-item'));
    const title = document.getElementById('video-title');
    const details = document.getElementById('video-details');
    const unavailable = document.getElementById('no-video-message');
    const previous = document.getElementById('previous-video');
    const next = document.getElementById('next-video');
    const browse = document.getElementById('browse-videos');
    const count = document.getElementById('video-position');
    const autoplay = document.getElementById('autoplay-toggle');
    const dialog = document.getElementById('video-picker');
    const list = document.getElementById('video-picker-list');
    const filters = Array.from(dialog.querySelectorAll('[data-video-filter]'));
    const empty = document.getElementById('video-picker-empty');
    const status = document.getElementById('video-status');
    const playable = items.map((item, index) => index).filter(index =>
        items[index].dataset.hasVideo === 'true' && items[index].dataset.video);
    const isGoal = index => items[index].dataset.result === 'goal';
    const goalLabel = document.querySelector('.shootout-shot-map')?.dataset.role === 'goalie' ? 'Goals allowed' : 'Goals';
    let current = -1;
    let filter = 'all';
    let advanceTimer;
    let resumeAfterPicker = false;
    const pickerButtons = new Map();

    try {
        const saved = localStorage.getItem('shootout-autoplay');
        if (saved !== null) autoplay.checked = saved === 'true';
    } catch (_) { /* Browsing still works when storage is disabled. */ }

    const queue = () => playable.filter(index => filter === 'all' || isGoal(index));
    const adjacent = direction => direction > 0
        ? queue().find(index => index > current)
        : queue().filter(index => index < current).pop();
    const cancelAdvance = () => clearTimeout(advanceTimer);
    const startVideo = () => video.play().catch(() => { /* Native play controls remain available. */ });
    const scrollToPlayer = () => container.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start'
    });

    function updateControls() {
        const visible = queue();
        const position = visible.indexOf(current);
        previous.disabled = adjacent(-1) === undefined;
        next.disabled = adjacent(1) === undefined;
        browse.disabled = playable.length === 0;
        autoplay.disabled = playable.length === 0;
        const scope = filter === 'goal' ? `${goalLabel} · ` : '';
        count.textContent = position >= 0 ? `${scope}${position + 1} / ${visible.length}` : `${scope}${visible.length} videos`;
        browse.setAttribute('aria-label', `Browse videos, ${count.textContent}`);
        filters.forEach(button => {
            const goals = button.dataset.videoFilter === 'goal';
            button.textContent = `${goals ? goalLabel : 'All videos'} (${goals ? playable.filter(isGoal).length : playable.length})`;
            button.setAttribute('aria-pressed', String(button.dataset.videoFilter === filter));
        });
        pickerButtons.forEach((button, index) => {
            button.hidden = !visible.includes(index);
            if (index === current) button.setAttribute('aria-current', 'true');
            else button.removeAttribute('aria-current');
        });
        empty.hidden = visible.length > 0;
        empty.textContent = filter === 'goal' ? 'No goal videos are available.' : 'No videos are available.';
    }

    function selectAttempt(index, { play = true } = {}) {
        if (index < 0 || index >= items.length) return;
        cancelAdvance();
        current = index;
        const item = items[index];
        items.forEach((entry, i) => {
            entry.classList.toggle('active', i === index);
            const button = entry.querySelector('.attempt-select');
            if (i === index) button?.setAttribute('aria-current', 'true');
            else button?.removeAttribute('aria-current');
        });
        const url = new URL(window.location.href);
        url.searchParams.set('v', item.dataset.videoId);
        window.history.replaceState({}, '', url);
        title.textContent = item.dataset.title;
        details.innerHTML = item.dataset.details;
        const hasVideo = playable.includes(index);
        video.style.display = hasVideo ? 'block' : 'none';
        unavailable.style.display = hasVideo ? 'none' : 'flex';
        video.pause();
        if (hasVideo) {
            video.src = item.dataset.video;
            video.load();
            if (play) startVideo();
        } else {
            video.removeAttribute('src');
            video.querySelector('source')?.remove();
            video.load();
        }
        updateControls();
        status.textContent = `${item.dataset.title}. ${details.textContent}${hasVideo ? '' : '. Video unavailable.'}`;
        document.dispatchEvent(new CustomEvent('shootout:attemptchange', {
            detail: { id: item.dataset.videoId, hasVideo }
        }));
    }

    function advance(direction) {
        const index = adjacent(direction);
        if (index !== undefined) selectAttempt(index);
    }
    previous.addEventListener('click', () => advance(-1));
    next.addEventListener('click', () => advance(1));

    playable.forEach(index => {
        const item = items[index];
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'video-picker-item';
        button.dataset.attemptId = item.dataset.videoId;
        const opponent = document.createElement('span');
        opponent.className = 'video-picker-opponent';
        opponent.textContent = item.dataset.title;
        const description = document.createElement('span');
        description.className = 'video-picker-details';
        description.textContent = `${item.querySelector('.attempt-date').textContent} · ${item.querySelector('.attempt-details').textContent}`;
        button.append(opponent, description);
        button.addEventListener('click', () => {
            resumeAfterPicker = false;
            dialog.close();
            selectAttempt(index);
        });
        pickerButtons.set(index, button);
        list.appendChild(button);
    });
    filters.forEach(button => button.addEventListener('click', () => {
        cancelAdvance();
        filter = button.dataset.videoFilter;
        updateControls();
        list.scrollTop = 0;
    }));
    browse.addEventListener('click', () => {
        cancelAdvance();
        resumeAfterPicker = !video.paused && !video.ended;
        video.pause();
        dialog.showModal();
        document.documentElement.classList.add('video-picker-open');
        browse.setAttribute('aria-expanded', 'true');
        const selected = pickerButtons.get(current);
        if (selected && !selected.hidden) {
            list.scrollTop = Math.max(0, selected.offsetTop - list.offsetTop - list.clientHeight / 3);
        }
    });
    dialog.querySelector('.video-picker-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('video-picker-open');
        browse.setAttribute('aria-expanded', 'false');
        if (resumeAfterPicker) startVideo();
        resumeAfterPicker = false;
    });

    items.forEach((item, index) => item.querySelector('.attempt-select').addEventListener('click', () => {
        // An explicit history/map choice starts a new unfiltered browsing sequence.
        filter = 'all';
        selectAttempt(index);
        scrollToPlayer();
    }));
    document.querySelectorAll('.attempt-jump').forEach(link => link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const index = items.findIndex(item => item.dataset.videoId === link.dataset.attemptId);
        if (index < 0) return;
        event.preventDefault();
        filter = 'all';
        selectAttempt(index);
        scrollToPlayer();
    }));
    autoplay.addEventListener('change', () => {
        cancelAdvance();
        try { localStorage.setItem('shootout-autoplay', String(autoplay.checked)); } catch (_) { /* Optional preference. */ }
    });
    video.addEventListener('pause', cancelAdvance);
    video.addEventListener('seeking', cancelAdvance);
    video.addEventListener('ended', () => {
        cancelAdvance();
        if (!autoplay.checked || dialog.open) return;
        const endedIndex = current;
        advanceTimer = setTimeout(() => {
            if (autoplay.checked && !dialog.open && video.ended && current === endedIndex) advance(1);
        }, 1000);
    });
    const requested = new URLSearchParams(window.location.search).get('v');
    const requestedIndex = items.findIndex(item => item.dataset.videoId === requested);
    selectAttempt(requestedIndex >= 0 ? requestedIndex : (playable[0] ?? 0));
});
