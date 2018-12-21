import websocket from "../../modules/websocket"
import Stype from "../Stype";
import Cmd from "../Cmd";
import five_chess from "../protobufs/five_chess";
import ugame from "../ugame";
import Response from "../Response";
import game_seat from "./game_seat"
import game_prop from "./game_prop";
import {State} from "../State"
import chess_disk from "./chess_disk"
import checkout from "./checkout"

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


    @property(cc.Node)
    do_ready_button: cc.Node = null

    
    service_handlers: {[key: string]: any} = {};

    load_flag = 0;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.service_handlers[Stype.GAME_FIVE_CHESS] = this.on_five_chess_server_return.bind(this);
        websocket.register_services_handler(this.service_handlers);
    }

    start () {
        five_chess.enter_zone(ugame.zid);
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
                this.on_user_arrived_return(body);
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
            case Cmd.GameFiveChess.RECONNECT:
                this.do_reconnect_return(body);
            break;
            case Cmd.GameFiveChess.GET_PREV_ROUND:
                this.on_get_prev_round(body);
            break;
        }
    }

    enter_zone_return(body) {
        console.log("enter_zone_return status : " + body);
        
    }

    user_quit_return(body) {
        console.log("user_quit_return status: " + body);
        cc.director.loadScene("home_scene");
    }

    enter_room_return(body) {
        
        if(body[0] != Response.OK) {
            console.log("enter_room_return error status : " + body[0]);
            return ;
        }
        console.log("enter_room_return success zid: " + body[1] + " room_id : " + body[2]);
    }

    on_sitdown_return(body) {
        let status = body[0];
        if(status != Response.OK) {
            console.log("on_sitdown_return error");
            return ;
        }
        let sv_seatid = body[1];
        console.log("sv_seat : " + sv_seatid);

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
        this.seatA.on_sitdowm(player_info, true);
        
    }

    on_user_arrived_return(body) {
        
        console.log("on_user_arrived_return success ! sv_seat_id: " + body[0]);
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

        this.seatB.on_sitdowm(player_info, false);
    }

    on_standup_return(body) {
        if(body[0] != Response.OK) {
            console.log("on_standup_return error");
            return ;
        }
        console.log("on_standup_return success");

        let seat_id = body[1];
        
        if(this.seatA.get_sv_seatid() == seat_id) {
            this.seatA.on_standup();
        }else if(this.seatB.get_sv_seatid() == seat_id) {
            this.seatB.on_standup();
        }
        
    }

    on_send_prop_return(body) { // let body = [  Response.OK,player.seatid,to_seatid,propid];
        if(body[0] != Response.OK) {
            console.log("on_send_prop_return error");
            return ;
        }
        console.log("on_send_prop_return toseat_id ", body[1]+ " seat_id" + body[2] + " prop id" + body[3]);
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
            this.do_ready_button.active = true;
            console.log("on_player_do_ready_return error");
            return ;
        }
        console.log("on_player_do_ready_return success : " + body[1]);
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
        console.log("turn_to_player_return success!");
        let action_time = body[0];
        let sv_seatid = body[1];

        if(sv_seatid == this.seatA.get_sv_seatid()  ) {
            this.seatA.turn_to_player(action_time);
        }else {
            this.seatB.turn_to_player(action_time);
        }
    }

    player_put_chess_return(body: any) {
        if(body[0] != Response.OK) {
            console.log("player_put_chess_return error!");
            return ;
        }
        console.log("player_put_chess_return success!");
        let block_x: number = body[1];
        let block_y: number = body[2];
        let chess_tyep: number = body[3];

        this.chess_disk.put_chess_at(chess_tyep, block_x, block_y);

        this.seatA.hide_timebar();
        this.seatB.hide_timebar();
    }

    game_checkout_return(body: any) {
        console.log("game_checkout_return success");
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
        console.log("game_check_out_over_return success!");

        this.checkout.hide_checkout_result();

        this.seatA.on_checkout_over();
        this.seatB.on_checkout_over();

        this.chess_disk.clear_disk();

        this.do_ready_button.active = true;
    }
    // 断线重连
    do_reconnect_return(body) {
        console.log("do_reconnect_return success!");
        let sv_seatid = body[0];    // 自己的位置信息

        let seat_b_data = body[1][0];   // 只有一个其他玩家
        let round_start_info = body[2];
        let chess_data = body[3];
        let game_ctl = body[4];

        this.do_ready_button.active = false;

        this.on_sitdown_return({
            0: Response.OK,
            1: sv_seatid
        });
        // 其他玩家信息
        this.on_user_arrived_return(seat_b_data);
        // 游戏开局信息
        this.on_game_start_return(round_start_info);
        for(let i=0; i<15; i++) {
            for(let j=0; j<15; j++) {
                if(chess_data[i * 15 + j] != 0) {
                    this.chess_disk.put_chess_at(chess_data[i*15+j], j, i);
                }
            }
        }

        let cur_seatid = game_ctl[0];
        let left_time = game_ctl[1];

        if(cur_seatid == -1) {
            return ;
        }
        if(cur_seatid == this.seatA.get_sv_seatid()) {
            this.seatA.turn_to_player(left_time);
            this.chess_disk.set_your_turn(true);
            
        }else {
            this.seatB.turn_to_player(left_time);
            this.chess_disk.set_your_turn(false);
        }


    }
    on_get_prev_round(body: any) {
        if(body[0] != Response.OK) {
            console.log("on_get_prev_round error");
            return ;
        }
        console.log("on_get_prev_round success!!");

        this.on_user_quit();

        websocket.register_services_handler(null);

        ugame.prev_round_data = body[1];
        cc.director.loadScene("replay_scene");
    }


    on_user_quit() {
        if(this.load_flag == 1) {
            return ;
        }
        this.load_flag = 1;
        five_chess.user_quit();
    }

    on_do_ready_click() {
        this.do_ready_button.active = false;
        five_chess.send_do_ready();
    }

    on_do_prev_round_click() {
        five_chess.send_get_prev_round();
    }

    // update (dt) {}
}
