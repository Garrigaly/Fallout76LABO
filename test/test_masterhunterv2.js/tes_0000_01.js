const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
// 修正ポイント：pixelmatchの読み込み方を確実にしました
const pixelmatch = require('pixelmatch'); 
const { PNG } = require('pngjs');

const inputDir = 'd:/nvidia_captures/input';
const assetDir = 'd:/nvidia_captures/master_assets';

// 博士のマスター資産（実名）
const MASTER_ASSETS = [
    { id: '1st',   name: '1stマーク', file: 'スクリーンショット 2026-01-26 172638.png' },
    { id: 'free',  name: '無料タグ',   file: 'スクリーンショット 2026-01-26 172632.png' },
    { id: 'owned', name: '所有済み',   file: 'スクリーンショット 2026-01-26 172628.png' },
    { id: 'atom',  name: 'Atomロゴ',   file: 'スクリーンショット 2026-01-26 172715.png' }
];

async function runHunter(imagePath) {
    const metadata = await sharp(imagePath).metadata();
    console.log(`\n[実戦テスト] 鑑定開始: ${path.basename(imagePath)} (${metadata.width}x${metadata.height})`);

    // 博士の WQHD 座標（確定版）
    const checkPoints = [
        { label: '上段左', x: 800, y: 280 },
        { label: '上段中', x: 1450, y: 280 },
        { label: '上段右', x: 2100, y: 280 }
    ];

    for (const point of checkPoints) {
        console.log(`\n>> 【${point.label}】スキャン中...`);
        for (const asset of MASTER_ASSETS) {
            const assetPath = path.join(assetDir, asset.file);
            if (!fs.existsSync(assetPath)) continue;

            const masterImg = sharp(assetPath);
            const masterMeta = await masterImg.metadata();
            const masterBuffer = await masterImg.ensureAlpha().raw().toBuffer();

            const targetBuffer = await sharp(imagePath)
                .extract({ left: point.x, top: point.y, width: masterMeta.width, height: masterMeta.height })
                .ensureAlpha().raw().toBuffer();

            // 修正ポイント：関数の呼び出しを確認
            const diff = new PNG({ width: masterMeta.width, height: masterMeta.height });
            const numDiffPixels = pixelmatch(
                targetBuffer, 
                masterBuffer, 
                diff.data, 
                masterMeta.width, 
                masterMeta.height, 
                { threshold: 0.15 }
            );

            const score = 1 - (numDiffPixels / (masterMeta.width * masterMeta.height));

            if (score > 0.80) {
                console.log(`   ┗ ★【${asset.name}】検知! (${(score * 100).toFixed(1)}%)`);
            }
        }
    }
}

async function main() {
    const target = 'Fallout76_2026_01_21_07_57_01_892.png';
    const fullPath = path.join(inputDir, target);
    if (fs.existsSync(fullPath)) await runHunter(fullPath);
}

main();