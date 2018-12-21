
import proto_tools from "./proto_tools";

export default class proto_man {
    // 协议类型
    public static PROTO_JSON: number = 1;
    public static PROTO_BUF: number = 2;
    // buf 协议的 编码 解码 管理
    static decoders: {[key: string] : any} = {};
    static encoders: {[key: string] : any} = {};
    // 全局的命令号，当我们的用户丢失链接的时候，
	// 所有的服务都会收到网关转发过来的这个时间这个消息
    public static GW_Disconnect: number = 10000;
    // 编码解码 函数
    static encode_cmd = encode_cmd;
    static decode_cmd = decode_cmd;
    // 注册 编码解码函数
    static reg_decoder = reg_buf_decoder;
    static reg_encoder = reg_buf_encoder;
    // 加密解密函数
    static encrypt_cmd = encrypt_cmd;
    static decrypt_cmd = decrypt_cmd;
    // 解  命令的 头 共10个字节 2 + 2 + 4 + 2
//    static decode_cmd_header = decode_cmd_header;
}
/**
 * stype 服务号     判断是 JSON | BUf
 * ctype 命令号     判断是 执行命令
 * body  数据体
 */
/**
 * ---------------------------------数据加密-------------------------------------------
 */
// 加密
function encrypt_cmd(str_of_buf: any) {
    return str_of_buf;
}
// 解密
function decrypt_cmd(str_of_buf: any) {
    return str_of_buf;
}
/**
 * ----------------------------------json 编码 解码--------------------------------------------
 */
// 编码
function _json_encode(stype: number, ctype: number, body: any): DataView {
    let cmd = {};
    cmd[0] = body;
    let str = JSON.stringify(cmd);

    let cmd_buf = proto_tools.encode_str_cmd(stype, ctype, str);    
    return cmd_buf;
}
// 解码
function _json_decode(cmd_buf: DataView): any {
    let cmd = proto_tools.decode_str_cmd(cmd_buf);
    let cmd_json = cmd[2];  // 0 stype 1 ctype 2 json数据
    try {
        let body_set = JSON.parse(cmd_json);
        cmd[2] = body_set[0];
    } catch (error) {
        console.log("_json_decode parse error");
        return null;    
    }

    if(!cmd || 
        typeof(cmd[0]) == "undefined" ||
        typeof(cmd[1]) == "undefined" ||
        typeof(cmd[2]) == "undefined") {
            console.log("json_decode error");
            return null;
    }
    return cmd;
}

/**
 * -----------------------------------------buf 编码 解码----------------------------------------
 */
// buf 协议的 编码 解码 管理

// 注册 buf 编码器
function reg_buf_encoder(stype: number, ctype: number, encode_func: any) {
    let key = get_key(stype, ctype);
    if(proto_man.encoders[key]) {
        console.log("encoder is register  stype: " + stype + " ctype: " + ctype);
    }
    // 继续添加
    proto_man.encoders[key] = encode_func;
    
}
// 注册 buf 解码器
function reg_buf_decoder(stype: number, ctype: number, decode_func: any) {
    
    let key = get_key(stype, ctype);
    if(proto_man.decoders[key]) {
        console.log("decoder is register stype: " + stype + " ctype: " + ctype);
    }
    // 继续添加
    proto_man.decoders[key] =  decode_func;
}

// 为每一个 stype+ctype 生成一个唯一编码解码器  key
function get_key(stype: number, ctype: number): number {
    return (stype * 65536 + ctype);
}


/**
 * --------------------------------------buf JSON 格式公用的 编码解码-----------------------------------
 */
// 编码
function encode_cmd(proto_type: number, stype: number, ctype: number, body: any): any {
    
    let buf = null;
    let dataview: DataView = null;
    if(proto_type == proto_man.PROTO_JSON) {   // 对json格式加码解码
        dataview = _json_encode(stype, ctype, body);
    } else if(proto_type == proto_man.PROTO_BUF) {    // 对buf格式 加码解码
        let key = get_key(stype, ctype);
        // 如果没有buf的编码器  就报错  表示当前的命令是未知格式的命令
        if(!proto_man.encoders[key]) {
            console.log("encode_cmd not exist error");
            return null;
        }
        dataview = proto_man.encoders[key](stype, ctype, body);
    }
    proto_tools.write_prototype_inbuf(dataview, proto_type);

    buf = dataview.buffer;
    if(buf) {
        buf = encrypt_cmd(buf);
    }
    return buf;
}
// 解码
function decode_cmd(proto_type: number, cmd_buf: ArrayBuffer) {

    cmd_buf = decrypt_cmd(cmd_buf);

    let dataview = new DataView(cmd_buf);
    if(cmd_buf.byteLength < proto_tools.header_size){
        console.log("decode_cmd error");
        return null;
    }

    if(proto_type == proto_man.PROTO_JSON) {   // json格式
        return _json_decode(dataview);
    } else if(proto_type == proto_man.PROTO_BUF) { // buf 格式
        
        let cmd = null;
        let stype = proto_tools.read_int16(dataview, 0);
        let ctype = proto_tools.read_int16(dataview, 2);
        let key = get_key(stype, ctype);

        if(!proto_man.decoders[key]) {
            console.log("decode_cmd decoder[key] error");
            return null;
        }
        cmd = proto_man.decoders[key](dataview);
        
        return cmd;
    }
}

/* // 解 服务号协议号 的编码   方便转发
function decode_cmd_header(cmd_buf: Buffer): Array<number> {
    let cmd: Array<number> = [];
    
    if(cmd_buf.length < proto_tools.header_size) {
        console.log("decode_cmd_header error");
        return null;
    }
    cmd[0] = proto_tools.read_int16(cmd_buf, 0);
    cmd[1] = proto_tools.read_int16(cmd_buf, 2);
    cmd[2] = proto_tools.read_uint32(cmd_buf, 4);
    cmd[3] = proto_tools.read_int16(cmd_buf, 8);

    return cmd;

    
} */
