/**
 * 未开发完毕的功能开关（用户 2026-10-22 点名：拼团活动与送好友在 Web 与 Mobile 同时隐藏）。
 *
 * 口径只存这一份，页面/组件里不许各写一句判断：
 *   - true  = 按原逻辑显示（仍受「插件装没装」「后端 flag」这些既有闸门约束）
 *   - false = 任何入口都不出现，且不发相关请求
 * 开发完毕后把对应项置 true 即可恢复，不需要改页面。
 *
 * Web 侧同名开关：tuzi-web/src/config/feature-flags.ts —— 两处一起改。
 */
export const FEATURE_GROUP_BUY = true;
export const FEATURE_SEND_FRIEND = true;
