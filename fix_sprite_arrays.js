const fs = require('fs');
const file = 'C:/Users/Jonathan/.gemini/antigravity/scratch/stardew_clone/game.js';
let content = fs.readFileSync(file, 'utf8');

let newContent = content.replace(/'([^']*)'/g, function (match, inner) {
    if (!inner.includes(',')) return match;
    let parts = inner.split(',');

    // Check if this looks like a sprite data string (lots of _ or standard keys)
    // Avoid hitting rgba(0,0,0,0.3) strings
    if (parts.length > 5 && (parts.includes('_') || parts.includes('G1') || parts.includes('P2') || parts.includes('S1'))) {
        if (parts.length < 16) {
            while (parts.length < 16) parts.push('_');
            return "'" + parts.join(',') + "'";
        } else if (parts.length > 16) {
            return "'" + parts.slice(0, 16).join(',') + "'";
        }
    }
    return match;
});

fs.writeFileSync(file, newContent);
console.log('Fixed array lengths!');
