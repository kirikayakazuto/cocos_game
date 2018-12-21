import ulevel from "../ulevel"
import five_chess from "../protobufs/five_chess";
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    unick: cc.Label = null;
    @property(cc.Label)
    uchip: cc.Label = null;
    @property(cc.Label)
    ulevel: cc.Label = null;
    @property(cc.ProgressBar)
    uexp_process: cc.ProgressBar = null;
    @property(cc.Sprite)
    usex: cc.Sprite = null;
    @property([cc.SpriteFrame])
    usex_sp: Array<cc.SpriteFrame> = [];
    @property(cc.Label)
    uvip: cc.Label = null;

    @property(cc.Node)
    props_root: cc.Node = null;
    // LIFE-CYCLE CALLBACKS:

    is_self = false;
    sv_seatid = -1;
 
    // onLoad () {}

    start () {

    }

    on_close_click() {
        this.close_dlg();
    }

    close_dlg() {
        this.node.removeFromParent();
    }

    show_user_info(player_info, is_self) {
        this.unick.string = player_info.unick;
        this.uchip.string = "" + player_info.uchip;
        this.usex.spriteFrame = this.usex_sp[player_info.usex];
        this.uvip.string = "VIP " + player_info.uvip;
        let ret = ulevel.get_level(player_info.uexp);
        this.ulevel.string = "LV " + ret[0];
        this.uexp_process.progress = ret[1];

        this.is_self = is_self;
        this.sv_seatid = player_info.sv_seatid;

        if(is_self) {
            this.props_root.active = false;
        }else {
            this.props_root.active = true;
        }
    }

    on_prop_item_click(e, prop_id) {
        prop_id = parseInt(prop_id);
        
        let to_seatid = this.sv_seatid;
        five_chess.send_prop(to_seatid, prop_id);
        this.close_dlg();
    }


    // update (dt) {}
}
