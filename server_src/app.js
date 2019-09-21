import path from 'path';
import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import MqttClient from './mqtt-client';

const app = express();
const port = process.env.PORT || 3001;
const client = new MqttClient();

app.use(express.static(path.resolve(__dirname, '..', 'build')));

const server = http.createServer(app);
const io = socketIo(server);

let sock;
io.on('connection', (socket) => {
    sock = socket;
    socket.on('disconnect', () => {
        sock = null;
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
});

server.listen(port, () => {
});

client.connect();
client.addListener('object_detection', (topic, message) => {
    if (sock) {
        sock.emit('object_detection', `${message.toString()}`);
    }
});

module.exports = app;
