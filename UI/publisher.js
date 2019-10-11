var t = 0;
var n1, n2, n3 = 0;
const brokerAddress = 'mqtt://localhost:1884'
//var host = 'mqtt://192.168.43.106'
var options = {
    retain: true
}
var mqtt = require('mqtt')
var client = mqtt.connect(brokerAddress)
client.on('connect', function() {
    console.log("publishing to %s", brokerAddress);
    setInterval(function() {
        t++;
        n1 = parseFloat(Math.sin(0.5 * t)).toFixed(4)
        n2 = parseFloat(Math.sin(0.1 * t + Math.PI)).toFixed(4)
        n3 = parseFloat(Math.sin(0.1 * t - Math.PI)).toFixed(4)
        value1= (60+(n1+1)*40).toFixed(2)
        value2= (20+(n2+1)*10).toFixed(2)
        value3= (700+(n3+1)*400).toFixed(2)
        client.publish('topic/sensor1', value1.toString(), {
            retain: false
        });
        client.publish('topic/sensor2', value2.toString(), {
            retain: false
        });
        client.publish('topic/sensor3', value3.toString(), {
            retain: false // ga dikirim terus2an
        });
        console.log("published message");
    }, 1000)
})
