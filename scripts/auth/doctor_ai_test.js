// D:\nvidia_captures\scripts\auth\doctor_ai_test.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 鍵の読み込み
const keyPath = path.join(__dirname, "main_key.json");
const config = require(keyPath);
const genAI = new GoogleGenerativeAI(config.api_key);

async function runDoctorAI() {
    console.log("🤖 博士専用AI秘書、起動します...\n");

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // --- ここが「AI」の真骨頂：指示書（プロンプト） ---
        const prompt = `
あなたは「ガリガリ博士」の有能な助手です。
以下の【生のチャレンジデータ】を、博士の【SNS投稿スタイル】に変換してください。

【博士の用語集（エイリアス）】
・ウエストテック研究センター ➔ ウエ研
・スーパーミュータント ➔ スパミュ
・レベルアップ ➔ レベ上げ
・変異：サヴェージ・ストライク ➔ アーマー貫通

【SNS投稿スタイルのルール】
・冒頭に「博士、お疲れ様です！」のような挨拶は不要。
・「〜だぞ」「〜完了！」など、博士らしい少し威勢の良い、かつ親しみやすい口調で。
・140文字以内のX（旧Twitter）投稿案として出力して。

【生のチャレンジデータ】
「本日のデイリー：ウエストテック研究センターでスーパーミュータントを5体倒せ。あとレベルアップを1回達成しろ。今日の変異はサヴェージ・ストライクだ。」
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("📝 AIが作成した投稿案：");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        console.log(response.text().trim());
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    } catch (error) {
        console.error("❌ エラーが発生しました:", error.message);
    }
}

runDoctorAI();