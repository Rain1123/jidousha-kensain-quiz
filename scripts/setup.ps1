# 初回セットアップ用スクリプト（PowerShell）
# 使い方: .\scripts\setup.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (-not (Test-Path .git)) {
    git init
    Write-Host "git init 完了"
}

npm install
npm run build

Write-Host ""
Write-Host "セットアップ完了"
Write-Host "開発サーバー: npm run dev"
Write-Host "ビルド出力: dist/"
