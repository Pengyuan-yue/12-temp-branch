@echo off
echo ========================================
echo   Wiza潜在客户搜索工具 - 管理员构建
echo ========================================
echo.

:: 检查管理员权限
net session >nul 2>&1
if errorlevel 1 (
    echo ❌ 需要管理员权限运行此脚本
    echo.
    echo 请右键点击此文件，选择"以管理员身份运行"
    echo.
    pause
    exit /b 1
)

echo ✅ 管理员权限确认

:: 设置环境变量禁用代码签名
set CSC_IDENTITY_AUTO_DISCOVERY=false

echo.
echo 🔄 开始构建应用...
npm run build

if errorlevel 1 (
    echo ❌ 构建失败
    pause
    exit /b 1
)

echo.
echo 📦 开始打包Windows应用...
npx electron-builder --win

if errorlevel 1 (
    echo ❌ 打包失败
    pause
    exit /b 1
)

echo.
echo 🎉 构建完成！
echo.
echo 安装包位置: dist\
dir dist\*.exe
echo.
pause 