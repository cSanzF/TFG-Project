const ipc = require('electron').ipcRenderer
const { ipcRenderer } = require('electron');

let currentChartType = 'line';
let flag = 0; 
let flagValues = false;
let chartData;
let chartDataArray = [];
let chartValueData;
let isDimer
const canvas = document.getElementById('line-chart');
const canvashm = document.getElementById('content');
const canvasvalues = document.getElementById('contentvalues');
const ctx = canvas.getContext('2d');

ipcRenderer.on('load-chart-data', (event, data) => {
    chartValueData = data;
    console.log("ON load-chart-data")
    // Lógica para mostrar la gráfica de líneas con Chart.js
   

    // Determinar si los datos son dímeros o trímeros
    isDimer = Object.keys(data)[0].length === 2;
    const isTrimer = Object.keys(data)[0].length === 3;

    
    // Configurar los datos de la gráfica
        console.log("Pintando line")
        chartData = {
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], // Posiciones en el eje X
            datasets: Object.entries(data).map(([key, value]) => ({
                label: key, // Etiqueta para cada dímero o trímero
                data: isTrimer ? [null, null, ...value.slice(2).map(val => Math.log10(val))] : [null, ...value.slice(1).map(val => Math.log10(val))], // Insertar valores nulos para dímeros y trímeros   -> value,  Valores en el eje Y
                borderColor: getRandomColor(), // Color aleatorio para cada línea
                borderWidth: 1,
                fill: false
            }))
        };
        drawLineChart(ctx, chartData);

        let y = 1;
        Object.keys(data).forEach((key, index) => {
            let values = data[key];
            values.forEach((value, idx) => {
                //if (value !== -Infinity) {
                if (value !== 0){
                    chartDataArray.push({ x: y, y: key, heat: Math.log10(value) });
                }else {
                    // Para dímeros y trímeros, mostrar el valor como cero
                       chartDataArray.push({ x: y, y: key, heat: 0 });
                }
                y++;
            });
            y = 1;
        });
});

function drawLineChart(ctx, chartData) {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Posición'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Log10 Valor'
                }
            }
        }
    };
    canvas.height = 900;
    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });
}

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color
}

function showLineChart() {
    console.log('ShowLineChart', currentChartType)
    if (currentChartType !== 'line') {
      currentChartType = 'line';
      canvas.style.display = "block";
      canvashm.style.display = "none";
      canvasvalues.style.display ='none';
    }
}

function showHeatmapChart() {
    console.log('ShowHeatMapChart: ', currentChartType)
    canvas.style.display = "none";
    canvashm.style.display = "block";
    canvasvalues.style.display ='none';
    if (currentChartType !== 'heatmap' && flag === 0) {
      currentChartType = 'heatmap'
      flag = 1;
      drawHeatmapChart(chartDataArray);
    } else if (currentChartType !== 'heatmap' && flag === 1){
        currentChartType = 'heatmap'
    }
}

function showValues() {
    const canvasvalues = document.getElementById('contentvalues');
    hideCharts();
    
    if (canvasvalues && !flagValues) {
        flagValues = true;
        
        const contentDiv = canvasvalues;
        const table = document.createElement('table');
        const tableBody = document.createElement('tbody');

        // Obtener las claves (etiquetas) del objeto chartData
        const labels = Object.keys(chartValueData);

        // Crear la primera fila de la tabla con los números del 1 al 10
        const headerRow = document.createElement('tr');
        for (let i = 0; i <= 10; i++) {
            const cell = document.createElement('th');
            cell.textContent = i === 0 ? ' ' : i;
            headerRow.appendChild(cell);
        }
        tableBody.appendChild(headerRow);

        // Iterar sobre las etiquetas (claves) de chartData
        labels.forEach(label => {
            const rowData = chartValueData[label];
            const row = document.createElement('tr');

            // Agregar la etiqueta como primera celda de la fila
            const labelCell = document.createElement('td');
            labelCell.textContent = label;
            row.appendChild(labelCell);

            // Iterar sobre los valores de la etiqueta y crear las celdas correspondientes
            rowData.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                cell.style.padding = '8px'; 
                row.appendChild(cell);
            });

            // Agregar la fila a la tabla
            tableBody.appendChild(row);
            tableBody.style.borderSpacing = '5px';
        });
        // Agregar separación entre columnas
        table.style.borderCollapse = 'separate';
        table.style.borderSpacing = '5px';

        // Agregar el cuerpo de la tabla al elemento de tabla
        table.appendChild(tableBody);

        // Agregar la tabla al contenedor de valores
        contentDiv.appendChild(table);
    }
}

function hideCharts() {
    canvas.style.display = "none";
    canvashm.style.display = "none";
    canvasvalues.style.display = "block";
    currentChartType = 'values';
}

function showCanvas(value) {
    // Si el valor es true, muestra el canvas
    if (value) {
        console.log("ShowCanvasLine")
        canvas.style.display = "block";
        canvashm.style.display = "none";
        canvasvalues.style.display ='none';
    } else {
        // Si el valor es false, oculta el canvas
        console.log("ShowCanvasHM")
        canvas.style.display = "none";
        canvashm.style.display = "block";
        canvasvalues.style.display ='none';
    }
}

function drawHeatmapChart(chartData) {
    // Obtener el contenedor del gráfico
    var container = document.getElementById('content');

    var minHeat = Infinity;
    var maxHeat = -Infinity;
    chartData.forEach(dataPoint => {
        if (dataPoint.heat !== 0) {
            minHeat = Math.min(minHeat, dataPoint.heat);
            maxHeat = Math.max(maxHeat, dataPoint.heat);
        }
    });

    // Definir rangos de valores y colores correspondientes
    var customColorScale = anychart.scales.ordinalColor();

    // Definir el número de rangos
    const numRanges = 1000;
    const startValue = isDimer ? 2 : minHeat;
    const endValue = isDimer ? 6 : maxHeat;
    const step = (endValue - startValue) / numRanges;

    let ranges = [];
    let colors = [];

    const hueRangeStart = 70; // Inicio del rango de tonos verdes y cyan
    const hueRangeEnd = 260; // Fin del rango de tonos verdes y cyan

    // Generar los rangos y los colores para el degradado
    for (let i = 0; i < numRanges; i++) {
        const from = startValue + (step * i);
        const to = startValue + (step * (i + 1));
        ranges.push({ from, to });
        let hue = 0;
        // Generar colores para el degradado en el espacio de color HSL
        if (isDimer)  hue = hueRangeStart + (i / numRanges) * (hueRangeEnd - hueRangeStart);
        else  hue = 140 + (i / numRanges) * (hueRangeEnd - 140);
        
        const saturation = 100; // Mantenemos la saturación al máximo
        const lightness = 50; // Mantenemos la luminosidad al 50%
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        colors.push(color);
    }

    ranges.push({ from: 0, to: 0 });
    colors.push('#ffffff');

    // Asignar los rangos y los colores al customColorScale
    customColorScale.ranges(ranges);
    customColorScale.colors(colors);

    // Crear el gráfico de heatmap
    var chart = anychart.heatMap(chartData);
    chart.title('Gráfico de Calor');
    chart.container('content');
    chart.labels().enabled(false);

    if (!isDimer){
        chart.height(2500)
        container.style.height = 2500+ 'px';
    } 

    chart.colorScale(customColorScale);
    chart.draw();

    // Escuchar eventos de redimensionamiento de la ventana
    window.addEventListener('resize', function() {
        if (currentChartType === "heatmap"){
            // Actualizar el tamaño del lienzo del gráfico al tamaño del contenedor
            var newWidth = container.clientWidth;
            var newHeight = container.clientHeight;

            // Actualizar el tamaño del lienzo del gráfico
            chart.width(newWidth)
            chart.height(newHeight)
            container.style.height = newHeight+ 'px';
        }
    });
}

