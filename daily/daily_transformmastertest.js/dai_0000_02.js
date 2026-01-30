const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';
const outputDir = 'd:/nvidia_captures/output';

// --- 博士専用マスタ ---
const MASTER_DATA = {
    locations: { "ガラハン鉱業本社": "ガラハン鉱業本社", "ウエストテック研究センター": "ウエ研", "バレー・ガレリア": "バレー・ガレリア" },
    enemies: { "カルト教信者": "カルト教信者", "スーパーミュータント": "スパミュ", "ブラッドイーグル": "ブラッドイーグル" },
    mutations: { "リフレクトスキン": "リフレクトスキン", "鋭い視線": "Per増加", "グループ再生": "回復", "不安定": "爆発" }
};
const WEEKLY_COLORS = { 0: "#FF0000", 1: "#00FFFF", 2: "#00FF00", 3: "#FF00FF", 4: "#FFFF00", 5: "#0000FF", 6: "#FFA500" };

const opsLeftPart = { left: 530, top: 54, width: 670, height: 442 };
const opsRightPart = { left: 525, top: 505, width: 705, height: 430 };
const dailyFinalCrop = { left: 800, top: 300, width: 970, height: 600 };

/**
 * デイリー判定: 黄色い帯(5回リトライ) + 文字「デイリー/ウィークリー」
 */
async function identifyAsDaily(inputPath) {
    const area = { left: 0, top: 200, width: 400, height: 600 };
    try {
        const { data } = await sharp(inputPath).extract(area).raw().toBuffer({ resolveWithObject: true });
        let hasYellow = false;
        for (let i = 1; i <= 5; i++) {
            const threshold = 180 - (i * 10);
            let yellowCount = 0;
            for (let j = 0; j < data.length; j += 3) {
                if (data[j] > threshold && data[j+1] > (threshold - 30) && data[j+2] < 120) yellowCount++;
            }
            if (yellowCount > 800) { hasYellow = true; break; }
        }
        if (!hasYellow) return false;

        const { data: { text } } = await Tesseract.recognize(inputPath, 'jpn');
        return text.includes("デイリー") || text.includes("ウィークリー");
    } catch (e) { return false; }
}

/**
 * オプス判定: マスタ単語との照合
 */
async function identifyAsOps(inputPath) {
    try {
        const buffer = await sharp(inputPath).extract({ left: 400, top: 0, width: 1200, height: 600 }).toBuffer();
        const { data: { text } } = await Tesseract.recognize(buffer, 'jpn');
        const cleanText = text.replace(/\s+/g, "");
        for (let cat in MASTER_DATA) {
            for (let key in MASTER_DATA[cat]) {
                if (cleanText.includes(key)) return true;
            }
        }
        return cleanText.includes("オプス") || cleanText.includes("アップリンク");
    } catch (e) { return false; }
}

function findInMaster(rawText, category, exclude = []) {
    const cleanText = rawText.replace(/\s+/g, "");
    const entries = MASTER_DATA[category];
    for (let key in entries) {
        if (cleanText.includes(key) && !exclude.includes(entries[key])) return entries[key];
    }
    return "（未認識）";
}

function generateSNSText(data) {
    const today = new Date();
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const dayIdx = today.getDay();
    return `#Fallout76
皆様おはようございます😎
${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 ${days[dayIdx]}曜日 晴れ☀️です

${data.minervaInfo}

オプスは${data.opsType}
${data.location}・${data.enemy}
${data.mutation1}・${data.mutation2}です

（ここに無料アイテム情報を入れる）

今日も良き日を❤️
${WEEKLY_COLORS[dayIdx]}`;
}

async function main() {
    console.log(">> 厳密判定テスト：ポジティブ・スキャンを開始します...");
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    
    let opsImg, dailyImg;
    let excludedFiles = [];

    for (const file of files) {
        const fullPath = path.join(inputDir, file);
        console.log(`>> [精査] ${file}...`);

        if (await identifyAsDaily(fullPath)) {
            dailyImg = file;
            console.log(`   --> 【採用】デイリー画像`);
        } else if (await identifyAsOps(fullPath)) {
            opsImg = file;
            console.log(`   --> 【採用】オプス画像`);
        } else {
            excludedFiles.push(file);
            console.log(`   --> 【除外】対象外の画像`);
        }
    }

    console.log("--- 判定結果サマリ ---");
    console.log(`採用(Daily): ${dailyImg || "未発見"}`);
    console.log(`採用(Ops)  : ${opsImg || "未発見"}`);
    console.log(`対象外枚数 : ${excludedFiles.length}枚`);
    console.log("----------------------");

    if (!opsImg || !dailyImg) {
        return console.log("error: 必要な画像が揃っていません。処理を中断します。");
    }

    // --- ここから成功済みの画像加工ロジック ---
    const opsOutput = path.join(outputDir, `processed_ops_test.png`);
    const img = sharp(path.join(inputDir, opsImg));
    const leftBuf = await img.clone().extract(opsLeftPart).toBuffer();
    const rightBuf = await img.clone().extract(opsRightPart).toBuffer();
    await sharp({ create: { width: 1430, height: 482, channels: 4, background: { r: 15, g: 15, b: 15, alpha: 1 } } })
        .composite([{ input: leftBuf, left: 20, top: 20 }, { input: rightBuf, left: 705, top: 26 }])
        .toFile(opsOutput);

    const dailyOutput = path.join(outputDir, `processed_daily_test.png`);
    await sharp(path.join(inputDir, dailyImg)).extract(dailyFinalCrop).toFile(dailyOutput);

    const { data: { text: opsText } } = await Tesseract.recognize(opsOutput, 'jpn');
    const dailyData = {
        minervaInfo: "（ミネルヴァ手動）",
        opsType: opsText.includes("アップリンク") ? "アップリンク" : "暗号解読",
        location: findInMaster(opsText, 'locations'),
        enemy: findInMaster(opsText, 'enemies'),
        mutation1: findInMaster(opsText, 'mutations'),
        mutation2: findInMaster(opsText, 'mutations', [findInMaster(opsText, 'mutations')])
    };

    fs.writeFileSync(path.join(outputDir, 'daily_post.txt'), generateSNSText(dailyData), 'utf8');
    console.log(">> 本日の全工程を完了しました！");
}

main();