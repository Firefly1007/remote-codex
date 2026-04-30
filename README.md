# Remote-Codex

> 基于 [siteboon/claudecodeui](https://github.com/siteboon/claudecodeui) 和 [StarsTom/mobileCodexHelper](https://github.com/StarsTom/mobileCodexHelper) 构建。

把你电脑上本地运行的 Codex 会话，变成一个可以在手机上访问和控制的私有网页面板。

这个项目适合下面这种需求：
- 你平时在电脑上跑 Codex
- 你想在手机上随时查看项目、会话、消息
- 你想从手机继续发消息，让电脑上的 Codex 接着执行
- 你希望默认是私有访问，并且新手机第一次登录要经过电脑批准

安全上的考虑：
- 仅允许你本人账号登录
- 首次新设备登录需电脑端授权
- 支持设备白名单，陌生设备不能直接进入
- 手机只发消息控制，不开放电脑桌面
- 远程访问建议走 Tailscale 等加密通道，降低暴露风险

如果你不熟悉这类项目，也没关系。只要你有 Codex，部署方案：在你电脑 Codex 新起一个线程，复制本项目链接地址：https://github.com/StarsTom/mobileCodexHelper ，然后分析依赖并安装调试运行。

如果觉得还有点用，请帮忙 star 一下，谢谢啦~

## 界面预览

![移动 Codex 控制台预览](docs/assets/mobile-codex-control-console.png)

## 它能做什么

- 在手机浏览器中查看 Codex 项目和会话
- 在手机上发送消息，继续控制电脑上的 Codex
- 首次登录新设备时，必须由电脑端批准
- 在 Windows 桌面工具中查看：
  - 本地服务状态
  - 手机访问开关状态
  - 已批准设备白名单
  - 待审批设备列表

## 它不能做什么

- 不适合多人协作
- 不建议把 Node 服务直接暴露到公网
- 默认不是远程桌面，也不是完整 IDE
- 重点是"手机查看和聊天控制"，不是开放所有高风险能力

## 整体工作方式

```
手机浏览器
   ↓ HTTPS（Tailscale 私网）
Tailscale Serve
   ↓ HTTP（127.0.0.1:8080）
nginx 反向代理（安全头、限流、WebSocket 升级）
   ↓ HTTP/WebSocket（127.0.0.1:3001）
Node.js 应用（Express + WebSocket）
   ↓
本地 Codex 会话
```

## 环境要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| Node.js | 22 LTS | 运行 Web 服务 |
| Python | 3.11+ | 运行桌面控制台 |
| nginx | Windows 版 | 反向代理 |
| Tailscale | 最新版 | 私网加密通道（强烈推荐） |

## 安装 nginx

1. 下载 nginx for Windows：https://nginx.org/en/download.html （选 Stable version 的 zip 包）
2. 解压到一个纯英文路径，例如 `D:\Program Files\nginx-1.30.0`
3. 设置环境变量让脚本能找到 nginx：
   ```powershell
   # 当前会话临时生效
   $env:MOBILE_CODEX_NGINX = "D:\Program Files\nginx-1.30.0\nginx.exe"

   # 或者永久设置（重新打开 PowerShell 后生效）
   [System.Environment]::SetEnvironmentVariable("MOBILE_CODEX_NGINX", "D:\Program Files\nginx-1.30.0\nginx.exe", "User")
   ```

4. 验证安装：
   ```powershell
   & $env:MOBILE_CODEX_NGINX -v
   ```

## 安装 Tailscale

1. 下载 Tailscale：https://tailscale.com/download/windows
2. 运行安装程序，按提示完成安装
3. 安装后会在系统托盘出现 Tailscale 图标，点击登录你的账号
4. 设置环境变量（如果安装路径不是默认的 `D:\Program Files\Tailscale\`）：
   ```powershell
   # 当前会话临时生效
   $env:MOBILE_CODEX_TAILSCALE = "你的路径\tailscale.exe"

   # 或者永久设置
   [System.Environment]::SetEnvironmentVariable("MOBILE_CODEX_TAILSCALE", "你的路径\tailscale.exe", "User")
   ```
5. 验证安装：
   ```powershell
   & $env:MOBILE_CODEX_TAILSCALE status
   ```

> **注意：** 手机上也需要安装 Tailscale 并登录**同一个账号**，才能访问你的电脑。

## 快速开始

### 第一步：一次性准备

```powershell
# 安装 Node.js 依赖
npm install

# 首次注册账号：启动开发服务器
npm run dev
```

浏览器打开 `http://127.0.0.1:3001`，完成首次注册。这个账号是你的唯一管理员账号。

注册完成后，`Ctrl+C` 停掉开发服务器。

### 第二步：启动桌面控制台

```powershell
python mobile_codex_control.py
```

控制台会自动查找 nginx 和 Tailscale 的安装路径。如果自动查找失败，手动设置环境变量：

```powershell
$env:MOBILE_CODEX_NGINX = "D:\Program Files\nginx-1.30.0\nginx.exe"
$env:MOBILE_CODEX_TAILSCALE = "D:\Program Files\Tailscale\tailscale.exe"
```

### 第三步：用控制台按钮完成后续所有操作

控制台窗口打开后，点击对应按钮即可：

| 按钮 | 功能 |
|------|------|
| **启动服务** | 启动 Node.js 应用 + nginx 代理 |
| **开启远程发布** | 启用 Tailscale Serve，生成 HTTPS 访问地址 |
| **打开本地面板** | 在浏览器打开 `http://127.0.0.1:3001` |

控制台会自动刷新状态，显示：
- 服务运行状态
- 远程发布状态
- 在线手机设备
- 设备白名单
- 待审批设备列表

### 第四步：手机访问

1. 手机安装 Tailscale 并登录**同一个账号**
2. 控制台中查看 Tailscale Serve 的 HTTPS 地址（类似 `https://你的电脑名.ts.net`）
3. 手机浏览器打开该地址
4. 输入账号密码登录
5. 首次登录会提示"等待电脑端批准"

### 第五步：在控制台中批准设备

手机登录后，控制台的"待审批设备"列表会自动出现新设备。选中设备，点击"批准所选"即可。

批准后，手机端会自动继续登录，之后就可以在手机上查看项目、会话、发送消息了。

## 首次设备批准

这是本项目最重要的安全机制之一。

当一个新手机或新 WebView 第一次登录时：

1. 手机端会提示"等待电脑端批准"
2. 电脑端桌面控制工具会出现待审批设备
3. 你核对设备名、平台、UA、IP 后点击"批准所选"
4. 手机端自动继续登录

这样做的好处是：

- 即使账号密码泄露，未知设备也不能直接登录
- 你可以控制哪些手机被加入白名单

## 部署成功的判断标准

如果下面这些都满足，说明部署基本成功：

- 电脑端 `http://127.0.0.1:3001` 能打开
- 桌面控制工具里 PC 应用服务和 nginx 都是正常
- 手机能打开私有 HTTPS 地址
- 手机首次登录时，电脑端能看到待审批设备
- 你批准后，手机能进入项目和会话列表
- 手机发送消息后，电脑上的 Codex 会继续执行

## 访问地址

### 生产模式（通过控制台或脚本启动）

| 场景 | 地址 | 说明 |
|------|------|------|
| 本机面板 | `http://127.0.0.1:3001` | 后端同时提供 API 和前端页面 |
| 本机通过 nginx | `http://127.0.0.1:8080` | nginx 反向代理到 3001 |
| 手机远程 | `https://你的电脑名.ts.net` | Tailscale 地址 |

### 开发模式（`npm run dev`）

| 场景 | 地址 | 说明 |
|------|------|------|
| 前端页面 | `http://127.0.0.1:5173` | Vite 开发服务器（热更新） |
| 后端 API | `http://127.0.0.1:3001` | Express API + WebSocket |

## 常用操作

### 通过桌面控制台（推荐）

```powershell
python mobile_codex_control.py
```

所有操作都可以在 GUI 中完成：启动/停止服务、开启/关闭远程、批准设备、查看状态。

### 通过命令行

```powershell
# 启动整套服务（应用 + nginx）
powershell -ExecutionPolicy Bypass -File scripts/start-mobile-codex-stack.ps1

# 停止整套服务
powershell -ExecutionPolicy Bypass -File scripts/stop-mobile-codex-stack.ps1

# 启用 Tailscale 远程
powershell -ExecutionPolicy Bypass -File scripts/enable-mobile-codex-remote.ps1

# 检查 Tailscale 状态
powershell -ExecutionPolicy Bypass -File scripts/check-tailscale-status.ps1

# 开发模式（前端热更新）
npm run dev

# 构建前端
npm run build

# 仅启动后端服务
npm run server
```

## 环境变量

在 `.env` 文件中配置：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3001` | 后端服务端口 |
| `VITE_PORT` | `5173` | 前端开发端口 |
| `HOST` | `127.0.0.1` | 绑定地址，建议保持 localhost |
| `CODEX_ONLY_HARDENED_MODE` | `true` | 硬核模式，仅开放 Codex 功能 |
| `VITE_CODEX_ONLY_HARDENED_MODE` | `true` | 前端硬核模式 |
| `AUTH_COOKIE_NAME` | `codex_auth` | 认证 Cookie 名称 |
| `AUTH_COOKIE_SECURE` | 未设置 | HTTPS 时设为 `true` |
| `CONTEXT_WINDOW` | `160000` | 上下文窗口大小 |

脚本相关的环境变量：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MOBILE_CODEX_NODE` | `node`（PATH） | Node.js 路径 |
| `MOBILE_CODEX_NGINX` | `nginx`（PATH） | nginx 路径 |
| `MOBILE_CODEX_TAILSCALE` | `D:\Program Files\Tailscale\tailscale.exe` | Tailscale CLI 路径 |
| `MOBILE_CODEX_UPSTREAM_DIR` | 项目根目录 | 应用代码目录 |
| `MOBILE_CODEX_ASCII_ALIAS` | `C:\mobileCodexHelper_ascii` | nginx ASCII 安全路径 |

## 可选：自己从源码构建

如果你想自己维护、二次开发，或者重新生成便携发布目录，按以下步骤操作。

### 目录结构

```text
mobile-codex-helper/
├─ deploy/
├─ docs/
├─ scripts/
├─ upstream-overrides/
├─ vendor/
│  └─ claudecodeui-1.25.2/
├─ mobile_codex_control.py
└─ requirements.txt
```

其中 `vendor/claudecodeui-1.25.2/` 是你自己下载的上游源码，`upstream-overrides/` 是本项目对上游的覆盖文件。

### 源码部署步骤

1. 下载上游 `siteboon/claudecodeui` v1.25.2，放到 `vendor/claudecodeui-1.25.2`
2. 将 `upstream-overrides/claudecodeui-1.25.2/` 中的文件复制到上游目录，覆盖原文件
3. 在上游目录执行 `npm install`
4. 回到项目根目录，执行 `npm install`
5. 执行 `python mobile_codex_control.py` 启动桌面工具
6. 后续操作与快速开始的第三步起相同

如果要把桌面工具打包成 `.exe`，还需要执行 `pip install -r requirements.txt`。

### 部署完成后建议自查

- 手机上第一次登录时，电脑端确实会弹出待审批设备
- 同一个账号换一台新手机时，旧设备不会自动继承信任
- 关闭 PC 服务后，手机端不会继续拿到可用会话
- 你没有把任何真实 `.env`、数据库、日志放进仓库

### 建议下一步

- 把桌面工具打包成 `.exe`
- 配置你自己的 Tailscale 访问方式
- 根据你自己的环境调整 nginx / Caddy 配置

## 最容易失败的 3 个点

### 1. 程序目录不完整或位置被改动

先确认这两件事：

- 你解压的是整个便携目录，而不是只拿出了其中的 `MobileCodexControl.exe`
- 程序目录里没有误删 `vendor/claudecodeui-1.25.2`

如果你是自己从源码构建的维护者，再额外确认：

- 使用的是 `claudecodeui v1.25.2`
- 目录名是 `vendor/claudecodeui-1.25.2`

### 2. 本机依赖路径没有被脚本找到

最常见的是：

- `node.exe`
- `nginx.exe`
- `tailscale.exe`

确认这些都在 PATH 中或在桌面工具里正确配置。只要有空值，就先不要继续下一步。

### 3. 手机封装壳不兼容

如果手机浏览器能登录，但封装成 App 的 WebView 不行，先默认怀疑是壳兼容问题，不要先怀疑账号密码。

优先建议：

- 先用手机浏览器打通全流程
- 再测试封装 App
- 确认壳支持 `localStorage`、Cookie、`Authorization` 请求头和 WebSocket

## 常见问题

### 手机能打开页面但登录后没反应

检查桌面控制台是否出现待审批设备，首次登录需要电脑端批准。

### 出现 502 错误

检查日志：
- `tmp/logs/mobile-codex-app.stdout.log`
- `tmp/logs/mobile-codex-app.stderr.log`
- nginx 日志在 `.runtime/nginx/logs/` 下

### nginx 启动失败

常见原因：路径包含中文字符。脚本会自动创建 ASCII 安全路径（`C:\mobileCodexHelper_ascii`），如果仍有问题，检查该路径的 junction 是否正确创建。

### Tailscale Serve 启用失败

运行 `check-tailscale-status.ps1` 检查状态。如果提示需要在 Tailscale 控制台启用 Serve，按输出的链接操作。

### 手机浏览器能登录但封装 App 不行

检查 WebView 是否支持 `localStorage`、Cookie、`Authorization` 请求头和 WebSocket。

### 为什么不直接公网暴露？

因为这个项目控制的是你电脑上的本地 Codex，会话权限很高。
推荐私网、反向代理、设备白名单三层一起用，不建议直接裸露到公网。

## 推荐阅读

- 架构说明：[`docs/ARCHITECTURE.zh-CN.md`](docs/ARCHITECTURE.zh-CN.md)
- 安全策略：[`SECURITY.md`](SECURITY.md)
- 开源发布检查清单：[`docs/OPEN_SOURCE_RELEASE_CHECKLIST.zh-CN.md`](docs/OPEN_SOURCE_RELEASE_CHECKLIST.zh-CN.md)

## 项目来源

本项目基于以下两个上游项目构建：

| 上游项目 | 说明 | 许可证 |
|----------|------|--------|
| [siteboon/claudecodeui](https://github.com/siteboon/claudecodeui) | Web UI 基础框架，提供项目/会话/消息管理、WebSocket 通信、认证系统等核心能力 | GPL-3.0 |
| [StarsTom/mobileCodexHelper](https://github.com/StarsTom/mobileCodexHelper) | 桌面控制工具、部署脚本、设备审批机制等手机控制层 | GPL-3.0 |

本项目在上游基础上主要增加了：

- `mobile_codex_control.py` — Windows 桌面控制台（tkinter GUI）
- `upstream-overrides/` — 对 claudecodeui 的补丁文件（hardened mode、设备审批、Cookie 认证、Windows 路径兼容）
- `scripts/` — 服务启停、Tailscale 远程访问等 PowerShell 脚本
- `deploy/` — nginx / Caddy 部署配置模板

请保留上游归属说明、本仓库中的许可证、以及对上游改动的说明。

## 贡献者

感谢以下上游项目的贡献者：

### [siteboon/claudecodeui](https://github.com/siteboon/claudecodeui)

[@viper151](https://github.com/viper151)
[@blackmammoth](https://github.com/blackmammoth)
[@EricBlanquer](https://github.com/EricBlanquer)
[@lvalics](https://github.com/lvalics)
[@DumoeDss](https://github.com/DumoeDss)
[@PaloSP](https://github.com/PaloSP)
[@NobitaYuan](https://github.com/NobitaYuan)
[@menny](https://github.com/menny)
[@itsmepicus](https://github.com/itsmepicus)
[@unsystemizer](https://github.com/unsystemizer)

### [StarsTom/mobileCodexHelper](https://github.com/StarsTom/mobileCodexHelper)

[@StarsTom](https://github.com/StarsTom)

### 本仓库

[@Firefly1007](https://github.com/Firefly1007)

## 发布前建议

如果你打算把你自己的改动再公开发布，至少先通读一次 [`SECURITY.md`](SECURITY.md)。
