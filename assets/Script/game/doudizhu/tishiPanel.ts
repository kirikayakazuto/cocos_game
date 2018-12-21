
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    str: cc.Label = null;


    
    init(str: string) {
        this.str.string = str;
    }
    /**
     * 关闭
     */
    close_button_click() {
        this.node.removeFromParent();
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
