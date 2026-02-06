// D:\nvidia_captures\scripts\auth\main_check.js (修正版)
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 本命のキー (main_key.json) を読み込む
const keyPath = path.join(__dirname, "main_key.json");
const config = require(keyPath);

// 道具箱の準備
const genAI = new GoogleGenerativeAI(config.api_key);

async function runMainCheck() {
    console.log("🚀 本命アカウント（2,900円垢）で直通テストを開始します...");

    try {
        // 直接モデルを指定して呼び出す
        const targetModel = "gemini-2.5-flash"; 
        console.log(`☎️ ${targetModel} に直接ダイヤル中...`);
        
        const model = genAI.getGenerativeModel({ model: targetModel });
        const result = await model.generateContent("本命回線の開通テストです。一言だけ挨拶してください。");
        const response = await result.response;
        
        console.log("-----------------------------------------");
        console.log("✨ 本命回線：接続成功！");
        console.log("AIからの初音:", response.text().trim());
        console.log("-----------------------------------------");
        console.log("💡 おめでとうございます！これで 2,900円の力 が解放されました。");

    } catch (error) {
        console.error("\n❌ まだエラーが出ます。");
        console.error("理由:", error.message);
    }
}

runMainCheck();