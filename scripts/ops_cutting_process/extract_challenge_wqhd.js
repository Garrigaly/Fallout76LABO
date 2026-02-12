import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 【新時代のおまじない】
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..');
const INPUT_DIR = path.join(ROOT, 'input');
const OUTPUT_DIR = path.join(ROOT, 'output', 'challenge');

// WQHD完全準拠：黄金のチャレンジ座標
const CHALLENGE_AREA = { left: 194, top: 405, width: 440, height: 575 };

async function extractChallenge() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const files = fs.readdirSync(INPUT_DIR).filter(f => f.match(/\.(png|jpg|jpeg)$/i));

    console.log(`>> [Modern ESM] WQHD Challenge精密抽出を開始...`);

    for (const file of files) {
        const inputPath = path.join(INPUT_DIR, file);
        try {
            await sharp(inputPath).extract(CHALLENGE_AREA).toFile(path.join(OUTPUT_DIR, `CH_${file}`));
            console.log(` ✅ 抽出完了: ${file}`);
        } catch (err) {
            console.error(` ❌ エラー (${file}): ${err.message}`);
        }
    }
}
extractChallenge();