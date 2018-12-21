import proto_man from "../../modules/proto_man"
import Stype from "../Stype";
import Cmd from "../Cmd";
import proto_tools from "../../modules/proto_tools";
import Response from "../Response";
/**
 * 
 * ---------------------------------- 五子棋游戏的通讯协议 --------------------------------
 * 
 */
/**
 * 玩家进入区间
 * 1, 接收值
 * 服务号(4), 命令号(1)
 * body = {
 *     zid: number,   //  区间号
 * }
 * 2, 返回值
 * 服务号(4), 命令号(1)
 * body = {
 *  status: number, // 返回一个状态值
 * }
 */
proto_man.reg_encoder(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.ENTER_ZONE, proto_tools.encode_status_cmd);
proto_man.reg_decoder(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.ENTER_ZONE, proto_tools.decode_status_cmd);

 /**
  * 玩家主动退出
  * 1, 接收值
  * 服务号(4), 命令号(2)
  * body = {
  *     null
  * }
  * 2, 返回值
  * 服务号(4), 命令号(2)
  * body = {
  *     status: number // 返回一个状态值
  * }
  */
proto_man.reg_encoder(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.USER_QUIT, proto_tools.encode_empty_cmd);
proto_man.reg_decoder(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.USER_QUIT, proto_tools.decode_status_cmd);



/**
 * 玩家进入房间
 * 1, 接收值
 * 服务号(4), 命令号(3)
 * body = {
 *  room_id: number, // 房间号 玩家主动进入某一个房间是调用
 * }
 * 2, 返回值
 * 服务号(4), 命令号(3)
 * body = {
 * status : Response.OK,
 * zid: this.zid,
 * room_id : this.room_id,
 * }
 */


function decode_enter_room(cmd_buf) {
    let cmd: Array<any> = [];

    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    let body: Array<any> = [];
    cmd[2] = body;

    let offset = proto_tools.header_size;
    body[0] = proto_tools.read_int16(cmd_buf, offset);
    if (body[0] != Response.OK) {
        return cmd;
    }
    offset += 2;
    
    body[1] = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;  

    body[2] = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;
    
    return cmd;
}
proto_man.reg_encoder(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.ENTER_ROOM, proto_tools.encode_int32_cmd);
proto_man.reg_decoder(Stype.GAME_FIVE_CHESS, Cmd.GameFiveChess.ENTER_ROOM, decode_enter_room);

/**
 * 发送道具
 * 接收值客户端发来的
 * 服务号,
 * 命令号(SEND_PROP: 8, // 发送道具)
 * body = {
 *  prop_id: number,
 *  to_seatid: number
 * }
 * 
 * 返回值 
 * body = {
 * }
 * 
 */