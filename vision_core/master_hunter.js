const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const assetDir = path.join(ROOT, 'master_assets');
const inputDir = path.join(ROOT, 'input');

const ASSETS = [
    { name: '1stマーク', file: 'スクリーンショット 2026-01-26 172638.png' },
    { name: '無料タグ',   file: 'スクリーンショット 2026-01-26 172632.png' }
];

async function huntAssets() {
    for (const asset of ASSETS) {
        const assetPath = path.join(assetDir, asset.file);
        if (fs.existsSync(assetPath)) {
            console.log(`[OK] 資産確認: ${asset.name}`);
        }
    }
}
huntAssets();