const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const inputDir = 'd:/nvidia_captures/input';
const outputDir = 'd:/nvidia_captures/output';

// --- 博士専用：Fallout 76 統合マスタ ---
const OPS_MASTER_DATA = {
    // ロケーション
    "ウエストテック研究センター": "ウエ研",
    "ガラハン鉱業本社": "ガラハン鉱業本社",
    "バレー・ガレリア": "バレー・ガレリア",
    "モーガンタウン・ハイスクール": "モーガンタウン・ハイスクール",
    // 敵派閥
    "スーパーミュータント": "スパミュ",
    "カルト教信者": "カルト教信者",
    "ブラッドイーグル": "ブラッドイーグル",
    "モールマイナー": "モールマイナー",
    // 変異
    "スティングフロスト": "氷結・毒",
    "不安定": "爆発",
    "氷の手": "氷結",
    "鋭い視線": "Per増加",
    "サヴェージ・ストライク": "アーマー貫通",
    "グループ再生": "回復"
};

/**
 * 博士流への変換関数
 * マスタに登録があれば略称を返し、なければそのまま（または正規化）返す
 */
function translate(rawText) {
    if (!rawText) return "不明";
    for (let officialName in OPS_MASTER_DATA) {
        if (rawText.includes(officialName)) {
            return OPS_MASTER_DATA[officialName];
        }
    }
    return rawText.trim().replace(/\n/g, ""); // 改行などは除去
}

/**
 * SNS投稿文の生成（博士の黄金律レイアウト）
 */
function generateSNSText(data) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const date = today.getDate();
    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][today.getDay()];

    return `#Fallout76
皆様おはようございます😎
${year}年${month}月${date}日 ${dayOfWeek}曜日 ${data.weather}です

${data.minervaInfo}

オプスは${data.opsType}
${translate(data.location)}・${translate(data.enemy)}
${translate(data.mutation1)}・${translate(data.mutation2)}です

${data.freeItems[0]}貰えます

お買い得は
${data.saleTop}

${data.saleOthers.join('\n')}

１ST限定 ${data.freeItems[1]}
${data.firstFree}貰えます
${data.firstSale}がお買い得

今日も良き日を❤️
${data.colorCode}`;
}

/**
 * OCR実行関数（日本語認識）
 */
async function performOCR(imagePath) {
    const { data: { text } } = await Tesseract.recognize(imagePath, 'jpn');
    return text;
}

/**
 * メイン実行処理
 */
async function processAll() {
    console.log(">> 処理を開始します...");
    
    // 1. 画像解析（OpsとDailyの判定）と切り抜きは既存ロジックを維持
    // ...（中略：sharpを使った判定と切り抜き。詳細は前回のコードと同様）...

    // 2. OCRによる文字抽出（ここではOps画像を対象にする例）
    // 本来はsharpでさらに細かく「敵の名前の場所」などを切り抜くと精度が上がります
    const opsImagePath = path.join(outputDir, 'processed_ops_example.png'); // 仮の名前
    console.log(">> 文字認識(OCR)を実行中...");
    const rawOcrResult = await performOCR(opsImagePath);

    // 3. データ流し込み（OCR結果からマスタ照合）
    const dailyData = {
        weather: "晴れ☀️", // 天気などは画像解析が進むまで固定
        minervaInfo: "ミネルヴァ情報をここに",
        opsType: rawOcrResult.includes("アップリンク") ? "アップリンク" : "暗号解読",
        location: rawOcrResult, // translate関数が中から地名を探します
        enemy: rawOcrResult,    // translate関数が中から敵名を探します
        mutation1: rawOcrResult,
        mutation2: rawOcrResult,
        freeItems: ["アイテム1", "アイテム2"],
        saleTop: "セール品トップ",
        saleOthers: ["セール品2", "セール品3"],
        firstFree: "1st無料",
        firstSale: "1stセール",
        colorCode: "#FF0000"
    };

    const postContent = generateSNSText(dailyData);
    fs.writeFileSync(path.join(outputDir, 'daily_post.txt'), postContent, 'utf8');
    
    console.log(">> すべての処理が完了しました！");
}

processAll();