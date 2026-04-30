# 说明

## 上游项目

本项目基于 [siteboon/claudecodeui](https://github.com/siteboon/claudecodeui) 构建。

- 上游项目：[siteboon/claudecodeui](https://github.com/siteboon/claudecodeui)
- 适配测试版本：v1.25.2
- 上游许可证：GPL-3.0

claudecodeui 是一个基于 Web 的 AI 编程助手 UI，支持 Claude、Codex、Cursor、Gemini 等多种 Provider。
本项目在其基础上增加了手机远程控制、设备审批、安全收敛等能力。

## 本项目的改动

相对于上游 claudecodeui，本项目主要新增和修改了以下内容：

- `mobile_codex_control.py` — Windows 桌面控制台（tkinter GUI），用于启停服务、管理设备审批、查看状态
- `upstream-overrides/` — 对上游 server/ 的补丁文件，包括：
  - hardened mode（仅开放 Codex 功能）
  - 设备首次登录审批机制
  - Cookie + Bearer + WebSocket 多层认证兼容
  - Windows 非 ASCII 路径的 ASCII 安全别名
- `scripts/` — PowerShell 服务管理脚本（启停、Tailscale 远程、状态检查）
- `deploy/` — nginx / Caddy 部署配置模板

## 许可证

本项目及上游项目均采用 GPL-3.0 许可证。详见 [LICENSE](LICENSE)。
