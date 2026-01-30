// [2026-01-29 16:00:00] Version: 1.1.0
/**
 * jsdata_today_apratia.js
 */
const DAILY_POST_DATA = {
  display_date: "2026年1月29日",
  day_of_week: "木曜日",
  weather_info: "曇り ☁️",
  
  manual_events: [
    "モスマン・イクイノックス開催中",
    "1月28日：ダブルS.C.O.R.E.開始（JST）"
  ],
  
  footer: {
    closing: "今日も良き日を❤️",
    color_code: "#32CD32"
  }
};

if (typeof module !== 'undefined') {
  module.exports = DAILY_POST_DATA;
}
