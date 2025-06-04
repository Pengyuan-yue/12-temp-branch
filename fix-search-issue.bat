@echo off
echo ========================================
echo 修复搜索显示0结果问题
echo ========================================
echo.
echo 步骤1: 清除Node.js缓存...
npm cache clean --force

echo.
echo 步骤2: 删除node_modules和重新安装依赖...
if exist node_modules rmdir /s /q node_modules
npm install

echo.
echo 步骤3: 清除构建缓存...
if exist dist rmdir /s /q dist
if exist out rmdir /s /q out

echo.
echo 步骤4: 重新构建应用...
npm run build

echo.
echo 步骤5: 启动开发服务器...
echo 请在新的终端窗口中运行: npm run dev
echo.
echo ========================================
echo 修复完成！
echo ========================================
echo.
echo 如果问题仍然存在，请：
echo 1. 打开浏览器开发者工具 (F12)
echo 2. 在Network标签页中查看API请求
echo 3. 在Console标签页中查看错误信息
echo 4. 使用debug-search.html工具直接测试API
echo.
pause 