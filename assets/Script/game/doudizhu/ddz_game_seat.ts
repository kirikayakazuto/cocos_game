import { State } from "../State";
import poker_card from "./poker_card";


const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    unick: cc.Label = null;
    @property(cc.Label)
    uchip: cc.Label = null;
    @property(cc.Label)
    uvip: cc.Label = null;

    @property(cc.Node)
    ready_button: cc.Node = null;
    @property(cc.Node)
    poker_bg: cc.Node = null;

    @property(cc.Node)
    time_node: cc.Node = null;

    @property(cc.Node)
    dizhu_node: cc.Node = null;

    @property(cc.Node)
    talk_node: cc.Node = null;

    msg_list = [
        "大家好,很高兴见到各位!",
        "快点呀,等到花都谢了",
        "你的牌打的也太好了",
        "不要吵吵了,专心玩游戏吧",
        "不好意思,我要离开一会",
        "不要走,决战到天亮",
        "你是MM还是GG",
        "交个朋友吧,能告诉我联系方式吗",
        "再见了,我会想念大家的",];


    player_info:{
        unick: string,
        usex: number,
        uface: number,

        uvip: number,
        uchip: number,
        uexp: number,

        sv_seatid: number, 
    } = null;

    is_who = -1;    // 是否是 0 表示自己, 1表示A, 2表示B
    state = State.InView;   // 状态

    time_label: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.poker_bg.active = false;
        this.node.active = false;
        
        this.time_node.active = false;
        this.dizhu_node.active = false;
        this.talk_node.active = false;
        this.time_label = this.time_node.getChildByName("str").getComponent(cc.Label);
    }

    start () {

    }
    /**
     * 显示聊天结点, 3秒后自动消失
     */
    show_talk_node(index: number) {
        if(this.talk_node.active == true) {
            return ;
        }
        this.talk_node.getChildByName("str").getComponent(cc.Label).string = this.msg_list[index];
        this.talk_node.active = true;
        cc.director.getScheduler().schedule(this.hide_talk_node, this, 3, 0, 3)
    }

    hide_talk_node() {
        this.talk_node.active = false;
    }
    /**
     * 玩家坐下
     */
    on_sitdowm(player_info, is_who: number) {
        this.player_info = player_info;
        this.node.active = true;

        this.state = player_info.state;

        this.unick.string = player_info.unick;
        this.uchip.string = player_info.uchip;
        this.uvip.string = player_info.uvip;
        
        this.is_who = is_who;
        console.log(player_info);
        if(player_info.state == State.Ready) {
            this.on_do_ready();
        }
    }
    /**
     * 玩家站起来
     */
    on_standup() {
        this.state = State.InView;
        this.node.active = false;
        this.player_info = null;
    }
    /**
     * 获取玩家座位号
     */
    get_sv_seatid() { 
        return this.player_info.sv_seatid;
    }
    /**
     * 玩家准备
     */
    on_do_ready() {
        // 修改按钮样式
        this.ready_button.getChildByName("str").getComponent(cc.Label).string = "已准备";
    }
    /**
     * 玩家取消准备
     */
    on_do_not_ready() {
        this.ready_button.getChildByName("str").getComponent(cc.Label).string = "准备";
    }
    /**
     * 隐藏准备按钮
     */
    on_hide_ready() {
        this.ready_button.active = false;
    }
    /**
     * 
     */
    on_show_ready() {
        this.ready_button.getChildByName("str").getComponent(cc.Label).string = "准备";
        this.ready_button.active = true;
    }
    /**
     * 展示其他玩家的手牌数目
     */
    on_show_poker_num(num: number) {
        this.poker_bg.active = true;
        this.poker_bg.getChildByName("str").getComponent(cc.Label).string = "" + num;
    }
    /**
     * 隐藏手牌显示
     */
    on_hide_poker_num() {
        this.poker_bg.active = false;
    }
    /**
     * 显示时间
     */
    
    on_show_time_num(num: number) {
        this.time_label.string = "" + num;
        this.time_node.active = true;
        this.schedule(() => {
            this.time_label.string = "" + (-- num);
        }, 1, num-1);
    }
    
    /**
     * 隐藏时间显示
     */
    on_hide_time_num() {
        this.unscheduleAllCallbacks();
        this.time_node.active = false;

    }
    reduce_time() {

    }
    /**
     * 切换玩家
     */
    turn_to_player(num: number, ret_func?: any) {
        if(ret_func) {
            this.on_show_time_num(num);
        }else {
            this.on_show_time_num(num);
        }
    }
    
    
    /**
     * 显示地主的标识
     */
    on_show_dizhu_node(poker_array: poker_card) {
        let p1 = null;
        let p2 = null; 
        // 加上地主牌
        if(this.is_who == 0) {
            // 对pokerlist
            p1 = cc.v2(0, 366);
            p2 = cc.v2(-514, 174);
            this.node.parent.getChildByName("poker_list").getComponent("poker_list").add_cards(poker_array);
        }else if(this.is_who == 1){
            // 更改牌的显示
            p1 = cc.v2(567, -271);
            p2 = cc.v2(249, -83);
            this.on_show_poker_num(20);
        }else if(this.is_who == 2){ 
            p1 = cc.v2(-278, -271);
            p2 = cc.v2(50, -86);
            this.on_show_poker_num(20);
        }
        this.dizhu_node.position = p1;
        this.dizhu_node.active = true;
        this.dizhu_node.runAction(cc.moveTo(0.5, p2));
    }
    /**
     * 隐藏地主标识
     */
    on_hide_dizhu_node() {
        this.dizhu_node.active = false;
    }
    
    
    // self -514, 174   center 0, 366
    // left B 249, -83       567, -271
    // right A   50 -86     -278    -271
     

    // update (dt) {}
}

/**
 * 一个显示系统
 * 要求
 * 每个大回合开始时, 清空桌面
 * A出牌, 显示A, B出牌显示B, C出牌,显示C, 隐藏A
 * 对桌面上的 扑克牌 进行显示  用队列吗?
 * 队列 , 一个长度为2的队列, 每次一个大回合开始时 清除
 */
