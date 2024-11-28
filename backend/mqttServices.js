import config from './mqttConfig.js';

let client;

// Store topic-callback mappings
const topicCallbacks = new Map();

function connectMQTT(onConnectCallback) {
    client = mqtt.connect(config.connectUrl, {
        clientId: config.client_Id,
        username: config.username,
        password: config.password,
        rejectUnauthorized: false,
    });

    client.on('connect', () => {
        console.log('Connected to HiveMQ!');
        if (onConnectCallback) {
            onConnectCallback();
        }
    });

    client.on('error', (err) => {
        console.log('Connection error:', err);
    });

    // Single message handler for all topics
    client.on('message', (receivedTopic, message) => {
        // Get the specific callback for this topic
        const callback = topicCallbacks.get(receivedTopic);
        if (callback) {
            callback(message);
        }
    });
}



function subscribeToTopic(topic, callback) {
    // Função para subscrever a um tópico e ouvir as mensagens
    client.subscribe([topic], (err) => {
        if (err) {
            console.log('Error subscribing:', err);
        } else {
            console.log(`Subscribed to topic ${topic}`);
        }
    });

    // Adiciona o callback ao mapeamento de tópicos
    topicCallbacks.set(topic, callback);
}

function unsubscribeFromTopic(topic) {
    // Função para cancelar a inscrição em um tópico
    client.unsubscribe([topic], (err) => {
        if (err) {
            console.log('Error unsubscribing:', err);
        } else {
            console.log(`Unsubscribed from topic ${topic}`);
        }
    });
}

function publishMessage(topic, message) {
    // Função para publicar uma mensagem em um tópico
    console.log(`Publishing message to topic ${topic}: ${message}`);
    client.publish(topic, message, { qos: 1, retain: false }, (error) => {
        if (error) {
            console.error(error);
        }
    });
}

// Exporta as funções para serem usadas em outros arquivos do projeto
const mqttServices = {
    connectMQTT,
    subscribeToTopic,
    unsubscribeFromTopic,
    publishMessage
};

export default mqttServices;
