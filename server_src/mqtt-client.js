import EventEmitter from 'events';
import Fs from 'fs';
import mqtt from 'mqtt';

const url = "mqtt://localhost";
const PORT = 1883;
const HOST = 'localhost';

const topic = "object_detection";

class Client {
    constructor() {
        this._event = null;
    }

    connect() {
        this._event = new EventEmitter();

        var options = {
            port: PORT,
            host: HOST,
            rejectUnauthorized: false,
        };
        const client = mqtt.connect(url, options);
        client.on('connect', () => {
            client.subscribe(topic);
        });

        client.on('message', (topic, message) => {
            this._event.emit(topic, topic, message);
        });
    }

    disconnect() {
    }

    addListener(event, listener) {
        this._event.on(event, listener);
    }

    removeListener(event, listener) {
        this._event.removeListener(event, listener);
    }
}

export default Client;
