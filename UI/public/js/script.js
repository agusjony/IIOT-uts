//  Tweakables
var maxData = 300;

// Global Variables
var ledstate = [false, false, false, false]
var dataDump = [];
var sensor_average = [0, 0, 0];

const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;
const varToString = varObj => Object.keys(varObj);

// ----------------------------------------------------------------------------

// MQTT Setup
var client = mqtt.connect();

client.on('connect', function() {
    client.subscribe('topic/sensor1')
    client.subscribe('topic/sensor2')
    client.subscribe('topic/sensor3')
    client.subscribe('topic/ledstatus1')
    client.subscribe('topic/ledstatus2')
    client.subscribe('topic/ledstatus3')
    client.subscribe('topic/ledstatus4')
})

client.on('message', function(topic, message) {
    //console.log('received message on %s: %s', topic, message)
    switch (topic) {
        case 'topic/temperature':
            changeValue(message, "humidity");
            break;
        case 'topic/humidity':
            changeValue(message, "temperature");
            break;
        case 'topic/intensity':
            changeValue(message, "brightness");
            break;
        case 'topic/ledstatus1':
            changeLED(message, 1);
            break;
        case 'topic/ledstatus2':
            changeLED(message, 2);
            break;
        case 'topic/ledstatus3':
            changeLED(message, 3);
            break;
        case 'topic/ledstatus4':
            changeLED(message, 4);
            break;
    }
})

// ----------------------------------------------------------------------------

function changeValue(value, value_id) {
    // Update HTML content
    //console.log('Received data VALUE for id %s : %s',value_id,value);
    value = parseFloat(value);

    // Update chart
    switch (value_id) {
        case 'humidity':
            insertData(chart1, value);
            gauge.set(value * 100);
            sensor_number = 0;
            break;
        case 'temperature':
            insertData(chart2, value);
            bar1.set(value / 30 * 100);
            sensor_number = 1;
            break;
        case 'brightness':
            insertData(chart3, value);
            document.getElementById("circle").style.marginLeft = (value / 1100 * 100) + "%";
            sensor_number = 2;
            break;
    }

    document.getElementById(value_id + "_value").innerHTML = value;
    document.getElementById(value_id + "_avrg").innerHTML = sensor_average[sensor_number].toFixed(2);
}

function insertData(chart_id, value) {
    var d = new Date();
    if (chart_id.data.datasets[0].data.length > maxData) { //Limit number of displayed data at one instance
        chart_id.data.labels.shift();
        chart_id.data.datasets[0].data.shift();
        chart_id.data.labels.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
        chart_id.data.datasets[0].data.push(value);
    } else {
        chart_id.data.labels.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
        chart_id.data.datasets[0].data.push(value);
    }
    chart_id.update();

    //update average value
    switch (chart_id) {
        case chart1:
            chart_number = 0;
            break;
        case chart2:
            chart_number = 1;
            break;
        case chart3:
            chart_number = 2;
            break;
    }

    sensor_average[chart_number] = average(chart_id.data.datasets[0].data);
    // console.log(average(chart_id.data.datasets[0].data));
}

function changeLED(state, led_id) { // Change LED on message received
    var state = (state.toString('utf-8') == 'true')
    var div_id = "ledstatus" + led_id.toString();
    // console.log('Received data LED for id %s : %s', led_id, state);

    ledstate[led_id - 1] = state;

    switch (state) {
        case false: // LED Mati
            document.getElementById(div_id).style.backgroundColor = "rgb(231, 76, 60)";
            break;
        case true: // LED Nyala
            document.getElementById(div_id).style.backgroundColor = "rgb(46, 204, 113)";
            break;
        default: // Data Invalid
            document.getElementById(div_id).style.backgroundColor = "white";
    }
}

function changeLEDButton(led_id) {
    var div_id = "ledstatus" + led_id;
    client.publish("topic/" + div_id, (!ledstate[led_id - 1]).toString('utf-8'))
}

// -----------------------------------------------------------------------------

function createChart(canvas, label, color) {
    var ctx = document.getElementById(canvas).getContext('2d');
    var config = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                borderColor: color,
                data: [],
                fill: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            hoverMode: 'index',
            stacked: false,
            scales: {
                yAxes: [{
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'left',
                    gridLines: {
                        color: '#252525',
                    },
                }],
                xAxes: [{
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: maxData / 2
                    },
                    gridLines: {
                        color: '#252525',
                    },
                }],
            }
        }
    };

    var chart = Chart.Line(ctx, config);

    return chart;
}

var chart1 = createChart('canvas1', 'Humidity', '#3cba9f');
var chart2 = createChart('canvas2', 'Temperature', '#c45850')
var chart3 = createChart('canvas3', 'Brightness', '#6FADCF')

// -----------------------------------------------------------------------------

// Brightness Gauge
var bar1 = new ldBar("#temp_gauge");

// Hum Gauge
var opts = {
    angle: 0.15, // The span of the gauge arc
    lineWidth: 0.44, // The line thickness
    radiusScale: 1, // Relative radius
    pointer: {
        length: 0.6, // // Relative to gauge radius
        strokeWidth: 0.035, // The thickness
        color: '#c45850' // Fill color
    },
    limitMax: false, // If false, max value increases automatically if value > maxValue
    limitMin: false, // If true, the min value of the gauge will be fixed
    colorStart: '#6FADCF', // Colors
    colorStop: '#3cba9f', // just experiment with them
    strokeColor: '#2f2f2f', // to see which ones work best for you
    generateGradient: true,
    highDpiSupport: true, // High resolution support
    staticLabels: {
        font: "10px sans-serif", // Specifies font
        labels: [0, 20, 40, 60, 80, 100], // Print labels at these values
        color: "#fff", // Optional: Label text color
        fractionDigits: 0 // Optional: Numerical precision. 0=round off.
    },

};
var target = document.getElementById('hum_gauge'); // your canvas element
var gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
gauge.maxValue = 100; // set max gauge value
gauge.setMinValue(0); // Prefer setter over gauge.minValue = 0
gauge.animationSpeed = 32; // set animation speed (32 is default value)
