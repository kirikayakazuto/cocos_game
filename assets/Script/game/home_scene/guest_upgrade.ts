import ugame from "../ugame";
import md5 = require("../../3rd/md5");
import auth from "../protobufs/auth";

// import auth from "../protobufs/auth"

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    input_phone_numer: cc.EditBox = null;
    @property(cc.EditBox)
    input_new_pwd: cc.EditBox = null;
    @property(cc.EditBox)
    input_again_pwd: cc.EditBox = null;
    @property(cc.EditBox)
    input_indetifying_code: cc.EditBox = null;
    @property(cc.Label)
    error_desic_label: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.error_desic_label.node.active = false;
    }
    // 显示错误信息
    show_error_tip(desic: string) {
        this.error_desic_label.node.active = true;
        this.error_desic_label.string = desic;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            this.error_desic_label.node.active = false;
        }, 3);
    }
    // 点击获取验证码
    on_get_identifying_code() {
        this.error_desic_label.node.active = false;
        let phone_num = this.input_phone_numer.string;
        if(!phone_num || phone_num.length != 11) {
            this.show_error_tip("无效的电活号码!");
            return ;
        }
        console.log(phone_num);
        auth.get_guess_upgrade_verify_code(phone_num, ugame.guest_key);
    }
    // 点击提交按钮 
    on_guest_upgrade_click() {
        let phone_num = this.input_phone_numer.string;
        if(!phone_num || phone_num.length != 11) {
            this.show_error_tip("无效的电活号码!");
            return ;
        }
        let pwd = this.input_new_pwd.string;
        if(pwd != this.input_again_pwd.string) {
            this.show_error_tip("两次输入的密码不一致!");
            return ;
        }
        let guest_key = ugame.guest_key;
        let identifying_code = this.input_indetifying_code.string;
        if(!identifying_code || identifying_code.length != 6) {
            this.show_error_tip("验证码错误!");
            return ;
        }
        ugame.save_temp_uname_and_upwd(phone_num, pwd);
        pwd = md5(pwd);
        auth.guest_bind_phone(phone_num, pwd, identifying_code);
        // 保存正式用户 和 密码
        
    }

    start () {
    }

    // update (dt) {}
}
