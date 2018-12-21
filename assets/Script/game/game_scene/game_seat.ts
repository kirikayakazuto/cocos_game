import game_show_info from "./game_show_info"
import {State} from "../State"
import action_time from "../../component/action_time"
const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    unick: cc.Label = null;
    @property(action_time)
    timebar: action_time = null;

    @property(cc.Prefab)
    show_uinfo_prefab: cc.Prefab = null;

    @property(cc.Node)
    ready_icon: cc.Node = null;

    @property(cc.Node)
    black_chess: cc.Node = null;
    @property(cc.Node)
    white_chess: cc.Node = null;

    player_info:{
        unick: string,
        usex: number,
        uface: number,

        uvip: number,
        uchip: number,
        uexp: number,

        sv_seatid: number, 
    } = null;

    is_self = false;    // 是否是 自己
    state = -1;         // 状态
    black_seat = -1;    // 黑旗的 位置
    action_time = -1;   // 等待时间

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.timebar.node.active = false;
        this.node.active = false;
        this.is_self = false;
        this.ready_icon.active = false;

        this.black_chess.active = false;
        this.white_chess.active = false;

        this.state = State.InView;
    }

    start () {

    }

    on_sitdowm(player_info, is_self) {
        this.player_info = player_info;
        this.node.active = true;

        this.black_chess.active = false;
        this.white_chess.active = false;
        this.state = State.InView;

        // this.timebar.node.active = false;
        this.unick.string = player_info.unick;
        this.is_self = is_self;
        this.ready_icon.active = false;
        if(player_info.state == State.Ready) {
            this.on_do_ready();
        }
    }

    on_standup() {
        this.state = State.InView;
        this.timebar.node.active = false;
        this.node.active = false;
        this.player_info = null;
        this.ready_icon.active = false;
    }

    get_sv_seatid() { 
        return this.player_info.sv_seatid;
    }

    on_show_info_click() {
        let dlg = cc.instantiate(this.show_uinfo_prefab);
        dlg.parent = this.node.parent;

        let game_show_info: game_show_info = dlg.getComponent("game_show_info");
        game_show_info.show_user_info(this.player_info, this.is_self);
    }

    on_do_ready() {
        this.ready_icon.active = true;
    }
    on_game_start(round_data) {
        this.black_seat = round_data[2];
        this.action_time = round_data[0];

        this.ready_icon.active = false;
        this.timebar.node.active = false;

        this.state = State.Playing;

        if(this.black_seat == this.player_info.sv_seatid) {
            this.black_chess.active = true;
            this.white_chess.active = false;
        }else {
            this.white_chess.active = true;
            this.black_chess.active = false;
        }
    }
    // 轮到哪个玩家
    turn_to_player(action_time) {
        this.timebar.node.active = true;
        this.timebar.start_action_time(action_time);
    }
    // 隐藏时间条
    hide_timebar() {
        this.timebar.node.active = false;
    }

    on_checkout_over() {
        this.timebar.node.active = false;
        this.black_chess.active = false;
        this.white_chess.active = false;
    }



    // update (dt) {}
}
