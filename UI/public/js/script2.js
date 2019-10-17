var ledstate = [false, false, false, false];
var threshold_val = 600;

// MQTT Setup
var client = mqtt.connect();

String.prototype.removeCharAt = function (i) {
    var tmp = this.split(''); // convert to an array
    tmp.splice(i - 1 , 1); // remove 1 element from the array (adjusting for non-zero-indexed counts)
    return tmp.join(''); // reconstruct the string
}

client.on('connect', function() {
    client.subscribe('intensity');
    client.subscribe('threshold');
})

client.on('message', function(topic, message) {
    //console.log('received message on %s: %s', topic, message)
    switch (topic) {
        case 'intensity':
            checkDanger(message);
            break;
        case 'threshold':
            threshold_val = message.toString().removeCharAt(1);
            console.log(threshold_val);
            document.getElementById('threshold_val').innerHTML = threshold_val;
    }
})

function changeLEDButton(led_id) {
    // var div_id = "ledstatus" + led_id;
    client.publish("led", (!ledstate[led_id - 1]).toString('utf-8'))
}

thresh_button.addEventListener('click', function() {
  client.publish('threshold', 't' + thresh_value.value.toString(), {retain:true});
  threshold_val = thresh_value.value;
});

function checkDanger(thresh_sensor) {
  if (thresh_sensor > threshold_val){
    danger.style.backgroundColor='white'; // LED MATI
  } else {
    danger.style.backgroundColor='red'; // LED HIDUP
  }
}
