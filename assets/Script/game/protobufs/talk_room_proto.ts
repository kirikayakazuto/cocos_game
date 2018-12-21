import proto_man from "../../modules/proto_man"
import proto_tools from "../../modules/proto_tools"

var STYPE_TALKROOM = 1;

var TalkCmd = {
	Enter: 1, // 用户进来
	Exit: 2, // 用户离开ia
	UserArrived: 3, // 别人进来;
	UserExit: 4, // 别人离开

	SendMsg: 5, // 自己发送消息,
	UserMsg: 6, // 收到别人的消息
};
 
var Respones = {
	OK: 1,
	IS_IN_TALKROOM: -100, // 玩家已经在聊天室
	NOT_IN_TALKROOM: -101, // 玩家不在聊天室
	INVALD_OPT: -102, // 玩家非法操作
	INVALID_PARAMS: -103, // 命令格式不对
};


/*
enter:
客户端: 进入聊天室
1, 1, body = {
	uname: "名字",
	usex: 0 or 1, // 性别
};
返回:
1, 1, status = OK;

exit
客户端: 离开聊天室
1, 2, body = null;
返回:
1, 2, status = OK;

客户端请求发送消息
1, 5, body = "消息内容"
返回
1, 5, body = {
	0: status, OK, 失败的状态码
	1: uname,
	2: usex,
	3: msg, // 消息内容
}

UserMsg: 服务器主动发送
1, 6, body = {
	0: uname,
	1: usex
	2: msg,
};

UserExit: 主动发送
1, 4, body = uinfo {
	uname: "名字",
	usex: 0, 1 // 性别
} 

UserEnter: 主动发送
1, 3, body = uinfo{
	uname: "名字",
	usex: 0 or 1, // 性别
}
*/

function decode_user_enter(cmd_buf) {
    var cmd = {};
    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    var offset = proto_tools.header_size;

    var body: {uname:string, usex: number} = null;
    cmd[2] = body;
    
    // uname
    var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
    body.uname = ret[0];
    offset = ret[1];

    // usex
    body.usex = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;
    return cmd;
}
proto_man.reg_decoder(1, 3, decode_user_enter);

function decode_user_exit(cmd_buf) {
    var cmd = {};
    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    var offset = proto_tools.header_size;

    var body: {uname:string, usex: number} = null;
    cmd[2] = body;
    
    // uname
    var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
    body.uname = ret[0];
    offset = ret[1];

    // usex
    body.usex = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;
    return cmd;
}
proto_man.reg_decoder(1, 4, decode_user_exit);


function encode_enter_talkroom(stype, ctype, body) {
    var uname_len = body.uname.utf8_byte_len();
    var total_len = proto_tools.header_size + 2 + uname_len + 2;
    var cmd_buf = proto_tools.alloc_DataView(total_len);
    var offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
    offset = proto_tools.write_str_inbuf(cmd_buf, offset, body.uname, uname_len);

    proto_tools.write_int16(cmd_buf, offset, body.usex);
    return cmd_buf;
}
proto_man.reg_encoder(1, 1, encode_enter_talkroom);
proto_man.reg_decoder(1, 1, proto_tools.decode_status_cmd);

proto_man.reg_encoder(1, 2, proto_tools.encode_empty_cmd);
proto_man.reg_decoder(1, 2, proto_tools.decode_status_cmd);

function decode_send_msg(cmd_buf) {
    var cmd = {};
    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    var offset = proto_tools.header_size;

    var body = {};
    var status = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    body[0] = status;
    cmd[2] = body;
    if (status != Respones.OK) {
        return cmd;
    }
    // uname
    var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
    body[1] = ret[0];
    offset = ret[1];

    // usex
    body[2] = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    // msg
    ret = proto_tools.read_str_inbuf(cmd_buf, offset);
    body[3] = ret[0];
    // 
    
    return cmd;
}
proto_man.reg_encoder(1, 5, proto_tools.encode_str_cmd);
proto_man.reg_decoder(1, 5, decode_send_msg);

function decode_user_msg(cmd_buf) {
    var cmd = {};
    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    var offset = proto_tools.header_size;

    var body = {};
    cmd[2] = body;
    // uname
    var ret = proto_tools.read_str_inbuf(cmd_buf, offset);
    body[0] = ret[0];
    offset = ret[1];

    // usex
    body[1] = proto_tools.read_int16(cmd_buf, offset);
    offset += 2;

    // msg
    ret = proto_tools.read_str_inbuf(cmd_buf, offset);
    body[2] = ret[0];
    // 

    return cmd;
}
proto_man.reg_decoder(1, 6, decode_user_msg);

module.exports = {
    stype: 1, 
    cmd: TalkCmd,
    respones: Respones,
};


