var r = document.querySelector('#r'),
    g = document.querySelector('#g'),
    b = document.querySelector('#b'),
    r_out = document.querySelector('#r_out'),
    g_out = document.querySelector('#g_out'),
    b_out = document.querySelector('#b_out'),
    rgb_button = document.querySelector('#rgb_button'),
    labels = document.querySelectorAll('label[for=r], output[for=r], label[for=g], output[for=g], label[for=b], output[for=b]');

var rgb_bool = true;

function setColor(rgb) {
    switch (rgb) {
        case 'r':
            //kirim perintah mqtt
            client.publish("rgb", 'r' + parseInt(r.value, 10).toString());
            break;
        case 'g':
            //kirim perintah mqtt
            client.publish("rgb", 'g' + parseInt(g.value, 10).toString());
            break;
        case 'b':
            //kirim perintah mqtt
            client.publish("rgb", 'b' + parseInt(b.value, 10).toString());
            break;
    }
    rgb_button.style.backgroundColor = 'rgb(' + r.value + ',' + g.value + ',' + b.value + ')';
}

r.addEventListener('change', function() {
    setColor('r');
    r_out.value = r.value;
}, false);

r.addEventListener('input', function() {
    setColor('r');
    r_out.value = r.value;
}, false);

g.addEventListener('change', function() {
    setColor('g');
    g_out.value = g.value;
}, false);

g.addEventListener('input', function() {
    setColor('g');
    g_out.value = g.value;
}, false);

b.addEventListener('change', function() {
    setColor('b');
    b_out.value = b.value;
}, false);

b.addEventListener('input', function() {
    setColor('b');
    b_out.value = b.value;
}, false);

rgb_button.addEventListener('click', function() {
  rgb_bool = !rgb_bool;
  switch (rgb_bool) {
    case true:
      rgb_button.style.backgroundColor = 'rgb(' + r.value + ',' + g.value + ',' + b.value + ')';
      rgb_button.style.color = 'black';
      rgb_button.innerHTML = 'ON';
      r.disabled = false;
      g.disabled = false;
      b.disabled = false;

      for (i=0; i < 6; i++) {
        if (i<2) {
          labels[i].style.backgroundColor = '#f00';
        } else if (i<4) {
          labels[i].style.backgroundColor = '#0f0';
        } else {
          labels[i].style.backgroundColor = '#00f';
        }

      }

      client.publish('rgb','s1')
      break;
    case false:
      rgb_button.style.backgroundColor = 'black';
      rgb_button.style.color = 'white';
      rgb_button.innerHTML = 'OFF';
      r.disabled = true;
      g.disabled = true;
      b.disabled = true;

      for (i=0; i < 6; i++) {
        labels[i].style.backgroundColor = 'grey';
      }

      client.publish('rgb','s0')
      break;
  }
});
