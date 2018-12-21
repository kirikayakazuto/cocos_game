import websocket from "../../modules/websocket"
import Stype from "../Stype";
import Cmd from "../Cmd";
import five_chess from "../protobufs/five_chess";
import ugame from "../ugame";
import Response from "../Response";
import game_seat from "../game_scene/game_seat"
import game_prop from "../game_scene/game_prop";
import {State} from "../State"
import chess_disk from "../game_scene/chess_disk"
import checkout from "../game_scene/checkout"

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(game_seat)
    seatA: game_seat = null;
    @property(game_seat)
    seatB: game_seat = null;
    @property(cc.Prefab)
    prop_prefab: cc.Prefab = null;

    @property(chess_disk)
    chess_disk: chess_disk = null;
    @property(checkout)
    checkout: checkout = null;

    cmd_set: any = null;
    cur_cmd = 0;
    prev_time = -1;

    
    service_handlers: {[key: string]: any} = {};

    load_flag = 0;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    }

    start () {
        let prev_round = ugame.prev_round_data;

        let seats_data = prev_round[0];
        this.on_user_arrived_return(seats_data[0], true);
        this.on_user_arrived_return(seats_data[1], false);

        this.cmd_set = prev_round[1];
        this.cur_cmd = 0;
        this.prev_time = -1;

        this.exec_cmd();
    }
    /**
     * ---------------------- 五子棋服务器GAME_FIVE_CHESS 返回的消息 --------------------------
     */
    on_five_chess_server_return(stype: number, ctype: number, body) {
        console.log(stype + " " + ctype +  " " + body);
        switch(ctype) {
            case Cmd.GameFiveChess.ENTER_ZONE:
                this.enter_zone_return(body);
            break;
            case Cmd.GameFiveChess.USER_QUIT:
                this.user_quit_return(body);
            break;
            case Cmd.GameFiveChess.ENTER_ROOM:
                this.enter_room_return(body);
            break;
            case Cmd.GameFiveChess.EXIT_ROOM:
            break;
            case Cmd.GameFiveChess.SITDOWN:
                this.on_sitdown_return(body);
            break;
            case Cmd.GameFiveChess.STANDUP:
                this.on_standup_return(body);
            break;

            case Cmd.GameFiveChess.USER_ARRIVED:
                this.on_user_arrived_return(body, null);
            break;

            case Cmd.GameFiveChess.SEND_PROP:
                this.on_send_prop_return(body);
            break;

            case Cmd.GameFiveChess.SEND_DO_READY:
                this.on_player_do_ready_return(body);
            break;
            case Cmd.GameFiveChess.ROUND_START:
                this.on_game_start_return(body);
            break;
            case Cmd.GameFiveChess.TURN_TO_PLAYER:
                this.turn_to_player_return(body);
            break;
            case Cmd.GameFiveChess.PUT_CHESS:
                this.player_put_chess_return(body);
            break;
            case Cmd.GameFiveChess.CHECKOUT:
                this.game_checkout_return(body);
            break;
            case Cmd.GameFiveChess.CHECKOUT_OVER:
                this.game_check_out_over_return(body);
            break;
            
        }
    }

    exec_cmd() {
        if(this.cur_cmd >= this.cmd_set.length) {
            return ;
        }

        let cmd = this.cmd_set[this.cur_cmd];
        this.cur_cmd ++;
        if(!cmd) {
            return ;
        }

        let stype = cmd[1];
        let ctype = cmd[2];
        let body = cmd[3];

        this.on_five_chess_server_return(stype, ctype, body);

        if(this.cur_cmd < this.cmd_set.length) {
            let next_cmd = this.cmd_set[this.cur_cmd];
            let next_time = next_cmd[0] - cmd[0];

            this.scheduleOnce(this.exec_cmd.bind(this), next_time);
        }else {
            this.scheduleOnce(this.game_check_out_over_return.bind(this), 5);       
        }
    }
    enter_zone_return(body) {
        
        
    }

    user_quit_return(body) {
        
        cc.director.loadScene("home_scene");
    }

    enter_room_return(body) {
        
        if(body[0] != Response.OK) {
            
            return ;
        }
        
    }

    on_sitdown_return(body) {
        console.log(body);
        let status = body[0];
        if(status != Response.OK) {
            return ;
        }
        let sv_seatid = body[1];
        

        let player_info = {
            unick: ugame.unick,
            usex: ugame.usex,
            uface: ugame.uface,

            uvip: ugame.game_info.uvip,
            uchip: ugame.game_info.uchip,
            uexp: ugame.game_info.uexp,
            state: State.InView,

            sv_seatid: sv_seatid,
        }
        console.log(player_info);
        this.seatA.on_sitdowm(player_info, true);
        
    }

    on_user_arrived_return(body, is_seatA: boolean) {
        
        
        let player_info = {
             
            unick: body[1],
            usex: body[2],
            uface: body[3],

            uvip: body[6],
            uchip: body[4],
            uexp: body[5],
            state: body[7],
            

            sv_seatid: body[0],  
        }
        if(is_seatA) {
            this.seatA.on_sitdowm(player_info, false);
        }else {
            this.seatB.on_sitdowm(player_info, false);
        }
        
    }

    on_standup_return(body) {
        if(body[0] != Response.OK) {
            
            return ;
        }
        

        let seat_id = body[1];
        
        if(this.seatA.get_sv_seatid() == seat_id) {
            this.seatA.on_standup();
        }else if(this.seatB.get_sv_seatid() == seat_id) {
            this.seatB.on_standup();
        }
        
    }

    on_send_prop_return(body) { // let body = [  Response.OK,player.seatid,to_seatid,propid];
        if(body[0] != Response.OK) {
            
            return ;
        }
        
        let prop_node = cc.instantiate(this.prop_prefab);
        prop_node.parent = this.node;
        let game_prop: game_prop = prop_node.getComponent("game_prop");

        let src_pos: cc.Vec2;
        let dst_pos: cc.Vec2;
        if(body[1] == this.seatA.get_sv_seatid()) {
            src_pos = this.seatA.node.getPosition();
            dst_pos = this.seatB.node.getPosition();
        }else {
            src_pos = this.seatB.node.getPosition();
            dst_pos = this.seatA.node.getPosition();
        }

        game_prop.play_prop_anim(src_pos, dst_pos, body[3]);

    }

    on_player_do_ready_return(body) {   // Response.OK, player.seatid
        if(body[0] != Response.OK) {
            
            
            return ;
        }
        
        if(this.seatA.get_sv_seatid() == body[1]) { // 自己准备
            this.seatA.on_do_ready();
        }else { // 别人准备
            this.seatB.on_do_ready();
        }
    }

    on_game_start_return(body: any) {
        // 开始游戏前的准备
        // end 
        this.seatA.on_game_start(body);
        this.seatB.on_game_start(body);
    }

    turn_to_player_return(body: any) {
        
        let action_time = body[0];
        let sv_seatid = body[1];

        if(sv_seatid == this.seatA.get_sv_seatid()) {
            this.seatA.turn_to_player(action_time);
            this.chess_disk.set_your_turn(true);
        }else {
            this.seatB.turn_to_player(action_time);
            this.chess_disk.set_your_turn(false);
        }
    }

    player_put_chess_return(body: any) {
        if(body[0] != Response.OK) {
            
            return ;
        }
        
        let block_x: number = body[1];
        let block_y: number = body[2];
        let chess_type: number = body[3];

        this.chess_disk.put_chess_at(chess_type, block_x, block_y);

        this.seatA.hide_timebar();
        this.seatB.hide_timebar();
    }

    game_checkout_return(body: any) {
        
        let win_seatid = body[0];
        let score = body[1];
        if(win_seatid == -1) {
            this.checkout.show_checkout_result(2, 0);
        }else if(win_seatid == this.seatA.get_sv_seatid()) {

            this.checkout.show_checkout_result(1, score);
            ugame.game_info.uchip += score;
        }else if(win_seatid == this.seatB.get_sv_seatid()) {

            this.checkout.show_checkout_result(0, score);
            ugame.game_info.uchip -= score;
        }
    }

    game_check_out_over_return(body: any) {
        

        this.checkout.hide_checkout_result();

        this.seatA.on_checkout_over();
        this.seatB.on_checkout_over();

        this.chess_disk.clear_disk();

        
    }




    on_user_quit() {
        if(this.load_flag == 1) {
            return ;
        }
        this.load_flag = 1;
        five_chess.user_quit();
    }

    on_do_ready_click() {
        
        five_chess.send_do_ready();
    }

    // update (dt) {}
}
