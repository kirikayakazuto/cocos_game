
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Sprite)
    poker_num: cc.Sprite = null;
    @property(cc.Sprite)
    poker_little_sp: cc.Sprite = null;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    /**
     * 对poker进行初始化
     */
    init(sp_num, sp_type) {
        
        this.poker_num = this.node.getChildByName("str").getComponent(cc.Sprite);
        this.poker_little_sp = this.node.getChildByName("b_little").getComponent(cc.Sprite);
        
        this.poker_num.spriteFrame = sp_num;
        this.poker_little_sp.spriteFrame = sp_type;
        
    }

    // update (dt) {}
}
