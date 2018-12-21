import ugame from "../ugame";
import ulevel from "../ulevel";
import dou_di_zhu from "../protobufs/dou_di_zhu";
import Stype from "../Stype";
import websocket from "../../modules/websocket";
import Cmd from "../Cmd";
import Response from "../Response";
import tishiPanel from "./tishiPanel"
import ddz_game_scene from "./ddz_game_scene"
import poker_sprite from "./poker_sprite"

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    /**
     * 用户信息
     */
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
    @property(cc.Label)
    udata: cc.Label = null;

    @property(cc.Prefab)
    create_room_panel: cc.Prefab  = null;

    @property(cc.Prefab)
    join_room_panel: cc.Prefab  = null;

    @property(cc.Node)
    centerNode: cc.Node = null;

    @property(cc.Node)
    tips_node: cc.Node = null;

    @property(cc.Node)
    wait_node: cc.Node = null;
    wait_label: cc.Label = null;

    @property(cc.Prefab)
    tishiPanel_prefab: cc.Prefab = null;
    @property(cc.Prefab)
    history_panel: cc.Prefab = null;


    service_handlers: {[key: string]: any} = {};
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.service_handlers[Stype.GAME_DOU_DI_ZHU] = this.on_dou_di_zhu_server_return.bind(this);
        websocket.register_services_handler(this.service_handlers);
        this.wait_label = this.wait_node.getChildByName("str").getComponent(cc.Label);
        this.sync_info();
        
    }

    /**
     * ---------------------- 五子棋服务器GAME_FIVE_CHESS 返回的消息 --------------------------
     */
    on_dou_di_zhu_server_return(stype: number, ctype: number, body) {
        console.log(stype , ctype, body);
        switch(ctype) {
            case Cmd.GameDouDiZhu.ENTER_ZONE:
                this.enter_zone_return(body);
            break;
            case Cmd.GameDouDiZhu.QUIT_ZONE:
                this.quit_zone_return(body);
            break;
            case Cmd.GameDouDiZhu.CREATE_ROOM:
                this.create_room_return(body);
            break;
            case Cmd.GameDouDiZhu.SEARCH_ROOM:
                this.search_room_return(body);
            break;
            case Cmd.GameDouDiZhu.RECONNECT:
                this.player_reconnect_return(body);
            break;
            case Cmd.GameDouDiZhu.GET_HISTORY:
                this.get_history_return(body);
            break;
            
        }
    }

    load_in_game_scene(ret_func?: any) {
        this.wait_node.active = true;
        poker_sprite.init(ret_func, (completedCount, totalCount, item) => {
            var per = Math.floor(completedCount*100/totalCount);
            this.wait_label.string = per + "%";
        });
    }
    /**
     * 玩家断线重连
     * @param body 
     */
    player_reconnect_return(body: any) {
        // 断线重连
        // step1
        // 进入游戏场景
        ugame.enter_room(-1);
        
        this.load_in_game_scene(() => {

            cc.loader["onProgress"] = function ( completedCount, totalCount,  item ){
                var per = Math.floor(completedCount*100/totalCount);
                this.wait_label.string = per + "%";
            }.bind(this);
            
            //使用preloadScene()预加载场景
            cc.director.preloadScene('ddz_game_scene', function(){
                cc.loader["onProgress"] = null;
                cc.director.loadScene('ddz_game_scene', function(body) {
                    let curScene = cc.director.getScene();
                    let canvas = curScene.children[0];
                    let ddz_game_ctl: ddz_game_scene = canvas.getComponent("ddz_game_scene");
                    ddz_game_ctl.on_sitdown_return([1, body[1]]);
                    ddz_game_ctl.on_userArrived_return(body[2][0]);
                    ddz_game_ctl.on_userArrived_return(body[2][1]);
                    ddz_game_ctl.round_start_return(body[3]);
                    ddz_game_ctl.turn_to_player_return([1, body[5][0], body[5][1]]);
                    
                    if(!body[6]) {   // can_send_poker
                        // 抢地主环节
                        ddz_game_ctl.can_send_card = false;
                    }else {
                        // 出牌环节
                        ddz_game_ctl.can_send_card = true;
                        ddz_game_ctl.player_self_button.show_send_cards_button();
                        ddz_game_ctl._find_seatPlayer_by_sv_seatid(body[7]).on_show_dizhu_node(body[8]);
                        ddz_game_ctl.dizhu_poker.show_dizhu_poker(body[8]);
                    }
                    ddz_game_ctl.send_cards_return(body[4]);
                }.bind(this, body));
            });

        });
    }

    search_room_return(body: any) {
        if(body[0] != Response.OK) {
            let node = cc.instantiate(this.tishiPanel_prefab);
            let tishiCtl: tishiPanel = node.getComponent("tishiPanel")
            tishiCtl.init("房间不存在或房间人已经满了!!!");
            node.parent = this.node.getChildByName("center");
            console.log("join room error : ", body);
            return ;
        }
        ugame.enter_room(body[1]);
        this.load_in_game_scene(() => {
            
            //onProgress可以查看到加载进度
            cc.loader["onProgress"] = function ( completedCount, totalCount,  item ){
                var per = Math.floor(completedCount*100/totalCount);
                this.wait_label.string = per + "%";
            }.bind(this);
            
            cc.director.preloadScene('ddz_game_scene',function(){
                cc.loader["onProgress"]= null;
                
                cc.director.loadScene('ddz_game_scene');
            });
        });
    }
    /**
     * 服务器返回的进入区间 回调
     * @param body 
     */
    enter_zone_return(body: any) {
        console.log(body);
    }
    /**
     * 退出区间 服务器回调
     * @param body 
     */
    quit_zone_return(body: any) {
        if(body != Response.OK) {
            console.log("quit_zone_return error" + body);
            return ;
        }
        this.wait_node.active = true;
        //onProgress可以查看到加载进度
        cc.loader["onProgress"] = function ( completedCount, totalCount,  item ){
            var per = Math.floor(completedCount*100/totalCount);
            this.wait_label.string = per + "%";
        }.bind(this);
        //使用preloadScene()预加载场景
        cc.director.preloadScene('home_scene',function(){
            cc.loader["onProgress"]= null;
            let frameSize = cc.view.getFrameSize(); 
            cc.view.setFrameSize(frameSize.height,frameSize.width);
            cc.director.loadScene('home_scene');
        });
    }
    /**
     * 创建房间
     * @param body 
     */
    create_room_return(body: any) {
        if(body[0] != Response.OK) {
            let node = cc.instantiate(this.tishiPanel_prefab);
            let tishiCtl: tishiPanel = node.getComponent("tishiPanel")
            tishiCtl.init("您的房卡不足, 请联系管理员!!!");
            node.parent = this.node.getChildByName("center");
            console.log("create_room_return error : ", body[0]);
            return ;
        }
        ugame.game_info.udata -= 10;
        console.log("room_id: " + body[1]);
        ugame.enter_room(body[1]);
        this.load_in_game_scene(() => {
            //onProgress可以查看到加载进度
            cc.loader["onProgress"] = function ( completedCount, totalCount,  item ){
                var per = Math.floor(completedCount*100/totalCount);
                this.wait_label.string = per + "%";
            }.bind(this);
            
            cc.director.preloadScene('ddz_game_scene',function(){
                cc.loader["onProgress"]= null;
                
                cc.director.loadScene('ddz_game_scene');
            });
        });
    }
    /**
     * 获取历史记录
     * @param body 
     */
    get_history_return(body: any) {
    
        if(body[0] != Response.OK) {
            console.log("get_history_return error");
            return ;
        }
        let node = cc.instantiate(this.history_panel);
        node.getComponent("history_panel").add_item_to_content(body[1]);
        node.parent = this.centerNode;
    }
    

    sync_info() {
        this.unick.string = ugame.unick;    
        this.uchip.string = "" + ugame.game_info.uchip;
        this.usex.spriteFrame = this.usex_sp[ugame.usex];
        this.uvip.string = "VIP " + ugame.game_info.uvip;
        this.udata.string = "" + ugame.game_info.udata;
        
        let ret = ulevel.get_level(ugame.game_info.uexp);
        this.ulevel.string = "LV " + ret[0];
        this.uexp_process.progress = ret[1];
    }
    start () {
        dou_di_zhu.enter_zone(ugame.zid);
    }
    /**
     * 创建房间
     */
    create_room_button_click() {
        let node = cc.instantiate(this.create_room_panel);
        node.parent = this.centerNode;
    }
    /**
     * 加入房间
     */
    join_room_button_click() {
        let node = cc.instantiate(this.join_room_panel);
        node.parent = this.centerNode;
    }

    add_roomcard_button_click() {
        console.log("增加房卡");
    }

    wanfa_button_click(e, data) {
        console.log("玩法");
    }
    /**
     * 战绩
     */
    record_button_click(e, data) {
        console.log("战绩");
        dou_di_zhu.get_history_record();

    }
    /**
     * 设置
     */
    set_button_click() {
        console.log("设置");
    }
    /**
     * 退出
     */
    quit_button_click() {
        console.log("退出");
        dou_di_zhu.quit_zone();
        
        
    }


    update (dt) {
        this.tips_node.position = cc.p(this.tips_node.x-1, this.tips_node.y);
        if (this.tips_node.position.x < -1515) {
            this.tips_node.position = cc.p(358, this.tips_node.position.y);
        }
    }
}
