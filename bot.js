const axios = require('axios');
const fs = require('fs');
const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
    ws.on('message', message => {
        console.log(`Received message: ${message}`);
    });
});

const project_id = 2319535;

setInterval(() => {
    wss.clients.forEach(ws => {
        axios.get(`https://charity.gofundme.com/v2/project/${project_id}/donations`)
            .then(resp => {
                return resp.data;
            })
            .then(data => {
                ws.send(JSON.stringify({
                    type: 'donationsList',
                    data: data.data
                }));
                axios.get(`https://charity.gofundme.com/v2/project/${project_id}`)
                    .then(resp => {
                        return resp.data;
                    })
                    .then(data => {
                        ws.send(JSON.stringify({
                            type: 'overview',
                            total: data.data.project_total_display,
                            goal: data.data.goal,
                            currency: data.data.currency
                        }));
                    });
            });

        console.log("Sent to client!");
    });
}, 5000);
