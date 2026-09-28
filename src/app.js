import { Chess } from "chess.js";
import { ChessBoard } from "./chessboard.js";

export function Init() {
    new ChessBoard(new Chess()).build();
}
