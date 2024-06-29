const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

// Carga Chart.js desde el directorio node_modules
const Chart = require('chart.js/auto');

let chartWindow;

// Configurar la variable de entorno PYTHONPATH para la ubicación de Python
process.env.PYTHONPATH = 'C:\\Users\\Carlos\\Desktop\\tfg';

const createWindow = ()=>{
    const window = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        resizable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    window.loadFile('index.html')
}

app.on('ready', () => {
    createWindow();
});

ipcMain.on('select-file-fasta', (event, { fileExtension }) => {
    const fileFilters = [{ name: 'Files', extensions: [fileExtension] }];
    
    dialog.showOpenDialog({ filters: fileFilters, properties: ['openFile'] }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            event.sender.send('file-selected-fasta', result.filePaths[0]);
        }
    }).catch(err => {
        console.log(err);
    });
});

ipcMain.on('select-file-bed', (event, { fileExtension }) => {
    const fileFilters = [{ name: 'Files', extensions: [fileExtension] }];
    
    dialog.showOpenDialog({ filters: fileFilters, properties: ['openFile'] }).then(result => {
        if (!result.canceled && result.filePaths.length > 0) {
            event.sender.send('file-selected-bed', result.filePaths[0]);
        }
    }).catch(err => {
        console.log(err);
    });
});

ipcMain.on('python-data', (event, data) => {
    console.log('Datos de Python recibidos en el proceso principal:', data);

    // Hacer lo que necesites con los datos recibidos
    if (!chartWindow) {
        // Crear una nueva ventana para mostrar el gráfico si aún no existe
        chartWindow = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        });

        // Cargar el archivo HTML de la gráfica en la nueva ventana
        chartWindow.loadFile('chart.html');

        // Liberar la ventana de la gráfica cuando se cierre
        chartWindow.on('closed', () => {
            chartWindow = null;
        });
    }

    // Envía los datos al proceso de renderizado
    chartWindow.webContents.on('dom-ready', () => {
        chartWindow.webContents.send('load-chart-data', data);
    });
});