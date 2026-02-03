const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const inputDir = path.join(ROOT, 'input');
const outputDir = path.join(ROOT, 'output');

const TEST_DAILY_AREA = { left: 200, top: 400, width: 410, height: 600 };
const MASTER_LIST = ["デイリー", "ウィークリー", "キャラクター", "サバイバル", "コンバット", "ソーシャル", "アパラチア"];

async function checkDailyOCR() {
    console.log(">> 整合性チェック：カテゴリー識別を開始...");
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    if (files.length === 0) return;
    
    const targetFile = files[0];
    const fullPath = path.join(inputDir, targetFile);

    try {
        const cropBuf = await sharp(fullPath).extract(TEST_DAILY_AREA).toBuffer();
        await sharp(cropBuf).toFile(path.join(outputDir, 'val_daily_vision.png'));

        const { data: { text } } = await Tesseract.recognize(cropBuf, 'jpn');
        const cleanRawText = text.replace(/\s+/g, "");
        const matches = MASTER_LIST.filter(word => cleanRawText.includes(word));

        console.log(`\n【確定項目】\n${matches.length > 0 ? matches.join('\n') : "未検知"}`);
    } catch (err) {
        console.error(`error: ${err.message}`);
    }
}
checkDailyOCR();