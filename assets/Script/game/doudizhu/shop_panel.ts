import dou_di_zhu from "../protobufs/dou_di_zhu";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    
    @property(cc.Node)
    bug_result: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    show_buy_result(str) {
        this.bug_result.getChildByName("str").getComponent(cc.Label).string = str;
        this.bug_result.active = true;
    }

    yes_button_click() {
        this.bug_result.active = false;
    }
    /**
     * 购买房卡 
     * @param e 
     * @param index 
     */
    bug_room_cards(e, index) {
        index = parseInt(index);
        dou_di_zhu.bug_room_cards(index);
    }
    /**
     * 关闭
     */
    quit_button_click() {
        this.node.removeFromParent();
    }

    // update (dt) {}
}
