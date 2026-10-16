document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.shootout-shot-map').forEach(map => {
        const toggle = map.querySelector('.shot-map-career-toggle');
        const panels = map.querySelectorAll('.shot-map-panel');
        const selection = map.querySelector('.shot-map-selection');
        const points = Array.from(map.querySelectorAll('.shot-map-point'));
        const highlightAttempt = id => {
            points.forEach(point => {
                const active = point.dataset.attemptId === id;
                point.classList.toggle('is-current', active);
                if (active) point.setAttribute('aria-current', 'true');
                else point.removeAttribute('aria-current');
            });
        };
        document.addEventListener('shootout:attemptchange', event => {
            highlightAttempt(event.detail.id);
            if (!selection.hidden) {
                const active = points.find(point => point.dataset.attemptId === event.detail.id);
                selection.textContent = active?.getAttribute('aria-label') || 'No recorded location for the selected attempt.';
            }
        });
        highlightAttempt(document.querySelector('.attempt-item.active')?.dataset.videoId);
        const showPeriod = () => {
            const scope = toggle.checked ? 'career' : 'recent';
            panels.forEach(panel => { panel.hidden = panel.dataset.scope !== scope; });
            selection.textContent = '';
            selection.hidden = true;
        };
        // Keep recent attempts as the default, including browsers that restore inputs.
        toggle.checked = false;
        showPeriod();
        toggle.addEventListener('change', showPeriod);
        points.forEach(point => {
            const showDetails = () => {
                selection.textContent = point.getAttribute('aria-label');
                selection.hidden = false;
            };
            point.addEventListener('click', showDetails);
            if (point.getAttribute('role') === 'button') {
                point.addEventListener('keydown', event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        showDetails();
                    }
                });
            }
        });
    });
});
