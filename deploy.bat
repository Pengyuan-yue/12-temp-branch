@echo off
echo ========================================
echo    Wiza潜在客户搜索工具 - 部署脚本
echo ========================================
echo.

:: 检查Node.js环境
echo [1/6] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)
echo ✅ Node.js环境检查通过

:: 检查npm环境
echo.
echo [2/6] 检查npm环境...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到npm
    pause
    exit /b 1
)
echo ✅ npm环境检查通过

:: 安装依赖
echo.
echo [3/6] 安装项目依赖...
npm install
if errorlevel 1 (
    echo ❌ 错误: 依赖安装失败
    pause
    exit /b 1
)
echo ✅ 依赖安装完成

:: 类型检查
echo.
echo [4/6] 执行TypeScript类型检查...
npm run typecheck
if errorlevel 1 (
    echo ❌ 错误: TypeScript类型检查失败
    pause
    exit /b 1
)
echo ✅ TypeScript类型检查通过

:: 构建项目
echo.
echo [5/6] 构建项目...
npm run build
if errorlevel 1 (
    echo ❌ 错误: 项目构建失败
    pause
    exit /b 1
)
echo ✅ 项目构建完成

:: 打包应用
echo.
echo [6/6] 打包Windows应用...
npm run build:win
if errorlevel 1 (
    echo ❌ 错误: 应用打包失败
    pause
    exit /b 1
)
echo ✅ 应用打包完成

echo.
echo ========================================
echo           🎉 部署完成！
echo ========================================
echo.
echo 安装包位置: dist\Wiza潜在客户搜索工具 Setup 1.0.0.exe
echo.
echo 下一步操作:
echo 1. 测试安装包
echo 2. 进行用户验收测试
echo 3. 准备发布
echo.
pause 