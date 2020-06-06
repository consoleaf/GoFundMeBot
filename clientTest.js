const WebSocket = require('ws');
const url = "ws://localhost:8080";

const connection = new WebSocket(url);

connection.onopen = () => {
    connection.send("message from client");
};

connection.onmessage = (e) => {
    console.log(e.data);
}
