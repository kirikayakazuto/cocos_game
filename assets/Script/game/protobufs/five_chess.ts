import websocket from "../../modules/websocket"
import Stype from "../Stype"
import Cmd from "../Cmd"

import "./five_chess_proto"

export default class five_chess {

    static enter_zone(zid: number) {
        websocket.send_cmd(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.ENTER_ZONE, zid);
    }

    static user_quit() {
        websocket.send_cmd(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.USER_QUIT, null);
    }
    // 发送道具
    static send_prop(to_seatid: number, prop_id: number) {
        let body = [
            prop_id,
            to_seatid,
        ];

        websocket.send_cmd(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.SEND_PROP, body);
    }

    static send_do_ready() {
        websocket.send_cmd(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.SEND_DO_READY, null);
    }

    static send_put_chess(block_x, block_y) {
        let body = [
            block_x,
            block_y
        ];
        websocket.send_cmd(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.PUT_CHESS, body);
    }

    static send_get_prev_round() {
        websocket.send_cmd(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.GET_PREV_ROUND, null);
    }

}