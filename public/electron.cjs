const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1400,
        height: 850,


        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs')
        }
    })
    win.webContents.setZoomLevel(0);
    win.webContents.setZoomFactor(1.0);

    win.loadURL('http://localhost:6767')
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// Select folder
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openDirectory'] // It only can select folders (not files)
    });

    if (result.canceled) {
        return null;
    } else {
        return result.filePaths[0]; // return address of the folder
    }
});