# 上游覆盖文件

本目录包含对上游项目的补丁文件：

- **上游项目**：[siteboon/claudecodeui](https://github.com/siteboon/claudecodeui)
- **适配版本**：v1.25.2
- **上游许可证**：GPL-3.0

## 覆盖内容

`claudecodeui-1.25.2/` 中的文件是上游源文件的修改版本，主要增加了：

- **Hardened mode**：默认仅开放 Codex 功能（`CODEX_ONLY_HARDENED_MODE`）
- **设备审批**：新手机首次登录需电脑端批准
- **Cookie 认证**：适配 WebView 和移动端浏览器的会话管理
- **Windows 路径兼容**：非 ASCII 路径的 ASCII 安全别名

## 应用方法

1. 下载上游 `siteboon/claudecodeui` v1.25.2 到 `vendor/claudecodeui-1.25.2/`
2. 将 `claudecodeui-1.25.2/` 中的文件复制到上游目录，覆盖原文件
3. 在上游目录执行 `npm install`

## 归属

本项目基于 [siteboon/claudecodeui](https://github.com/siteboon/claudecodeui) 的工作。上游项目采用 GPL-3.0 许可证，本目录中的所有修改同样遵循该许可证。
