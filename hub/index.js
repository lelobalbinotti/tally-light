// override logging
// @see https://github.com/megahertz/electron-log#overriding-consolelog
Object.assign(console, require('electron-log').functions);

console.log("Using Electron Runner for vTally");
console.log("================================");
console.log("");

const { app, dialog } = require('electron');

// Aplicação de bandeja (Tray) - não encerrar quando não houver janelas
app.on('window-all-closed', (e) => {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }
});

let appLock = app.requestSingleInstanceLock();
if (!appLock) {
    dialog.showErrorBox(
        'Multiple instances',
        'Another instance of vTally is already running. Please close the other instance first.'
    );
    app.quit();
    return;
}

// Iniciar ponte OBS 30 (WebSocket v5 -> v4)
try {
    require('./src/obs_bridge');
} catch (e) {
    console.error('Erro ao iniciar ponte OBS:', e);
}

// start vTally
process.env.NODE_ENV = 'production';
require('vtally/src/server');
require('./src/tray');
