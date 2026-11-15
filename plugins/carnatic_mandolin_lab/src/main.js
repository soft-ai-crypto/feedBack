import { melakartaOptions, janyaOptions, buildRaga, mod12, STR, OPEN_NOTES, FRET_MAX } from './carnatic.js';

const SCREEN_ID = 'plugin-carnatic_mandolin_lab';
const DEFAULT_RAGA = 'm:15'; // Mayamalavagowla
const STRING_NAMES = ['5th', '4th', '3rd', '2nd', '1st']; // index 0 = lowest string

function makeCell(text, style) {
    const d = document.createElement('div');
    d.textContent = text;
    d.style.cssText = style;
    return d;
}

function fillRagaList() {
    const sel = document.getElementById('cml-raga');
    if (!sel || sel.options.length) return;
    const groups = [
        ['Janya ragas', janyaOptions()],
        ['Melakarta ragas', melakartaOptions()],
    ];
    for (const [title, options] of groups) {
        const g = document.createElement('optgroup');
        g.label = title;
        for (const o of options) {
            const opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.label;
            g.appendChild(opt);
        }
        sel.appendChild(g);
    }
    sel.value = DEFAULT_RAGA;
    sel.addEventListener('change', draw);
}

function swaraLabels(raga) {
    const map = new Map();
    for (const step of [...raga.aro, ...raga.ava]) {
        const pc = mod12(step.semi);
        const list = map.get(pc) || [];
        if (!list.includes(step.lab)) list.push(step.lab);
        map.set(pc, list);
    }
    const out = new Map();
    for (const [pc, list] of map) out.set(pc, list.join('/'));
    return out;
}

function stepText(steps) {
    return steps.map((s) => s.lab + (s.semi >= 12 ? "'" : '')).join(' ');
}

function addDots(pill, count, above, color) {
    for (let i = 0; i < count; i++) {
        const dot = document.createElement('span');
        const off = (i - (count - 1) / 2) * 7;
        dot.style.cssText = `position:absolute; left:calc(50% + ${off}px - 2px); ${above ? 'top' : 'bottom'}:2px; width:4px; height:4px; border-radius:50%; background:${color};`;
        pill.appendChild(dot);
    }
}

function makePill(label, semi, isSa, title) {
    const pill = document.createElement('div');
    pill.textContent = label;
    pill.title = title;
    const bg = isSa ? '#f59e0b' : '#2563eb';
    const fg = isSa ? '#111827' : '#ffffff';
    pill.style.cssText = `position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); min-width:36px; height:30px; padding:0 4px; border-radius:15px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; background:${bg}; color:${fg};`;
    const oct = Math.floor(semi / 12);
    if (oct >= 1) addDots(pill, oct, true, fg);
    if (oct <= -1) addDots(pill, -oct, false, fg);
    return pill;
}

function draw() {
    const sel = document.getElementById('cml-raga');
    const board = document.getElementById('cml-board');
    const scaleEl = document.getElementById('cml-scale');
    const status = document.getElementById('cml-status');
    if (!sel || !board) return;
    board.textContent = '';
    const raga = buildRaga(sel.value);
    if (!raga) {
        if (scaleEl) scaleEl.textContent = '';
        if (status) status.textContent = 'Could not load that raga.';
        return;
    }
    if (status) status.textContent = '';
    if (scaleEl) scaleEl.textContent = `Arohanam: ${stepText(raga.aro)}  ·  Avarohanam: ${stepText(raga.ava)}`;

    const labels = swaraLabels(raga);
    const scale = new Set(raga.scale);
    const cols = FRET_MAX + 1;
    const grid = document.createElement('div');
    grid.style.cssText = `display:grid; grid-template-columns:130px repeat(${cols}, 46px); gap:2px; width:${130 + cols * 48}px;`;

    grid.appendChild(makeCell('', ''));
    for (let f = 0; f <= FRET_MAX; f++) {
        grid.appendChild(makeCell(f === 0 ? 'Open' : String(f), 'text-align:center; color:#9ca3af; font-size:12px;'));
    }

    for (let s = STR.length - 1; s >= 0; s--) {
        grid.appendChild(makeCell(`${STRING_NAMES[s]} string (${OPEN_NOTES[s]})`, 'display:flex; align-items:center; color:#d1d5db; font-size:13px;'));
        for (let f = 0; f <= FRET_MAX; f++) {
            const semi = STR[s] + f;
            const pc = mod12(semi);
            const cell = document.createElement('div');
            const edge = f === 0 ? 'border-right:4px solid #9ca3af;' : 'border-right:1px solid #374151;';
            cell.style.cssText = `position:relative; height:38px; background:linear-gradient(#6b7280,#6b7280) center / 100% 2px no-repeat; ${edge}`;
            if (scale.has(pc)) {
                const label = labels.get(pc) || '';
                cell.appendChild(makePill(label, semi, pc === 0, `${label} on the ${STRING_NAMES[s]} string, fret ${f}`));
            }
            grid.appendChild(cell);
        }
    }
    board.appendChild(grid);
}

function init() {
    fillRagaList();
    draw();
}

init();

if (window.feedBack && typeof window.feedBack.on === 'function') {
    window.feedBack.on('screen:changed', (ev) => {
        const id = ev && ev.detail && ev.detail.id;
        if (id === SCREEN_ID) init();
    });
}
