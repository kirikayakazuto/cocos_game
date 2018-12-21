import utils from "../utils/utils";
import { game_info } from "./info_interface";

export default class ugame {

    static unick: string = "";  // 昵称
    static usex: number = -1;   // 性别
    static uface: number = 0;   // 头像
    static uvip: number = 0;    // vip等级
    static udata: number = 0;   // 房卡数目

    static uname: string = null;    // 登录的用户名
    static upwd: string = null;     // 密码

    static is_guest: boolean = false;   // 是否是游客
    static guest_key: string = null;    // 游客key
    
    static zid = 0; //1, 2, 3       // 玩家进入游戏的区间信息
    static roomid = -1; // 房间id

    static prev_round_data = null;  // 上局回顾数据包

    
    static game_info: game_info = null; // 游戏数据库 的用户信息
    /**
     * 游客登录
     * @param unick 
     * @param usex 
     * @param uface 
     * @param uvip 
     * @param guest_key 
     */
    static guest_login_success(unick: string, usex: number, uface: number, uvip: number, guest_key: string) {
        this.unick = unick;
        this.usex = usex;
        this.uface = uface;
        this.uvip = uvip;
        this.udata = 0;
        this.is_guest = true;
        console.log("guest_login_success : " + guest_key);

        if(this.guest_key != guest_key) {
            this.guest_key = guest_key;
            console.log("guest_key : " + guest_key);
            cc.sys.localStorage.setItem("guest_key", guest_key);
        }
    }
    // 修改 用户信息
    static edit_profile_success(unick: string, usex: number) {
        this.unick = unick;
        this.usex = usex;
    }
    /**
     * 临时保存uname 和 upwd
     * @param uname 
     * @param upwd 
     */
    static save_temp_uname_and_upwd(uname: string, upwd: string) {
        this.uname = uname;
        this.upwd = upwd;
    }
    /**
     * 正式用户登录成功
     * @param unick 
     * @param usex 
     * @param uface 
     * @param uvip 
     */
    static uname_login_success(unick: string, usex: number, uface: number, uvip: number) {
        this.unick = unick;
        this.usex = usex;
        this.uface = uface;
        this.uvip = uvip;
        this.is_guest = false;

        this._save_uname_and_upwd();
    }
    /**
     * 游客绑定电话号码成功
     */
    static guest_bind_phone_success() {
        ugame.is_guest = false;
        this._save_uname_and_upwd();
    }
    // 将用户名的密码保存在本地
    private static _save_uname_and_upwd() {
        let body = {
            uname: this.uname,
            upwd: this.upwd,
        }
        let body_json = JSON.stringify(body);
        cc.sys.localStorage.setItem("uname_upwd", body_json);
    }

    static save_uname_and_upwd() {
        ugame.is_guest = false;
        this._save_uname_and_upwd();
    }
    /**
     * 保存游戏用户 数据
     * @param data 
     */
    static save_user_game_data(data: game_info) {
        console.log("save_user_game_data" + data);
        ugame.game_info = data;
    }
    /**
     * 保存进入游戏区间
     * @param zid 
     */
    static enter_zone(zid: number) {
        this.zid = zid;
    }
    /**
     * 房间id
     * @param roomid 
     */
    static enter_room(roomid: number) {
        this.roomid = roomid;
    }
    /**
     * 断线重连的信息
     * player.room_id,
            player.seatid,
            seats_data,
            round_start_info,
            player.poker_array,
            game_ctl
     */
    static reconnect_room(body) {
        
    }
}

let uname_and_upwd_json = cc.sys.localStorage.getItem("uname_upwd");
if(!uname_and_upwd_json) {  // 如果本地没用正式账号 和 密码
    ugame.is_guest = true;
    ugame.guest_key = cc.sys.localStorage.getItem("guest_key");
    if(!ugame.guest_key) {
        ugame.guest_key = utils.random_string(32);
    }
}else {
    let body: {uname: string, upwd: string} = JSON.parse(uname_and_upwd_json);
    ugame.is_guest = false;
    ugame.uname = body.uname;
    ugame.upwd = body.upwd;
}
console.log("ugame guest_key : " + ugame.guest_key + " uname_upwd : " + ugame.uname + " " + ugame.upwd);
