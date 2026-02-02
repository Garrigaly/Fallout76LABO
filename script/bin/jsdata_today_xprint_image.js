// [2026-02-02] Version: 1.9.4 - Roadmap Integrated Edition
const fs = require('fs');
const path = require('path');

const DATA_DIR = "D:\\nvidia_captures\\data";
const PATHS = {
    basic: path.join(DATA_DIR, "jsondata_today_basic.json"),
    ops: path.join(DATA_DIR, "jsondata_today_ops.json"),
    shop: path.join(DATA_DIR, "jsondata_today_atomicshop.json"),
    output: path.join(DATA_DIR, "today_daily_post.txt")
};

const COLORS = { "月": "#FF8C00", "火": "#FF0040", "水": "#00BFFF", "木": "#32CD32", "金": "#FFD700", "土": "#9932CC", "日": "#DC143C" };

const load = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

try {
    const basic = load(PATHS.basic);
    const ops = load(PATHS.ops);
    const shop = load(PATHS.shop);

    const [y, m, d] = basic.date.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const week = ["日", "月", "火", "水", "木", "金", "土"][dateObj.getDay()];

    let post = [];

    // --- 1. ヘッダー ---
    post.push(`#Fallout76 #${basic.current_event || ""}`);
    post.push(`皆様おはようございます😎`);
    post.push(`${y}年${m}月${d}日${week}${basic.weather}です`);
    post.push("");

    // --- 2. イベント・ミネルヴァ ---
    let eventLine = [];
    if (basic.current_event) eventLine.push(`${basic.current_event}${basic.event_status}`);
    if (basic.minerva && basic.minerva !== "不在") eventLine.push(`ミネルヴァさんは${basic.minerva}です`);
    if (eventLine.length > 0) {
        post.push(eventLine.join('\n'));
        post.push("");
    }

    // --- 3. デイリーオプス ---
    post.push(ops.mutations.length >= 3 ? "オプスもダブル" : `オプスは${ops.mode}`);
    post.push(`${ops.location}・${ops.faction}/${ops.mutations.join('・')}です`);
    post.push("");

    // --- 4. アトミックショップ ---
    const free = shop.items.filter(i => i.price === "Free" && !i.status.includes("1st"));
    if (free.length > 0) {
        free.forEach((item, i) => post.push(item.name + (i === free.length - 1 ? "貰えます" : "")));
    }
    const sale = shop.items.filter(i => i.status.includes("Sale") && !i.status.includes("1st") && i.price !== "Free");
    if (sale.length > 0) {
        post.push("お買い得は。");
        sale.forEach(i => post.push(i.name));
    }
    const first = shop.items.filter(i => i.status.includes("1st"));
    if (first.length > 0) {
        post.push("1ST限定。");
        first.forEach(i => post.push(i.name + (i.price === "Free" || i.status.includes("1st") ? "貰えます" : "")));
    }
    post.push("");

    // --- 5. フッター ---
    post.push("今日も良き日を♡");
    post.push(COLORS[week]);

    // 最終整形（スペース排除、タグ間のみ許可）
    let result = post.join('\n').replace(/[ 　]+/g, (m, off, str) => (str[off - 1] === '7' && str[off + 1] === '#') ? ' ' : '');
    
    fs.writeFileSync(PATHS.output, result);
    console.log(`[Success] 黄金比率 v1.9.3 出力完了 (${basic.date})`);

} catch (e) {
    console.error("[Error]", e.message);
}