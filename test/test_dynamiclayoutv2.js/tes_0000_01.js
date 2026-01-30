const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';
const outputDir = 'd:/nvidia_captures/output';

// --- 【Version 2：下段・小さな目】 ---
// WQHD基準（2560x1440）で下段エリアを射程に収めます
const SMALL_EYE = {
    left: 580,   // 横位置はV1と共通
    top: 940,    // 大タイルのすぐ下から開始
    width: 1950, // 6枚前後の小タイルをすべて横断する幅
    height: 340  // 下段の商品名と価格・タグをカバー
};

async function scanSmallEye(imagePath) {
    const fileName = path.basename(imagePath);
    console.log(`\n[V2スキャン開始] WQHD下段の「小さな目」で診察します: ${fileName}`);

    try {
        const eyePath = path.join(outputDir, 'small_eye_view.png');

        // 1. 下段エリアを抽出して「 small_eye_view.png 」を生成
        await sharp(imagePath)
            .extract(SMALL_EYE)
            .toFile(eyePath);
        
        console.log(`   ┗ 【視界確定】 small_eye_view.png を保存しました。`);

        // 2. 文字解析（下段の文字サイズを計測）
        const { data } = await Tesseract.recognize(eyePath, 'eng');

        console.log("\n--------------------------------------------------");
        console.log("  文字の高さ | 座標(y) | 下段テキスト内容 (eng)");
        console.log("--------------------------------------------------");

        if (data && data.words) {
            data.words.forEach(word => {
                const text = word.text.trim();
                const height = word.bbox.y1 - word.bbox.y0;
                
                // 2文字以上の意味のある断片だけを表示
                if (text.length >= 2 && word.confidence > 40) {
                    // WQHDの小枠における商品名と詳細の「境界線」を炙り出します
                    let label = height > 28 ? "【小枠：商品名】" : "【小枠：詳細】";
                    console.log(`  ${label} ${height}px | y:${word.bbox.y0} | ${text}`);
                }
            });
        }

    } catch (err) {
        console.error(`   ┗ 【エラー】${err.message}`);
    }
}

async function main() {
    // 臨床試験のターゲット画像
    const target = 'Fallout76_2026_01_21_07_57_01_892.png';
    const fullPath = path.join(inputDir, target);

    if (fs.existsSync(fullPath)) {
        await scanSmallEye(fullPath);
    } else {
        console.log(`error: ${target} が見つかりません。`);
    }
}

main();