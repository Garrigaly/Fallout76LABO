// D:\nvidia_captures\scripts\auth\call_emergency_line.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 予備のキー（spare_key.json）を読み込む
const keyPath = path.join(__dirname, "spare_key.json");
const config = require(keyPath);

const genAI = new GoogleGenerativeAI(config.api_key);

async function callSpareLine() {
    console.log("☎️ 予備回線（別アカウント）で呼び出し中...");

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("予備回線のテストです。短く応答してください。");
        const response = await result.response;
        
        console.log("-----------------------------------------");
        console.log("✅ 予備回線：正常稼働中");
        console.log("AI応答:", response.text().trim());
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("❌ 予備回線でエラーが発生しました:", error.message);
    }
}

callSpareLine();