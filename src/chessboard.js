import { createElement } from "./helperFunctions";
import ChessSquare from "./chessSquare.js";
import ChessPiece from "./chessPiece.js";

export class ChessBoard {
    #root = null;
    #squares = Array.from({ length: 8 }, () => Array(8));
    #selectedSquare = null;
    #legalMoves = [];
    #lastMove = null;
    #game = null;
    #engine = null;
    #isEngineThinking = false;
    #playerColor = "w"; // TODO: player gets to pick their color

    constructor(game, engine = null) {
        this.#game = game;
        this.#engine = engine;

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") this.clearSelection();
        });
    }

    get squares() {
        return this.#squares;
    }

    // TODO: add option for flipping the board (reverse)

    build() {
        this.#root = createElement("div", { classList: "board" });
        for (let y = 7; y >= 0; y--) {
            for (let x = 0; x < 8; x++) {
                const color = (x + y) % 2 === 0 ? "black" : "white";
                const element = createElement(
                    "div",
                    {
                        classList: ["square", color],
                        onclick: () => this.handleSquareClick(this.#squares[x][y]),
                    },
                    this.#root,
                );
                this.#squares[x][y] = new ChessSquare(x, y, element);
            }
        }
        this.renderPosition();
        return this.#root;
    }

    getSquare(notation) {
        const x = notation.charCodeAt(0) - 97;
        const y = Number(notation[1]) - 1;
        return this.#squares[x][y];
    }

    clearLegalMoves() {
        for (const move of this.#legalMoves) this.getSquare(move.to).element.classList.remove("legalMove");
        this.#legalMoves = [];
    }

    showLegalMoves(square) {
        this.clearLegalMoves();
        const moves = this.#game.moves({
            square: square.notation,
            verbose: true,
        });
        this.#legalMoves = moves;
        for (const move of moves) this.getSquare(move.to).element.classList.add("legalMove");
    }

    clearSelection() {
        if (this.#selectedSquare) this.#selectedSquare.element.classList.remove("selected");
        this.clearLegalMoves();
        this.#selectedSquare = null;
    }

    selectSquare(square) {
        this.clearSelection();
        this.#selectedSquare = square;
        square.element.classList.add("selected");
        this.showLegalMoves(square);
    }

    clearLastMoveHighlight() {
        const highlighted = this.#root.querySelectorAll(".lastMove");
        for (const element of highlighted) element.classList.remove("lastMove");
    }

    showLastMove(move) {
        this.clearLastMoveHighlight();
        this.getSquare(move.from).element.classList.add("lastMove");
        this.getSquare(move.to).element.classList.add("lastMove");
        this.#lastMove = move;
    }

    addPiece(piece) {
        piece.square.piece = piece;
    }

    renderPosition() {
        // TODO: only replace what's different from last turn;

        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const square = this.#squares[x][y];
                square.piece = null;
                square.element.replaceChildren();
            }
        }

        const board = this.#game.board();
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const pieceData = board[y][x];
                if (!pieceData) continue;
                const piece = new ChessPiece(pieceData.type, pieceData.color === "w" ? "white" : "black", this.#squares[x][7 - y]);
                this.addPiece(piece);
            }
        }

        if (this.#lastMove) this.showLastMove(this.#lastMove);
    }

    async makeEngineMove() {
        if (!this.#engine || this.#game.isGameOver()) return;

        this.#isEngineThinking = true;
        const currentFen = this.#game.fen();

        const bestMoveUCI = await this.#engine.findBestMove(currentFen, 1);

        if (bestMoveUCI && bestMoveUCI !== "(none)") {
            const fromNotation = bestMoveUCI.substring(0, 2);
            const toNotation = bestMoveUCI.substring(2, 4);
            const promotion = bestMoveUCI.length > 4 ? bestMoveUCI[4] : "q";

            const move = this.#game.move({
                from: fromNotation,
                to: toNotation,
                promotion: promotion,
            });

            if (move) {
                this.showLastMove(move);
                this.renderPosition();
            }
        }

        this.#isEngineThinking = false;
    }

    async handleSquareClick(square) {
        if (this.#isEngineThinking || this.#game.turn() !== this.#playerColor) return;

        if (!this.#selectedSquare) {
            if (!square.piece) return;
            this.selectSquare(square);
            return;
        } else if (square === this.#selectedSquare) {
            this.clearSelection();
            return;
        } else if (square.piece && square.piece.color === this.#selectedSquare.piece.color) {
            this.selectSquare(square);
            return;
        }

        let move;
        try {
            move = this.#game.move({
                from: this.#selectedSquare.notation,
                to: square.notation,
                promotion: "q",
            });
        } catch {
            console.log("illegal move attempted");
        }

        this.clearSelection();
        if (!move) return;

        this.showLastMove(move);
        this.renderPosition();

        if (this.#engine && !this.#game.isGameOver()) await this.makeEngineMove();
    }
}
