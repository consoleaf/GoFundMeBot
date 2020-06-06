const axios = require('axios');
const fs = require('fs');
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    ws.on('message', message => {
        console.log(`Received message: ${message}`);
    });
});

setInterval(() => {
    wss.clients.forEach(ws => {
        axios.get('https://charity.gofundme.com/v2/project/1234/donations')
            .then(resp => {
                return resp.data;
            })
            .then(data => {
                ws.send(JSON.stringify(data));
            });
        console.log("Sent to client!");
    });
}, 5000);
