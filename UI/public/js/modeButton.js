var modeButton = document.querySelector('#modeButton'),
    container = document.querySelector('#panel'),
    led_cont = document.querySelectorAll('#led, #rgb'),
    thresh = document.querySelector('#threshold_cont'),
    thresh_button = document.querySelector('#thresh_button'),
    thresh_value = document.querySelector('#thresh_value'),
    danger = document.querySelector('.danger');
var threshold_val = 600;

modeButton.addEventListener( 'change', function() {
  if (modeButton.checked == true) { //Auto Mode
    client.publish('mode', 's1');
    container.style.backgroundColor = 'grey';
    for (i=0; i<2; i++) {
      led_cont[i].style.visibility = 'hidden';
    }
    thresh.style.visibility = 'visible';
  } else {
    client.publish('mode', 's0');
    container.style.backgroundColor = 'transparent';
    for (i=0; i<2; i++) {
      led_cont[i].style.visibility = 'visible';
    }
    thresh.style.visibility = 'hidden';
  }
})
