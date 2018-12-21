const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    rank_label: cc.Label = null;
    @property(cc.Label)
    unick_label: cc.Label = null;
    @property(cc.Label)
    uchip_label: cc.Label = null;
    @property(cc.Sprite)
    usex: cc.Sprite = null;
    @property([cc.SpriteFrame])
    usex_sp: Array<cc.SpriteFrame> = [];

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    show_rank_info(rank_num: number, unick: string, usex: number, uface: number, uchip: number) {
        this.rank_label.string = "" + rank_num;
        this.unick_label.string = unick;
        this.uchip_label.string = "" + uchip;
        this.usex.spriteFrame = this.usex_sp[usex];
    }

    // update (dt) {}
}
