const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = 'd:/nvidia_captures';
const SOURCE_DIR = path.join(ROOT_DIR, 'afterburner_png_stills');
const FALLOUT76_DIR = path.join(ROOT_DIR, 'fallout76');
const OUTPUT_DIR = path.join(ROOT_DIR, 'output');

// --- 博士のスクショ(2560x1440)に合わせた黄金座標 ---
const CROPS = {
    CHALLENGE_LIST: { left: 800, top: 300, width: 970, height: 600 }, // チャレンジリスト
    OPS_BOX:        { left: 210, top: 50,  width: 650, height: 950 }  // オプス情報ボックス全体
};

const MASTER_DATA = {
    locations: { "Vault 94": "Vault 94", "ウエストテック": "ウエ研", "ガラハン": "ガラハン" },
    enemies: { "スコーチ": "スコーチ", "ミュータント": "スパミュ", "カルト": "カルト" },
    mutations: { "弾力性": "弾力性(近接トドメのみ)", "スウィフト": "高速移動", "リフレクト": "リフレクト" }
};

const WEEKLY_COLORS = { 0: "#FF0000", 1: "#00FFFF", 2: "#00FF00", 3: "#FF00FF", 4: "#FFFF00", 5: "#0000FF", 6: "#FFA500" };

async function startAutomation() {
    console.log(">> [Phase 1] 仕分け & スマートリネーム実行...");
    const targetFolder = sortAndRenameFiles();
    if (!targetFolder) return console.log("!! 処理対象がありません。");

    console.log(`>> [Phase 2] 精密解析実行: ${targetFolder}`);
    await runAnalysis(targetFolder);
}

function sortAndRenameFiles() {
    if (!fs.existsSync(SOURCE_DIR)) return null;
    const files = fs.readdirSync(SOURCE_DIR).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    if (files.length === 0) return getLatestDir(FALLOUT76_DIR);

    let lastTargetDir = "";
    files.forEach((file, index) => {
        const parts = file.split('_'); 
        if (parts.length >= 4) {
            const game = parts[0].toLowerCase();
            const dateFolderName = `${game}_${parts[1]}${parts[2]}${parts[3]}`;
            const destDir = path.join(ROOT_DIR, game, dateFolderName);
            if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

            const ext = path.extname(file);
            const newName = `f76_${parts[2]}${parts[3]}_${(index + 1).toString().padStart(2, '0')}${ext}`;
            fs.renameSync(path.join(SOURCE_DIR, file), path.join(destDir, newName));
            lastTargetDir = destDir;
        }
    });
    return lastTargetDir;
}

function getLatestDir(root) {
    const dirs = fs.readdirSync(root).map(d => ({ name: d, time: fs.statSync(path.join(root, d)).mtime })).sort((a, b) => b.time - a.time);
    return dirs.length > 0 ? path.join(root, dirs[0].name) : null;
}

async function runAnalysis(inputDir) {
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    const worker = await Tesseract.createWorker('jpn');

    let reportData = { ops: null, dateStr: "", year: 2026, month: 1, day: 1 };
    const dateMatch = inputDir.match(/(\d{4})(\d{2})(\d{2})/);
    if (dateMatch) {
        reportData.year = parseInt(dateMatch[1]);
        reportData.month = parseInt(dateMatch[2]);
        reportData.day = parseInt(dateMatch[3]);
        reportData.dateStr = `${reportData.month}/${reportData.day}`;
    }

    for (const file of files) {
        const fullPath = path.join(inputDir, file);
        const imgType = await checkType(fullPath);

        if (imgType === "OPS") {
            const opsOutput = path.join(OUTPUT_DIR, `processed_ops_${file}`);
            // オプスは情報ボックスをそのまま抜き出して補正
            await sharp(fullPath)
                .extract(CROPS.OPS_BOX)
                .grayscale()
                .normalize()
                .toFile(opsOutput);
            
            const { data: { text } } = await worker.recognize(opsOutput);
            console.log(`[OCR] OPS読み取り結果: ${text.replace(/\s+/g, '')}`);
            const result = parseOpsText(text);
            if (result.location !== "（未検出）") reportData.ops = result;
        } 
        else if (imgType === "DAILY") {
            const dailyOutput = path.join(OUTPUT_DIR, `processed_daily_${file}`);
            await sharp(fullPath).extract(CROPS.CHALLENGE_LIST).toFile(dailyOutput);
            console.log(`[OK] Challenge画像生成: ${file}`);
        }
    }

    if (reportData.ops) {
        fs.writeFileSync(path.join(OUTPUT_DIR, 'daily_post.txt'), generatePostText(reportData));
        console.log(">> 投稿文を生成しました。");
    }

    await worker.terminate();
    console.log(">> 全工程終了。");
}

async function checkType(p) {
    // 画面左上のタイトルエリアの色と位置で厳格に判定
    const { data } = await sharp(p).extract({ left: 50, top: 50, width: 500, height: 100 }).raw().toBuffer({ resolveWithObject: true });
    let yellow = 0, blue = 0;
    for (let i = 0; i < data.length; i += 3) {
        if (data[i] > 200 && data[i+1] > 180 && data[i+2] < 100) yellow++;
    }
    
    // 「デイリー」の文字がある場所を特定
    if (yellow > 500) {
        // オプス画面は情報ボックス（黒い背景）が左側にあるかチェック
        const stats = await sharp(p).extract({ left: 220, top: 100, width: 100, height: 100 }).stats();
        return (stats.channels[0].mean < 50) ? "OPS" : "DAILY";
    }
    return "OTHER";
}

function parseOpsText(t) {
    const clean = t.replace(/\s+/g, "");
    const find = (cat) => {
        for (let k in MASTER_DATA[cat]) {
            if (clean.includes(k)) return MASTER_DATA[cat][k];
        }
        return "（未検出）";
    };
    return { location: find('locations'), enemy: find('enemies'), m1: find('mutations'), m2: "（判定中）" };
}

function generatePostText(data) {
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const d = new Date(data.year, data.month - 1, data.day);
    const dayName = days[d.getDay()];
    const ops = data.ops || { location: "Vault 94", enemy: "スコーチ", m1: "弾力性", m2: "（判定中）" };

    return `#Fallout76\n皆様おはようございます😎\n\n${data.dateStr} ${dayName}曜日です☀️\n\nオプスはアップリンク\n${ops.location}・${ops.enemy}\n${ops.m1}・${ops.m2}です\n\n今日も良き日を❤️\n${WEEKLY_COLORS[d.getDay()]}`;
}

startAutomation();