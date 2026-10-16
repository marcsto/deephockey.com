document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('.shootout-trajectories');
    const data = root?.querySelector('.trajectory-data');
    if (!data) return;
    const records = JSON.parse(data.textContent);
    const find = selector => root.querySelector(selector);
    const select = find('#trajectory-attempt');
    const slider = find('#trajectory-progress');
    const play = find('.trajectory-play');
    const previous = find('.trajectory-previous');
    const next = find('.trajectory-next');
    const compare = find('.trajectory-compare input');
    const watch = find('.trajectory-watch');
    const paths = Array.from(root.querySelectorAll('.trajectory-route'));
    const filters = Array.from(root.querySelectorAll('[data-route-filter]'));
    const selectedPath = find('.trajectory-selected-path');
    const halo = find('.trajectory-selected-halo');
    const cursor = find('.trajectory-cursor');
    const start = find('.trajectory-start');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let filtered = records;
    let selected;
    let animation;
    let playing = false;

    function stop() {
        cancelAnimationFrame(animation);
        playing = false;
        play.textContent = '↻ Replay route';
    }

    const bounds = () => [selected.segments[0][0][0], selected.segments.at(-1).at(-1)[0]];
    const point = (element, p) => {
        element.setAttribute('cx', p[1]);
        element.setAttribute('cy', p[2]);
    };

    function draw(value) {
        const [first, last] = bounds();
        const time = value >= 1000 ? last : first + (last - first) * value / 1000;
        const pieces = [];
        let position;
        selected.segments.forEach(segment => {
            const visible = segment.filter(p => p[0] <= time);
            if (!visible.length) return;
            const after = segment[visible.length];
            if (after) {
                const before = visible.at(-1);
                const fraction = (time - before[0]) / (after[0] - before[0]);
                visible.push([time, before[1] + fraction * (after[1] - before[1]),
                    before[2] + fraction * (after[2] - before[2])]);
            }
            if (time <= segment.at(-1)[0]) position = visible.at(-1);
            pieces.push(`M ${visible.map(p => `${p[1]} ${p[2]}`).join(' L ')}`);
        });
        const d = pieces.join(' ');
        selectedPath.setAttribute('d', d);
        halo.setAttribute('d', d);
        if (position) point(cursor, position);
        cursor.style.display = position ? '' : 'none';
        find('.trajectory-gap').hidden = Boolean(position);
        find('.trajectory-time').textContent = `${(time - first).toFixed(1)} / ${(last - first).toFixed(1)} s`;
        slider.setAttribute('aria-valuetext', `${(time - first).toFixed(1)} of ${(last - first).toFixed(1)} seconds${position ? '' : ', tracking gap'}`);
    }

    function updatePaths() {
        const visible = new Set(filtered.map(r => r.id));
        paths.forEach(path => {
            const current = path.dataset.routeId === selected?.id;
            path.style.display = visible.has(path.dataset.routeId) && (compare.checked || current) ? '' : 'none';
            path.classList.toggle('is-selected', current);
        });
    }

    function choose(record) {
        stop();
        selected = record;
        if (!record) return;
        select.value = record.id;
        const index = filtered.indexOf(record);
        previous.disabled = index <= 0;
        next.disabled = index >= filtered.length - 1;
        find('.trajectory-position').textContent = `${index + 1} / ${filtered.length}`;
        find('.trajectory-result').textContent = record.result_label;
        find('.trajectory-result').dataset.result = record.result;
        find('.trajectory-opponent').textContent = `vs ${record.opponent}`;
        find('.trajectory-date').textContent = `${record.date} · ${record.type}`;
        find('.trajectory-lane').textContent = record.side === 'center' ? 'Center' : `Shooter’s ${record.side}`;
        const [first, last] = bounds();
        find('.trajectory-duration').textContent = `${(last - first).toFixed(1)} sec`;
        [selectedPath, cursor, start].forEach(element => { element.dataset.result = record.result; });
        point(start, record.segments[0][0]);
        watch.href = `?v=${record.id}`;
        watch.dataset.attemptId = record.id;
        watch.hidden = !record.has_video;
        find('.trajectory-no-video').hidden = record.has_video;
        slider.value = '1000';
        updatePaths();
        draw(1000);
    }

    function applyFilter(filter, preferred = selected?.id) {
        stop();
        filtered = records.filter(record => filter === 'all' || record.result === filter);
        filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.routeFilter === filter)));
        select.replaceChildren(...filtered.map(record => {
            const option = document.createElement('option');
            option.value = record.id;
            option.textContent = `${record.date} · ${record.result_label} · ${record.opponent}`;
            return option;
        }));
        find('.trajectory-layout').hidden = !filtered.length;
        find('.trajectory-filter-empty').hidden = Boolean(filtered.length);
        choose(filtered.find(record => record.id === preferred) || filtered[0]);
    }

    filters.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.routeFilter)));
    select.addEventListener('change', () => choose(filtered.find(record => record.id === select.value)));
    previous.addEventListener('click', () => choose(filtered[filtered.indexOf(selected) - 1]));
    next.addEventListener('click', () => choose(filtered[filtered.indexOf(selected) + 1]));
    compare.addEventListener('change', updatePaths);
    paths.forEach(path => path.addEventListener('click', () => choose(filtered.find(record => record.id === path.dataset.routeId))));
    slider.addEventListener('input', () => { stop(); draw(Number(slider.value)); });
    play.addEventListener('click', () => {
        if (playing) { stop(); return; }
        const [first, last] = bounds();
        // Explicit replay is the only animation; never run on load or selection.
        if (reducedMotion.matches) {
            slider.value = '0';
            draw(0);
            find('.trajectory-selection-hint').textContent = 'Reduced motion is on. Use the slider to trace the route.';
            return;
        }
        const started = performance.now();
        playing = true;
        play.textContent = 'Ⅱ Pause replay';
        function frame(now) {
            const value = Math.min(1000, (now - started) / (last - first));
            slider.value = String(value);
            draw(value);
            if (value < 1000) animation = requestAnimationFrame(frame);
            else stop();
        }
        animation = requestAnimationFrame(frame);
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
    reducedMotion.addEventListener('change', stop);
    document.addEventListener('shootout:attemptchange', event => {
        if (records.some(record => record.id === event.detail.id)) applyFilter('all', event.detail.id);
    });
    const requested = new URLSearchParams(window.location.search).get('v');
    applyFilter('all', requested);
});
