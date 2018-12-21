import Stype from "../Stype";
import Response from "../Response";
import proto_tools from "../../modules/proto_tools"
import proto_man from "../../modules/proto_man"
import Cmd from "../Cmd";
import {user_info} from "../info_interface";
     /**
     * 游客登录:
     * 1, 接收值:
     * 服务号(2), 命令号:GUEST_LOGIN, body(guest_key): string
     * 
     * 2, 返回值:
     * 服务号(2), 命令号, body({
     *                             status: number = 状态码, uid:number, unick: string, usex: number, uface: number, uvip: number, ukey: string
     *                         })
     */

    // 编码游客登录命令
    function decode_guest_login(cmd_buf: DataView) {
        let cmd: Array<any> = [];
        cmd[0] = proto_tools.read_int16(cmd_buf, 0);
        cmd[1] = proto_tools.read_int16(cmd_buf, 2);
        let body:user_info = {};
        cmd[2] = body;
    
        let offset = proto_tools.header_size;
        body.status = proto_tools.read_int16(cmd_buf, offset);
        if (body.status != Response.OK) {
            return cmd;
        }
        offset += 2;
    
        body.uid = proto_tools.read_uint32(cmd_buf, offset);
        offset += 4;
    
        let ret = proto_tools.read_str_inbuf(cmd_buf, offset);
        body.unick = ret[0];
        offset = ret[1];
        
        body.usex = proto_tools.read_int16(cmd_buf, offset);
        offset += 2;
    
        body.uface = proto_tools.read_int16(cmd_buf, offset);
        offset += 2;
    
        body.uvip = proto_tools.read_int16(cmd_buf, offset);
        offset += 2;
        
        let ret2 = proto_tools.read_str_inbuf(cmd_buf, offset);
        body.guest_key = ret2[0];
        offset = ret2[1];
    
        return cmd;
    }
    
    proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GUEST_LOGIN, proto_tools.encode_str_cmd);
    proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GUEST_LOGIN, decode_guest_login);

     /**
      * 
      * 重复登录
      */

    proto_man.reg_decoder(Stype.Auth, Cmd.Auth.RELOGIN, proto_tools.decode_empty_cmd);
    
    /**
        * 修改用户信息:
        * 1, 接收值:
        *   服务号(2), 命令号:, body = {
        *                                 unick: string,
        *                                 usex: number
        *                       }
        * 2, 返回值:
        *   服务号(2), 命令号, body = {
        *                                 status: number   状态码
        *                                 unick: string,
        *                                 usex: number
        *                       }
        */
       function decode_edit_profile(cmd_buf: DataView) {
        let cmd: Array<any> = [];
        cmd[0] = proto_tools.read_int16(cmd_buf, 0);
        cmd[1] = proto_tools.read_int16(cmd_buf, 2);
        let body: user_info = {};
        cmd[2] = body;
     
        let offset = proto_tools.header_size;
        body.status = proto_tools.read_int16(cmd_buf, offset);
        offset += 2;
        if(body.status != Response.OK) {
            return cmd;
        }
     
        let ret = proto_tools.read_str_inbuf(cmd_buf, offset);
        body.unick = ret[0];
        offset = ret[1];
        
        body.usex = proto_tools.read_int16(cmd_buf, offset);
        
     
        return cmd;
     }
     
     function encode_edit_profile(stype: number, ctype: number, body: any) {
     
        let unick_len = body.unick.utf8_byte_len();
     
        let total_len = proto_tools.header_size + (2 + unick_len) + 2;
        let cmd_buf = proto_tools.alloc_DataView(total_len);
        let offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
     
     
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body.unick, unick_len);
        proto_tools.write_int16(cmd_buf, offset, body.usex);
        offset += 2;
     
        return cmd_buf;
     }
     
     proto_man.reg_decoder(Stype.Auth, Cmd.Auth.EDIT_PROFILE, decode_edit_profile);
     proto_man.reg_encoder(Stype.Auth, Cmd.Auth.EDIT_PROFILE, encode_edit_profile);

    /**
     * 游客账号升级为正式账号 的验证码
     * 1, 接收值:
     *  服务号(2), 命令号, body{
     *                              0: opt_code  // 操作类型 0游客升级, 1, 修改密码, 2, 手机拉取验证码
     *                              1: phone_number
     *                              2: guest_key
     *                          }
     * 2, 返回值:
     * 服务号(2), 命令号, body = status
     */
    function encode_upgrade_verify_code(stype: number, ctype: number, body: any) {
        let phone_len = body[1].utf8_byte_len();
        let guest_key_len = body[2].utf8_byte_len();
     
        let total_len = proto_tools.header_size + 2 + (2 + phone_len) + (2 + guest_key_len);
        let cmd_buf = proto_tools.alloc_DataView(total_len);
        let offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
     
        proto_tools.write_int16(cmd_buf, offset, body[0]);
        offset += 2;
     
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], phone_len);
        proto_tools.write_str_inbuf(cmd_buf, offset, body[2], guest_key_len);
     
        return cmd_buf;
     }
     
     proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_INDENTIFY, encode_upgrade_verify_code);
     proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_INDENTIFY, proto_tools.decode_status_cmd);
     
    /**
     * 绑定游客账号
     * 1, 接收值
     * 服务号(2), 命令号, body = {
     *     0: phone_num    手机号
     *     1: pwd_md5      密码的md5值
     *     2: phone code 手机验证码
     * }
     * 
     * 2, 返回值
     * 服务号(2), 命令号, body
     */
    function encode_guest_bind_account(stype: number, ctype: number, body: any) {
        let phone_len: number = body[0].utf8_byte_len();
        let pwd_len: number = body[1].utf8_byte_len();
        let verify_code_len: number = body[2].utf8_byte_len();
    
        let total_len = proto_tools.header_size + (2 + phone_len) + (2 + pwd_len) + (2 + verify_code_len);
        let cmd_buf = proto_tools.alloc_DataView(total_len);
        let offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
    
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[0], phone_len);
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], pwd_len);
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[2], verify_code_len);
    
        return cmd_buf;
    }
    
    proto_man.reg_encoder(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, encode_guest_bind_account);
    proto_man.reg_decoder(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, proto_tools.decode_status_cmd);
    /**
     * 正式用户  账号密码 登录
     * 1, 接收值
     *     服务号(2), 命令号, body = {0: uname, 1: upwd}
     * 2, 返回值
     *     服务号(2), 命令号, body = {
     *                               status: number,
     *                               uid: number,
     *                               unick: string,
     *                               usex: number,
     *                               uface: number,
     *                               uvip: number, 
     *                              }
     */
    function encode_uname_login(stype: number, ctype: number, body: any) {
        let uname_len: number = body[0].utf8_byte_len();
        let upwd_len: number = body[1].utf8_byte_len();
    
        let total_len = proto_tools.header_size + (2 + uname_len) + (2 + upwd_len);
        let cmd_buf = proto_tools.alloc_DataView(total_len);
        let offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
    
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[0], uname_len);
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], upwd_len);
    
        return cmd_buf;
    }
    
    function decode_uname_login(cmd_buf) {
        let cmd = {};
        cmd[0] = proto_tools.read_int16(cmd_buf, 0);
        cmd[1] = proto_tools.read_int16(cmd_buf, 2);
        let body: user_info = {};
        cmd[2] = body;
    
        let offset = proto_tools.header_size;
        body.status = proto_tools.read_int16(cmd_buf, offset);
        if (body.status != Response.OK) {
            return cmd;
        }
        offset += 2;
    
        body.uid = proto_tools.read_uint32(cmd_buf, offset);
        offset += 4;
    
        let ret = proto_tools.read_str_inbuf(cmd_buf, offset);
        body.unick = ret[0];
        offset = ret[1];
        
        body.usex = proto_tools.read_int16(cmd_buf, offset);
        offset += 2;
    
        body.uface = proto_tools.read_int16(cmd_buf, offset);
        offset += 2;
    
        body.uvip = proto_tools.read_int16(cmd_buf, offset);
        offset += 2;
    
        return cmd;
    }
    
    proto_man.reg_decoder(Stype.Auth, Cmd.Auth.UNAME_LOGIN, decode_uname_login);
    proto_man.reg_encoder(Stype.Auth, Cmd.Auth.UNAME_LOGIN, encode_uname_login);
     
    /**
     *  正式用户注册 获取手机验证码
     * 1, 接收值
     *  服务号(2), 命令号, body = {
     *  0: opt_code: number,   // 操作码, 0, 游客升级, 1手机注册, 2忘记密码
     *  1: phone_num: string //电话号码
     * }
     * 2, 返回值
     * 服务号(2), 命令号, body = status:  状态码
     */
    function encode_phone_reg_verify_code(stype: number, ctype: number, body: any) {
        let phone_len: number = body[1].utf8_byte_len();
    
        let total_len = proto_tools.header_size + 2 + (2 + phone_len);
        let cmd_buf = proto_tools.alloc_DataView(total_len);
        let offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
     
        proto_tools.write_int16(cmd_buf, offset, body[0]);
        offset += 2;
     
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], phone_len);
     
        return cmd_buf;
     }
     
     proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VERIFY, encode_phone_reg_verify_code);
     proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VERIFY, proto_tools.decode_status_cmd);
     
    /**
     * 正式用户注册,  手机号码注册
     * 1, 接收值
     * 服务号(2), 命令号, body = {
     *  0: phone_num: string,
     *  1: pwd: string,
     *  2: verify_code: string,
     *  3: unick: string,
     * }
     * 2, 返回值
     * 服务号(2), 命令号, body = status
     */
    function encode_phone_reg_account(stype: number, ctype: number, body: any) {
        let phone_len = body[0].utf8_byte_len();
        let pwd_len = body[1].utf8_byte_len();
        let verify_code_len = body[2].utf8_byte_len();
        let unick_len = body[3].utf8_byte_len();
    
        
        let total_len = proto_tools.header_size + (2 + phone_len) + (2 + pwd_len) + (2 + verify_code_len) + (2 + unick_len);
        let cmd_buf = proto_tools.alloc_DataView(total_len);
    
        let offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[0], phone_len);
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], pwd_len);
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[2], verify_code_len);
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[3], unick_len);
    
        return cmd_buf;
    }
    proto_man.reg_encoder(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, encode_phone_reg_account);
    proto_man.reg_decoder(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, proto_tools.decode_status_cmd);
     
    /**
     * 修改 正式用户的 密码 获取验证码
     * 1, 接收值
     *  服务号(2), 命令号, body = {
     *  0: opt_code: number,   // 操作码, 0, 游客升级, 1手机注册, 2忘记密码
     *  1: phone_num: string //电话号码
     * }
     * 2, 返回值
     * 服务号(2), 命令号, body = status:  状态码
     */
    // 与正式用户注册  获取验证码 的 编码解码函数相同

    proto_man.reg_encoder(Stype.Auth, Cmd.Auth.GET_FORGET_PWD_VERIFY, encode_phone_reg_verify_code);
    proto_man.reg_decoder(Stype.Auth, Cmd.Auth.GET_FORGET_PWD_VERIFY, proto_tools.decode_status_cmd);


    /**
     * 重置密码
     * 1, 接收值
     *  服务号(2), 命令号, body = {
     *  0: phone_num: string,
     *  1: pwd_md5: string,
     *  2: verify_code: string,
     * }
     * 2, 返回值
     *  服务号(2), 命令号, body = status
     */
    function encode_reset_upwd(stype: number, ctype: number, body: any) {
        let phone_len: number = body[0].utf8_byte_len();
        let pwd_len: number = body[1].utf8_byte_len();
        let verify_code_len: number = body[2].utf8_byte_len();
    
        
        let total_len = proto_tools.header_size + (2 + phone_len) + (2 + pwd_len) + (2 + verify_code_len);
        let cmd_buf = proto_tools.alloc_DataView(total_len);
    
        let offset = proto_tools.write_cmd_header_inbuf(cmd_buf, stype, ctype);
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[0], phone_len);
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[1], pwd_len);
        offset = proto_tools.write_str_inbuf(cmd_buf, offset, body[2], verify_code_len);
    
        return cmd_buf;
    }
    proto_man.reg_encoder(Stype.Auth, Cmd.Auth.RESET_USER_PWD, encode_reset_upwd);
    proto_man.reg_decoder(Stype.Auth, Cmd.Auth.RESET_USER_PWD, proto_tools.decode_status_cmd);
    
    