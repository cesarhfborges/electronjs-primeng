const {app, BrowserWindow, Tray, screen, Menu, ipcMain, Notification} = require('electron')
const url = require("url");
const path = require("path");
require('dotenv').config()

let mainWindow;

const iconPath = path.join(__dirname, 'favicon.ico');

function createWindow() {

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Mostrar/Ocultar', click: function () {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
      }
    },
    {
      label: 'Encerrar', click: function () {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);

  const sizes = {
    width: 1000,
    height: 720,
  };

  const tray = new Tray(iconPath);

  mainWindow = new BrowserWindow({
    width: sizes.width,
    height: sizes.height,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      backgroundThrottling: true,
      enableRemoteModule: true,
      autoplayPolicy: "no-user-gesture-required",
      allowRunningInsecureContent: true,
      plugins: true,
      devTools: true,
      javascript: true,
      contextIsolation: false,
    },
    icon: iconPath,
    title: 'Electron PrimeNG',
    resizable: true,
    minimizable: true,
    maximizable: true,
    center: true,
    frame: true,
    // x: screen.getPrimaryDisplay().size.width - sizes.width,
    // y: screen.getPrimaryDisplay().size.height - sizes.height,
  });

  tray.on("click", () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
      // notifications('CooperSystem', 'Aplicativo minimizado');
    } else {
      mainWindow.show();
    }
  });
  tray.setContextMenu(contextMenu);

  mainWindow.tray = tray;

  if (process.env.PRODUCTION) {
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, `/dist/index.html`),
        protocol: "file:",
        slashes: true
      })
    );
  } else {
    mainWindow.loadURL('http://localhost:4003').then(r => console.log(r));
  }

  mainWindow.focus();
  if (process.env.SHOW_CONSOLE) {
    // Open the DevTools.
    mainWindow.webContents.openDevTools({mode: 'detach', activate: true});
  }

  if (!process.env.SHOW_MENU) {
    mainWindow.removeMenu();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  mainWindow.on('close', function (event) {
    if(!app.isQuiting){
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

ipcMain.on('alert', (event, {title, message}) => {
  const n = new Notification({icon: iconPath, title: title, body: message});
  n.show();
});

app.on('ready', () => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
