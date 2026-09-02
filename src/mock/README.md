# tuzi-mobile Mock 系统

[![License: 凸知开源协议](https://img.shields.io/badge/License-凸知开源协议V1.0-blue.svg)](./LICENSE)

一套面向 `tuzi-mobile` 的轻量级 Mock 解决方案，支持 H5 开发环境下通过本地 JSON 文件模拟后端接口响应。

---

## 目录

- [功能特性](#功能特性)
- [架构设计](#架构设计)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [Mock 数据规范](#mock-数据规范)
- [API 参考](#api-参考)
- [目录结构](#目录结构)
- [开发指南](#开发指南)
- [常见问题](#常见问题)
- [参与贡献](#参与贡献)
- [许可证](#许可证)

---

## 功能特性

- **零依赖**：不引入 `mockjs`，仅使用 uni-app 原生能力与本地 JSON 文件。
- **H5 专属**：通过 `// #ifdef H5` 条件编译，确保微信小程序、App 等构建目标零影响。
- **三级开关**：支持请求级、全局运行时、构建环境变量三种方式控制 Mock。
- **自动采集**：配套 `tools/mock-crawler` 脚本，扫描源码、请求真实后端并自动生成 Mock 数据。
- **空响应占位**：真实后端返回为空时，根据页面组件字段结构自动生成占位数据。
- **标准响应结构**：所有 Mock 数据统一为 `{code, msg, data}`，与后端响应保持一致。

---

## 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                     tuzi-mobile (H5)                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   页面/组件   │ -> │  request.js  │ -> │  mock/index  │  │
│  │ this.$api(...)│    │  Mock 拦截   │    │ 加载本地 JSON│  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
│                                                  │          │
└──────────────────────────────────────────────────┼──────────┘
                                                   │
                                          ┌────────▼────────┐
                                          │ src/mock/data/  │
                                          │ {route}.json    │
                                          └─────────────────┘
```

请求链路：

1. 页面通过 `this.$api('module.action', data)` 发起请求。
2. `src/common/request/request.js` 在 H5 环境下优先判断 Mock 开关。
3. 若 Mock 开启且存在对应 JSON 文件，直接返回本地数据。
4. 若 Mock 关闭、非 H5 平台或未命中文件，则调用真实 `uni.request`。

---

## 快速开始

### 1. 开启 Mock（推荐：配置文件开关）

修改 `src/static/config.js`，将 `enableMock` 置为 `true`：

```javascript
export default {
    "apiUrl": "...",
    "enableMock": true,   // false = 走真实后端；true = 命中本地 Mock
};
```

重启/刷新 H5 开发服务后生效，无需任何控制台命令。未命中 Mock 文件的接口自动回退真实后端。

### 2. 运行时临时开关（浏览器控制台）

```javascript
uni.setStorageSync('enableMock', 'true');
```

刷新页面后，所有支持 Mock 的接口将优先命中本地 JSON 文件。注意：**配置文件显式设置 `enableMock` 时优先级更高**（配置为 false 时控制台命令不会生效）。

### 2. 运行采集脚本

```bash
cd <项目根目录>  # 本仓库所在的父目录（同时包含 tuzi-mobile 与 tools/）

node tools/mock-crawler/index.js \
  --base-url=http://demo.selfbuilt.cn \
  --uniacid=1 \
  --auth-token=xxx
```

采集完成后：

- Mock 数据输出到 `tuzi-mobile/src/mock/data/`。
- 报告生成在 `tools/mock-crawler/report/tuzi-mobile-{timestamp}.md`。

### 3. 手动补全数据

编辑对应路由的 JSON 文件即可：

```bash
tuzi-mobile/src/mock/data/user/info/index.json
```

---

## 配置说明

### 开关优先级（从高到低）

1. **请求级**：`{ mock: true }`（单接口强制）
2. **配置文件**：`src/static/config.js` 的 `enableMock`（全局总开关，显式指定后覆盖运行时/环境变量）
3. **全局运行时**：`uni.getStorageSync('enableMock')`
4. **构建环境变量**：`VUE_APP_MOCK_ENABLE=true`（vue-cli 只注入 `VUE_APP_` 前缀变量）

### 环境变量示例

```bash
cd tuzi-mobile
cross-env NODE_ENV=development UNI_PLATFORM=h5 VUE_APP_MOCK_ENABLE=true vue-cli-service uni-serve
```

或在项目根目录新建 `.env.development` 文件：

```
VUE_APP_MOCK_ENABLE=true
```

---

## Mock 数据规范

### 文件路径

```
src/mock/data/{route}.json
```

例如接口路由 `app/course/index` 对应：

```
src/mock/data/app/course/index.json
```

### 数据格式

```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "list": [],
    "total": 0
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | Number | 业务状态码，`1` 为成功，`0` 为失败 |
| `msg` | String | 提示信息 |
| `data` | Any | 接口实际返回数据 |

---

## API 参考

### `mock/index.js`

#### `isMockEnabled(options)`

判断当前是否启用 Mock。

```javascript
import mock from '@/mock';

mock.isMockEnabled({ mock: true }); // true
```

#### `normalizeRoute(url, baseUrl)`

将完整请求 URL 归一化为路由字符串。

```javascript
mock.normalizeRoute(
  'http://demo.selfbuilt.cn/index.php?i=1&route=api/app/course/index',
  'http://demo.selfbuilt.cn/index.php?i=1&route=api/'
);
// => 'app/course/index'
```

#### `tryLoadMock(route)`

尝试加载指定路由的 Mock 数据。

```javascript
const data = mock.tryLoadMock('app/course/index');
// => { code: 1, msg: 'success', data: {...} } | null
```

#### `wrapMockResponse(data, code, msg)`

将原始数据包装为标准响应结构。

```javascript
mock.wrapMockResponse({ list: [] }, 1, 'success');
// => { code: 1, msg: 'success', data: { list: [] } }
```

---

## 目录结构

```
tuzi-mobile/src/mock/
├── index.js              # Mock 核心工具函数
├── modules/              # 按模块拆分的 Mock 数据（预留）
│   └── .gitkeep
└── data/                 # 按路由生成的 Mock 数据
    ├── app/
    │   └── course/
    │       └── index.json
    ├── common/
    │   └── init.json
    └── user/
        └── info/
            └── index.json
```

---

## 开发指南

### 新增一个 Mock 接口

1. 确认接口路由，例如 `custom/module/action`。
2. 创建文件 `src/mock/data/custom/module/action.json`。
3. 按规范写入响应数据。
4. 在 H5 环境下开启 Mock 并验证。

### 调试 Mock 命中情况

开启 Mock 后，打开浏览器控制台，未命中文件时会看到警告：

```
[Mock] 未找到 Mock 文件: custom/module/action，已回退到真实请求
```

### 扩展请求级开关支持

当前 `this.$api` 未透传第三个参数。若需支持：

```javascript
this.$api('user.info.index', {}, { mock: true });
```

可修改 `src/common/request/index.js`，将 `options` 透传至 `request.request({ url, data, method, ...options })`。

---

## 常见问题

### Q: 为什么微信小程序/App 无法使用 Mock？

Mock 系统仅设计用于 H5 开发环境。小程序和 App 通过 `// #ifdef H5` 条件编译排除 Mock 逻辑，避免引入不必要的 JSON 文件与运行时开销。

### Q: 为什么部分接口返回的是占位数据？

当真实后端返回 `data` 为空，或请求失败时，脚本会根据页面代码中的字段结构生成占位数据。这些占位数据仅保证页面能正常渲染，不代表真实业务值，建议根据 report 手动补全。

### Q: 如何更新已采集的 Mock 数据？

重新运行采集脚本即可覆盖已有文件：

```bash
node tools/mock-crawler/index.js --base-url=http://demo.selfbuilt.cn --uniacid=1
```

---

## 参与贡献

1. Fork 本仓库。
2. 创建功能分支：`git checkout -b feature/mock-xxx`。
3. 提交变更：`git commit -am 'feat(mock): add xxx'`。
4. 推送分支：`git push origin feature/mock-xxx`。
5. 提交 Pull Request。

---

## 许可证

随主项目以 [凸知开源协议 V1.0](./LICENSE) 协议分发（非商业免费，商业需授权），详见项目根 LICENSE。
