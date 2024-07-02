const ipc = require('electron').ipcRenderer
const { ipcRenderer } = require('electron');
const { spawn } = require('child_process');


const $ = selector => document.querySelector(selector)
const $button = document.querySelector('#selectFasta');
const $button2 = document.querySelector('#selectBed');
const $k2Checkbox = document.getElementById('k2');
const $k3Checkbox = document.getElementById('k3');
const $processDataButton = document.querySelector('#processData');

let selectedKValue = 2;
let selectedFastaPath = "";
let selectedBedPath = "";


$button.addEventListener('click', (event)=>{
    ipc.send('select-file-fasta', { fileExtension: 'fasta' });
})

$button2.addEventListener('click', (event)=>{
    ipc.send('select-file-bed', { fileExtension: 'bed' });
})

$k2Checkbox.addEventListener('change', () => {
    if ($k2Checkbox.checked) {
        selectedKValue = "2";
        $k3Checkbox.checked = false;
    }
});

$k3Checkbox.addEventListener('change', () => {
    if ($k3Checkbox.checked) {
        selectedKValue = "3";
        $k2Checkbox.checked = false;
    }
});

$processDataButton.addEventListener('click', ()=>{
    //console.log('Fasta:', selectedFastaPath)
    //console.log('Bed:', selectedBedPath)
    //console.log('Valor de K:', selectedKValue)
    if (selectedFastaPath === ""){
        console.log("fasta vacio") 
    }
    if (selectedBedPath === ""){
        console.log("bed vacio")
    }
    if (selectedKValue != 2 && selectedKValue != 3)
    {
        console.log("k vacio")
    }

    const pythonScriptPath = 'C:\\Users\\Carlos\\Desktop\\tfg\\main.py'; //Modificar por la ruta del script main.py donde estará Python instalado
    const pythonProcess = spawn('python', [pythonScriptPath, selectedKValue, selectedFastaPath, selectedBedPath]);

    let pythonOutput = '';
    pythonProcess.stdout.on('data', (data) => {
        pythonOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Proceso de Python finalizado con código ${code}`);

        try {
            // Parsear los datos de salida de Python
            const parsedData = JSON.parse(pythonOutput);

            // Enviar los datos al proceso principal
            ipcRenderer.send('python-data', parsedData);
        } catch (error) {
            console.error('Error al parsear los datos de Python:', error);
        }
    });

})

ipc.on('file-selected-fasta', (event, filePath) => {
    selectedFastaPath = filePath;
    document.getElementById('selectedFastaLabel').innerText = filePath.split('\\').pop();
  });

ipc.on('file-selected-bed', (event, filePath) => {
    selectedBedPath = filePath;
    document.getElementById('selectedBedLabel').innerText = filePath.split('\\').pop();
  });

