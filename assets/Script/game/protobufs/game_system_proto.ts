import Stype from "../Stype";
import Response from "../Response";
import proto_tools from "../../modules/proto_tools"
import proto_man from "../../modules/proto_man"
import Cmd from "../Cmd";
import { bonues_info, game_info } from "../info_interface";

/**
 * 用户账号 登录到游戏服务器 
 * 
 * 1, 接收值
 * 服务号(3), 命令号 GameSystem.UGAME_LOGIN: 1,
 * body = null
 * 
 * 2, 返回值
 * 服务号(3), 命令号 GameSystem.UGAME_LOGIN: 1,
 * body = {
 * 0: status,
 * 1: uchip,
 * 2: uexp,
 * 3: game_uvip,
 * }
 */
function decode_get_ugame_info(cmd_buf) {
    let cmd: Array<any> = [];
    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    let body: game_info = {};
    cmd[2] = body;

    let offset = proto_tools.header_size;
    body.status = proto_tools.read_int16(cmd_buf, offset);
    if (body.status != Response.OK) {
        return cmd;
    }
    offset += 2;

    body.uchip = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

    body.uexp = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

    body.uvip = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    return cmd;
}

proto_man.reg_encoder(Stype.GAME_SYSTEM, Cmd.GameSystem.GET_GAME_INFO, proto_tools.encode_empty_cmd);
proto_man.reg_decoder(Stype.GAME_SYSTEM, Cmd.GameSystem.GET_GAME_INFO, decode_get_ugame_info);

/**
 * 每日登录登录奖励  GameSystem.LOGIN_BONUES_INFO
 * 1, 接收值
 * 服务号(2), 命令号 GameSystem.LOGIN_BONUES_INFO 
 * body = {
 * }
 * 2, 返回值
 * body = {
 *  0: status,
 *  1: 是否可以领取奖励,
 *  2: id号,
 *  3: bonues, 奖励多少
 *  4: days, 连续登录的天数
 * }
 */
function decode_login_bonues_info(cmd_buf: DataView) {
    let cmd: Array<any> = [];
    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    let body: bonues_info = {};
    cmd[2] = body;

    let offset = proto_tools.header_size;
    body.status = proto_tools.read_int16(cmd_buf, offset);
    if (body.status != Response.OK) {
        console.log("decode_login_bonues_info status error");
        return cmd;
    }
    offset += 2;

    // 是否有奖励
    body.b_has = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    // 奖励的ID号
    body.id = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

    // 奖励的数目
    body.bonues = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

    // 登陆的天数
    body.days = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    return cmd;
}
proto_man.reg_encoder(Stype.GAME_SYSTEM, Cmd.GameSystem.LOGIN_BONUES_INFO, proto_tools.encode_empty_cmd);
proto_man.reg_decoder(Stype.GAME_SYSTEM, Cmd.GameSystem.LOGIN_BONUES_INFO, decode_login_bonues_info);

/**
 * 领取今日的登录奖励
 * 服务号(3), 命令号GameSystem.RECV_LOGIN_BUNUES: 3, // 发放登录奖励
 * body = {
 *  bonues_id: number,
 * }
 * 返回值:
 * 服务号(3), 命令号GameSystem.RECV_LOGIN_BUNUES: 3, // 发放登录奖励
 * body = {
 *  status: number,
 *  bonues: number,
 * }
 */
function decode_recv_login_bonues(cmd_buf) {
    let cmd: Array<any> = [];
    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    let body: bonues_info = {};
    cmd[2] = body;

    let offset = proto_tools.header_size;
    body.status = proto_tools.read_int16(cmd_buf, offset);
    if (body.status != Response.OK) {
        return cmd;
    }
    offset += 2;
    // 奖励的数目
    body.bonues = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

    return cmd;
}
proto_man.reg_encoder(Stype.GAME_SYSTEM, Cmd.GameSystem.RECV_LOGIN_BUNUES, proto_tools.encode_int32_cmd);
proto_man.reg_decoder(Stype.GAME_SYSTEM, Cmd.GameSystem.RECV_LOGIN_BUNUES, decode_recv_login_bonues);

/**
 * 世界排行榜
 * 1,接收值
 * 服务号(3), 命令号,GET_WORLD_RANK_INFO: 4, // 获取世界全局的排行榜信息
 * body = {
 *  
 * }
 * 2, 返回值
 * 服务号(3), 命令号,GET_WORLD_RANK_INFO: 4, // 获取世界全局的排行榜信息
 * body = {
 *  //let ret = {};
 * ret[0] = Response.OK;
 * ret[1] = rank_array.length;
 * ret[2] = rank_array; (unick, usex, uface, uchip)
 * ret[3] = my_rank_num
 * }
 */

function decode_world_rank_info(cmd_buf: DataView) {
    
    let cmd: Array<any> = [];
    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);

    let body = {};
    cmd[2] = body;

    let offset = proto_tools.header_size;
    body[0] = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    body[1] = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

    let array_info:Array<any> = [];
    for(let i=0; i<body[1]; i++) {
        array_info.push([]);
    }
    for(let i=0; i<body[1]; i++) {

        let ret = proto_tools.read_str_inbuf(cmd_buf, offset);
        
        array_info[i][0] = ret[0];
        offset = ret[1];

        array_info[i][1] = proto_tools.read_int16(cmd_buf, offset);
        offset += 2;

        array_info[i][2] = proto_tools.read_int16(cmd_buf, offset);
        offset += 2;

        array_info[i][3] = proto_tools.read_int32(cmd_buf, offset);
        offset += 4;
    }

    body[2] = array_info;


    body[3] = proto_tools.read_int32(cmd_buf, offset);
    offset += 4;

    return cmd;
}
proto_man.reg_encoder(Stype.GAME_SYSTEM, Cmd.GameSystem.GET_WORLD_RANK_INFO, proto_tools.encode_empty_cmd);
proto_man.reg_decoder(Stype.GAME_SYSTEM, Cmd.GameSystem.GET_WORLD_RANK_INFO, decode_world_rank_info);


