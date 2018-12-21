import md5 = require("../../3rd/md5");
import auth from "../protobufs/auth";
import ugame from "../ugame";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

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
        // this.node.active = false;
        this.error_label.node.active = false;
    }

    start () {
    }

    on_close_click() {
        this.node.active = false;
    }
    /**
     * 显示错误信息
     * @param str 
     */
    show_error_label(str: string) {
        this.error_label.node.active = true;
        this.error_label.string = str;
        this.unscheduleAllCallbacks();

        this.scheduleOnce(() => {
            this.error_label.node.active = false;
        }, 2);
    }

    /**
     * 忘记密码  获取验证码
     */
    on_get_forget_pwd_verify_code_click() {
        if(!this.phone_input.string || this.phone_input.string.length != 11) {
            this.show_error_label("手机号码有误!");
            return ;
        }
        auth.get_forget_pwd_verify_code(this.phone_input.string);
    }
    /**
     * 点击忘记密码
     */
    on_forget_pwd_commit_click() {
        if(!this.phone_input.string || this.phone_input.string.length != 11) {
            this.show_error_label("手机号码有误!");
            return ;
        }

        if(!this.pwd_input.string || this.pwd_input.string.length <= 0) {
            this.show_error_label("密码有误!");
            return ;
        }

        if(this.pwd_input.string != this.again_pwd_input.string) {
            this.show_error_label("两次输入的密码不相同!");
            return ;
        }

        if(!this.verify_code_input.string || this.verify_code_input.string.length != 6) {
            this.show_error_label("验证码有误!");
            return ;
        }
        ugame.save_temp_uname_and_upwd(this.phone_input.string, this.pwd_input.string);
        let pwd_md5 = md5(this.pwd_input.string);
        auth.reset_user_pwd(this.phone_input.string, pwd_md5, this.verify_code_input.string);
        
    }


    // update (dt) {}
}
