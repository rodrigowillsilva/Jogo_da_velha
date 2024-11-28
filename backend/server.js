import mqttServices from './mqttServices.js';
import gameModels from './gameModel.js';

const { connectMQTT, subscribeToTopic, publishMessage, unsubscribeFromTopic } = mqttServices;
const { Game} = gameModels;

const game = new Game("gameId");
let nomeJogador = "playerName";

let frontHandleUIUpdate;
let frontStartGame;
let frontEndGame;

let character = 'X';

export function getCharacter() {
    return character;
}

// Conecte-se ao HiveMQ
export function InicializaConexaoMQTT(onConnectCallback) {
    connectMQTT(() => {
        if (onConnectCallback) {
            onConnectCallback();
        }
    });
}

export function ProcurarJogo(gameId, playerName, frontHandleUIUpdateCallback, frontStartGameCallback, frontEndGameCallback) {
    game.gameId = gameId;
    game.players = [playerName];
    game.gameStatus = 'waiting';
    game.winner = '';
    game.messages = [];

    nomeJogador = playerName;
    frontHandleUIUpdate = frontHandleUIUpdateCallback;
    frontStartGame = frontStartGameCallback;
    frontEndGame = frontEndGameCallback;

    subscribeToTopic(`JogoDaVelha/${gameId}/descoberta`, (body) => {
        const [action, message] = body.toString().split(' ');
        console.log(`nomeJogador: ${nomeJogador} nome do outro jogador: ${message}`);

        if (nomeJogador === message) {
            return;
        }

        if (action === 'ProcurarJogador') {

            console.log(`Player ${message} encontrado!`);

            PublicarMensagem(`descoberta`, `JogadorEncontrado ${nomeJogador}`);

            game.players.push(message);

            unsubscribeFromTopic(`JogoDaVelha/${gameId}/descoberta`);
            frontStartGame();
            startGame();

        }
        else if (action === 'JogadorEncontrado') {

            console.log(`Player ${message} encontrado!`);

            game.players.push(message);
            character = 'O';

            unsubscribeFromTopic(`JogoDaVelha/${gameId}/descoberta`);
            frontStartGame();
            startGame();
        }

    });

    PublicarMensagem(`descoberta`, `ProcurarJogador ${nomeJogador}`);


    subscribeToTopic(`JogoDaVelha/${gameId}/jogada`, (message) => {
        // Para jogadores receberem o estado do jogo do host e atualizarem seu front-end

        console.log(`Jogada recebida: ${message.toString()}`);

        const [row, col, char] = message.toString().split(' ');

        frontHandleUIUpdate(row, col, char);

        // Atualiza o estado do jogo
        game.board[row][col] = char;

        // Verifica se o jogo acabou
        // Verifica se o jogador ganhou
        const winner = checkWinner();
        if (winner) {
            game.winner = winner;
            game.gameStatus = 'finished';
            console.log(`O jogador ${winner} ganhou!`);

            frontEndGame(winner);
        }
    });


   
    subscribeToTopic(`JogoDaVelha/${gameId}/chat`, (message) => {
        // Processa as mensagens do chat
        console.log(`Mensagem recebida: ${message.toString()}`);

    });

}

function checkWinner() {
    // Verifica se o jogador ganhou
    // Verifica as linhas
    for (let i = 0; i < 3; i++) {
        if (game.board[i][0] === character && game.board[i][1] === character && game.board[i][2] === character) {
            return character;
        }
    }

    // Verifica as colunas
    for (let i = 0; i < 3; i++) {
        if (game.board[0][i] === character && game.board[1][i] === character && game.board[2][i] === character) {
            return character;
        }
    }

    // Verifica as diagonais
    if (game.board[0][0] === character && game.board[1][1] === character && game.board[2][2] === character) {
        return character;
    }

    if (game.board[0][2] === character && game.board[1][1] === character && game.board[2][0] === character) {
        return character;
    }

    return '';
}


export function PublicarMensagem(topic, message) {
    publishMessage(`JogoDaVelha/${game.gameId}/${topic}`, message);
    console.log(`Mensagem publicada: ${message}`);
}

export function PrintGameInfo() {
    console.log(`Game Info: ${JSON.stringify(game)}`);
}

function startGame() {
    // Inicia o jogo
    console.log(`Iniciando o jogo...`);
    game.gameStatus = 'playing';

}





// // Defina os dados da sua conexão HiveMQ
// const protocol = 'mqtts';
// const host = '84022148914b475995eb5a668608ef9b.s1.eu.hivemq.cloud'; // Substitua pelo seu Broker URL
// const port = '8883';
// const client_Id = `mqtt_${Math.random().toString(16).slice(3)}`;
// const connectUrl = `${protocol}://${host}:${port}`;
// const username = 'B4ttleship'; // Seu nome de usuário
// const password = 'B4ttle123'; // Sua senha

// // Conectar ao HiveMQ
// const client = mqtt.connect(connectUrl, {
//     clientId: client_Id,
//     username: username,
//     password: password,
//     // port: 8883,
//     rejectUnauthorized: false, // Para ignorar erros de certificado SSL (importante para a primeira conexão)
// });

// client.on('connect', () => {
//     console.log('Conectado ao HiveMQ!');
//     // Inscrever-se no tópico `game/descoberta`
//     client.subscribe(['game/discover'], (err) => {
//         if (err) {
//             console.log('Erro ao se inscrever:', err);
//         } else {
//             console.log('Inscrito com sucesso no tópico game/discover');
//         }
//     });
// });

// client.on('message', (topic, message) => {
//     console.log(`Mensagem recebida no tópico ${topic}: ${message.toString()}`);
// });

// client.on('error', (err) => {
//     console.log('Erro de conexão:', err);
// });