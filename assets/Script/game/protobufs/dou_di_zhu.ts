import websocket from "../../modules/websocket"
import Stype from "../Stype"
import Cmd from "../Cmd"

import "./dou_di_zhu_proto"
import poker_card from "../doudizhu/poker_card";


export default class dou_di_zhu {
    static enter_zone(zid: number) {
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.ENTER_ZONE, zid);
    }

    static quit_zone() {
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.QUIT_ZONE, null);
    }

    static create_room(room_level: number) {
        let body = [room_level];
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.CREATE_ROOM, body);
    }

    static search_room(room_id: number) {
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.SEARCH_ROOM, room_id);
    }
    

    static exit_room() {
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.EXIT_ROOM, null);
    }
    /**
     * 进入房间
     * @param room_id 
     */
    static enter_room(room_id: number) {
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.ENTER_ROOM, room_id);
    }
    /**
     * 玩家准备
     */
    static player_do_ready() {
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.SEND_DO_READY, null);
    }
    /**
     * 玩家取消准备
     */
    static player_not_ready() {
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.SEND_NOT_READY, null);
    }
    /**
     * 是否抢地主
     * @param num 
     */
    static send_dizhu(num: number) {
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.SEND_DIZHU, num);
    }
    /**
     * 
     * @param arr 出牌
     */
    static send_poker_cards(arr: Array<poker_card>) {
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.PLAYER_SEND_CARDS, arr);
    }

    /**
     * 发送消息
     */
    static send_msg(index: number) {
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.SEND_MSG, index);
    }
    /**
     * 获取历史记录
     */
    static get_history_record() {
        websocket.send_cmd(Stype.GAME_DOU_DI_ZHU, Cmd.GameDouDiZhu.GET_HISTORY, null);
    }
}
