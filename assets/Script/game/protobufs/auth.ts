import websocket from "../../modules/websocket"
import Stype from "../Stype"
import Cmd from "../Cmd"
import ugame from "../ugame";
import {user_info} from "../info_interface";
import md5 = require("../../3rd/md5");
import "./auth_proto"


/**
 *  -------------------- 用户登录验证  中心 -----------------
 */
export default class auth {
    // 游客登录
    static guest_login() {
        let key = ugame.guest_key;
        websocket.send_cmd(Stype.Auth, Cmd.Auth.GUEST_LOGIN, key);
    }
    // 正式用户登录
    static uname_login() {
        let pwd = md5(ugame.upwd);
        let body = {
            0: ugame.uname,
            1: pwd,
        };
        websocket.send_cmd(Stype.Auth, Cmd.Auth.UNAME_LOGIN, body);
    }
    // 修改用户资料
    static edit_profile(unick: string, usex: number) {
        let body: user_info = {};
        body.unick = unick;
        body.usex = usex;

        websocket.send_cmd(Stype.Auth, Cmd.Auth.EDIT_PROFILE, body);
    }
    // 获取验证码
    static get_guess_upgrade_verify_code(phone_num: string, guest_key: string) {
        let body = {
            0: 0,
            1: phone_num,
            2: guest_key,
        };
        websocket.send_cmd(Stype.Auth, Cmd.Auth.GUEST_UPGRADE_INDENTIFY, body);
    }
    // 游客账号  绑定  电话号码
    static guest_bind_phone(phone_num: string, pwd_md5: string, identifying_code: string) {
        let body = {
            0: phone_num,
            1: pwd_md5,
            2: identifying_code,
        };
        websocket.send_cmd(Stype.Auth, Cmd.Auth.BIND_PHONE_NUM, body);
    }
    // 手机注册 验证码
    static get_phone_reg_verify_code(phone_num: string) {
        let body = {
            0: 1,   // 0为游客升级, 1为手机注册拉取验证码, 2为修改密码拉取验证码
            1: phone_num,
        };
        websocket.send_cmd(Stype.Auth, Cmd.Auth.GET_PHONE_REG_VERIFY, body);
    }
    // 手机号 注册
    static reg_phone_account(unick: string, phone_num: string, pwd: string, verify_code: string) {
        let body = {
            0: phone_num,
            1: pwd,
            2: verify_code,
            3: unick,
        };
        websocket.send_cmd(Stype.Auth, Cmd.Auth.PHONE_REG_ACCOUNT, body);
    }
    /**
     * -----------------------------------------忘记密码 -------------------------------------
     */
    // 获取验证码
    static get_forget_pwd_verify_code(phone_num: string) {
        let body = {
            0: 2,       // 0为游客升级, 1为手机注册拉取验证码, 2为修改密码拉取验证码
            1: phone_num,
        }
        websocket.send_cmd(Stype.Auth, Cmd.Auth.GET_FORGET_PWD_VERIFY, body)
    }

    static reset_user_pwd(phone_num: string, pwd_md5: string, verify_code: string) {
        let body = {
            0: phone_num,
            1: pwd_md5,
            2: verify_code,
        }
        websocket.send_cmd(Stype.Auth, Cmd.Auth.RESET_USER_PWD, body);
    }

    static find_friend(str: string) {
        websocket.send_cmd(Stype.Auth, Cmd.Auth.FIND_FRIENDS, str)
    }

    /**
     * 添加好友
     * @param str 
     */
    static add_friend(str: string) {
        websocket.send_cmd(Stype.Auth, Cmd.Auth.ADD_FRIENDS, str)
    }
    /**
     * 获取添加好友请求
     */
    static get_friends_request() {
        websocket.send_cmd(Stype.Auth, Cmd.Auth.GET_FRIENDS_REQUEST, null);
    }

    /**
     * 响应添加好友
     */
    static response_friend_request(body: any) {
        websocket.send_cmd(Stype.Auth, Cmd.Auth.RESPONSE_FRIENDS_REQUEST, body)
    }
}