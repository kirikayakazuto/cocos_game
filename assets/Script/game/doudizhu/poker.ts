
const {ccclass, property} = cc._decorator;

@ccclass
export default class poker extends cc.Component {

    poker_bg: cc.Sprite = null;
    poker_num: cc.Sprite = null;
    poker_little_sp: cc.Sprite = null;
    poker_big_sp: cc.Sprite = null;

    
    can_touch = false;
    is_select = 1;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        /* this.node.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventCustom) => {
            if(this.can_touch == false) {
                return ;
            }
            this.can_touch = false;

            let move_action = cc.moveBy(0.2, this.node.x, 50 * this.is_select);
            let call_back = cc.callFunc(() => {
                this.can_touch = true;
                this.is_select *= -1;
            });
            this.node.runAction(cc.sequence(move_action, call_back));
            
        }, this.node); */
        
    }
    /**
     * 对poker进行初始化
     */
    init(sp_bg, sp_num, sp_type) {
        this.poker_bg = this.node.getChildByName("b-bg").getComponent(cc.Sprite);
        this.poker_num = this.node.getChildByName("str").getComponent(cc.Sprite);
        this.poker_little_sp = this.node.getChildByName("b_little").getComponent(cc.Sprite);
        this.poker_big_sp = this.node.getChildByName("b_big").getComponent(cc.Sprite);

        this.poker_bg.spriteFrame = sp_bg;
        this.poker_num.spriteFrame = sp_num;
        this.poker_little_sp.spriteFrame = sp_type;
        this.poker_big_sp.spriteFrame = sp_type;
    }

    /**
     * 加上阴影
     */
    setMaskShowing(flag: boolean) {
        this.node.getChildByName("mask").active = flag;
    }



    /**
     * 添加触摸事件
     */

    start () {

    }

    // update (dt) {}
}
