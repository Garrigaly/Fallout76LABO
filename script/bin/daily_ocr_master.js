const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');

const outputDir = 'd:/nvidia_captures/output';

// --- 博士専用：カテゴリ別・統合マスタ ---
const MASTER_DATA = {
    locations: {
        "ガラハン鉱業本社": "ガラハン鉱業本社",
        "ウエストテック研究センター": "ウエ研",
        "バレー・ガレリア": "バレー・ガレリア"
    },
    enemies: {
        "カルト教信者": "カルト教信者",
        "スーパーミュータント": "スパミュ",
        "モールマイナー": "モールマイナー"
    },
    mutations: {
        "リフレクトスキン": "リフレクトスキン",
        "鋭い視線": "Per増加",
        "グループ再生": "回復",
        "不安定": "爆発"
    }
};

/**
 * 特定のカテゴリから一致するものを探す関数
 */
function findInMaster(rawText, category, exclude = []) {
    const cleanText = rawText.replace(/\s+/g, "");
    const entries = MASTER_DATA[category];
    
    for (let officialName in entries) {
        // すでに選ばれたもの（exclude）は除外して探す
        if (cleanText.includes(officialName) && !exclude.includes(entries[officialName])) {
            return entries[officialName];
        }
    }
    return "（未認識）";
}

function generateSNSText(data) {
    const today = new Date();
    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const dayName = days[today.getDay()];
    
    return `#Fallout76
皆様おはようございます😎
${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 ${dayName}曜日 晴れ☀️です

${data.minervaInfo}

オプスは${data.opsType}
${data.location}・${data.enemy}
${data.mutation1}・${data.mutation2}です

（ここに無料アイテム情報を入れる）

今日も良き日を❤️
#FF0000`;
}

async function runOCR() {
    console.log(">> データの抽出と分類を開始します...");

    const files = fs.readdirSync(outputDir);
    const opsFile = files.find(f => f.startsWith('processed_ops_'));
    if (!opsFile) return console.log("error: image not found.");

    const { data: { text } } = await Tesseract.recognize(path.join(outputDir, opsFile), 'jpn');
    const cleanText = text.replace(/\s+/g, "");

    // カテゴリごとに正しく抽出
    const location = findInMaster(text, 'locations');
    const enemy = findInMaster(text, 'enemies');
    const m1 = findInMaster(text, 'mutations');
    const m2 = findInMaster(text, 'mutations', [m1]); // 1つ目と違うものを探す

    const dailyData = {
        minervaInfo: "（ミネルヴァ情報を入力）",
        opsType: cleanText.includes("アップリンク") ? "アップリンク" : "暗号解読",
        location: location,
        enemy: enemy,
        mutation1: m1,
        mutation2: m2
    };

    fs.writeFileSync(path.join(outputDir, 'daily_post.txt'), generateSNSText(dailyData), 'utf8');
    console.log(">> 分類完了！ daily_post.txt を確認してください。");
}

runOCR();