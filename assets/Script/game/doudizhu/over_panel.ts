import dou_di_zhu from "../protobufs/dou_di_zhu";
import ddz_game_scene from "./ddz_game_scene"
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    
    @property([cc.SpriteFrame])
    over_sp: Array<cc.SpriteFrame> = [];    // 0是win 1是lost
    @property(cc.Node)
    dizhu_info: cc.Node = null;

    @property(cc.SpriteFrame)
    sp: cc.SpriteFrame = null;

    @property([cc.Node])
    node_arr: Array<cc.Node> = [];

    game_ctl: ddz_game_scene = null;
    onLoad () {
        
    }

    start () {

    }

    init_info(info: Array<any>, is_dizhu_win: boolean, self_seatid: number, game_ctl: any) {
        this.game_ctl = game_ctl;
        for(let i=0; i<info.length; i++) {
            if(self_seatid == info[i][1]) {  // 当前玩家
                this.node_arr[i].getComponent(cc.Sprite).spriteFrame = this.sp;
                if(info[i][4] && is_dizhu_win || !info[i][4] && !is_dizhu_win) {
                    
                }else {
                    this.node.getComponent(cc.Sprite).spriteFrame = this.over_sp[1];
                }
            }
            this.node_arr[i].getChildByName("nick").getComponent(cc.Label).string = info[i][0];
            this.node_arr[i].getChildByName("beishu").getComponent(cc.Label).string = "" + info[i][2];
            this.node_arr[i].getChildByName("chip").getComponent(cc.Label).string = "" + info[i][3];
            if(info[i][4]) {
                this.dizhu_info.y = -50 + (-70 * i) ;
            }
        }  
    }
    /**
     * 继续游戏
     * 隐藏当前panel
     * 自动点击准备
     */
    continue_game_button_click() {
        this.game_ctl.clear_table();
        this.node.removeFromParent();
    }
    /**
     * back
     */
    back_button_click() {
        dou_di_zhu.exit_room();
    }



    // update (dt) {}
}