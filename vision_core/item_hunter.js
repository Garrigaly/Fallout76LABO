const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const inputDir = path.join(ROOT, 'input');
const outputDir = path.join(ROOT, 'output');

const TILE = { left: 245, top: 215, width: 335, height: 460 }; 

async function analyzeTiles(imagePath) {
    for (let i = 0; i < 3; i++) {
        const xOffset = i * 345;
        const tilePath = path.join(outputDir, `tile_${i}.png`);
        await sharp(imagePath)
            .extract({ left: TILE.left + xOffset, top: TILE.top, width: TILE.width, height: TILE.height })
            .toFile(tilePath);
        // ...ピクセル判定ロジック...
        console.log(`   ┗ タイル ${i} 保存完了`);
    }
}