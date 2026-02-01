// [2026-02-01 21:15:00] Version: 1.9.2 - Layout Restoration Edition
const fs = require('fs');
const path = require('path');

const PATHS = {
    basic: 'D:\\nvidia_captures\\data\\jsondata_today_basic.json',
    ops: 'D:\\nvidia_captures\\data\\jsondata_today_ops.json',
    shop: 'D:\\nvidia_captures\\data\\jsondata_today_atomicshop.json',
    challenge: 'D:\\nvidia_captures\\data\\jsondata_today_dailychallenge.json',
    roadmap: 'D:\\nvidia_captures\\data\\jsondata_roadmap_master.json',
    outputTxt: 'D:\\nvidia_captures\\data\\today_daily_post.txt'
};

const ALIAS = {
    "ウエストテック研究センター": "ウエ研",
    "スーパーミュータント": "スパミュ",
    "鋭い視線": "Per増加",
    "サヴェージ_ストライク": "アーマー貫通",
    "不安定": "爆発",
    "氷の手": "氷結",
    "スティングフロスト": "氷結_毒",
    "グループ再生": "回復",
    "素早く": "高速移動"
};

function translate(text) {
    let t = text || "";
    for (const [key, val] of Object.entries(ALIAS)) {
        t = t.replace(new RegExp(key, 'g'), val);
    }
    return t;
}

// 開催中イベント判定ロジック
function isEventActive(dateStr, today) {
    const range = dateStr.match(/(\d+)\/(\d+)〜(\d+)\/(\d+)/);
    if (!range) return false;
    const [_, m1, d1, m2, d2] = range.map(Number);
    const start = new Date(today.getFullYear(), m1 - 1, d1);
    let end = new Date(today.getFullYear(), m2 - 1, d2);
    if (end < start) end.setFullYear(end.getFullYear() + 1); // 年跨ぎ対応
    return today >= start && today <= end;
}

try {
    const today = new Date();
    const basic = JSON.parse(fs.readFileSync(PATHS.basic, 'utf8'));
    const ops = JSON.parse(fs.readFileSync(PATHS.ops, 'utf8'));
    const shop = JSON.parse(fs.readFileSync(PATHS.shop, 'utf8'));
    const challenge = JSON.parse(fs.readFileSync(PATHS.challenge, 'utf8'));
    const roadmap = JSON.parse(fs.readFileSync(PATHS.roadmap, 'utf8'));

    const dayOfWeek = ["日", "月", "火", "水", "木", "金", "土"][today.getDay()];
    let lines = [];

    // 1. ヘッダー（空行なしの密着レイアウト）
    lines.push("#Fallout76");
    lines.push("皆様おはようございます😎");
    lines.push(`${basic.date.replace(/-/g, '/')}（${dayOfWeek}） ${basic.weather}です`);
    lines.push("");

    // 2. 開催中イベント（今日の日付でフィルタリング）
    let activeEvents = [];
    roadmap.roadmap.forEach(m => {
        m.events.forEach(e => {
            if (isEventActive(e.date, today)) {
                activeEvents.push(`【開催中】${e.name} (${e.date})`);
            }
        });
    });
    if (activeEvents.length > 0) {
        lines.push(...activeEvents);
        lines.push("");
    }

    // 3. デイリーオプス
    lines.push(`オプス：${translate(ops.location)} (${translate(ops.faction)})`);
    lines.push(`変異：${ops.mutations.map(m => translate(m)).join('・')}です`);
    lines.push("");

    // 4. デイリーチャレンジ（上位5件）
    lines.push("【今日のデイリー】");
    challenge.challenges.slice(0, 5).forEach(c => lines.push(`・${c}`));
    lines.push("");

    // 5. アトミックショップ（無料 & 1st）
    const freeItems = shop.items.filter(i => i.price === "Free" || i.status.includes("Fallout 1st"));
    if (freeItems.length > 0) {
        lines.push("アトショ無料：");
        freeItems.forEach(i => {
            lines.push(`・${i.name}${i.status.includes("Fallout 1st") ? " (1st)" : ""}`);
        });
        lines.push("");
    }

    // 6. フッター
    lines.push("今日も良き日を❤️");
    lines.push("#32CD32"); // 日曜カラー

    fs.writeFileSync(PATHS.outputTxt, lines.join('\n'), 'utf8');
    console.log(">> [Success] 黄金のレイアウトで投稿案を生成しました。");

} catch (err) {
    console.error("❌ 致命的エラー:", err.message);
    process.exit(1);
}