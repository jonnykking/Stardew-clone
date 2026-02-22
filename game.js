const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// --- Configuration ---
const TILE_SIZE = 64;
const MAP_WIDTH = 50; // 50x50 tiles = 3200x3200 world
const MAP_HEIGHT = 50;

// Tile Dictionary
const TILES = {
    GRASS: 0,
    WATER: 1,
    TREE: 2,
    ROCK: 3,
    DIRT: 4,
    SEEDS: 5,
    CROP_GROWING: 6,
    CROP_READY: 7,
    FENCE: 8,
    PATH: 9
};

// Colors for our procedurally drawn assets
const TILE_COLORS = {
    [TILES.GRASS]: '#55aa55',
    [TILES.WATER]: '#3388cc',
    [TILES.TREE]: '#2d5a27', // The canopy color
    [TILES.ROCK]: '#808080',
    [TILES.DIRT]: '#8b5a2b'
};

// Properties
const SOLID_TILES = [TILES.WATER, TILES.TREE, TILES.ROCK];

// --- Map Generation ---
let map = [];
function generateMap() {
    for (let y = 0; y < MAP_HEIGHT; y++) {
        let row = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Borders are water
            if (x === 0 || y === 0 || x === MAP_WIDTH - 1 || y === MAP_HEIGHT - 1) {
                row.push(TILES.WATER);
                continue;
            }

            // Random distribution for a farm area
            let rand = Math.random();
            if (rand < 0.02) {
                row.push(TILES.WATER);
            } else if (rand < 0.15) {
                row.push(TILES.TREE);
            } else if (rand < 0.20) {
                row.push(TILES.ROCK);
            } else {
                row.push(TILES.GRASS);
            }
        }
        map.push(row);
    }

    // Ensure player start area (center) is clear
    let cx = Math.floor(MAP_WIDTH / 2);
    let cy = Math.floor(MAP_HEIGHT / 2);
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            map[cy + j][cx + i] = TILES.GRASS;
        }
    }
}
generateMap();

// --- Pixel Art Sprite Generation ---

// Palette
const P = {
    _: null, // Transparent
    G1: '#63c74d', G2: '#3e8948', G3: '#265c42', // Grass
    W1: '#2ce8f5', W2: '#0099db', W3: '#2a628f', // Water
    D1: '#8a5c3c', D2: '#754022', D3: '#522511', // Dirt
    R1: '#c0cbdc', R2: '#8b9bb4', R3: '#5a6988', // Rock
    T1: '#4a3018', T2: '#2b1a0d', // Trunk
    L1: '#73eff7', // Water Glint
    S1: '#ffcd75', S2: '#d9a066', // Skin
    P1: '#323c39', P2: '#2cdaba', // Pants/Overalls
    H1: '#d95763', H2: '#ac3232', // Shirt
    A1: '#df7126', A2: '#8f563b', // Hat
    EY: '#181425', // Eyes
    // Crops
    C1: '#7bc676', C2: '#4a9c45', C3: '#f2f0e6', C4: '#d95763',
    // Decor
    F1: '#c0a062', F2: '#9a7b45', F3: '#73562a', // Fences
    // Dog companion
    D1: '#a1a5aa', D2: '#737a82' // grey whippet
};

const SPRITE_DATA = {
    [TILES.GRASS]: [
        'G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1',
        'G1,G2,G1,G1,G1,G1,G2,G1,G1,G1,G1,G1,G1,G1,G2,G1',
        'G2,G3,G1,G1,G1,G2,G3,G1,G1,G1,G1,G1,G1,G2,G3,G1',
        'G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1',
        'G1,G1,G1,G1,G2,G1,G1,G1,G1,G1,G1,G2,G1,G1,G1,G1',
        'G1,G1,G1,G2,G3,G1,G1,G1,G1,G1,G2,G3,G1,G1,G1,G1',
        'G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1',
        'G2,G1,G1,G1,G1,G1,G1,G1,G2,G1,G1,G1,G1,G1,G1,G1',
        'G3,G2,G1,G1,G1,G1,G1,G2,G3,G1,G1,G1,G1,G1,G1,G1',
        'G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1',
        'G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G2,G1,G1,G1,G1',
        'G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G2,G3,G1,G1,G1,G1',
        'G1,G1,G2,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1',
        'G1,G2,G3,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1',
        'G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G2,G1,G1',
        'G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G1,G2,G3,G1,G1'
    ],
    [TILES.WATER]: [
        'W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,_;W3,_;W3,_;W3,_;W3,_;W3,_;W3,_;W3,_;W3,W2,W1',
        'W1,W2,_;W3,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W3,W3,W2,W2,W1',
        'W1,W2,W2,W3,W3,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W3,W3,W3,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W3,W3,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W3,W3,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W3,W3,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W3,W3,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1'
    ],
    // Fixing WATER representation manually above with semicolons is tricky, using simple solid colors for pixel rows instead
    [TILES.WATER]: [
        'W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W3,W3,W2,W2,W2,W2,W3,W3,W3,W3,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W3,W3,W2,W2,W1',
        'W1,W2,W2,W3,W3,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W3,W3,W3,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W3,W3,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W3,W3,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W3,W3,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W3,W3,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W2,W1',
        'W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1,W1'
    ],
    [TILES.DIRT]: [
        'D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1',
        'D1,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D1,D1',
        'D1,D2,D3,D3,D3,D3,D3,D3,D3,D3,D3,D3,D3,D2,D1,D1',
        'D1,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D1,D1',
        'D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1',
        'D1,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D1,D1',
        'D1,D2,D3,D3,D3,D3,D3,D3,D3,D3,D3,D3,D3,D2,D1,D1',
        'D1,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D1,D1',
        'D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1',
        'D1,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D1,D1',
        'D1,D2,D3,D3,D3,D3,D3,D3,D3,D3,D3,D3,D3,D2,D1,D1',
        'D1,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D1,D1',
        'D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1',
        'D1,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D2,D1,D1',
        'D1,D2,D3,D3,D3,D3,D3,D3,D3,D3,D3,D3,D3,D2,D1,D1',
        'D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1,D1'
    ],
    [TILES.ROCK]: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,R1,R1,R1,R1,R1,R1,_,_,_,_,_,_',
        '_,_,_,R1,R1,R1,R1,R1,R1,R1,R1,_,_,_,_,_',
        '_,_,R1,R1,R2,R2,R2,R2,R2,R1,R1,_,_,_,_,_',
        '_,R1,R1,R2,R2,R2,R2,R2,R2,R2,R1,R1,_,_,_,_',
        '_,R1,R2,R2,R2,R2,R1,R1,R2,R2,R2,R1,_,_,_,_',
        '_,R1,R2,R2,R2,R1,R1,R1,R1,R2,R2,R1,_,_,_,_',
        '_,R1,R2,R2,R2,R2,R2,R2,R2,R2,R2,R1,_,_,_,_',
        '_,R1,R2,R2,R3,R3,R3,R3,R2,R2,R2,R1,_,_,_,_',
        '_,R1,R2,R3,R3,R3,R3,R3,R3,R2,R2,R1,_,_,_,_',
        '_,_,R1,R3,R3,R3,R3,R3,R3,R3,R1,R1,_,_,_,_',
        '_,_,R1,R1,R3,R3,R3,R3,R3,R1,R1,_,_,_,_,_',
        '_,_,_,_,R1,R1,R1,R1,R1,R1,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    [TILES.SEEDS]: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,D3,D3,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,D3,D3,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,D3,D3,_,_,_',
        '_,_,_,_,D3,D3,_,_,_,_,_,D3,D3,_,_,_',
        '_,_,_,_,D3,D3,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    [TILES.CROP_GROWING]: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,C1,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,C1,C1,C1,_,_,_,_,_,_,_',
        '_,_,_,_,_,C1,C2,C2,C1,_,_,_,_,_,_',
        '_,_,_,_,_,_,C2,C1,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,C1,C2,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,C2,C1,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,C1,C1,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    [TILES.CROP_READY]: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,C1,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,C1,C1,C1,_,_,_,_,_,_,_',
        '_,_,_,_,_,C1,C2,C2,C1,_,_,_,_,_,_',
        '_,_,_,_,_,_,C1,C1,C1,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,C2,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,C3,C3,C3,_,_,_,_,_,_,_',
        '_,_,_,_,_,C3,C3,C3,C3,C3,_,_,_,_,_,_',
        '_,_,_,_,_,C3,C3,C3,C3,C3,_,_,_,_,_,_',
        '_,_,_,_,_,C4,C4,C4,C4,C4,_,_,_,_,_,_',
        '_,_,_,_,_,_,C4,C4,C4,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,C4,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    [TILES.FENCE]: [
        '_,_,_,_,_,_,_,F1,F2,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F1,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        'F1,F1,F1,F1,F1,F1,F1,F2,F1,F1,F1,F1,F1,F1,F1,F1',
        'F2,F2,F2,F2,F2,F2,F2,F3,F2,F2,F2,F2,F2,F2,F2,F2',
        'F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        'F1,F1,F1,F1,F1,F1,F1,F2,F1,F1,F1,F1,F1,F1,F1,F1',
        'F2,F2,F2,F2,F2,F2,F2,F3,F2,F2,F2,F2,F2,F2,F2,F2',
        'F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3,F3',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F3,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F3,F3,_,_,_,_,_,_,_'
    ],
    FENCE_VERTICAL: [
        '_,_,_,_,_,_,_,F1,F2,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F1,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F2,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F3,F3,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,F3,F3,_,_,_,_,_,_,_'
    ],
    [TILES.PATH]: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,R2,R1,R1,_,_,_,_,R3,R2,R1,_,_,_,_',
        '_,R2,R3,R2,R1,_,_,R3,R3,R3,R2,_,_,_,_',
        '_,R1,R2,R2,R1,_,_,_,R3,R2,R1,_,_,_,_',
        '_,_,R1,R1,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,R2,R2,R1,_,_,_,_,_,_,_',
        '_,_,_,_,_,R2,R3,R2,R1,_,_,_,_,_,_,_',
        '_,_,_,_,_,R1,R2,R2,R1,_,_,_,R2,R1,_,_',
        '_,R2,R2,_,_,R1,R1,_,_,_,_,R2,R3,R1,_',
        'R2,R3,R2,R1,_,_,_,_,_,_,_,R1,R2,R1,_',
        '_,R2,R2,R1,_,_,_,_,_,_,_,_,R1,_,_,_',
        '_,_,_,_,_,_,_,_,R2,R2,R1,_,_,_,_,_',
        '_,_,_,_,_,_,_,R2,R3,R2,R1,_,_,_,_,_',
        '_,_,_,_,_,_,_,R1,R2,R2,R1,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,R1,R1,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    [TILES.TREE]: [ // 16x32 Matrix
        '_,_,_,_,_,_,_,G1,G1,_,_,_,_,_,_,_',
        '_,_,_,_,_,G1,G1,G2,G2,G1,G1,_,_,_,_,_',
        '_,_,_,G1,G1,G2,G2,G2,G2,G2,G1,G1,_,_,_',
        '_,_,G1,G2,G2,G2,G2,G2,G2,G2,G2,G1,_,_',
        '_,G1,G2,G2,G2,G3,G3,G3,G3,G2,G2,G2,G1,_',
        '_,G1,G2,G2,G3,G3,G3,G3,G3,G3,G2,G2,G1,_',
        'G1,G2,G2,G3,G3,G3,G3,G3,G3,G3,G3,G2,G2,G1',
        'G1,G2,G3,G3,G3,G3,G3,G3,G3,G3,G3,G3,G2,G1',
        'G1,G2,G3,G3,G3,G2,G2,G2,G3,G3,G3,G3,G2,G1',
        'G1,G2,G3,G3,G2,G2,G2,G2,G2,G3,G3,G3,G2,G1',
        'G1,G2,G3,G3,G2,G1,G1,G1,G2,G3,G3,G3,G2,G1',
        'G1,G2,G3,G3,G2,G1,G2,G2,G2,G3,G3,G3,G2,G1',
        '_,G1,G2,G3,G3,G3,G3,G3,G3,G3,G3,G2,G1,_',
        '_,G1,G2,G2,G3,G3,G3,G3,G3,G3,G2,G2,G1,_',
        '_,_,G1,G2,G2,G2,G3,G3,G3,G2,G2,G1,_,_',
        '_,_,_,G1,G1,G2,G2,G2,G2,G1,G1,_,_,_,_',
        '_,_,_,_,_,G3,G3,G3,G3,G3,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T2,T1,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T2,T1,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T2,T1,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T2,T1,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T2,T1,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T2,T1,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T2,T1,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T2,T1,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T2,T1,_,_,_,_,_,_,_',
        '_,_,_,_,_,T1,T1,T2,T1,T1,_,_,_,_,_,_',
        '_,_,_,_,T1,T1,T1,T2,T1,T1,T1,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    // PLAYER: 16x32 Matrices
    PLAYER_DOWN_1: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_,_,_',
        '_,_,A1,A2,A2,A2,A2,A2,A2,A2,A2,A2,A1,_,_',
        '_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_',
        '_,_,_,S1,S1,S1,S1,S1,S1,S1,S1,S2,S2,_,_,_',
        '_,_,_,S1,S1,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_',
        '_,_,_,S1,S1,EY,S1,S1,EY,S1,S1,S1,S2,_,_,_',
        '_,_,_,S1,S1,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_',
        '_,_,_,_,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,_,H1,H1,H1,H1,H1,H1,_,_,_,_,_',
        '_,_,_,_,S1,H2,H1,H1,H1,H1,H2,S1,_,_,_,_',
        '_,_,_,_,S1,H2,H1,H1,H1,H1,H2,S1,_,_,_,_',
        '_,_,_,_,S1,P1,P1,P2,P2,P1,P1,S1,_,_,_,_',
        '_,_,_,_,_,P1,P1,P2,P2,P1,P1,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,P2,P2,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,P2,P2,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,_,_,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,_,_,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,T1,T1,_,_,T1,T1,_,_,_,_,_', // boots
        '_,_,_,_,_,T2,T2,_,_,T2,T2,_,_,_,_,_',
        // padding
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    PLAYER_DOWN_2: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_,_,_',
        '_,_,A1,A2,A2,A2,A2,A2,A2,A2,A2,A2,A1,_,_',
        '_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_',
        '_,_,_,S1,S1,S1,S1,S1,S1,S1,S1,S2,S2,_,_,_',
        '_,_,_,S1,S1,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_',
        '_,_,_,S1,S1,EY,S1,S1,EY,S1,S1,S1,S2,_,_,_',
        '_,_,_,S1,S1,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_',
        '_,_,_,_,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,_,H1,H1,H1,H1,H1,H1,_,_,_,_,_',
        '_,_,_,S1,H2,H1,H1,H1,H1,H2,_,_,_,_,_,_', // shifted arm
        '_,_,_,S1,H2,H1,H1,H1,H1,H2,S1,_,_,_,_,_',
        '_,_,_,_,S1,P1,P1,P2,P2,P1,P1,S1,_,_,_,_',
        '_,_,_,_,_,P1,P1,P2,P2,P1,P1,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,P2,P2,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,P2,P2,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,_,_,P2,P2,_,_,_,_,_', // walking shift
        '_,_,_,_,_,T1,T1,_,_,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,T2,T2,_,_,T1,T1,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,T2,T2,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    PLAYER_UP_1: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_,_,_',
        '_,_,A1,A2,A2,A2,A2,A2,A2,A2,A2,A2,A1,_,_',
        '_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_',
        '_,_,_,A2,A2,A2,A2,A2,A2,A2,A2,A2,A2,_,_,_', // Hair in back
        '_,_,_,A2,A2,A2,A2,A2,A2,A2,A2,A2,A2,_,_,_',
        '_,_,_,S1,S1,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_',
        '_,_,_,S1,S1,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_',
        '_,_,_,_,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,_,H1,H1,H1,H1,H1,H1,_,_,_,_,_',
        '_,_,_,_,S1,H2,H1,H1,H1,H1,H2,S1,_,_,_,_',
        '_,_,_,_,S1,H2,H1,H1,H1,H1,H2,S1,_,_,_,_',
        '_,_,_,_,S1,P1,P1,P2,P2,P1,P1,S1,_,_,_,_',
        '_,_,_,_,_,P1,P1,P2,P2,P1,P1,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,P2,P2,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,P2,P2,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,_,_,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,_,_,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,T1,T1,_,_,T1,T1,_,_,_,_,_',
        '_,_,_,_,_,T2,T2,_,_,T2,T2,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    PLAYER_UP_2: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_,_,_',
        '_,_,A1,A2,A2,A2,A2,A2,A2,A2,A2,A2,A1,_,_',
        '_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_',
        '_,_,_,A2,A2,A2,A2,A2,A2,A2,A2,A2,A2,_,_,_',
        '_,_,_,A2,A2,A2,A2,A2,A2,A2,A2,A2,A2,_,_,_',
        '_,_,_,S1,S1,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_',
        '_,_,_,S1,S1,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_',
        '_,_,_,_,S1,S1,S1,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,_,H1,H1,H1,H1,H1,H1,_,_,_,_,_',
        '_,_,_,S1,H2,H1,H1,H1,H1,H2,_,_,_,_,_,_', // shift arm
        '_,_,_,S1,H2,H1,H1,H1,H1,H2,S1,_,_,_,_,_',
        '_,_,_,_,S1,P1,P1,P2,P2,P1,P1,S1,_,_,_,_',
        '_,_,_,_,_,P1,P1,P2,P2,P1,P1,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,P2,P2,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,P2,P2,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,P2,P2,_,_,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,T1,T1,_,_,P2,P2,_,_,_,_,_',
        '_,_,_,_,_,T2,T2,_,_,T1,T1,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,T2,T2,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    PLAYER_RIGHT_1: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,A1,A1,A1,A1,A1,A1,A1,A1,_,_,_,_',
        '_,_,_,A1,A2,A2,A2,A2,A2,A2,A2,A1,_,_,_',
        '_,_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_,_',
        '_,_,_,_,A2,A2,S1,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,A2,A2,A2,S1,S1,EY,S1,S2,_,_,_,_',
        '_,_,_,_,A2,A2,A2,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,_,A2,S1,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,_,_,S1,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,_,_,H1,H1,H1,H1,H1,_,_,_,_,_',
        '_,_,_,_,_,H2,H2,H1,H1,H2,H2,_,_,_,_,_',
        '_,_,_,_,_,S1,H2,H1,H1,H2,S1,_,_,_,_,_',
        '_,_,_,_,_,S1,P1,P1,P2,P1,S1,_,_,_,_,_',
        '_,_,_,_,_,_,P1,P1,P2,P1,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,_,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,_,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T1,_,T1,_,_,_,_,_,_',
        '_,_,_,_,_,_,T2,T2,_,T2,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    PLAYER_RIGHT_2: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,A1,A1,A1,A1,A1,A1,A1,A1,_,_,_,_',
        '_,_,_,A1,A2,A2,A2,A2,A2,A2,A2,A1,_,_,_',
        '_,_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_,_',
        '_,_,_,_,A2,A2,S1,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,A2,A2,A2,S1,S1,EY,S1,S2,_,_,_,_',
        '_,_,_,_,A2,A2,A2,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,_,A2,S1,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,_,_,S1,S1,S1,S1,S1,S2,_,_,_,_',
        '_,_,_,_,_,_,H1,H1,H1,H1,H1,_,_,_,_,_',
        '_,_,_,_,S1,H2,H2,H1,H1,H2,_,_,_,_,_,_', // shifted arm
        '_,_,_,_,S1,H2,H2,H1,H1,H2,S1,_,_,_,_,_',
        '_,_,_,_,_,H2,P1,P1,P2,P1,S1,_,_,_,_,_',
        '_,_,_,_,_,_,P1,P1,P2,P1,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_P2,P2,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T1,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T2,T2,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    PLAYER_LEFT_1: [ // Flipped version of Right 1
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,A1,A1,A1,A1,A1,A1,A1,A1,_,_,_,_',
        '_,_,_,A1,A2,A2,A2,A2,A2,A2,A2,A1,_,_,_',
        '_,_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_,_',
        '_,_,_,_,S2,S1,S1,S1,S1,S1,A2,A2,_,_,_,_',
        '_,_,_,_,S2,S1,EY,S1,S1,A2,A2,A2,_,_,_,_',
        '_,_,_,_,S2,S1,S1,S1,S1,A2,A2,A2,_,_,_,_',
        '_,_,_,_,S2,S1,S1,S1,S1,S1,A2,_,_,_,_,_',
        '_,_,_,_,S2,S1,S1,S1,S1,S1,_,_,_,_,_,_',
        '_,_,_,_,_,H1,H1,H1,H1,H1,_,_,_,_,_,_',
        '_,_,_,_,_,H2,H2,H1,H1,H2,H2,_,_,_,_,_',
        '_,_,_,_,_,S1,H2,H1,H1,H2,S1,_,_,_,_,_',
        '_,_,_,_,_,S1,P1,P2,P1,P1,S1,_,_,_,_,_',
        '_,_,_,_,_,_,P1,P2,P1,P1,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,_,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,_,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,_,T1,T1,_,_,_,_,_,_',
        '_,_,_,_,_,_,T2,_,T2,T2,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    PLAYER_LEFT_2: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,A1,A1,A1,A1,A1,A1,A1,A1,_,_,_,_',
        '_,_,_,A1,A2,A2,A2,A2,A2,A2,A2,A1,_,_,_',
        '_,_,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,A1,_,_',
        '_,_,_,_,S2,S1,S1,S1,S1,S1,A2,A2,_,_,_,_',
        '_,_,_,_,S2,S1,EY,S1,S1,A2,A2,A2,_,_,_,_',
        '_,_,_,_,S2,S1,S1,S1,S1,A2,A2,A2,_,_,_,_',
        '_,_,_,_,S2,S1,S1,S1,S1,S1,A2,_,_,_,_,_',
        '_,_,_,_,S2,S1,S1,S1,S1,S1,_,_,_,_,_,_',
        '_,_,_,_,_,H1,H1,H1,H1,H1,_,_,_,_,_,_',
        '_,_,_,_,_,H2,H1,H1,H2,H2,S1,_,_,_,_,_',
        '_,_,_,_,_,S1,H2,H1,H1,H2,H2,S1,_,_,_,_',
        '_,_,_,_,_,S1,P1,P2,P1,P1,H2,_,_,_,_,_',
        '_,_,_,_,_,_,P1,P2,P1,P1,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_P2,P2,P2,P2,_,_,_,_,_,_',
        '_,_,_,_,_,_,P2,P2,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T1,T1,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,T2,T2,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_', '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    DOG_LEFT: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,D2,D1,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,D2,D1,D1,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,D1,EY,D1,D1,_,_,_,_,_,_',
        '_,_,_,_,_,_,D1,D1,D1,EY,_,_,_,_,_,_',
        '_,_,_,_,D2,D1,D1,D2,D2,_,_,_,_,_,_',
        '_,_,_,D1,D1,D1,D1,D1,D1,D1,D2,_,_,_,_',
        '_,_,D1,D1,D1,D1,D1,D1,D1,D1,D2,D2,_,_,_',
        '_,_,D1,D1,D1,D1,D1,D1,D1,D1,D1,D2,D2,_,_',
        '_,_,D1,D1,_,_,_,D1,D1,_,D1,D1,_,_,_,_',
        '_,_,D1,_,_,_,_,D2,_,_,D2,_,_,_,_,_',
        '_,_,D2,_,_,_,_,D2,_,_,D2,_,_,_,_,_',
        '_,_,D2,_,_,_,_,D2,_,_,D2,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ],
    DOG_RIGHT: [
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,_,D1,D2,_,_,_,_,_,_',
        '_,_,_,_,_,_,_,D1,D1,D2,_,_,_,_,_,_',
        '_,_,_,_,_,D1,D1,EY,D1,_,_,_,_,_,_,_',
        '_,_,_,_,_,EY,D1,D1,D1,_,_,_,_,_,_,_',
        '_,_,_,_,_,_,D2,D2,D1,D1,D2,_,_,_,_,_',
        '_,_,_,_,D2,D1,D1,D1,D1,D1,D1,D1,_,_,_',
        '_,_,_,D2,D2,D1,D1,D1,D1,D1,D1,D1,D1,_,_',
        '_,_,D2,D2,D1,D1,D1,D1,D1,D1,D1,D1,D1,_,_',
        '_,_,_,_,D1,D1,_,D1,D1,_,_,_,D1,D1,_,_',
        '_,_,_,_,_,D2,_,_,D2,_,_,_,_,D1,_,_',
        '_,_,_,_,_,D2,_,_,D2,_,_,_,_,D2,_,_',
        '_,_,_,_,_,D2,_,_,D2,_,_,_,_,D2,_,_',
        '_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_'
    ]
};

class SpriteManager {
    constructor() {
        this.cache = {}; // key: string, value: root canvas
    }

    getSprite(key, matrix, width, height, scale) {
        if (!this.cache[key]) {
            this.cache[key] = this.buildSprite(matrix, width, height, scale);
        }
        return this.cache[key];
    }

    buildSprite(data, w, h, scale) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = w * scale;
        offCanvas.height = h * scale;
        const octx = offCanvas.getContext('2d');

        for (let y = 0; y < h; y++) {
            const row = data[y].split(',');
            for (let x = 0; x < w; x++) {
                const colorKey = row[x];
                if (colorKey !== '_') {
                    octx.fillStyle = P[colorKey];
                    octx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }
        return offCanvas;
    }
}
const sprites = new SpriteManager();

// --- Input Handling ---
const keys = {};
let moving = false;
let animTimer = 0;
let animFrame = 1;

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

// UI Tools
let activeTool = 0; // 0=Axe, 1=Pickaxe, 2=Hoe, 3=Seeds, 4=Can, 5=Fence, 6=Path
const slots = document.querySelectorAll('.slot');
window.addEventListener('keydown', e => {
    if (e.code === 'Digit1') setTool(0);
    if (e.code === 'Digit2') setTool(1);
    if (e.code === 'Digit3') setTool(2);
    if (e.code === 'Digit4') setTool(3);
    if (e.code === 'Digit5') setTool(4);
    if (e.code === 'Digit6') setTool(5);
    if (e.code === 'Digit7') setTool(6);
});
function setTool(index) {
    activeTool = index;
    slots.forEach((s, i) => s.classList.toggle('active', i === index));
}

// --- Inventory ---
let inventory = { wood: 0, stone: 0, turnip: 0 };
const invTurnipEl = document.getElementById('inv-turnip');
const invWoodEl = document.getElementById('inv-wood');
const invStoneEl = document.getElementById('inv-stone');

function addInventory(type, amount) {
    if (type === 'wood') {
        inventory.wood += amount;
        invWoodEl.innerText = inventory.wood;
    } else if (type === 'stone') {
        inventory.stone += amount;
        invStoneEl.innerText = inventory.stone;
    } else if (type === 'turnip') {
        inventory.turnip += amount;
        if (invTurnipEl) invTurnipEl.innerText = inventory.turnip;
    }
}

let activeCrops = []; // Track active crops {x, y, plantTime}
let wateredTiles = new Set(); // Track tiles watered today. Stores "x,y" string

// --- Entities & Camera ---
class Player {
    constructor(x, y) {
        this.x = x * TILE_SIZE;
        this.y = y * TILE_SIZE;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE * 2; // 16x32 aspect ratio
        this.speed = 4;
        this.facing = 'DOWN'; // UP, DOWN, LEFT, RIGHT
    }

    update() {
        let dx = 0;
        let dy = 0;
        moving = false;

        if (keys['KeyW'] || keys['ArrowUp']) { dy = -this.speed; this.facing = 'UP'; moving = true; }
        if (keys['KeyS'] || keys['ArrowDown']) { dy = this.speed; this.facing = 'DOWN'; moving = true; }
        if (keys['KeyA'] || keys['ArrowLeft']) { dx = -this.speed; this.facing = 'LEFT'; moving = true; }
        if (keys['KeyD'] || keys['ArrowRight']) { dx = this.speed; this.facing = 'RIGHT'; moving = true; }

        if (moving) {
            animTimer++;
            if (animTimer > 10) {
                animFrame = animFrame === 1 ? 2 : 1;
                animTimer = 0;
            }
        } else {
            animFrame = 1; // Default to standing still
        }

        // Attempt movement (collision box is bottom half of player)
        if (dx !== 0) {
            this.x += dx;
            if (this.checkCollision()) this.x -= dx;
        }
        if (dy !== 0) {
            this.y += dy;
            if (this.checkCollision()) this.y -= dy;
        }
    }

    checkCollision() {
        // Simple bounding box vs tile grid representing feet
        let leftTile = Math.floor((this.x + 16) / TILE_SIZE);
        let rightTile = Math.floor((this.x + this.width - 16) / TILE_SIZE);
        let topTile = Math.floor((this.y + TILE_SIZE) / TILE_SIZE); // Bottom half only
        let bottomTile = Math.floor((this.y + this.height) / TILE_SIZE);

        for (let y = topTile; y <= bottomTile; y++) {
            for (let x = leftTile; x <= rightTile; x++) {
                if (x < 0 || y < 0 || x >= MAP_WIDTH || y >= MAP_HEIGHT) return true; // World bounds
                if (SOLID_TILES.includes(map[y][x])) return true;
            }
        }
        return false;
    }

    draw(ctx, camX, camY) {
        // Draw Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        // Lower shadow so it's directly at feet (pixel 80 of the 128 height, rather than bottom)
        ctx.ellipse(this.x - camX + this.width / 2, this.y - camY + 80, this.width / 2.5, this.width / 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stamping Pixel Matrix Player File
        let spriteKey = `PLAYER_${this.facing}_${animFrame}`;
        let pSprite = sprites.getSprite(spriteKey, SPRITE_DATA[spriteKey], 16, 32, 4); // 4x scaling
        ctx.drawImage(pSprite, this.x - camX, this.y - camY);
    }

    // Returns the grid coordinate directly in front of the player
    getFacingTile() {
        // Center of collision box
        let cx = this.x + this.width / 2;
        let cy = this.y + this.height - (TILE_SIZE / 2);
        let offset = TILE_SIZE;

        if (this.facing === 'UP') cy -= offset;
        if (this.facing === 'DOWN') cy += offset;
        if (this.facing === 'LEFT') cx -= offset;
        if (this.facing === 'RIGHT') cx += offset;

        return {
            x: Math.floor(cx / TILE_SIZE),
            y: Math.floor(cy / TILE_SIZE)
        };
    }
}

const player = new Player(Math.floor(MAP_WIDTH / 2), Math.floor(MAP_HEIGHT / 2));

class Dog {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 64;
        this.height = 64;
        this.facing = 'LEFT';
        this.speed = 2.0;
        this.targetX = x;
        this.targetY = y;
        this.pauseTimer = 0;
    }

    update(px, py) {
        if (this.pauseTimer > 0) {
            this.pauseTimer -= 16; // Assuming 60fps, so 16ms per frame
            return;
        }

        let dx = this.targetX - this.x;
        let dy = this.targetY - this.y;
        let dist = Math.hypot(dx, dy);
        let distToPlayer = Math.hypot(px - this.x, py - this.y);

        if (dist < 5 || distToPlayer > 800) {
            this.pauseTimer = 500 + Math.random() * 2000;
            // Pick a new target near the player (radius 80 to 200)
            let r = 80 + Math.random() * 120;
            let angle = Math.random() * Math.PI * 2;
            this.targetX = px + Math.cos(angle) * r;
            this.targetY = py + Math.sin(angle) * r;

            // Constrain
            this.targetX = Math.max(0, Math.min(this.targetX, MAP_WIDTH * TILE_SIZE - this.width));
            this.targetY = Math.max(0, Math.min(this.targetY, MAP_HEIGHT * TILE_SIZE - this.height));

            // Recalculate dx, dy right away if we broke out due to player distance
            dx = this.targetX - this.x;
            dy = this.targetY - this.y;
            dist = Math.hypot(dx, dy);
            if (dist < 5) return;
        }

        let vx = (dx / dist) * this.speed;
        let vy = (dy / dist) * this.speed;

        this.x += vx;
        this.y += vy;

        if (vx > 0.5) this.facing = 'RIGHT';
        else if (vx < -0.5) this.facing = 'LEFT';
    }

    draw(ctx, camX, camY) {
        let drawX = Math.floor(this.x - camX);
        let drawY = Math.floor(this.y - camY);

        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(drawX + this.width / 2, drawY + 60, this.width / 3, this.width / 8, 0, 0, Math.PI * 2);
        ctx.fill();

        let matrix = this.facing === 'LEFT' ? SPRITE_DATA.DOG_LEFT : SPRITE_DATA.DOG_RIGHT;
        let sprite = sprites.getSprite('DOG_' + this.facing, matrix, 16, 16, 4);
        ctx.drawImage(sprite, drawX, drawY);
    }
}

const dog = new Dog(player.x + 50, player.y + 50); // Instantiate the dog near the player

const camera = {
    x: 0,
    y: 0,
    update() {
        // Center camera on player
        this.x = player.x + player.width / 2 - canvas.width / 2;
        this.y = player.y + player.height / 2 - canvas.height / 2;

        // Clamp to map edges
        this.x = Math.max(0, Math.min(this.x, MAP_WIDTH * TILE_SIZE - canvas.width));
        this.y = Math.max(0, Math.min(this.y, MAP_HEIGHT * TILE_SIZE - canvas.height));
    }
};

// --- Interactions ---
window.addEventListener('mousedown', e => {
    // Left click to interact
    if (e.button === 0) {
        interact();
    }
});

window.addEventListener('keydown', e => {
    if (e.code === 'Space') {
        interact();
    }
});

function interact() {
    const targetTile = player.getFacingTile();
    if (targetTile.x < 0 || targetTile.x >= MAP_WIDTH || targetTile.y < 0 || targetTile.y >= MAP_HEIGHT) return;

    let tileType = map[targetTile.y][targetTile.x];

    // Helper: scan a 2x2 area around a target coordinate to see if we hit a large object.
    const findLargeObject = (type, tx, ty) => {
        for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
                if (ty + oy >= 0 && ty + oy < MAP_HEIGHT && tx + ox >= 0 && tx + ox < MAP_WIDTH) {
                    if (map[ty + oy][tx + ox] === type) return { x: tx + ox, y: ty + oy };
                }
            }
        }
        return null; // Not found Let's just check 2x2 explicitly
    };

    // Helper: Explicit 2x2 check considering tree's top-left origin
    const findTree = (tx, ty) => {
        let pts = [{ x: tx, y: ty }, { x: tx - 1, y: ty }, { x: tx, y: ty - 1 }, { x: tx - 1, y: ty - 1 }];
        for (let p of pts) {
            if (p.x >= 0 && p.x < MAP_WIDTH && p.y >= 0 && p.y < MAP_HEIGHT) {
                if (map[p.y][p.x] === TILES.TREE) return p;
            }
        }
        return null;
    };

    // Helper: Explicit 2x2 check for rocks
    const findRock = (tx, ty) => {
        let pts = [{ x: tx, y: ty }, { x: tx - 1, y: ty }, { x: tx, y: ty - 1 }, { x: tx - 1, y: ty - 1 }];
        for (let p of pts) {
            if (p.x >= 0 && p.x < MAP_WIDTH && p.y >= 0 && p.y < MAP_HEIGHT) {
                if (map[p.y][p.x] === TILES.ROCK) return p;
            }
        }
        return null;
    };

    // Harvest Turnips
    if (tileType === TILES.CROP_READY) {
        map[targetTile.y][targetTile.x] = TILES.DIRT;
        addInventory('turnip', 1);
        return;
    }

    // Axe (0) works on Trees (2) and Fences (8)
    if (activeTool === 0) {
        if (tileType === TILES.FENCE) {
            map[targetTile.y][targetTile.x] = TILES.GRASS;
            addInventory('wood', 1);
        } else {
            let treePoint = findTree(targetTile.x, targetTile.y);
            if (treePoint) {
                map[treePoint.y][treePoint.x] = TILES.GRASS;
                addInventory('wood', 1);
            }
        }
    }
    // Pickaxe (1) works on Rocks (3) and Paths (9)
    else if (activeTool === 1) {
        if (tileType === TILES.PATH) {
            map[targetTile.y][targetTile.x] = TILES.GRASS;
            addInventory('stone', 1);
        } else {
            let rockPoint = findRock(targetTile.x, targetTile.y);
            if (rockPoint) {
                map[rockPoint.y][rockPoint.x] = TILES.GRASS;
                addInventory('stone', 1);
            }
        }
    }
    // Hoe (2) works on Grass (0) or Dirt (4)
    else if (activeTool === 2) {
        if (tileType === TILES.GRASS) {
            map[targetTile.y][targetTile.x] = TILES.DIRT;
        } else if (tileType === TILES.DIRT) {
            map[targetTile.y][targetTile.x] = TILES.GRASS; // Untill
            wateredTiles.delete(`${targetTile.x},${targetTile.y}`);
        }
    }
    // Seeds (3) works on Dirt (4)
    else if (activeTool === 3 && tileType === TILES.DIRT) {
        map[targetTile.y][targetTile.x] = TILES.SEEDS;
        activeCrops.push({ x: targetTile.x, y: targetTile.y, age: 0 }); // Use age explicitly
    }
    // Watering Can (4) works on Dirt and Crops
    else if (activeTool === 4 && (tileType === TILES.DIRT || tileType >= TILES.SEEDS)) {
        wateredTiles.add(`${targetTile.x},${targetTile.y}`);
    }
    // Fence (5) works on Grass or Dirt, costs 1 Wood
    else if (activeTool === 5 && (tileType === TILES.GRASS || tileType === TILES.DIRT) && inventory.wood > 0) {
        map[targetTile.y][targetTile.x] = TILES.FENCE;
        inventory.wood--;
        invWoodEl.innerText = inventory.wood;
    }
    // Path (6) works on Grass or Dirt, costs 1 Stone
    else if (activeTool === 6 && (tileType === TILES.GRASS || tileType === TILES.DIRT) && inventory.stone > 0) {
        map[targetTile.y][targetTile.x] = TILES.PATH;
        inventory.stone--;
        invStoneEl.innerText = inventory.stone;
    }
}

// --- Drawing ---
function drawTile(tileType, drawX, drawY, c, r) {
    if (tileType === TILES.WATER) {
        let wSprite = sprites.getSprite(TILES.WATER, SPRITE_DATA[TILES.WATER], 16, 16, 4);
        ctx.drawImage(wSprite, drawX, drawY);
        return;
    }

    // Everything sits on Grass
    let gSprite = sprites.getSprite(TILES.GRASS, SPRITE_DATA[TILES.GRASS], 16, 16, 4);
    ctx.drawImage(gSprite, drawX, drawY);

    let isCropOrDirt = tileType === TILES.DIRT || (tileType >= TILES.SEEDS && tileType <= TILES.CROP_READY);
    if (isCropOrDirt || tileType === TILES.FENCE || tileType === TILES.PATH) {
        let isWatered = wateredTiles.has(`${drawX / TILE_SIZE + camera.x / TILE_SIZE},${drawY / TILE_SIZE + camera.y / TILE_SIZE}`);
        if (c !== undefined && r !== undefined) isWatered = wateredTiles.has(`${c},${r}`);

        if (isCropOrDirt) {
            let dSprite = sprites.getSprite(TILES.DIRT, SPRITE_DATA[TILES.DIRT], 16, 16, 4);
            ctx.drawImage(dSprite, drawX, drawY);
            if (isWatered) {
                // Richer soil color overlay for wet dirt
                ctx.fillStyle = 'rgba(60, 20, 0, 0.25)';
                ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
            }
        }

        if (tileType === TILES.SEEDS) {
            let sSprite = sprites.getSprite(TILES.SEEDS, SPRITE_DATA[TILES.SEEDS], 16, 16, 4);
            ctx.drawImage(sSprite, drawX, drawY);
        } else if (tileType === TILES.CROP_GROWING) {
            let cSprite = sprites.getSprite(TILES.CROP_GROWING, SPRITE_DATA[TILES.CROP_GROWING], 16, 16, 4);
            ctx.drawImage(cSprite, drawX, drawY);
        } else if (tileType === TILES.CROP_READY) {
            let rSprite = sprites.getSprite(TILES.CROP_READY, SPRITE_DATA[TILES.CROP_READY], 16, 16, 4);
            ctx.drawImage(rSprite, drawX, drawY);
        } else if (tileType === TILES.FENCE) {
            let isVertical = false;
            if (c !== undefined && r !== undefined) {
                let fenceUp = r > 0 && map[r - 1][c] === TILES.FENCE;
                let fenceDown = r < MAP_HEIGHT - 1 && map[r + 1][c] === TILES.FENCE;
                let fenceLeft = c > 0 && map[r][c - 1] === TILES.FENCE;
                let fenceRight = c < MAP_WIDTH - 1 && map[r][c + 1] === TILES.FENCE;
                if ((fenceUp || fenceDown) && !fenceLeft && !fenceRight) {
                    isVertical = true;
                }
            }
            let spriteKey = isVertical ? 'FENCE_VERTICAL' : TILES.FENCE;
            let fSprite = sprites.getSprite(spriteKey, SPRITE_DATA[spriteKey] || SPRITE_DATA[TILES.FENCE], 16, 16, 4);
            ctx.drawImage(fSprite, drawX, drawY);
        } else if (tileType === TILES.PATH) {
            let pSprite = sprites.getSprite(TILES.PATH, SPRITE_DATA[TILES.PATH], 16, 16, 4);
            ctx.drawImage(pSprite, drawX, drawY);
        }
    }
    else if (tileType === TILES.TREE) {
        let tSprite = sprites.getSprite(TILES.TREE, SPRITE_DATA[TILES.TREE], 16, 32, 4);
        // Shadow closer to the trunk base instead of far below
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(drawX + TILE_SIZE / 2, drawY + 46, TILE_SIZE * .35, TILE_SIZE * .15, 0, 0, Math.PI * 2);
        ctx.fill();
        // Trees overhang the tile above them, so render Y is shifted!
        ctx.drawImage(tSprite, drawX, drawY - TILE_SIZE);
    }
    else if (tileType === TILES.ROCK) {
        let rSprite = sprites.getSprite(TILES.ROCK, SPRITE_DATA[TILES.ROCK], 16, 16, 4);
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(drawX + TILE_SIZE / 2, drawY + TILE_SIZE - 8, TILE_SIZE * .35, TILE_SIZE * .15, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.drawImage(rSprite, drawX, drawY);
    }
}

let lastTime = 0;
let lastAutoWater = 0;

function gameLoop(timestamp) {
    player.update();
    dog.update(player.x, player.y); // Update dog's position
    camera.update();

    let now = Date.now();
    let delta = now - lastTime;
    if (lastTime === 0 || delta > 100) delta = 16; // Prevent massive jumps
    lastTime = now;

    // Auto-water soil adjacent to water every 2 seconds
    if (now - lastAutoWater > 2000) {
        lastAutoWater = now;
        let newWatered = new Set();

        // Scan the map for DIRT or CROPS adjacent to WATER
        for (let r = 0; r < MAP_HEIGHT; r++) {
            for (let c = 0; c < MAP_WIDTH; c++) {
                let t = map[r][c];
                if (t === TILES.DIRT || (t >= TILES.SEEDS && t <= TILES.CROP_READY)) {
                    // Check neighbors
                    let watered = false;
                    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    for (let [dy, dx] of dirs) {
                        let ny = r + dy, nx = c + dx;
                        if (ny >= 0 && nx >= 0 && ny < MAP_HEIGHT && nx < MAP_WIDTH) {
                            if (map[ny][nx] === TILES.WATER) {
                                watered = true;
                                break;
                            }
                        }
                    }
                    if (watered) {
                        newWatered.add(`${c},${r}`);
                    }
                }
            }
        }

        // Merge into wateredTiles
        for (let tile of newWatered) {
            wateredTiles.add(tile);
        }
    }

    for (let crop of activeCrops) {
        // Handle migration from old 'plantTime' format just in case
        if (crop.age === undefined) crop.age = now - (crop.plantTime || now);

        let cType = map[crop.y][crop.x];
        let isWatered = wateredTiles.has(`${crop.x},${crop.y}`);

        // Only explicitly increase crop age when the tile is watered
        if (isWatered) {
            crop.age += delta;
            if (crop.age > 4000 && cType === TILES.SEEDS) {
                map[crop.y][crop.x] = TILES.CROP_GROWING;
            } else if (crop.age > 10000 && cType === TILES.CROP_GROWING) {
                map[crop.y][crop.x] = TILES.CROP_READY;
            }
        }
    }
    // Cleanup activeCrops if harvested or un-tilled
    activeCrops = activeCrops.filter(crop => map[crop.y][crop.x] >= TILES.SEEDS && map[crop.y][crop.x] <= TILES.CROP_READY);

    // Clear screen
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate visible tile range
    let startCol = Math.floor(camera.x / TILE_SIZE);
    let endCol = startCol + (canvas.width / TILE_SIZE) + 1;
    let startRow = Math.floor(camera.y / TILE_SIZE);
    let endRow = startRow + (canvas.height / TILE_SIZE) + 1;

    // Draw Map
    for (let r = startRow; r <= endRow; r++) {
        for (let c = startCol; c <= endCol; c++) {
            if (c >= 0 && c < MAP_WIDTH && r >= 0 && r < MAP_HEIGHT) {
                let tileType = map[r][c];
                let drawX = (c * TILE_SIZE) - camera.x;
                let drawY = (r * TILE_SIZE) - camera.y;

                // Draw tile
                drawTile(tileType, drawX, drawY, c, r);

                // Draw interaction highlight if in front of player
                let faceTarget = player.getFacingTile();
                if (c === faceTarget.x && r === faceTarget.y) {
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
                }
            }
        }
    }

    // Draw Entities
    player.draw(ctx, camera.x, camera.y);

    // Draw Dog
    dog.draw(ctx, camera.x, camera.y);

    requestAnimationFrame(gameLoop);
}

// Start
requestAnimationFrame(gameLoop);
