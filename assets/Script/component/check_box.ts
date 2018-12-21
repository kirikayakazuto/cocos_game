
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.SpriteFrame)
    normal: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    select: cc.SpriteFrame = null;

    @property(cc.String)
    b_cheched: boolean = false;

    sp: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.sp = this.node.getComponent(cc.Sprite);
        this.set_checked(this.b_cheched);
    }

    set_checked(b_cheched: boolean) {
        this.b_cheched = b_cheched;
        if(this.b_cheched) {
            this.sp.spriteFrame = this.select;
        }else {
            this.sp.spriteFrame = this.normal;
        }
    }
    // 判断是否被选中
    is_checked() {
        return this.b_cheched;
    }

    start () {
        
    }

    // update (dt) {}
}
