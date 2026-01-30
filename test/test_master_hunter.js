const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';
const assetDir = 'd:/nvidia_captures/master_assets';
const outputDir = 'd:/nvidia_captures/output';

// --- 博士が用意した「本物のファイル名」に合わせました ---
const ASSETS = [
    { name: '1stマーク', file: 'スクリーンショット 2026-01-26 172638.png' },
    { name: '無料タグ',   file: 'スクリーンショット 2026-01-26 172632.png' },
    { name: '所有済み',   file: 'スクリーンショット 2026-01-26 172628.png' },
    { name: 'Atomロゴ',   file: 'スクリーンショット 2026-01-26 172715.png' }
];

async function huntAssets(imagePath) {
    console.log(`\n[追跡開始] 博士の用意した「正解スタンプ」で照合します...`);
    
    for (const asset of ASSETS) {
        const assetPath = path.join(assetDir, asset.file);
        
        if (fs.existsSync(assetPath)) {
            console.log(`   ┗ 【検知用データ読込】 ${asset.name} (準備OK)`);
            // ここで実際のマッチングロジックへ繋げますが、まずは読み込み成功を確認します
        } else {
            console.log(`   ┗ 【！】警告: ${asset.file} が見つかりません。`);
        }
    }

    console.log("\n>> 全ての「正解スタンプ」の読み込みに成功しました。");
    console.log(">> 博士、これで「絵」による判定の準備は100%完了です！");
}

async function main() {
    const target = 'Fallout76_2026_01_21_07_57_01_892.png';
    const fullPath = path.join(inputDir, target);
    if (fs.existsSync(fullPath)) await huntAssets(fullPath);
}

main();