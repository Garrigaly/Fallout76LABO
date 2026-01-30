const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';

// --- 確定済みの黄金座標（判定用の視界） ---
const EYES = {
    DAILY_MENU: { left: 200, top: 400, width: 410, height: 600 },
    OPS_SCREEN: { left: 530, top: 54,  width: 680, height: 880 }
};

// --- 固定単語マスターリスト（整合性チェック用） ---
const CHALLENGE_MASTER = [
    "デイリー", "ウィークリー", "キャラクター", "サバイバル", 
    "コンバット", "ソーシャル", "アパラチア", "釣り", "バーニング・スプリングス"
];

// --- デイリーオプス用フレーバーテキスト（無視設定） ---
const IGNORE_PHRASE = "アップリンクの機能を復旧し、敵の行動を監視して敵対勢力をすべて排除しろ！";

async function identifyImage(fullPath) {
    const fileName = path.basename(fullPath);
    console.log(`\n[分析中] ${fileName}...`);

    try {
        // --- 1. チャレンジ画面（デイリー/ウィークリー）の判定 ---
        const dBuf = await sharp(fullPath).extract(EYES.DAILY_MENU).toBuffer();
        const { data: { text: dRaw } } = await Tesseract.recognize(dBuf, 'jpn');
        const cleanD = dRaw.replace(/\s+/g, "");
        const matched = CHALLENGE_MASTER.filter(word => cleanD.includes(word));

        if (matched.length > 0) {
            if (matched.includes("デイリー")) {
                console.log(`   ┗ 【判定成功】>> 今日のデイリー`);
                return "DAILY";
            }
            if (matched.includes("ウィークリー")) {
                console.log(`   ┗ 【判定成功】>> ウィークリー`);
                return "WEEKLY";
            }
            console.log(`   ┗ 【判定】>> チャレンジ画面（その他）`);
            return "CHALLENGE_OTHER";
        }

        // --- 2. デイリーオプス画面の判定 ---
        const oBuf = await sharp(fullPath).extract(EYES.OPS_SCREEN).toBuffer();
        const { data: { text: oRaw } } = await Tesseract.recognize(oBuf, 'jpn');
        const cleanO = oRaw.replace(/\s+/g, "").replace(IGNORE_PHRASE.replace(/\s+/g, ""), "");

        if (cleanO.includes("オプス") || cleanO.includes("アップリンク")) {
            console.log(`   ┗ 【判定成功】>> デイリーオプス`);
            return "OPS";
        }

        // --- 3. その他（アトムショップ、ニュース、対象外） ---
        console.log(`   ┗ 【判定除外】>> 対象外の画像（ノイズ）`);
        return "UNKNOWN";

    } catch (err) {
        console.log(`   ┗ 【エラー】解析失敗: ${err.message}`);
        return "ERROR";
    }
}

async function main() {
    console.log(">> 臨床試験：自動仕分けテストプログラムを起動...");
    const files = fs.readdirSync(inputDir).filter(f => f.match(/\.(png|jpg|jpeg)$/i));
    
    if (files.length === 0) return console.log("error: inputフォルダにテスト用画像を準備してください。");

    let stats = { DAILY: 0, OPS: 0, WEEKLY: 0, OTHER: 0 };

    for (const file of files) {
        const result = await identifyImage(path.join(inputDir, file));
        if (result === "DAILY") stats.DAILY++;
        else if (result === "OPS") stats.OPS++;
        else if (result === "WEEKLY") stats.WEEKLY++;
        else stats.OTHER++;
    }

    console.log(`\n=========================================`);
    console.log(`【臨床試験：最終診断結果】`);
    console.log(`  ■ 今日のデイリー捕捉 : ${stats.DAILY} 枚`);
    console.log(`  ■ デイリーオプス捕捉 : ${stats.OPS} 枚`);
    console.log(`  ■ ウィークリー捕捉   : ${stats.WEEKLY} 枚`);
    console.log(`  ■ 除外済みノイズ     : ${stats.OTHER} 枚`);
    console.log(`=========================================`);
}

main();