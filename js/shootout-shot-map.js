document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.shootout-shot-map').forEach(map => {
        const toggle = map.querySelector('.shot-map-career-toggle');
        const panels = map.querySelectorAll('.shot-map-panel');
        const selection = map.querySelector('.shot-map-selection');
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
        map.querySelectorAll('.shot-map-point').forEach(point => {
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
