//HDの画像をデイリーチャレンジの画像をくりぬく
//WQHDの画像もできるように拡大処理を追加する必要がある
// [2026-02-03] Relative Path Edition
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ルートとディレクトリの設定
const ROOT = path.join(__dirname, '..', '..');
const inputDir = path.join(ROOT, 'input');
const outputDir = path.join(ROOT, 'output');

// 1月27日に博士が確定させた「デイリーチャレンジの座標を切り抜く」
const CHALLENGE_AREA = {
    left: 194,
    top: 405,
    width: 440,
    height: 575
};

async function extractChallenges() {
    console.log(">> チャレンジエリアの一括切り抜きを開始...");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    
    for (const file of files) {
        const fullPath = path.join(inputDir, file);
        const outPath = path.join(outputDir, `extracted_${file}`);

        try {
            await sharp(fullPath)
                .extract(CHALLENGE_AREA)
                .toFile(outPath);
            console.log(` ✅ 保存完了: ${file}`);
        } catch (err) {
            console.error(` ❌ エラー (${file}): ${err.message}`);
        }
    }
    console.log("\n>> 全工程完了。outputフォルダを確認してください。");
}

extractChallenges();