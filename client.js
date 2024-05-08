const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let username = '';

rl.question('Enter your username: ', (answer) => {
    username = answer.trim();
    const client = net.createConnection(3000, () => {
    console.log(`${username} connected to server.`);
    client.write(`${username} joined the chat.`);
    client.setEncoding('utf8');
        client.on('data', data => {
            console.log(data);

            client.on('end', () => {
                console.log('disconnected from server');
                process.exit();
            });
        });
});

process.stdin.on('data', data => {
    const text = data.toString().trim();
    console.log('sending:', text);
    client.write(`${username}: ${text}`);
    if (text === 'exit') {
        client.write(`${username} has left the chat.`)
        client.end();
    }
});
});

