const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// 相対パス設定：script/bin に配置することを想定
const ROOT = path.join(__dirname, '..', '..');
const inputDir = path.join(ROOT, 'input');
const outputDir = path.join(ROOT, 'output');

const TEST_OPS_AREA = { left: 530, top: 54, width: 680, height: 880 };
const IGNORE_PHRASE = "アップリンクの機能を復旧し、敵の行動を監視して敵対勢力をすべて排除しろ！";

async function checkOpsOCR() {
    console.log(">> オプス文字認識・精密診断を開始...");
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    if (files.length === 0) return;
    
    const targetFile = files[0];
    const fullPath = path.join(inputDir, targetFile);

    try {
        const cropBuf = await sharp(fullPath).extract(TEST_OPS_AREA).toBuffer();
        await sharp(cropBuf).toFile(path.join(outputDir, 'val_ops_vision.png'));

        const { data: { text } } = await Tesseract.recognize(cropBuf, 'jpn');
        let cleanText = text.replace(/\s+/g, "");
        const cleanIgnorePhrase = IGNORE_PHRASE.replace(/\s+/g, "");
        const finalInfo = cleanText.replace(cleanIgnorePhrase, "");

        console.log(`\n-----------------------------------------`);
        console.log(`【抽出された純粋な情報】\n${finalInfo}`); 
        console.log(`-----------------------------------------`);
    } catch (err) {
        console.error(`error: ${err.message}`);
    }
}
checkOpsOCR();