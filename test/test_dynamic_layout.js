const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';
const outputDir = 'd:/nvidia_captures/output';

// --- WQHD（2560x1440）専用：第一の大きな目 ---
const BIG_EYE = {
    left: 580,   // 左メニューを回避
    top: 280,    // 上部タブを回避
    width: 1950, // 右端のタイルまでカバー（2560pxの幅があるからこそ可能な数値）
    height: 655  // 上段の大タイルを深く診る
};

async function huntWithBigEye(imagePath) {
    const fileName = path.basename(imagePath);
    console.log(`\n[スキャン開始] WQHD専用・大いなる目で診察: ${fileName}`);

    try {
        const eyePath = path.join(outputDir, 'big_eye_view.png');

        // WQHDのキャンバスから理想の範囲を抽出
        await sharp(imagePath)
            .extract(BIG_EYE)
            .toFile(eyePath);
        
        console.log(`   ┗ 【視界確定】 big_eye_view.png を保存しました。`);

        // 文字解析の実行
        const { data } = await Tesseract.recognize(eyePath, 'eng');

        console.log("\n--------------------------------------------------");
        console.log("  文字の高さ | 座標(y) | テキスト内容");
        console.log("--------------------------------------------------");

        if (data && data.words) {
            data.words.forEach(word => {
                const text = word.text.trim();
                const height = word.bbox.y1 - word.bbox.y0;
                if (text.length >= 2 && word.confidence > 40) {
                    let label = height > 35 ? "【大：商品名】" : "【小：詳細】";
                    console.log(`  ${label} ${height}px  | y:${word.bbox.y0} | ${text}`);
                }
            });
        }
    } catch (err) {
        console.error(`   ┗ 【エラー】WQHD画像ではない可能性があります: ${err.message}`);
    }
}

async function main() {
    const target = 'Fallout76_2026_01_21_07_57_01_892.png';
    const fullPath = path.join(inputDir, target);
    if (fs.existsSync(fullPath)) await huntWithBigEye(fullPath);
}

main();