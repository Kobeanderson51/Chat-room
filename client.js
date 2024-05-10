const net = require('net');
const readline = require('readline');

const client = new net.Socket();

const PORT = 3001;
const HOST = 'localhost';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let name;

rl.question('Enter your name: ', (input) => {
    name = input.trim();
    client.connect(PORT, HOST, () => {
        client.write(`JOIN:${name}`);
        
        rl.on('line', (input) => {
            if (input.startsWith('/setname')) {
                const newName = input.substring(9).trim(); // Adjust substring to start from index 9 to remove '/setname '
                if (!newName) {
                    console.log('Invalid name. Please provide a non-empty name.');
                } else {
                    client.write(`SETNAME:${newName}`);
                }
            } else if (input === '@exit') {
                client.end();
                rl.close();
            } else {
                client.write(`${input}`);
            }
        });
    });
});

client.on('data', (data) => {
    console.log(`${data}`);
});

client.on('close', () => {
    console.log('Connection closed');
});
