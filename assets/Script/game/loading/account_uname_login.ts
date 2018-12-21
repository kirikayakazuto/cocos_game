import ugame from "../ugame";
import auth from "../protobufs/auth";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    @property(cc.EditBox)
    phone_input: cc.EditBox = null;
    @property(cc.EditBox)
    pwd_input: cc.EditBox = null;

    onLoad () {
        // this.node.active = false;
    }

    start () {
        if(!ugame.is_guest) {
            this.phone_input.string = ugame.uname;
            this.pwd_input.string = ugame.upwd;
        }
    }

    on_close_click() {
        this.node.active = false;
    }
    login_click_flag = false;
    /**
     * l
     */
    on_uname_upwd_login_click() {
        if(!this.phone_input.string || this.phone_input.string.length != 11) {
            return ;
        }

        if(!this.pwd_input.string || this.pwd_input.string.length <= 0) {
            return ;
        }
        if(this.login_click_flag) {
            return ;
        }
        this.login_click_flag = true;
        ugame.save_temp_uname_and_upwd(this.phone_input.string, this.pwd_input.string);
        auth.uname_login();
    }
    

    // update (dt) {}
}
