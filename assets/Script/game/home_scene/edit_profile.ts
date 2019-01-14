import check_box from "../../component/check_box"
import ugame from "../ugame";
import auth from "../protobufs/auth";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.EditBox)
    unick_input: cc.EditBox = null;

    @property(check_box)
    man_checkbox: check_box = null;

    @property(check_box)
    woman_checkbox: check_box = null;

    usex: number = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.unick_input.string = ugame.unick;
        this.set_ckeck_sex(ugame.usex);
    }

    on_ckeck_click(e, type) {
        type = parseInt(type);
        this.set_ckeck_sex(type);
    }

    set_ckeck_sex(type) {
        this.usex = type;
        if(type == 0) { // man
            this.man_checkbox.set_checked(true);
            this.woman_checkbox.set_checked(false);
        }else if(type == 1) {   // woman
            this.man_checkbox.set_checked(false);
            this.woman_checkbox.set_checked(true);
        }
    }
    // 点击提交
    on_subcommit_click() {
        if(this.unick_input.string == "") {
            console.log("unick is null");
            return ;
        }
        auth.edit_profile(this.unick_input.string, this.usex);
        
    }

    // update (dt) {}
}
