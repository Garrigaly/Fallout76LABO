//オプスのスクショをロケーション・敵・変異内容の部分を切り取るプログラム
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..', '..'); 
const INPUT_DIR = path.join(ROOT, 'daily_ops_extracted'); 
const OUTPUT_DIR = path.join(ROOT, 'output', 'ops');
const CONFIG = { R: { left: 525, top: 505, width: 705, height: 430 } };

async function extractOps() {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const files = fs.readdirSync(INPUT_DIR).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    
    let success = 0, std = 0, processed = 0;

    console.log("\n" + "=".repeat(60));
    console.log("   精密解体：統計サマリーモード (4K対応版)");
    console.log("=".repeat(60));
    console.log(`索敵対象 : ${files.length} 枚 | 作業開始...`);

    for (const file of files) {
        processed++;
        if (processed % 100 === 0) console.log(`現在 ${processed} 枚目を解体中...`);
        try {
            const processor = sharp(path.join(INPUT_DIR, file));
            const meta = await processor.metadata();
            let finalImg = processor;
            
            // 4K(3840)やHD(1920)を WQHD(2560) へ高品質正規化
            if (meta.width !== 2560 || meta.height !== 1440) {
                std++;
                finalImg = processor.resize(2560, 1440, { kernel: 'lanczos3', fit: 'fill' });
            }
            await finalImg.extract(CONFIG.R).toFile(path.join(OUTPUT_DIR, `R_${path.parse(file).name}.png`));
            success++;
        } catch (err) { console.error(` [失敗] ${file}: ${err.message}`); }
    }
    console.log("-".repeat(60));
    console.log(`【精密解体完了報告】`);
    console.log(`  ■ 読み込み総数 : ${files.length} 枚`);
    console.log(`  ■ 成功（R精製）: ${success} 枚`);
    console.log(`  ■ 解像度補正   : ${std} 枚`);
    console.log("="*60 + "\n");
}
extractOps();