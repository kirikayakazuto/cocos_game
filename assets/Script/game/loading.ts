import auth from "./protobufs/auth"
import ugame from "./ugame"
import {user_info, game_info} from "./info_interface"
import Cmd from "./Cmd";
import Stype from "./Stype";
import websocket from "../modules/websocket";
import Response from "./Response";

import game_system from "../game/protobufs/game_system"
import QQLoginCtl from "../lib/QQLoginCtl";

const {ccclass, property} = cc._decorator;

@ccclass
export default class loading extends cc.Component {
    @property(cc.Node)
    account_reg: cc.Node = null;
    @property(cc.Node)
    account_forget_pwd: cc.Node = null;
    @property(cc.Node)
    account_uname_locin: cc.Node = null;
    @property(cc.Node)
    wait_node: cc.Node = null;
    wait_label: cc.Label = null;

    can_QQ_login = false;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {

        
        let service_handlers:{[key: string] : any} = {};
        service_handlers[Stype.Auth] = this.on_auth_server_return.bind(this);
        service_handlers[Stype.GAME_SYSTEM] = this.on_game_system_server_return.bind(this);
        websocket.register_services_handler(service_handlers);
        this.wait_label = this.wait_node.getChildByName("str").getComponent(cc.Label);
    }

    start () {

    }

    /**
     * qq登录
     */
    qq_login() {
        
    }
    /**
     * 显示信息
     * @param str 
     */
    show_tips(str: string) {

    }
    /**
     * 微信登录
     */
    wx_login() {
        // this.get_app_sig();
    }
    // 游客账号  登录成功
    guest_login_return(body: user_info) {
        console.log(body);
        if(body.status != Response.OK) { // 
            console.log("error guest_login_return");
            return ;
        }
        ugame.guest_login_success(body.unick, body.usex, body.uface, body.uvip, body.guest_key);
        // cc.director.loadScene("home_scene");
        this.on_auth_login_success();
    }
    // 正式用户 登录成功
    uname_login_return(body: user_info) {
        if(body.status != Response.OK) {
            console.log(body);
            return ;
        }
        ugame.uname_login_success(body.unick, body.usex, body.uface, body.uvip);
        ugame.save_uname_and_upwd();
        // cc.director.loadScene("home_scene");
        this.on_auth_login_success();
    }

    // 用户登录成功  ,   随后登录到游戏服务器
    on_auth_login_success() {
        game_system.get_game_info();
    }
    // 获取手机  验证码 
    on_get_phone_reg_verify_return(status: number) {
        if(status != Response.OK) {
            console.log("on_get_phone_reg_verify_return error status : " + status);
            return ;
        }
        console.log("on_get_phone_reg_verify_return success!");
    }
    // 正式用户注册成功
    on_reg_phone_account_return(status: number) {
        if(status != Response.OK) {
            console.log("on_reg_phone_account_return error status : " + status);
            return ;
        }
        console.log("on_reg_phone_account_return success!");
        ugame.save_uname_and_upwd();
        auth.uname_login();
    }

    // 获取 修改密码 的验证码
    on_get_forget_pwd_verify_return(status: number) {
        if(status != Response.OK) {
            console.log("on_get_forget_pwd_verify_return error status : " + status);
            return ;
        }
        console.log("on_get_forget_pwd_verify_return success!");
    }
    // 重置密码
    on_reset_pwd_return(status: number) {
        if(status != Response.OK) {
            console.log("on_reset_pwd_return error status: " + status);
            return ;
        }
        ugame.save_uname_and_upwd();

        auth.uname_login();
    }
    on_get_game_info_return(body: game_info) {
        if(body.status != Response.OK) {
            console.log("on_get_game_info_return error status: " + status);
            return ;
        }
        // 保存数据
        ugame.save_user_game_data(body);


        this.wait_node.active = true;
        //onProgress可以查看到加载进度
        cc.loader["onProgress"] = function ( completedCount, totalCount,  item ){
            var per = Math.floor(completedCount*100/totalCount);
            this.wait_label.string = per + "%";
        }.bind(this);
        //使用preloadScene()预加载场景
        cc.director.preloadScene('home_scene',function(){
            cc.loader["onProgress"]= null;
            cc.director.loadScene('home_scene');
        });

    }
    /**
     * 游戏服务器回调
     * @param stype 
     * @param ctype 
     * @param body 
     */
    on_game_system_server_return(stype: number, ctype: number, body: any) {
        console.log("on_game_system_server_return" +  ctype, body);
        switch(ctype) {
            case Cmd.GameSystem.GET_GAME_INFO:
                this.on_get_game_info_return(body);
            break;
        }
    }

    // 登录验证 入口 函数
    on_auth_server_return(stype: number, ctype: number, body: any) {
        console.log("on_auth_server_return ctype : " + ctype, body);
        switch(ctype) {
            case Cmd.Auth.GUEST_LOGIN: 
                this.guest_login_return(body);
            break;

            case Cmd.Auth.RELOGIN:
                console.log("error on_auth_server_return 游客账号已在别处登录");
            break;

            case Cmd.Auth.UNAME_LOGIN:
                this.uname_login_return(body);
            break;

            case Cmd.Auth.GET_PHONE_REG_VERIFY:
                this.on_get_phone_reg_verify_return(body);
            break;

            case Cmd.Auth.PHONE_REG_ACCOUNT:
                this.on_reg_phone_account_return(body);
            break;

            case Cmd.Auth.GET_FORGET_PWD_VERIFY:
                this.on_get_forget_pwd_verify_return(body);
            break;

            case Cmd.Auth.RESET_USER_PWD:
                this.on_reset_pwd_return(body);
            break;


        }
    }
    quick_lick_flag = 0;
    // 点击游客登录
    on_quick_login_click() {
        if(this.quick_lick_flag != 0) {
            return ;
        }
        this.quick_lick_flag = 1;
        console.log("是否是游客 : " + ugame.is_guest);
        if(ugame.is_guest) {
            auth.guest_login();
        }else {
            auth.uname_login();
        }
    }
    // 注册
    on_register_account_click() {  
        this.account_reg.active = true;
    }
    // 忘记密码
    on_forget_pwd_click() {
        this.account_forget_pwd.active = true;
    }
    // 账号登录
    on_uname_login_click() {
        this.account_uname_locin.active = true;
    }

    // 点击微信登录
    on_wechat_login_click() {
        
    }

    // update (dt) {}
}
