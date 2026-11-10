// ─────────────────────────────────────────────────────────────────────────────
//  THE KEYBOARD'S LAYOUT: a 75% board with a knob (the AULA F75's shape).
//  Six rows, each 16 units wide. A key is [KeyboardEvent.code, label, width];
//  a bare number is a gap. Used by the room's keyboard and by the keyboard
//  interface (#type), so a key pressed anywhere lights up on both.
// ─────────────────────────────────────────────────────────────────────────────
const letters = (s) => [...s].map((c) => [`Key${c}`, c, 1]);
const digits = [...'1234567890'].map((c) => [`Digit${c}`, c, 1]);
const fkeys = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => [`F${a + i}`, `F${a + i}`, 1]);

export const LAYOUT = [
  [['Escape', 'Esc', 1], 0.25, ...fkeys(1, 4), 0.25, ...fkeys(5, 8), 0.25, ...fkeys(9, 12), 0.25, ['Delete', 'Del', 1], ['Knob', '', 1]],
  [['Backquote', '`', 1], ...digits, ['Minus', '-', 1], ['Equal', '=', 1], ['Backspace', '⌫', 2], ['Home', 'Home', 1]],
  [['Tab', 'Tab', 1.5], ...letters('QWERTYUIOP'), ['BracketLeft', '[', 1], ['BracketRight', ']', 1], ['Backslash', '\\', 1.5], ['PageUp', 'PgUp', 1]],
  [['CapsLock', 'Caps', 1.75], ...letters('ASDFGHJKL'), ['Semicolon', ';', 1], ['Quote', '\'', 1], ['Enter', 'Enter', 2.25], ['PageDown', 'PgDn', 1]],
  [['ShiftLeft', 'Shift', 2.25], ...letters('ZXCVBNM'), ['Comma', ',', 1], ['Period', '.', 1], ['Slash', '/', 1], ['ShiftRight', 'Shift', 1.75], ['ArrowUp', '↑', 1], ['End', 'End', 1]],
  [['ControlLeft', 'Ctrl', 1.25], ['MetaLeft', '⌘', 1.25], ['AltLeft', 'Alt', 1.25], ['Space', '', 6.25], ['AltRight', 'Alt', 1], ['Fn', 'Fn', 1], ['ControlRight', 'Ctrl', 1], ['ArrowLeft', '←', 1], ['ArrowDown', '↓', 1], ['ArrowRight', '→', 1]],
];

// every key with its place: x and w in units (0–16), row 0–5
export const KEYS = LAYOUT.flatMap((row, r) => {
  let x = 0;
  const out = [];
  for (const k of row) {
    if (typeof k === 'number') { x += k; continue; }
    out.push({ code: k[0], label: k[1], x, w: k[2], r });
    x += k[2];
  }
  return out;
});

// pressed keys, shared by everything that draws a keyboard
const listeners = new Set();
export const onKey = (fn) => (listeners.add(fn), () => listeners.delete(fn));
export const press = (code, down) => listeners.forEach((fn) => fn(code, down));
addEventListener('keydown', (e) => press(e.code, true));
addEventListener('keyup', (e) => press(e.code, false));
addEventListener('blur', () => KEYS.forEach((k) => press(k.code, false)));
