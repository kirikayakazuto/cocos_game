import frame_anim from "../../component/frame_anim"
const {ccclass, property} = cc._decorator;

@ccclass("prop_skin")
class prop_skin {

    @property(cc.SpriteFrame)
    icon: cc.SpriteFrame = null;

    @property([cc.SpriteFrame])
    anim_frames: Array<cc.SpriteFrame> = [];
}

@ccclass
export default class game_prop extends cc.Component {

    @property([prop_skin])
    skin_set: Array<prop_skin> = [];

    frame_anim: frame_anim = null;
    anim_sprite: cc.Sprite = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.frame_anim = this.node.getChildByName("anim").getComponent("frame_anim");
        this.anim_sprite = this.node.getChildByName("anim").getComponent(cc.Sprite);
    }

    play_prop_anim(from: cc.Vec2, to_dst: cc.Vec2, prop_id: number) {

        if(prop_id <= 0 || prop_id > 5) {
            return ;
        }

        this.anim_sprite.spriteFrame = this.skin_set[prop_id - 1].icon;
        this.node.setPosition(from);

        let m = cc.moveTo(0.5, to_dst).easing(cc.easeCubicActionOut());

        let func = cc.callFunc(() => {
            this.frame_anim.sprite_frames = this.skin_set[prop_id - 1].anim_frames;
            this.frame_anim.play_once(() => {
                this.node.removeFromParent();
            });
        });

        let seq = cc.sequence(m, func);
        this.node.runAction(seq);

    }

    start () {

    }

    // update (dt) {}
}
