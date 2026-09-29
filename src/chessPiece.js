import { createElement } from "./helperFunctions";

export default class ChessPiece {
    #type;
    #color;
    #square;
    #element;

    constructor(type, color, square) {
        this.#type = type;
        this.#color = color;
        this.#square = square;

        this.#element = createElement(
            "img",
            {
                src: this.getImagePath(),
                classList: "piece",
                draggable: false,
            },
            square.element,
        );
    }

    get type() {
        return this.#type;
    }

    get color() {
        return this.#color;
    }

    get square() {
        return this.#square;
    }

    get element() {
        return this.#element;
    }

    getImagePath() {
        const names = {
            p: "Pawn",
            n: "Knight",
            b: "Bishop",
            r: "Rook",
            q: "Queen",
            k: "King",
        };

        return `${import.meta.env.BASE_URL}assets/${this.color}${names[this.type]}.svg`;
    }
}
