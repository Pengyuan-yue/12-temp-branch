import { shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { registerApiHandlers } from './api-handlers'

// 延迟导入app模块以避免构建问题
let app: any;
let isDev = false;

async function loadApp() {
  if (!app) {
    app = await import('electron').then(m => m.app);
    isDev = process.env.NODE_ENV === 'development';
  }
  return app;
}

async function createWindow(): Promise<void> {
  const app = await loadApp();
  
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    title: 'Wiza潜在客户搜索工具',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      nodeIntegrationInWorker: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    // 开发环境下自动打开开发者工具
    if (isDev) {
      mainWindow.webContents.openDevTools()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // 开发环境下加载本地服务器，生产环境下加载本地文件
  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    console.log('Loading development URL:', process.env['ELECTRON_RENDERER_URL'])
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    console.log('Loading production file:', join(__dirname, '../renderer/index.html'))
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // 添加错误处理
  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL)
  })

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM ready')
  })

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading')
  })
}

// 当Electron完成初始化并准备创建浏览器窗口时调用此方法
async function startApp() {
  const app = await loadApp();
  
  // 为Windows设置应用用户模型ID
  app.setAppUserModelId('com.wiza.desktop')

  // 在开发中默认按F12打开或关闭DevTools
  // 在生产中忽略CommandOrControl + R
  // 不再使用optimizer.watchWindowShortcuts

  // IPC测试
  ipcMain.handle('ping', () => 'pong')
  
  // 添加文件夹选择处理
  ipcMain.handle('select-directory', async () => {
    try {
      console.log('正在打开文件夹选择对话框...')
      const result = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: '选择导出文件保存位置'
      })
      console.log('文件夹选择对话框结果:', result)
      
      if (result.canceled) {
        console.log('用户取消了文件夹选择')
        return { success: false, error: '用户取消操作' }
      }
      
      if (!result.filePaths || result.filePaths.length === 0) {
        console.log('未选择任何文件夹')
        return { success: false, error: '未选择任何文件夹' }
      }
      
      const selectedPath = result.filePaths[0]
      console.log('用户选择的文件夹路径:', selectedPath)
      
      // 检查路径是否有效
      const fs = await import('fs')
      const path = await import('path')
      
      try {
        // 尝试创建测试文件检查写入权限
        const testFile = path.join(selectedPath, 'wiza_test_permission.tmp')
        fs.writeFileSync(testFile, '权限测试文件')
        fs.unlinkSync(testFile)
        console.log('文件夹写入权限验证通过')
      } catch (err) {
        console.error('文件夹写入权限验证失败:', err)
        return { 
          success: false, 
          error: `无写入权限: ${err instanceof Error ? err.message : '未知错误'}` 
        }
      }
      
      return { success: true, path: selectedPath }
    } catch (error) {
      console.error('文件夹选择错误:', error)
      return { 
        success: false, 
        error: `文件夹选择失败: ${error instanceof Error ? error.message : '未知错误'}` 
      }
    }
  })

  // 添加导出到Excel处理程序
  ipcMain.handle('export-to-excel', async (_, data, filename) => {
    try {
      console.log('正在导出数据到Excel...');
      console.log(`数据条数: ${data.length}, 文件名: ${filename}`);
      
      const fs = await import('fs');
      const path = await import('path');
      const ExcelJS = await import('exceljs');
      
      // 创建工作簿和工作表
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('联系人数据');
      
      // 如果数据为空，返回错误
      if (!data || data.length === 0) {
        console.error('导出数据为空');
        return false;
      }
      
      // 添加表头
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
      
      // 添加数据行
      data.forEach(item => {
        const row = [];
        headers.forEach(header => {
          row.push(item[header] || '');
        });
        worksheet.addRow(row);
      });
      
      // 设置列宽
      worksheet.columns.forEach(column => {
        column.width = 20;
      });
      
      // 获取下载目录
      const downloadPath = app.getPath('downloads');
      const filePath = path.join(downloadPath, `${filename}.xlsx`);
      
      console.log(`保存文件到: ${filePath}`);
      
      // 写入文件
      await workbook.xlsx.writeFile(filePath);
      console.log('Excel文件导出成功');
      
      // 打开文件所在目录
      shell.showItemInFolder(filePath);
      
      return true;
    } catch (error) {
      console.error('导出到Excel失败:', error);
      return false;
    }
  });

  // 注册API处理器
  registerApiHandlers()

  await createWindow();

  app.on('activate', async function () {
    if (BrowserWindow.getAllWindows().length === 0) await createWindow();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });
}

// 启动应用程序
startApp().catch(err => {
  console.error('启动应用程序失败:', err);
});
