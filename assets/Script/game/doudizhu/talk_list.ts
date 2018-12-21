import dou_di_zhu from "../protobufs/dou_di_zhu";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }


    talk_msg_click(e, index) {
        index = parseInt(index);
        console.log(index);
        dou_di_zhu.send_msg(index);
    }

    /**
     * 显示
     */
    show_talk_list() {
        this.node.active = true;
    }
    /**
     * 隐藏
     */
    hide_talk_list() {
        this.node.active = false;
    }

    // update (dt) {}
}
