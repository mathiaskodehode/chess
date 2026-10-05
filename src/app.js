import { Chess } from "chess.js";
import { ChessBoard } from "./chessboard.js";
import { StockfishEngine } from "./engine.js";

export function Init() {
    const engine = new StockfishEngine();
    new ChessBoard(new Chess(), engine).build();
}
