// Entry point for World mode (the hotel).
import { Game } from './game.js';

const canvas = document.getElementById('game');
const hud = document.getElementById('hud');
window.__hotel = new Game(canvas, hud); // handy in the dev console
canvas.focus({ preventScroll: true });
