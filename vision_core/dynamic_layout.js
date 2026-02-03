const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const inputDir = path.join(ROOT, 'input');
const outputDir = path.join(ROOT, 'output');

const BIG_EYE = { left: 580, top: 280, width: 1950, height: 655 };

async function huntWithBigEye(imagePath) {
    console.log(`\n[診察] WQHD大いなる目: ${path.basename(imagePath)}`);
    try {
        const eyePath = path.join(outputDir, 'big_eye_view.png');
        await sharp(imagePath).extract(BIG_EYE).toFile(eyePath);
        
        const { data } = await Tesseract.recognize(eyePath, 'eng');
        if (data && data.words) {
            data.words.forEach(word => {
                const height = word.bbox.y1 - word.bbox.y0;
                if (word.text.length >= 2 && word.confidence > 40) {
                    let label = height > 35 ? "【商品名】" : "【詳細】";
                    console.log(`${label} ${height}px | ${word.text}`);
                }
            });
        }
    } catch (err) {
        console.error(`error: ${err.message}`);
    }
}
// 実行部分は最新のファイル構成に合わせて調整