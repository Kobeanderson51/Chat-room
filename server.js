const net = require('net');


const server = net
    .createServer(client => {
        client.write('Hello! Welcome to the chat server!\n');
        client.on('data', data => {
            console.log(data);
        })
        client.setEncoding('utf8');
    })
    .listen(3000, () => { 
        console.log(`listening on port`, server.address().port);
    })