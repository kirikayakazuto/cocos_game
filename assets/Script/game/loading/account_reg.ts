import auth from "../protobufs/auth"
import md5 = require("../../3rd/md5");
import ugame from "../ugame"
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    unick_input: cc.EditBox = null;
    @property(cc.EditBox)
    phone_input: cc.EditBox = null;
    @property(cc.EditBox)
    pwd_input: cc.EditBox = null;
    @property(cc.EditBox)
    again_pwd_input: cc.EditBox = null;
    @property(cc.EditBox)
    verify_code_input: cc.EditBox = null;
    @property(cc.Label)
    error_label: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.error_label.node.active = false;
    }

    start () {

    }

    show_error_label(str: string) {

        this.error_label.node.active = true;
        this.error_label.string = str;
        this.unscheduleAllCallbacks();

        this.scheduleOnce(() => {
            this.error_label.node.active = false;
        }, 2);
    }

    on_close_click() {
        this.node.active = false;
    }
    // 点击获取验证码
    on_get_verify_code_click() {
        if(!this.phone_input.string || this.phone_input.string.length != 11) {
            this.show_error_label("手机号码有误");
            return ;
        }
        auth.get_phone_reg_verify_code(this.phone_input.string);
    }
    // 提交按钮
    on_reg_account_with_phone_click() {
        if(!this.phone_input.string || this.phone_input.string.length != 11) {
            this.show_error_label("手机号码有误");
            return ;
        }

        if(!this.unick_input.string || this.unick_input.string.length <= 0) {
            this.show_error_label("昵称有误");
            return ;
        }

        if(!this.pwd_input.string || this.pwd_input.string.length <= 0) {
            this.show_error_label("密码有误");
            return ;
        }

        if(this.again_pwd_input.string != this.pwd_input.string) {
            this.show_error_label("密码不一致");
            return ;
        }

        if(!this.verify_code_input.string || this.verify_code_input.string.length != 6) {
            this.show_error_label("验证码有误");
            return ;
        }
        ugame.save_temp_uname_and_upwd(this.phone_input.string, this.pwd_input.string);
        let pwd = md5(this.pwd_input.string);
        auth.reg_phone_account(this.unick_input.string, this.phone_input.string, pwd, this.verify_code_input.string);
        
    }

    // update (dt) {}
}
