const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';
const outputDir = 'd:/nvidia_captures/output';

// アトムショップの1枚目の枠（ハートのキング等がある場所）を正確に狙う
const TILE = { left: 245, top: 215, width: 335, height: 460 }; 

async function analyzeAndSave(imagePath) {
    console.log(`\n[診察開始] ${path.basename(imagePath)}`);

    for (let i = 0; i < 3; i++) {
        const xOffset = i * 345; // 横に3つ並んでいるタイルを順番に診る
        const tilePath = path.join(outputDir, `tile_${i}.png`);

        // 1. まずタイルを切り抜いて保存（これでお互いに何を見ているか確認できます）
        await sharp(imagePath)
            .extract({ left: TILE.left + xOffset, top: TILE.top, width: TILE.width, height: TILE.height })
            .toFile(tilePath);

        // 2. 文字認識（エラー回避のため、英語のみで一旦テスト）
        const { data: { text } } = await Tesseract.recognize(tilePath, 'eng');
        
        // 3. 判定（1stアイコンの有無をピクセルで診る）
        // ※右上の100x100エリアに「白」が集中しているか
        const { data: pixels } = await sharp(tilePath)
            .extract({ left: 235, top: 0, width: 100, height: 100 })
            .raw().toBuffer({ resolveWithObject: true });
        
        let whiteCount = 0;
        for (let j = 0; j < pixels.length; j += 3) {
            if (pixels[j] > 200 && pixels[j+1] > 200 && pixels[j+2] > 200) whiteCount++;
        }

        const isFirst = whiteCount > 100; // 100ピクセル以上白ければ1stとみなす
        const type = isFirst ? "【1st特典】" : "【一般枠】";

        console.log(`   ┗ タイル ${i}: ${type} を検知 (白ピクセル: ${whiteCount})`);
    }
}

async function main() {
    const files = fs.readdirSync(inputDir).filter(f => f.includes('07_57_01_892'));
    if (files.length === 0) return console.log("対象のショップ画像が見つかりません。");
    await analyzeAndSave(path.join(inputDir, files[0]));
    console.log("\n>> 完了。outputフォルダに tile_0, 1, 2 が書き出されているはずです！");
}

main();