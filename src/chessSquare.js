export default class ChessSquare {
    #element;
    #x;
    #y;
    #piece = null;

    constructor(x, y, element) {
        this.#x = x;
        this.#y = y;
        this.#element = element;
    }

    get notation() {
        return ["a", "b", "c", "d", "e", "f", "g", "h"][this.#x] + (this.#y + 1);
    }

    get element() {
        return this.#element;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get piece() {
        return this.#piece;
    }

    set piece(piece) {
        this.#piece = piece;
    }
}
