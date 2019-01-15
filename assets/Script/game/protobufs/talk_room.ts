import websocket from "../../modules/websocket"
import Stype from "../Stype"
import Cmd from "../Cmd"

export default class talk_room {
    /**
     * 进入聊天系统
     */
    static enter_talk() {
        websocket.send_cmd(Stype.TalkRoom, Cmd.TalkRoom.ENTER_TALK, null);
    }
    /**
     * 获取在线好友
     */
    static get_online_friends() {
        websocket.send_cmd(Stype.TalkRoom, Cmd.TalkRoom.GET_ONLINE_FRIENDS, null)
    }
}