var s1 = 0
var s2 = 0
var s3 = 0
var s4 = 0

var maxData = 100;
var dataDump = [];
const host = 'http://localhost:3003'

async function changeValue() {
  var response = await fetch(host + '/messageIn') // AJAX - to asynchronously fetch / "get" data
  var data = await response.json()

  // Update HTML content
  // console.log('received data: %s', data.value1);
  document.getElementById("humidity_value").innerHTML = parseFloat(data.value1).toFixed(2);
  document.getElementById("temperature_value").innerHTML = parseFloat(data.value2).toFixed(2);
  document.getElementById("brightness_value").innerHTML = parseFloat(data.value3).toFixed(2);
  // document.getElementById("hum_gauge").style.marginLeft = data.value1 + "%";

  // dataDump.push([d,data]); // --> To save it into database later, commented untuk menghemat memori hehe

  // Update chart
  d = new Date();
  if (mychart.data.datasets[0].data.length > maxData) { //Limit number of displayed data at one instance
    mychart.data.labels.shift();
    mychart.data.datasets[0].data.shift();
    mychart.data.datasets[1].data.shift();
    mychart.data.labels.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
    mychart.data.datasets[0].data.push(data.value1);
    mychart.data.datasets[1].data.push(data.value2);
  } else {
    mychart.data.labels.push(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
    mychart.data.datasets[0].data.push(data.value1);
    mychart.data.datasets[1].data.push(data.value2);
  }

  mychart.update();

  gauge.set(data.value1 * 100);
  document.getElementById("circle").style.marginLeft = (data.value3 / 1100 * 100) + "%";
  bar1.set(data.value2 / 30 * 100);
}

var x1 = false;
var x2 = false;
var x3 = false;
var x4 = false;

function changeStatus1() {
  x1 = !x1;
  switch (x1) {
    case false: // LED mati
      document.getElementById("ledstatus1").style.backgroundColor = "rgb(231, 76, 60)";
      break;
    case true: // LED nyala
      document.getElementById("ledstatus1").style.backgroundColor = "rgb(46, 204, 113)";
      break;
    default: // Tidak ada data
      document.getElementById("ledstatus1").style.backgroundColor = "white";
  }
}

function changeStatus2() {
  x2 = !x2;
  switch (x2) {
    case false: // LED mati
      document.getElementById("ledstatus2").style.backgroundColor = "rgb(231, 76, 60)";
      break;
    case true: // LED nyala
      document.getElementById("ledstatus2").style.backgroundColor = "rgb(46, 204, 113)";
      break;
    default: // Tidak ada data
      document.getElementById("ledstatus2").style.backgroundColor = "white";
  }
}

function changeStatus3() {
  x3 = !x3;
  switch (x3) {
    case false: // LED mati
      document.getElementById("ledstatus3").style.backgroundColor = "rgb(231, 76, 60)";
      break;
    case true: // LED nyala
      document.getElementById("ledstatus3").style.backgroundColor = "rgb(46, 204, 113)";
      break;
    default: // Tidak ada data
      document.getElementById("ledstatus3").style.backgroundColor = "white";
  }
}

function changeStatus4() {
  x4 = !x4;
  switch (x4) {
    case false: // LED mati
      document.getElementById("ledstatus4").style.backgroundColor = "rgb(231, 76, 60)";
      break;
    case true: // LED nyala
      document.getElementById("ledstatus4").style.backgroundColor = "rgb(46, 204, 113)";
      break;
    default: // Tidak ada data
      document.getElementById("ledstatus4").style.backgroundColor = "white";
  }
}

// Get Time
var d = new Date()
var h = d.getHours()
var m = d.getMinutes()
var s = (d.getMilliseconds()) / 1000
var now = h + ':' + m + ':' + s

// chart.js
var ctx = document.getElementById('canvas').getContext('2d');

var mydatas = {
  labels: [],
  datasets: [{
    label: 'Humidity',
    // backgroundColor: chartColors.grey,
    borderColor: '#3cba9f',
    data: [],
    fill: false,
    yAxisID: 'y-axis-1',
  }, {
    label: 'Temperature',
    // backgroundColor: chartColors.blue,
    borderColor: '#c45850',
    data: [],
    fill: false,
    yAxisID: 'y-axis-2',
  }]
};

var config = {
  data: mydatas,
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
        id: 'y-axis-1',
        gridLines: {
          color: '#252525',
        },
      }, {
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'right',
        id: 'y-axis-2',

        // grid line settings
        gridLines: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      }],
      xAxes: [{
        // type: 'time',
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

var mychart = Chart.Line(ctx, config);

setInterval(function() {
  changeValue();
}, 200)


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
