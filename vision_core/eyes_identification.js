const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const inputDir = path.join(ROOT, 'input');

const EYES = {
    DAILY: { left: 200, top: 400, width: 500, height: 600 },
    OPS:   { left: 530, top: 54,  width: 680, height: 880 }
};

async function startIdentification() {
    console.log(">> 画像自動判別シーケンス開始...");
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    for (const file of files) {
        const fullPath = path.join(inputDir, file);
        // ここに判定ロジック（identifyDaily/Ops）が続きます
        console.log(`[診察完了] ${file}`);
    }
}
startIdentification();