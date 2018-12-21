
const {ccclass, property} = cc._decorator;

@ccclass
export default class tab_button extends cc.Component {

    @property(cc.SpriteFrame)
    icon_normal: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    icon_selected: cc.SpriteFrame = null;

    icon: cc.Sprite = null;
    label: cc.Node = null;
    is_active: boolean = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.icon = this.node.getChildByName("icon").getComponent(cc.Sprite);
        this.label = this.node.getChildByName("name");
        this.is_active = false;
    }

    start () {

    }

    set_actived(is_active) {
        this.is_active = is_active;
        if(this.is_active) {
            this.icon.spriteFrame = this.icon_selected;
            this.label.color = new cc.Color(64, 155, 226, 255);
        }else {
            this.icon.spriteFrame = this.icon_normal;
            this.label.color = new cc.Color(118, 118, 118, 255);
        }
    }

    // update (dt) {}
}
