@echo off
chcp 65001 >nul
echo ========================================
echo    Wiza潜在客户搜索工具 - 发布前检查
echo ========================================
echo.

:: 设置颜色
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "RESET=[0m"

:: 初始化检查结果
set /a total_checks=0
set /a passed_checks=0
set /a failed_checks=0

echo %BLUE%🔍 开始发布前检查...%RESET%
echo.

:: 检查1: Node.js环境
echo %BLUE%[1/10] 检查Node.js环境...%RESET%
set /a total_checks+=1
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ Node.js未安装或不可用%RESET%
    set /a failed_checks+=1
) else (
    echo %GREEN%✅ Node.js环境正常%RESET%
    set /a passed_checks+=1
)

:: 检查2: npm环境
echo.
echo %BLUE%[2/10] 检查npm环境...%RESET%
set /a total_checks+=1
npm --version >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ npm不可用%RESET%
    set /a failed_checks+=1
) else (
    echo %GREEN%✅ npm环境正常%RESET%
    set /a passed_checks+=1
)

:: 检查3: 依赖安装
echo.
echo %BLUE%[3/10] 检查项目依赖...%RESET%
set /a total_checks+=1
if not exist "node_modules" (
    echo %YELLOW%⚠️ 依赖未安装，正在安装...%RESET%
    npm install
    if errorlevel 1 (
        echo %RED%❌ 依赖安装失败%RESET%
        set /a failed_checks+=1
    ) else (
        echo %GREEN%✅ 依赖安装成功%RESET%
        set /a passed_checks+=1
    )
) else (
    echo %GREEN%✅ 项目依赖已安装%RESET%
    set /a passed_checks+=1
)

:: 检查4: 项目构建
echo.
echo %BLUE%[4/10] 执行项目构建...%RESET%
set /a total_checks+=1
npm run build >nul 2>&1
if errorlevel 1 (
    echo %RED%❌ 项目构建失败%RESET%
    set /a failed_checks+=1
) else (
    echo %GREEN%✅ 项目构建成功%RESET%
    set /a passed_checks+=1
)

:: 检查5: 输出文件
echo.
echo %BLUE%[5/10] 检查构建输出...%RESET%
set /a total_checks+=1
if exist "out\main\index.js" if exist "out\preload\index.js" if exist "out\renderer\index.html" (
    echo %GREEN%✅ 构建输出文件完整%RESET%
    set /a passed_checks+=1
) else (
    echo %RED%❌ 构建输出文件不完整%RESET%
    set /a failed_checks+=1
)

:: 检查6: 应用图标
echo.
echo %BLUE%[6/10] 检查应用图标...%RESET%
set /a total_checks+=1
if exist "resources\icon.ico" (
    for %%A in ("resources\icon.ico") do (
        if %%~zA GTR 1000 (
            echo %GREEN%✅ 应用图标文件正常 (%%~zA 字节)%RESET%
            set /a passed_checks+=1
        ) else (
            echo %YELLOW%⚠️ 应用图标文件过小 (%%~zA 字节)，建议更新%RESET%
            set /a passed_checks+=1
        )
    )
) else (
    echo %RED%❌ 应用图标文件缺失%RESET%
    set /a failed_checks+=1
)

:: 检查7: package.json配置
echo.
echo %BLUE%[7/10] 检查package.json配置...%RESET%
set /a total_checks+=1
findstr /C:"\"version\": \"1.0.0\"" package.json >nul
if errorlevel 1 (
    echo %YELLOW%⚠️ 版本号可能需要更新%RESET%
    set /a passed_checks+=1
) else (
    echo %GREEN%✅ 版本号配置正确 (1.0.0)%RESET%
    set /a passed_checks+=1
)

:: 检查8: 文档文件
echo.
echo %BLUE%[8/10] 检查文档文件...%RESET%
set /a total_checks+=1
if exist "README.md" if exist "pre-release-checklist.md" (
    echo %GREEN%✅ 文档文件完整%RESET%
    set /a passed_checks+=1
) else (
    echo %RED%❌ 文档文件不完整%RESET%
    set /a failed_checks+=1
)

:: 检查9: 部署脚本
echo.
echo %BLUE%[9/10] 检查部署脚本...%RESET%
set /a total_checks+=1
if exist "deploy.bat" (
    echo %GREEN%✅ 部署脚本存在%RESET%
    set /a passed_checks+=1
) else (
    echo %RED%❌ 部署脚本缺失%RESET%
    set /a failed_checks+=1
)

:: 检查10: 磁盘空间
echo.
echo %BLUE%[10/10] 检查磁盘空间...%RESET%
set /a total_checks+=1
for /f "tokens=3" %%a in ('dir /-c ^| find "可用字节"') do set available_space=%%a
if defined available_space (
    echo %GREEN%✅ 磁盘空间充足%RESET%
    set /a passed_checks+=1
) else (
    echo %YELLOW%⚠️ 无法检查磁盘空间%RESET%
    set /a passed_checks+=1
)

:: 显示检查结果
echo.
echo ========================================
echo           📊 检查结果汇总
echo ========================================
echo.
echo 总检查项目: %total_checks%
echo %GREEN%通过项目: %passed_checks%%RESET%
echo %RED%失败项目: %failed_checks%%RESET%
echo.

:: 计算通过率
set /a pass_rate=(%passed_checks% * 100) / %total_checks%
echo 通过率: %pass_rate%%%

if %failed_checks% EQU 0 (
    echo.
    echo %GREEN%🎉 所有检查项目都通过了！%RESET%
    echo %GREEN%✅ 项目已准备好发布%RESET%
    echo.
    echo 下一步操作:
    echo 1. 运行 deploy.bat 创建安装包
    echo 2. 在目标系统上测试安装包
    echo 3. 进行最终用户验收测试
) else (
    echo.
    echo %YELLOW%⚠️ 发现 %failed_checks% 个问题需要解决%RESET%
    echo.
    echo 建议操作:
    echo 1. 查看上述失败项目
    echo 2. 修复相关问题
    echo 3. 重新运行此检查脚本
)

echo.
echo ========================================
echo 详细信息请查看: pre-release-checklist.md
echo ========================================
echo.
pause 