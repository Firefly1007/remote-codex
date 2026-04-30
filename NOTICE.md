# 说明

## 上游项目

本项目基于以下两个上游项目构建：

### siteboon/claudecodeui

- 项目地址：[siteboon/claudecodeui](https://github.com/siteboon/claudecodeui)
- 适配版本：v1.25.2
- 许可证：GPL-3.0
- 贡献：Web UI 基础框架，提供项目/会话/消息管理、WebSocket 通信、认证系统等核心能力

### StarsTom/mobileCodexHelper

- 项目地址：[StarsTom/mobileCodexHelper](https://github.com/StarsTom/mobileCodexHelper)
- 许可证：GPL-3.0
- 贡献：桌面控制工具、部署脚本、设备审批机制、安全收敛策略等手机控制层

## 本项目的改动

本项目将上述两个上游项目整合为一个统一仓库，并做了以下新增和修改：

- `mobile_codex_control.py` — Windows 桌面控制台（tkinter GUI），用于启停服务、管理设备审批、查看状态
- `upstream-overrides/` — 对上游 claudecodeui server/ 的补丁文件，包括：
  - hardened mode（仅开放 Codex 功能）
  - 设备首次登录审批机制
  - Cookie + Bearer + WebSocket 多层认证兼容
  - Windows 非 ASCII 路径的 ASCII 安全别名
- `scripts/` — PowerShell 服务管理脚本（启停、Tailscale 远程、状态检查）
- `deploy/` — nginx / Caddy 部署配置模板

## 许可证

本项目及两个上游项目均采用 GPL-3.0 许可证。详见 [LICENSE](LICENSE)。
