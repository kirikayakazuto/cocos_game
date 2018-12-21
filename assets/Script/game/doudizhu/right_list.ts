
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Node)
    nameToggle: cc.Node = null;
    @property(cc.Node)
    numToggle: cc.Node = null;
    @property(cc.Node)
    ruleToggle: cc.Node = null;
    @property(cc.Node)
    multipleToggle: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }
    // 改变样式
    changeLabelStr() {

    }

    public config = {
        
    };

    // update (dt) {}
}
