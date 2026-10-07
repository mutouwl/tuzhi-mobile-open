/**
 * 个人中心装修配置 → 页面渲染数据
 *
 * 后台「店铺装修 > 个人中心」只存 key 与顺序/开关，名称/图标/路径来自接口下发的清单（options）。
 * 清单里没有的 key 直接跳过：后端删项时不能把用户端渲染打空。
 */

function catalogOf(options, group) {
  return (options && options[group]) || [];
}

/**
 * 会员入口是否可用（与 vip-card 组件的前两个条件同口径）
 * @param {Function} systemConfig $tools.systemConfig
 * @return {Boolean}
 */
export function vipEntryOpen(systemConfig) {
  const vip = systemConfig("vip_config") || {};
  return vip.status == 1 && vip.entrance == 1;
}

/**
 * 按装修配置重算资产项与常用功能
 * @param {Object} config 后端下发的装修配置
 * @param {Object} options 可配置项清单
 * @param {Object} assetsNav 页面现有的资产项（含接口回填的 value，按引用保留）
 * @param {Function} systemConfig $tools.systemConfig
 * @return {Object} 可直接并回页面 data 的补丁
 */
export function buildDecorate(config, options, assetsNav, systemConfig) {
  const header = config.header || {};
  const assets = config.assets || {};
  const functions = config.functions || {};
  const assetCatalog = catalogOf(options, "assets");
  const functionCatalog = catalogOf(options, "functions");

  const nextAssets = {};
  (assets.items || []).forEach((key) => {
    const meta = assetCatalog.find((one) => one.key === key);
    if (!meta || !assetsNav[key]) {
      return;
    }
    // 与常用功能同一道闸门：带 app_tag 的付费插件项未安装时配置说了不算。
    // 2026-10-03：「我的奖品」不再带 app_tag（奖品能力已升入标准版），
    // 所以这一格与余额/积分/优惠券走同一条路——装修配了就在，没配就不出
    if (meta.app_tag && !systemConfig("app_isinstall_" + meta.app_tag)) {
      return;
    }
    nextAssets[key] = assetsNav[key];
  });

  const controllNav = [];
  (functions.items || []).forEach((item) => {
    if (!item || item.status == 0) {
      return;
    }
    const meta = functionCatalog.find((one) => one.key === item.key);
    if (!meta) {
      return;
    }
    // 付费插件是「代码即插件」，未安装时页面文件根本不存在，配置说了不算
    if (meta.app_tag && !systemConfig("app_isinstall_" + meta.app_tag)) {
      return;
    }
    if (meta.key === "vip" && !vipEntryOpen(systemConfig)) {
      return;
    }
    const nav = { key: meta.key, name: meta.name, icon: meta.icon, path: meta.path };
    if (meta.size) {
      nav.size = meta.size;
    }
    controllNav.push(nav);
  });

  return {
    // 整块留着但里面一项都没有，等于给用户端留一张空卡，连带隐掉
    showAssets: assets.status != 0 && Object.keys(nextAssets).length > 0,
    showFunctions: functions.status != 0 && controllNav.length > 0,
    // 学习中心卡只配显隐（老配置没有这一键时按显示处理，与后端 sanitize 的缺省同档）
    showStudyCenter: (config.study_center || {}).status != 0,
    vipEntryInHeader: header.vip_entry != 0,
    functionStyle: functions.style === "list" ? "list" : "grid",
    assetsNav: nextAssets,
    controllNav: controllNav,
  };
}
