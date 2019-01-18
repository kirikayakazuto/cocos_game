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

    static talk_with_friend(friend_name: string, msg: string) {
        let body = [friend_name, msg];
        websocket.send_cmd(Stype.TalkRoom, Cmd.TalkRoom.TALK_WITH_FRIEND, body);
    }
    /**
     * 获取历史消息
     * @param fname 
     */
    static get_history_talk_msg(fname: string) {
        let body = [
            fname,
            1
        ]
        websocket.send_cmd(Stype.TalkRoom, Cmd.TalkRoom.GET_HISTORY_TALK_MSG, body);
    }
}