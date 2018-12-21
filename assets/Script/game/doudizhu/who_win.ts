
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property([cc.SpriteFrame])
    who_win: Array<cc.SpriteFrame> = [];    // 0地主win 1地主lost 2农民win 3农民lost

    
    init(index: number) {
        if(index < 0 || index > 3) {
            return ;
        }
        this.node.getChildByName("img").getComponent(cc.Sprite).spriteFrame = this.who_win[index];
        this.node.active = true;
    }

    hide_node() {
        this.node.active = false;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
