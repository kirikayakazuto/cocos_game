import websocket from "../../modules/websocket"
import Stype from "../Stype"
import Cmd from "../Cmd"

import "./game_system_proto"


/**
 *  -------------------- 游戏系统  中心 -----------------
 */
export default class game_system {
    // 获取用户游戏信息
    static get_game_info() {
        websocket.send_cmd(Stype.GAME_SYSTEM, Cmd.GameSystem.GET_GAME_INFO, null);
    }
    // 获取登录奖励信息
    static get_login_bonues_today() {
        websocket.send_cmd(Stype.GAME_SYSTEM, Cmd.GameSystem.LOGIN_BONUES_INFO, null);   
    }
    // 发送登录奖励
    static send_recv_login_bonues(bonues_id: number) {
        websocket.send_cmd(Stype.GAME_SYSTEM, Cmd.GameSystem.RECV_LOGIN_BUNUES, bonues_id);
    }
    // 获取世界排行榜信息
    static get_world_rank_info() {
        websocket.send_cmd(Stype.GAME_SYSTEM, Cmd.GameSystem.GET_WORLD_RANK_INFO, null);
    }
}