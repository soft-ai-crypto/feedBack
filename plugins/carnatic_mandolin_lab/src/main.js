const SCREEN_ID = 'plugin-carnatic_mandolin_lab';

function init() {
    const el = document.getElementById('cml-status');
    if (el) el.textContent = 'Carnatic Mandolin Lab loaded. Fretboard view coming next.';
}

init();

if (window.feedBack && typeof window.feedBack.on === 'function') {
    window.feedBack.on('screen:changed', (ev) => {
        const id = ev && ev.detail && ev.detail.id;
        if (id === SCREEN_ID) init();
    });
}
