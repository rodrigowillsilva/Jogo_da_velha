// Classe do jogo da velha
export class Game {
    constructor(gameId) {
        this.gameId = gameId;
        this.players = new Array(2).fill(undefined);  
        this.board = new Array(3).fill(0).map(() => new Array(3).fill(0));
        this.gameStatus = 'waiting';
        this.winner = '';
        this.messages = [];

        //this.players.push(host);
    }

    // Métodos para controlar o jogo podem ser adicionados aqui
    addPlayer(player) {
        this.players.push(player);
    }

    // Outros métodos conforme necessário
}

// Exportando a classe Game e o array gameModels
const gameModels = {
    Game
};

export default gameModels;