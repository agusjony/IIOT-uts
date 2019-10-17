//---------------------------------------------------------------

// Setup Server
var brokerAddress = "localhost";
var brokerPort = 1884;
var httpAddress = "localhost";
var httpPort = 3003;

// Embedded Mosca initialization
var mosca = require("mosca");
var server = new mosca.Server({
    // host: brokerAddress,
    port: brokerPort,
    http: {
        // host: httpAddress,
        port: httpPort,
        bundle: true,
        static: './public/'
    },
    persistence: {
        factory: mosca.persistence.Memory
    },
});

// Triggered when server status is ready
server.on('ready', function() {
    console.log('-------------------------------')
    console.log('Mosca Broker is up and running in %s:%s !', brokerAddress, brokerPort)
    console.log('Using %s:%s for HTTP and MQTT over Web-Sockets !', httpAddress, httpPort)
    console.log('-------------------------------')
    console.log('')
})

// Triggered when a client is connected
server.on('clientConnected', function(client) {
    console.log('BROKER : client connected (%s)', client.id)
})

server.on('clientDisconnected', function(client) {
    console.log('BROKER : client disconnected (%s)', client.id)
})

// Triggered when a message is received
server.on('published', function(packet, client) {
    console.log('MESSAGE : %s', packet.payload.toString('utf-8'))
})

//---------------------------------------------------------------
