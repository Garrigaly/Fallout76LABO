// SDKを使わず、直接URLを叩く最も「ピュア」なテストです
const API_KEY = "AIzaSyABmnqklBMUondCVVmsHSb8uOAtvKD-uIA"; 
// 1.5 Flash を捨て、最新の 3.0 を呼び出します
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro-latest:generateContent?key=${API_KEY}`;

async function test() {
  console.log("SDKを介さず、Googleサーバーに直接接続を試みます...");
  
  const payload = {
    contents: [{ parts: [{ text: "こんにちは、博士です。応答してください。" }] }]
  };

  try {
    const response = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      console.log("\n--- ついに成功！ ---");
      console.log(data.candidates[0].content.parts[0].text);
    } else {
      console.log("\n--- サーバーがエラーを返しました ---");
      console.log(`ステータス: ${response.status}`);
      console.log("内容:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("通信そのものに失敗しました:", error);
  }
}

test();