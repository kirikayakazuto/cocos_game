import Cmd from "../Cmd";
import Stype from "../Stype";
import websocket from "../../modules/websocket";
import dou_di_zhu from "../protobufs/dou_di_zhu";
import ugame from "../ugame";
import Response from "../Response";
import { State } from "../State";
import ddz_game_seat from "./ddz_game_seat"
import poker_list from "./poker_list"

import dizhu_poker from "./dizhu_poker"
import poker_di_pool from "./poker_di_pool"
import player_self_button from "./player_self_button"
import playerPoker from "./playerPoker";
import who_win from "./who_win"
import over_panel from "./over_panel"
import QueuePool from "./QueuePool";
import cards_compare from "./cards_compare";
import ddz_uitl from "./ddz_util";
import send_poker_ctl from "./send_poker_ctl";
import { stringify } from "querystring";
import { format } from "path";
import QueueShow from "./QueueShow";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    wait_node: cc.Node = null;
    wait_label: cc.Label = null;

    @property(ddz_game_seat)
    seat_self: ddz_game_seat = null;
    @property(ddz_game_seat)
    seat_otherA: ddz_game_seat = null;
    @property(ddz_game_seat)
    seat_otherB: ddz_game_seat = null;

    @property(cc.Label)
    roomid_label: cc.Label = null;
    
    @property(poker_list)
    poker_list: poker_list = null;

    @property(dizhu_poker)
    dizhu_poker: dizhu_poker = null;

    @property(poker_di_pool)
    poker_di_pool: poker_di_pool = null;

    @property(player_self_button)
    player_self_button: player_self_button = null;

    @property(who_win)
    who_win: who_win = null;

    @property(cc.Prefab)
    over_panel: cc.Prefab = null;

    @property(cc.Prefab)
    tishiPanel: cc.Prefab = null;

    GAME_SEAT = 3;
    // false表示没准备, ture表示已经准备了
    ready_flag = false;

    can_send_card = false;


    service_handlers: {[key: string]: any} = {};

    onLoad () {
        this.service_handlers[Stype.GAME_DOU_DI_ZHU] = this.on_dou_di_zhu_server_return.bind(this);
        websocket.register_services_handler(this.service_handlers);
        this.wait_label = this.wait_node.getChildByName("str").getComponent(cc.Label);
        this.sync_info();
    }
    start () {
        // 房间创建完毕, 用户进入房间
        if(ugame.roomid != -1) {
            dou_di_zhu.enter_room(ugame.roomid);
        }
        
    }

    sync_info() {
        let num = this.PrefixInteger(ugame.roomid, 6)
        this.roomid_label.string = num;
    }
    PrefixInteger(num: number, n: number) {
        return (Array(n).join('0') + num).slice(-n);
    }
    /**
     * 回调
     * @param stype 
     * @param ctype 
     * @param body 
     */
    on_dou_di_zhu_server_return(stype: number, ctype: number, body) {
        console.log(stype, ctype, body);
        switch(ctype) {
            case Cmd.GameDouDiZhu.ENTER_ROOM:
                this.enter_room_return(body);
            break;
            case Cmd.GameDouDiZhu.EXIT_ROOM:
                this.exit_room_return(body);
            break;
            case Cmd.GameDouDiZhu.SITDOWN:
                this.on_sitdown_return(body);
            break;
            case Cmd.GameDouDiZhu.STANDUP:
                this.on_standup_return(body);
            break;
            case Cmd.GameDouDiZhu.USER_ARRIVED:
                this.on_userArrived_return(body);
            break;
            case Cmd.GameDouDiZhu.SEND_DO_READY:
                this.on_player_ready(body);
            break;
            case Cmd.GameDouDiZhu.SEND_NOT_READY:
                this.on_player_not_ready(body);
            break;
            case Cmd.GameDouDiZhu.ROUND_START:
                this.round_start_return(body);
            break;
            case Cmd.GameDouDiZhu.SEND_CARDS:
                this.send_cards_return(body);
            break;  
            case Cmd.GameDouDiZhu.TURN_TO_PLAYER:
                this.turn_to_player_return(body);
            break;
            case Cmd.GameDouDiZhu.SEND_DIZHU:
                this.send_dizhu_return(body);
            break;
            case Cmd.GameDouDiZhu.DI_ZHU_SEAT:
                this.di_zhu_seat_return(body);
            break;
            case Cmd.GameDouDiZhu.PLAYER_SEND_CARDS:
                this.player_send_cards_return(body);
            break;
            case Cmd.GameDouDiZhu.PLAYER_NO_CARDS:
                this.player_no_cards_retrun(body);
            break;
            case Cmd.GameDouDiZhu.CHECK_OUT_GAME:
                this.check_out_game_return(body);
            break;
            case Cmd.GameDouDiZhu.SEND_MSG:
                this.send_msg_return(body);
            break;
        }
    }
    /**
     * 进入房间
     * @param body 
     */
    enter_room_return(body) {
        console.log("玩家进入了房间!");
    }
    /**
     * 退出房间
     * @param body 
     */
    exit_room_return(body: any) {

        if(body != Response.OK) {
            let node = cc.instantiate(this.tishiPanel);
            node.getComponent("tishiPanel").init("游戏正在进行中, 请不要退出!");
            node.parent = this.node;
            return ;
        }
        this.wait_node.active = true;
        //onProgress可以查看到加载进度
        cc.loader["onProgress"] = function ( completedCount, totalCount,  item ){
            var per = Math.floor(completedCount*100/totalCount);
            this.wait_label.string = per + "%";
        }.bind(this);
        //使用preloadScene()预加载场景
        cc.director.preloadScene('ddz_main_scene',function(){
            cc.loader["onProgress"]= null;
            cc.director.loadScene('ddz_main_scene');
        });
    }
    /**
     * 坐下
     * @param body 
     */
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
        this.seat_self.on_sitdowm(player_info, 0);
    }
    /**
     * 站起
     * @param body 
     */
    on_standup_return(body) {
        if(body[0] != Response.OK) {
            console.log("on_standup_return error");
            return ;
        }
        console.log("on_standup_return success");

        let seat_id = body[1];
        this._find_seatPlayer_by_sv_seatid(seat_id).on_standup();
    }
    /**
     * 其他玩家进入
     * @param body 
     */
    on_userArrived_return(body: any) {
        let player_info = {
            sv_seatid: body[0],   
            unick: body[1],
            usex: body[2],
            uface: body[3],
            uchip: body[4],
            uexp: body[5],
            uvip: body[6],
            udata: body[7],
            state: body[8],
        }
        if(this.seat_self.get_sv_seatid() == 0) {
            if(player_info.sv_seatid == 2) {
                this.seat_otherA.on_sitdowm(player_info, 1);
            }else {
                this.seat_otherB.on_sitdowm(player_info, 2);
            }
        }
        if(this.seat_self.get_sv_seatid() == 1) {
            if(player_info.sv_seatid == 0) {
                this.seat_otherA.on_sitdowm(player_info, 1);
            }else {
                this.seat_otherB.on_sitdowm(player_info, 2);
            }
        }
        if(this.seat_self.get_sv_seatid() == 2) {
            if(player_info.sv_seatid == 1) {
                this.seat_otherA.on_sitdowm(player_info, 1);
            }else {
                this.seat_otherB.on_sitdowm(player_info, 2);
            }
        }
    }
    
    /**
     * 点击准备, 再点击 取消准备
     */
    ready_button_click() {
        if(!this.ready_flag) {
            dou_di_zhu.player_do_ready();
        }else {
            dou_di_zhu.player_not_ready();  
        }
    }
    /**
     * 玩家点击准备
     * @param body 
     */
    on_player_ready(body) {
        this.ready_flag = true;
        if(body[0] != Response.OK) {
            console.log("on_player_do_ready_return error");
            return ;
        }
        this._find_seatPlayer_by_sv_seatid(body[1]).on_do_ready();
    }
    /**
     * 玩家取消准备
     * @param body 
     */
    on_player_not_ready(body) {
        this.ready_flag = false;
        if(body[0] != Response.OK) {
            console.log("on_player_not_ready_return error");
            return ;
        }
        this._find_seatPlayer_by_sv_seatid(body[1]).on_do_not_ready();
    }
    /**
     * 游戏正式开始
     * @param body 
     * let body = [
            this.think_time,
            wait_client_time,
            this.dizhu_seatid
        ];
     */
    round_start_return(body: any) {
        
        console.log(body);
        this.poker_di_pool.hide_all_player_show();
        this.poker_di_pool.hide_player_pokers();
        // 其他玩家的手牌数目
        this.poker_list.remove_all_poker();
        this.player_self_button.hide_node();
        
        this.seat_self.on_hide_time_num();
        this.seat_otherA.on_hide_time_num();
        this.seat_otherB.on_hide_time_num();

        // 将准备按钮隐藏
        if(this.seat_self && this.seat_otherA && this.seat_otherB) {
            this.seat_self.on_hide_ready();
            this.seat_otherA.on_hide_ready();
            this.seat_otherB.on_hide_ready();
        }
    }
    /**
     * 收到牌
     * @param body 
     * // 17张牌, 乱序, 数值 + 类型
     */
    send_cards_return(body: any) {
        this.poker_list.send_cards(body[0]);
        // 其他玩家的手牌数目
        for(let i=1; i<body.length; i++) {
            console.log(body[i][0] + " " + body[i]);
            this._find_seatPlayer_by_sv_seatid(body[i][0]).on_show_poker_num(body[i][1]);
        }
    }
    /**
     * 轮到哪个玩家, body是seat_id, 开始抢地主
     * @param body 
     */
    turn_to_player_return(body: any) {
        if(body[0] != Response.OK) {
            console.log("turn_to_player_return error: " + body[0]);
            return ;
        }
        let action_time = body[1];
        let sv_seatid = body[2];
        this.seat_self.on_hide_time_num();
        this.seat_otherA.on_hide_time_num();
        this.seat_otherB.on_hide_time_num();
        
        if(sv_seatid == this.seat_self.get_sv_seatid()) {
            
            if(this.can_send_card)  {
                let pokers = QueuePool.getPrevious();
            
                let myCards = this.poker_list.get_all_poker();
                let myCardNum = send_poker_ctl._transformation_arr(myCards);
                let lastCardNum = send_poker_ctl._transformation_arr(pokers.poker);
                let flag = cards_compare.isShowOutCardBtn(myCardNum, lastCardNum, pokers.type);
                if(flag == false) {
                    this.player_self_button.show_yaobuqi_button();
                    action_time = 20;
                }else {
                    this.player_self_button.show_send_cards_button();
                }
            }
            this.seat_self.turn_to_player(action_time);
            this.player_self_button.show_node();
        }else if(sv_seatid == this.seat_otherA.get_sv_seatid()){
            this.seat_otherA.turn_to_player(action_time);
            this.player_self_button.hide_node();
        }else if(sv_seatid == this.seat_otherB.get_sv_seatid()) {
            this.seat_otherB.turn_to_player(action_time);
            this.player_self_button.hide_node();
        }
    }
    /**
     * 是否抢地主
     * @param body 
     * ok
     * is_dizhu
     * seatid
     */
    send_dizhu_return(body: any) {
        if(body[0] != Response.OK) {
            console.log("send_dizhu_return error: " + body[0]);  
            return ;
        }
        let is_dizhu = body[1];
        let sv_seatid = body[2];
        let dizhu_flag_array = body[3];
        let is_who = -1;
        is_who = this._find_seatPlayer_by_sv_seatid(sv_seatid).is_who;
        this.poker_di_pool.show_qiang_dizhu(is_who, dizhu_flag_array, is_dizhu);
    }

    
    /**
     * 
     * @param body 
     * ok
     * dizhu_seatid
     */
    di_zhu_seat_return(body) {
        if(body[0] != Response.OK) {
            console.log("di_zhu_seat_return error: " +  body[0]);
            return ;
        }
        let sv_seatid = body[1];
        let dizhu_poker = body[2];
        // 清空底池
        this.poker_di_pool.hide_all_player_show();

        this.can_send_card = true;
        this.player_self_button.show_send_cards_button();

        this._find_seatPlayer_by_sv_seatid(sv_seatid).on_show_dizhu_node(dizhu_poker);
        this.dizhu_poker.show_dizhu_poker(dizhu_poker);

    }

    _find_seatPlayer_by_sv_seatid(sv_seatid) {
        if(this.seat_self.player_info && this.seat_self.get_sv_seatid() == sv_seatid) { // 自己准备
            return this.seat_self;
        }else if(this.seat_otherA.player_info && this.seat_otherA.get_sv_seatid() == sv_seatid) {
            return this.seat_otherA;
        }else if(this.seat_otherB.player_info && this.seat_otherB.get_sv_seatid() == sv_seatid) {
            return this.seat_otherB;
        }
        console.log("_find_seatPlayer_by_sv_seatid error: " + sv_seatid);
        return null;
    }

    /**
     * 玩家出牌
     * @param body 
     */
    player_send_cards_return(body: any) {
        if(body[0] != Response.OK) {
            console.log("player_send_cards_return error: " + status);
            return ;
        }
        
        // 出牌
        let sv_seatid = body[1];
        let poker_arr: playerPoker = body[2];
        let len = body[3]
        let is_who = -1;

        console.log("player_send_cards_return", body);

        QueuePool.push(poker_arr);

        // 把牌 从玩家手中删除
        if(this.seat_self && this.seat_self.get_sv_seatid() == sv_seatid) { // 自己准备
            this.poker_list.remove_selected_poker_card(poker_arr.poker);
            is_who = this.seat_self.is_who;
        }else if(this.seat_otherA && this.seat_otherA.get_sv_seatid() == sv_seatid) {
            this.seat_otherA.on_show_poker_num(len);
            is_who = this.seat_otherA.is_who;
        }else if(this.seat_otherB && this.seat_otherB.get_sv_seatid() == sv_seatid) {
            this.seat_otherB.on_show_poker_num(len);
            is_who = this.seat_otherB.is_who;
        }
        
        this.poker_di_pool.show_player_send_poker(is_who, poker_arr.poker);
    }
    /**
     * 玩家牌出完了
     * @param body 
     */
    player_no_cards_retrun(body) {
        if(body[0] != Response.OK) {
            console.log("player_no_cards_retrun error: " + body[0]);
            return ;
        }
        let win_seatid = body[1];
        let allPoker = body[2];
        let dizhu_seatid = body[3];
        let self_seatid = this.seat_self.get_sv_seatid();

        this.seat_self.on_hide_time_num();
        this.seat_otherA.on_hide_time_num();
        this.seat_otherB.on_hide_time_num();
        this.player_self_button.hide_node();

        let is_who = -1;
        for(let i=0; i<allPoker.length; i++) {
            is_who = this._find_seatPlayer_by_sv_seatid(allPoker[i][0]).is_who;
            if(is_who != 0) {
                this.poker_di_pool.show_player_pokers(is_who, allPoker[i][1]);
            }
            
        }

        this.scheduleOnce(() => {
            if(dizhu_seatid  == win_seatid) {  // 地主获胜
                if(dizhu_seatid == self_seatid) {  // 玩家是地主 获胜
                    this.who_win.init(0);
                    ugame.game_info.uchip += body[4] * 2;
                }else {
                    this.who_win.init(3);
                    ugame.game_info.uchip -= body[4] * 2;
                }
            }else { // 不是地主获胜
                if(dizhu_seatid == self_seatid) {
                    this.who_win.init(1);   // 不是地主获胜, 玩家是地主
                    ugame.game_info.uchip -= body[4];
                }else {
                    this.who_win.init(2);   // 农民胜利
                    ugame.game_info.uchip += body[4];
                }
    
            }
        }, 0.5);
        

    }
    /**
     * 
     * @param body 
     * let arr = [];
            arr.push(this.seats[i].unick);
            arr.push(this.seats[i].seatid);
            arr.push(this.TIMES);
            if(this.seats[i].is_dizhu) {
                if(is_dizhu_win)    arr.push("+" + this.TIMES * this.bet_chip * 2);
                else                arr.push("-" + this.TIMES * this.bet_chip * 2);
            }else {
                if(is_dizhu_win)    arr.push("-" + this.TIMES * this.bet_chip);
                else                arr.push("+" + this.TIMES * this.bet_chip);
            }
            arr.push(this.seats[i].is_dizhu)
     */
    check_out_game_return(body: any) {
        if(body[0] != Response.OK) {
            return ;
        }

        let node = cc.instantiate(this.over_panel);
        node.getComponent(over_panel).init_info(body[1], body[2], this.seat_self.get_sv_seatid(), this);
        node.parent = this.node.getChildByName("center");
        
    }
    /**
     * 发送消息
     * @param body 
     */
    send_msg_return(body: any) {
        if(body[0] != Response.OK) {
            console.log("send_msg_err");
            return ;
        }
        this.hide_talk_list();
        this._find_seatPlayer_by_sv_seatid(body[1]).show_talk_node(body[2]);


    }
    /**
     * 清理桌子, 等待下一局游戏的开始
     */
    clear_table() {
        this.can_send_card = false;
        QueuePool.clear();
        
        this.who_win.hide_node();
        this.poker_di_pool.hide_all_player_show();
        this.poker_di_pool.hide_player_pokers();
        // 其他玩家的手牌数目
        this.poker_list.remove_all_poker();

        this.seat_self.on_hide_poker_num();
        this.seat_otherA.on_hide_poker_num();
        this.seat_otherB.on_hide_poker_num();

        this.seat_self.on_hide_dizhu_node();
        this.seat_otherA.on_hide_dizhu_node();
        this.seat_otherB.on_hide_dizhu_node();

        this.seat_self.on_show_ready();
        this.seat_otherA.on_show_ready(); 
        this.seat_otherB.on_show_ready();
        this.ready_flag = false;
        
        this.dizhu_poker.hide_dizhu_poker();

        this.player_self_button.show_qiang_dizhu_button();
    }

    /**
     * 退出按钮
     */
    quit_button_click() {
        dou_di_zhu.exit_room();
    }

    talk_button_click() {
        let talk_node = cc.find("Canvas/bottom_right/talk_list");
        if(talk_node.active == true) {
            talk_node.active = false;
        }else {
            talk_node.active = true;
        }
    }

    hide_talk_list() {
        cc.find("Canvas/bottom_right/talk_list").active = false;
    }

    // update (dt) {}
}
