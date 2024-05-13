const net = require('net');

const clients = [];

const server = net.createServer((socket) => {
    console.log('Client connected');
    let clientName;

    socket.on('data', (data) => {
        const message = data.toString().trim();
        if (message.startsWith('JOIN:')) {
            clientName = message.substring(5);
            console.log(`${clientName} joined the server`);
            clients.push({ socket, clientName });
            broadcast(`${clientName} joined the server`, socket);
        } else if (message.startsWith('SETNAME:')) {
            const newName = message.substring(8).trim();
            if (!newName) {
                socket.write('Invalid name. Please provide a non-empty name.\n');
            } else if (clients.some(client => client.clientName === newName)) {
                socket.write('This name is already in use. Please choose a different name.\n');
            } else {
                const oldName = clientName;
                clientName = newName;
                console.log(`${oldName} changed name to ${newName}`);
                broadcast(`${oldName} changed name to ${newName}`, socket);
            }
        } else if (message.startsWith('/kick')) {
            const usernameToKick = message.split(' ')[1];
            const password = message.split(' ')[2];
            if (!password) {
                console.log('Invalid kick command. Format: /kick username password\n');
                socket.write('Invalid kick command. Format: /kick username password\n');
            } else {
                if (password === "k0b3") {
                    const clientToKick = clients.find(client => client.clientName === usernameToKick);
                    if (clientToKick) {
                        clientToKick.socket.write('You have been kicked from the server.\n');
                        clientToKick.socket.end();
                        console.log(`${usernameToKick} has been kicked from the server`)
                    } else {
                        socket.write(`User ${usernameToKick} not found.\n`);
                    }
                } else {
                    console.log('Invalid password.\n');
                    socket.write('Invalid password.\n');
                }
            }
        } else if (message.startsWith('/dm')) {
        const recipient = message.split(' ')[1];
        const dmContent = message.substring(5 + recipient.length).trim();
        const senderName = clients.find(client => client.socket === socket).clientName;
        const recipientClient = clients.find(client => client.clientName === recipient);
        if (recipientClient) {
            recipientClient.socket.write(`[DM] ${senderName}: ${dmContent}\n`);
            socket.write(`[DM] ${senderName} to ${recipient}: ${dmContent}\n`);
        } else {
            socket.write(`User ${recipient} not found or offline.\n`);
        }
    } else if (message.startsWith('/list')) {
            const clientNames = clients.map(client => client.clientName).join(', ');
            const listMessage = `Connected users: ${clientNames}\n`;
            socket.write(listMessage);
        } else if(message === '@exit') {
            console.log(`${clientName} left the server`);
            broadcast(`${clientName} left the server`, socket);
            socket.end();
            clients.splice(clients.findIndex(c => c.socket === socket), 1);
        } else {
            console.log(`${clientName}: ${message}`);
            broadcast(`${clientName}: ${message}`, socket);
        }
    });

    socket.on('end', () => {
        const index = clients.findIndex(client => client.socket === socket);
        if (index !== -1) {
            const exitingClientName = clientName || 'Anonymous';
            clients.splice(index, 1);
            broadcast(`${exitingClientName} left the server\n`, socket);
            console.log(`${exitingClientName} left the server`);
        }
    });
});

function broadcast(message, senderSocket) {
    clients.forEach((client) => {
        if (client.socket !== senderSocket) {
            client.socket.write(message);
        }
    });
}

const PORT = 3001;
const HOST = 'localhost';

server.listen(PORT, HOST, () => {
    console.log(`Server listening on ${HOST}:${PORT}`);
});
