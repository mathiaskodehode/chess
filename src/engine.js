export class StockfishEngine {
    #worker = null;
    #isReady = false;
    #onMoveCallback = null;

    constructor() {
        const workerPath = `${import.meta.env.BASE_URL}stockfish.js`;
        this.#worker = new Worker(workerPath);
        this.#initWorker();
    }

    #initWorker() {
        this.#worker.onmessage = event => {
            const line = event.data;
            // console.log("[Stockfish Output]:", line);

            if (line === "readyok") {
                this.#isReady = true;
            }

            if (line.startsWith("bestmove")) {
                const parts = line.split(" ");
                const bestMoveStr = parts[1];
                if (this.#onMoveCallback) {
                    const callback = this.#onMoveCallback;
                    this.#onMoveCallback = null;
                    callback(bestMoveStr);
                }
            }
        };

        this.#send("uci");
        this.#send("isready");
    }

    #send(command) {
        this.#worker.postMessage(command);
    }

    findBestMove(fen, depth = 10) {
        depth = depth || 1;
        return new Promise(resolve => {
            this.#onMoveCallback = resolve;
            this.#send(`position fen ${fen}`);
            this.#send(`go depth ${depth}`);
        });
    }
}
