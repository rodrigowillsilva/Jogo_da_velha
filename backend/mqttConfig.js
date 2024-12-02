//const mqtt = require('mqtt');

// Defina os dados da sua conexão HiveMQ
const protocol = /*'mqtts'*/ 'wss';
const host = '84022148914b475995eb5a668608ef9b.s1.eu.hivemq.cloud';
const port = /*'8883'*/ '8884';
const client_Id = `mqtt_${Math.random().toString(16).slice(3)}`;
const connectUrl = `${protocol}://${host}:${port}/mqtt`;
const username = 'B4ttleship'; 
const password = 'B4ttle123';

const mqttConfig = {
    protocol,
    host,
    port,
    client_Id,
    connectUrl,
    username,
    password
}

export default mqttConfig;