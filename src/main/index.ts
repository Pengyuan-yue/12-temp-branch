import { shell, BrowserWindow, ipcMain } from 'electron'
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
      nodeIntegration: false
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
