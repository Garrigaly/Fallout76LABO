// D:\nvidia_captures\scripts\auth\check_connection.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

// ESM環境でJSONを読み込むための設定
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 外部JSON（APIキー）の読み込み
const keyPath = path.join(__dirname, "new_gemini_key.json");
const config = require(keyPath);

// SDKの初期化
const genAI = new GoogleGenerativeAI(config.api_key);

async function runTest() {
    console.log("🚀 Gemini API 疎通テストを開始します...");

    try {
        // 先ほどの診断で有効だったモデルを指定
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // テストリクエスト
        const result = await model.generateContent("接続テスト成功。短く挨拶を返してください。");
        const response = await result.response;
        
        console.log("-----------------------------------------");
        console.log("✅ 接続ステータス: 正常 (OK)");
        console.log("使用モデル: gemini-2.5-flash");
        console.log("AIからの応答:", response.text().trim());
        console.log("-----------------------------------------");
    } catch (error) {
        console.error("-----------------------------------------");
        console.error("❌ 接続エラーが発生しました");
        console.error("エラー詳細:", error.message);
        console.error("-----------------------------------------");
    }
}

runTest();